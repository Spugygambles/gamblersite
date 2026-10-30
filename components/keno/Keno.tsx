"use client";

import { useEffect, useRef, useState } from "react";
import { BetField, Choices, FairDialog, GameFrame, History, HowTo, ModeTabs, Readout, Tools, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CheckIcon, CoinIcon } from "@/components/home/icons";
import { saveSettings, useSettings } from "@/components/mines/stores";
import { wagered } from "@/lib/gems";
import { BOARD, DRAWN, MAX_PICKS, RISKS, RISK_LABEL, TABLES, describeDraw, drawNumbers, maxMultiplier, multiplier, randomPicks, type Risk } from "@/lib/keno";
import { takeNonce } from "@/lib/seeds";
import { addToBalance, walletBalance } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import { sfx } from "./sounds";
import styles from "./Keno.module.css";

type Mode = "manual" | "auto";
type Phase = "idle" | "drawing" | "done";
type Game = { picks: number[]; risk: Risk; bet: number; drawn: number[] };
type Past = { id: number; text: string; won: boolean | null };

// how fast the drawn numbers come up, the pause before the payout, and
// the pause between auto games
const REVEAL_MS = 120;
const SETTLE_MS = 350;
const AUTO_PAUSE = 900;
const HISTORY = 12;

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const times = (m: number) => `${m >= 100 ? m.toFixed(0) : m.toFixed(2)}×`;
const robux = (n: number) => Math.round(n);

const SPEAKER = (
  <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

/**
 * Keno. Pick one to ten of the forty numbers, choose a risk, and bet: ten
 * numbers are drawn one by one, and what you're paid depends on how many
 * of yours came up (the strip under the board). The draw comes from the
 * shared provably-fair seeds (lib/keno.ts, lib/fair.ts).
 */
export default function Keno() {
  const bet = useBet();
  const settings = useSettings();
  const [mode, setMode] = useState<Mode>("manual");
  const [risk, setRisk] = useState<Risk>("classic");
  const [picks, setPicks] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [game, setGame] = useState<Game | null>(null);
  const [shown, setShown] = useState(0);
  const [result, setResult] = useState<{ hits: number; mult: number; payout: number } | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const live = useRef<Phase>("idle");
  const timer = useRef(0);
  const pastId = useRef(0);

  // auto
  const [autoGames, setAutoGames] = useState("");
  const [stopProfit, setStopProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [running, setRunning] = useState(false);
  const auto = useRef({ running: false, timer: 0, done: 0, profit: 0 });

  const drawing = phase === "drawing";
  const busy = drawing || running;
  const n = picks.length;
  const table = n ? TABLES[risk][n] : [];
  const maxMult = maxMultiplier(risk, n);
  const why = n === 0 ? `Pick 1 to ${MAX_PICKS} numbers` : bet.bet <= 0 ? "Type a bet" : bet.short ? "Not enough balance" : "";
  const canPlay = !busy && !why;

  // what the board shows: the numbers drawn so far and the hits among them
  const revealed = game ? game.drawn.slice(0, shown) : [];
  const boardPicks = game && phase !== "idle" ? game.picks : picks;
  const hitsSoFar = game ? revealed.filter((x) => game.picks.includes(x)).length : 0;

  // ---- Auto -------------------------------------------------------------------------------

  const stopAuto = () => {
    auto.current.running = false;
    clearTimeout(auto.current.timer);
    setRunning(false);
  };

  const nextRound = useRef<() => void>(() => {});

  // the round's settled: count it, check the limits, go again or stop
  const afterRound = (profit: number) => {
    const a = auto.current;
    a.done += 1;
    a.profit = robux(a.profit + profit);
    const limit = Number(autoGames) || 0;
    const profitStop = Number(stopProfit) || 0;
    const lossStop = Number(stopLoss) || 0;
    if ((limit > 0 && a.done >= limit) || (profitStop > 0 && a.profit >= profitStop) || (lossStop > 0 && -a.profit >= lossStop)) {
      setNote(`Auto done: ${a.done} game${a.done === 1 ? "" : "s"}, ${a.profit >= 0 ? "+" : "−"}${money.format(Math.abs(a.profit))}`);
      stopAuto();
      return;
    }
    a.timer = window.setTimeout(() => nextRound.current(), AUTO_PAUSE);
  };

  // ---- A game ------------------------------------------------------------------------------

  const settle = (g: Game) => {
    const hits = g.drawn.filter((x) => g.picks.includes(x)).length;
    const mult = multiplier(g.risk, g.picks.length, hits);
    const payout = robux(g.bet * mult);
    if (payout > 0) addToBalance(payout);
    recordOutcome(robux(payout - g.bet));
    if (payout > g.bet) sfx("win");
    else if (payout > 0) sfx("even");
    live.current = "done";
    setPhase("done");
    setResult({ hits, mult, payout });
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: times(mult), won: payout > g.bet ? true : payout < g.bet ? false : null }, ...h].slice(0, HISTORY));
    setNote(`${hits} of ${g.picks.length} hit: ${times(mult)}${payout > 0 ? `, ${money.format(payout)} back` : ""}`);
    if (auto.current.running) afterRound(payout - g.bet);
  };

  const play = () => {
    if (live.current === "drawing" || picks.length === 0) return;
    const betNow = bet.bet;
    if (betNow <= 0 || betNow > walletBalance()) {
      setNote(betNow > walletBalance() ? "Not enough balance for the next game" : "Type a bet");
      if (auto.current.running) stopAuto();
      return;
    }
    const s = takeNonce();
    const drawn = drawNumbers(s.serverSeed, s.clientSeed, s.nonce);
    addToBalance(-betNow);
    wagered(betNow);
    const g: Game = { picks: [...picks], risk, bet: betNow, drawn };
    live.current = "drawing";
    setGame(g);
    setShown(0);
    setResult(null);
    setPhase("drawing");
    setNote("");
    let i = 0;
    const step = () => {
      i += 1;
      setShown(i);
      sfx(g.picks.includes(g.drawn[i - 1]) ? "hit" : "tick");
      timer.current = window.setTimeout(i < DRAWN ? step : () => settle(g), i < DRAWN ? REVEAL_MS : SETTLE_MS);
    };
    timer.current = window.setTimeout(step, REVEAL_MS);
  };
  useEffect(() => {
    nextRound.current = play;
  });

  const startAuto = () => {
    if (!canPlay || auto.current.running) return;
    sfx("bet");
    Object.assign(auto.current, { running: true, timer: 0, done: 0, profit: 0 });
    setRunning(true);
    play();
  };

  useEffect(() => {
    const a = auto.current;
    return () => {
      clearTimeout(a.timer);
      clearTimeout(timer.current);
    };
  }, []);

  // ---- The picks --------------------------------------------------------------------------

  // a change to the picks after a game puts the board back to the start
  const fresh = () => {
    if (live.current === "done") {
      live.current = "idle";
      setPhase("idle");
      setGame(null);
      setShown(0);
      setResult(null);
      setNote("");
    }
  };

  const toggle = (num: number) => {
    if (busy) return;
    fresh();
    setPicks((p) => (p.includes(num) ? p.filter((x) => x !== num) : p.length >= MAX_PICKS ? p : [...p, num]));
  };

  const autoPick = () => {
    if (busy) return;
    fresh();
    setPicks(randomPicks(picks.length || MAX_PICKS));
  };

  const clear = () => {
    if (busy) return;
    fresh();
    setPicks([]);
  };

  const switchMode = (m: Mode) => {
    if (busy || m === mode) return;
    setMode(m);
  };

  // ---- The controls and the stage -----------------------------------------------------------

  const controls = (
    <>
      <ModeTabs
        modes={[
          ["manual", "Manual"],
          ["auto", "Auto"],
        ]}
        mode={mode}
        onChange={switchMode}
        disabled={busy}
      />
      <BetField bet={bet} disabled={busy} />
      <Choices label="Risk" options={RISKS.map((r) => ({ value: r, label: RISK_LABEL[r] }))} value={risk} onChange={setRisk} disabled={busy} attr="data-risk" />
      <div className={kit.readouts}>
        <Readout
          label="Numbers picked"
          value={
            <>
              <b data-picks-count>{n}</b>&thinsp;/&thinsp;{MAX_PICKS}
            </>
          }
        />
        <Readout
          label={`Max win${n ? ` (${times(maxMult)})` : ""}`}
          value={
            <>
              <CoinIcon />
              <span data-max-win>{money.format(robux(bet.bet * maxMult))}</span>
            </>
          }
        />
      </div>
      <div className={kit.fieldRow}>
        <button type="button" className={kit.secondary} disabled={busy} onClick={autoPick} data-auto-pick>
          Auto pick
        </button>
        <button type="button" className={kit.secondary} disabled={busy || n === 0} onClick={clear} data-clear>
          Clear
        </button>
      </div>

      {mode === "manual" ? (
        <button
          type="button"
          className={kit.primary}
          disabled={!canPlay}
          onClick={() => {
            sfx("bet");
            play();
          }}
          data-place-bet
        >
          {drawing ? "Drawing…" : "Bet"}
        </button>
      ) : (
        <>
          <label className={kit.field}>
            <span className={kit.fieldLabel}>Number of games</span>
            <input className={kit.input} inputMode="numeric" placeholder="∞" value={autoGames} disabled={running} onChange={(e) => setAutoGames(e.target.value.replace(/\D/g, ""))} data-auto-games />
          </label>
          <div className={kit.fieldRow}>
            <label className={kit.field}>
              <span className={kit.fieldLabel}>Stop on profit</span>
              <input className={kit.input} inputMode="decimal" placeholder="0" value={stopProfit} disabled={running} onChange={(e) => setStopProfit(e.target.value.replace(/\D/g, ""))} />
            </label>
            <label className={kit.field}>
              <span className={kit.fieldLabel}>Stop on loss</span>
              <input className={kit.input} inputMode="decimal" placeholder="0" value={stopLoss} disabled={running} onChange={(e) => setStopLoss(e.target.value.replace(/\D/g, ""))} />
            </label>
          </div>
          {running ? (
            <button type="button" className={kit.stop} onClick={stopAuto} data-stop-auto>
              Stop auto
            </button>
          ) : (
            <button type="button" className={kit.primary} disabled={!canPlay} onClick={startAuto} data-start-auto>
              Start auto
            </button>
          )}
        </>
      )}
      {why && !busy && (
        <p className={kit.why} data-why>
          {why}
        </p>
      )}
      <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")}>
        <button
          type="button"
          className={kit.tool}
          aria-pressed={settings.sound}
          aria-label={settings.sound ? "Sound on" : "Sound off"}
          title={settings.sound ? "Sound on" : "Sound off"}
          onClick={() => saveSettings({ ...settings, sound: !settings.sound })}
          data-sound-toggle
        >
          {SPEAKER}
        </button>
      </Tools>
    </>
  );

  const stage = (
    <>
      <History items={history} />
      <div className={styles.center}>
        <div className={styles.board} role="group" aria-label="Numbers" data-board>
          {BOARD.map((num) => {
            const picked = boardPicks.includes(num);
            const isDrawn = revealed.includes(num);
            const hit = picked && isDrawn;
            return (
              <button
                key={num}
                type="button"
                className={styles.tile}
                disabled={busy}
                aria-pressed={picked}
                aria-label={`${num}${hit ? ", hit" : isDrawn ? ", drawn" : picked ? ", picked" : ""}`}
                onClick={() => toggle(num)}
                data-tile={num}
                data-picked={picked || undefined}
                data-drawn={isDrawn || undefined}
                data-hit={hit || undefined}
              >
                <span className={styles.num}>{num}</span>
                {hit && <CheckIcon className={styles.check} />}
              </button>
            );
          })}
        </div>
        <p className={styles.tally} aria-live="polite" data-tally>
          {game && phase !== "idle" ? (
            <>
              <b className="tabular">{shown}</b> of {DRAWN} drawn · <b className="tabular">{hitsSoFar}</b> hit{hitsSoFar === 1 ? "" : "s"}
            </>
          ) : n ? (
            `${n} number${n === 1 ? "" : "s"} picked. Bet to draw ${DRAWN}.`
          ) : (
            "Pick your numbers on the board."
          )}
        </p>
        <div className={styles.payouts} aria-label="Payouts" data-payouts>
          {n ? (
            table.map((m, k) => (
              <div key={k} className={styles.chip} data-hits={k} data-zero={m === 0 || undefined} data-active={result && result.hits === k ? "" : undefined}>
                <span className={styles.chipHits}>
                  {k} hit{k === 1 ? "" : "s"}
                </span>
                <span className={`${styles.chipMult} tabular`}>{times(m)}</span>
              </div>
            ))
          ) : (
            <span className={styles.payoutsHint}>The payouts show once you pick.</span>
          )}
        </div>
      </div>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </>
  );

  return (
    <>
      <GameFrame controls={controls} stage={stage} attrs={{ "data-keno": "", "data-phase": phase, "data-mode": mode }} />
      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={busy}
          intro="The ten numbers drawn are picked from the forty by the draws, in the order they come up."
          verify={(server, client, nonce) => describeDraw(drawNumbers(server, client, nonce))}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How to play Keno"
          onClose={() => setDialog(null)}
          steps={[
            `Pick 1 to ${MAX_PICKS} numbers on the board, or let Auto pick choose for you.`,
            "Choose a risk. Low pays a little and often; High pays rarely and big. The strip under the board shows what each hit count pays.",
            `Bet, and ${DRAWN} numbers are drawn. Every one of yours that comes up is a hit.`,
            "Auto plays the same numbers game after game, stopping at a count or a profit or loss you set.",
          ]}
          note="The house keeps 10%: every payout table returns 90% of the bet over the odds."
        />
      )}
    </>
  );
}
