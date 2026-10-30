"use client";

import { useEffect, useRef, useState } from "react";
import { BetField, FairDialog, HowTo, ModeTabs, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CoinIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import { saveSettings, useSettings } from "@/components/mines/stores";
import { wagered } from "@/lib/gems";
import { MAX_TARGET, MIN_TARGET, chanceOf, chanceText, money, parseTarget, payoutOf, profitOf, rollOf, targetFromChance, times } from "@/lib/limbo";
import { takeNonce } from "@/lib/seeds";
import { addToBalance, walletBalance } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import { sfx, warmSfx } from "./sfx";
import styles from "./Limbo.module.css";

type Mode = "manual" | "auto";
type Phase = "idle" | "rolling" | "won" | "lost";
type Adjust = { mode: "reset" | "increase"; pct: string };
type Roll = { result: number; target: number; bet: number; won: boolean };
type Past = { id: number; text: string; won: boolean };

const HISTORY = 12;
// the number climbs to the roll over this long, or the fast way
const ROLL_MS = 550;
const FAST_MS = 250;
const TICK_MS = 45;
const AUTO_PAUSE = 500;

const toCents = (n: number) => Math.round(n * 100) / 100;

const SPEAKER = (
  <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

const BOLT = (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </svg>
);

// the chart mark on the multiplier field
const CHART = (
  <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7 15l3.5-4 2.5 2.5L17 9" />
  </svg>
);

// a die, turning while the roll's on
const DIE = (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-4 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-4 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

/**
 * Limbo. Name a multiplier (or the chance, which sets the multiplier) and
 * bet; a number climbs from 1.00x and the bet pays the multiplier if the
 * number reaches it. It turns green the moment it passes the target, red
 * if it stops short. The roll comes from the shared provably-fair seeds.
 */
export default function Limbo() {
  const bet = useBet("10.00");
  const settings = useSettings();
  const [mode, setMode] = useState<Mode>("manual");
  const [targetText, setTargetText] = useState("2.00");
  const [chanceInput, setChanceInput] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [passed, setPassed] = useState(false);
  const [last, setLast] = useState<Roll | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [fast, setFast] = useState(false);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const numberRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const ticker = useRef(0);
  const live = useRef<{ phase: Phase; pending: Roll | null }>({ phase: "idle", pending: null });
  const pastId = useRef(0);

  // auto
  const [autoBets, setAutoBets] = useState("");
  const [onWin, setOnWin] = useState<Adjust>({ mode: "reset", pct: "" });
  const [onLoss, setOnLoss] = useState<Adjust>({ mode: "reset", pct: "" });
  const [stopProfit, setStopProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [running, setRunning] = useState(false);
  const auto = useRef({ running: false, timer: 0, done: 0, profit: 0, startBet: 0 });

  const target = parseTarget(targetText);
  const rolling = phase === "rolling";
  const busy = rolling || running;
  const chance = target ? chanceOf(target) : 0;
  const profit = target ? profitOf(bet.bet, target) : 0;
  const canBet = !busy && bet.ok && target !== null;
  // the chance field shows what's typed into it until it's left, else the target's chance
  const chanceShown = chanceInput ?? (target ? chanceText(chance) : "");

  // ---- Rolling ---------------------------------------------------------------------------

  const stopTicking = () => {
    clearInterval(ticker.current);
    ticker.current = 0;
  };

  const settle = () => {
    const p = live.current.pending;
    if (!p) return;
    stopTicking();
    if (p.won) addToBalance(payoutOf(p.bet, p.target));
    recordOutcome(p.won ? profitOf(p.bet, p.target) : -p.bet);
    const next: Phase = p.won ? "won" : "lost";
    live.current = { phase: next, pending: null };
    setPhase(next);
    setLast(p);
    const id = ++pastId.current;
    setHistory((h) => [...h, { id, text: times(p.result), won: p.won }].slice(-HISTORY));
    setNote(p.won ? `${times(p.result)} reached your ${times(p.target)}: ${money.format(payoutOf(p.bet, p.target))} to your balance` : `${times(p.result)}, under your ${times(p.target)}`);
    if (auto.current.running) afterRound(p);
  };

  // the number climbs from 1.00x to the roll, quick at first and slowing
  // in; it goes green the moment it passes the target
  const climb = (result: number, targetNow: number, ms: number) => {
    cancelAnimationFrame(frame.current);
    const el = numberRef.current;
    let t0 = -1;
    let green = false;
    const tick = (now: number) => {
      if (t0 < 0) t0 = now;
      const p = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = p < 1 ? 1 + (result - 1) * eased : result;
      if (el) el.textContent = times(value);
      if (!green && value >= targetNow) {
        green = true;
        setPassed(true);
        sfx("win", 0.6);
      }
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else settle();
    };
    frame.current = requestAnimationFrame(tick);
  };

  const roll = (betNow: number, targetNow: number) => {
    const s = takeNonce();
    const result = rollOf(s.serverSeed, s.clientSeed, s.nonce);
    addToBalance(-betNow);
    wagered(betNow);
    const pending: Roll = { result, target: targetNow, bet: betNow, won: result >= targetNow };
    live.current = { phase: "rolling", pending };
    setPhase("rolling");
    setPassed(false);
    setNote("");
    stopTicking();
    ticker.current = window.setInterval(() => sfx("tick", 0.35), TICK_MS);
    climb(result, targetNow, fast ? FAST_MS : ROLL_MS);
  };

  const placeBet = () => {
    if (!canBet || target === null || live.current.phase === "rolling") return;
    warmSfx();
    sfx("click", 0.5);
    roll(bet.bet, target);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearInterval(ticker.current);
    },
    [],
  );

  // ---- Auto ---------------------------------------------------------------------------------

  const stopAuto = () => {
    auto.current.running = false;
    clearTimeout(auto.current.timer);
    setRunning(false);
  };

  const nextRound = useRef<() => void>(() => {});
  const afterRound = (p: Roll) => {
    const a = auto.current;
    a.done += 1;
    a.profit = toCents(a.profit + (p.won ? profitOf(p.bet, p.target) : -p.bet));
    const adjust = p.won ? onWin : onLoss;
    const pct = Number(adjust.pct) || 0;
    const nextBet = adjust.mode === "increase" && pct > 0 ? toCents(p.bet * (1 + pct / 100)) : a.startBet;
    bet.setBetText(nextBet.toFixed(2));
    const limit = Number(autoBets) || 0;
    const profitStop = Number(stopProfit) || 0;
    const lossStop = Number(stopLoss) || 0;
    if ((limit > 0 && a.done >= limit) || (profitStop > 0 && a.profit >= profitStop) || (lossStop > 0 && -a.profit >= lossStop)) {
      setNote(`Auto done: ${a.done} bet${a.done === 1 ? "" : "s"}, ${a.profit >= 0 ? "+" : "−"}${money.format(Math.abs(a.profit))}`);
      stopAuto();
      return;
    }
    a.timer = window.setTimeout(() => nextRound.current(), AUTO_PAUSE);
  };

  const runRound = () => {
    const a = auto.current;
    if (!a.running) return;
    const betNow = bet.bet;
    if (betNow <= 0 || betNow > walletBalance() || target === null) {
      setNote(betNow > walletBalance() ? "Not enough balance for the next bet" : "The bet or the multiplier isn't right");
      stopAuto();
      return;
    }
    roll(betNow, target);
  };
  useEffect(() => {
    nextRound.current = runRound;
  });

  const startAuto = () => {
    if (!canBet || auto.current.running) return;
    warmSfx();
    sfx("click", 0.5);
    Object.assign(auto.current, { running: true, timer: 0, done: 0, profit: 0, startBet: bet.bet });
    setRunning(true);
    runRound();
  };

  useEffect(() => {
    const a = auto.current;
    return () => clearTimeout(a.timer);
  }, []);

  // ---- The fields on the stage ------------------------------------------------------

  const typeTarget = (text: string) => {
    setTargetText(text.replace(/[^\d.]/g, ""));
    setChanceInput(null);
  };
  const typeChance = (text: string) => {
    const clean = text.replace(/[^\d.]/g, "");
    setChanceInput(clean);
    const t = targetFromChance(clean);
    if (t !== null) setTargetText(t.toFixed(2));
  };
  const leaveChance = () => {
    setChanceInput(null);
    if (target !== null) setTargetText(target.toFixed(2));
  };

  // ---- The controls ----------------------------------------------------------------------

  const switchMode = (m: Mode) => {
    if (busy || m === mode) return;
    setMode(m);
  };

  const controls = (
    <>
      <ModeTabs modes={[["manual", "Manual"], ["auto", "Auto"]] as const} mode={mode} onChange={switchMode} disabled={busy} />
      <BetField bet={bet} disabled={busy} max={false} />
      <div className={kit.field}>
        <span className={kit.fieldLabel}>Profit</span>
        <span className={`${styles.profit} tabular`} data-payout={target && bet.bet > 0 ? money.format(profit) : "—"}>
          <CoinIcon />
          {target && bet.bet > 0 ? money.format(profit) : "0.00"}
        </span>
      </div>

      {mode === "auto" && (
        <>
          <label className={kit.field}>
            <span className={kit.fieldLabel}>Number of bets</span>
            <input className={kit.input} inputMode="numeric" placeholder="∞" value={autoBets} disabled={running} onChange={(e) => setAutoBets(e.target.value.replace(/\D/g, ""))} data-auto-bets />
          </label>
          {(
            [
              ["On win", onWin, setOnWin],
              ["On loss", onLoss, setOnLoss],
            ] as const
          ).map(([label, value, set]) => (
            <div key={label} className={kit.field}>
              <span className={kit.fieldLabel}>{label}</span>
              <div className={styles.adjust}>
                <div className={kit.choices} role="radiogroup" aria-label={label}>
                  {(["reset", "increase"] as const).map((m) => (
                    <button key={m} type="button" role="radio" aria-checked={value.mode === m} className={kit.choice} disabled={running} onClick={() => set({ ...value, mode: m })}>
                      {m === "reset" ? "Reset" : "Increase by"}
                    </button>
                  ))}
                </div>
                <span className={styles.pctRow}>
                  <input
                    className={kit.input}
                    inputMode="decimal"
                    value={value.pct}
                    placeholder="0"
                    disabled={running || value.mode === "reset"}
                    onChange={(e) => set({ ...value, pct: e.target.value.replace(/[^\d.]/g, "") })}
                    aria-label={`${label}, increase by percent`}
                  />
                  <span className={styles.pct}>%</span>
                </span>
              </div>
            </div>
          ))}
          <div className={kit.fieldRow}>
            <label className={kit.field}>
              <span className={kit.fieldLabel}>Stop on profit</span>
              <input className={kit.input} inputMode="decimal" placeholder="0.00" value={stopProfit} disabled={running} onChange={(e) => setStopProfit(e.target.value.replace(/[^\d.]/g, ""))} />
            </label>
            <label className={kit.field}>
              <span className={kit.fieldLabel}>Stop on loss</span>
              <input className={kit.input} inputMode="decimal" placeholder="0.00" value={stopLoss} disabled={running} onChange={(e) => setStopLoss(e.target.value.replace(/[^\d.]/g, ""))} />
            </label>
          </div>
        </>
      )}

      {mode === "manual" ? (
        <button type="button" className={`${kit.primary} ${styles.betButton}`} disabled={!canBet} onClick={placeBet} data-place-bet>
          {rolling ? <span className={styles.die}>{DIE}</span> : "Bet"}
        </button>
      ) : running ? (
        <button type="button" className={`${kit.stop} ${styles.betButton}`} onClick={stopAuto} data-stop-auto>
          Stop auto
        </button>
      ) : (
        <button type="button" className={`${kit.primary} ${styles.betButton}`} disabled={!canBet} onClick={startAuto} data-start-auto>
          Start auto
        </button>
      )}
      {!bet.ok && !busy && bet.bet > 0 && (
        <p className={kit.why} data-why>
          Not enough balance
        </p>
      )}
    </>
  );

  // ---- The stage ------------------------------------------------------------------------------

  const outcome = phase === "won" || passed ? "won" : phase === "lost" ? "lost" : undefined;
  const stage = (
    <>
      <ol className={styles.history} aria-label="Last rolls" data-history>
        {history.map((h) => (
          <li key={h.id} className={`${styles.past} ${h.won ? styles.pastWon : ""} tabular`} data-won={h.won ? "true" : "false"}>
            {h.text}
          </li>
        ))}
      </ol>
      <div className={styles.board} data-board>
        <div className={styles.numberBox}>
          <span ref={numberRef} className={`${styles.number} tabular`} data-result data-outcome={outcome}>
            {last && !rolling ? times(last.result) : "1.00x"}
          </span>
        </div>
      </div>
      <div className={styles.fields}>
        <label className={styles.stageField}>
          <span className={styles.stageLabel}>Multiplier</span>
          <span className={styles.stageInput} data-invalid={target === null || undefined}>
            <input
              inputMode="decimal"
              value={targetText}
              disabled={busy}
              aria-invalid={target === null ? true : undefined}
              aria-label={`Multiplier, ${MIN_TARGET.toFixed(2)} to ${new Intl.NumberFormat("en-US").format(MAX_TARGET)}`}
              onChange={(e) => typeTarget(e.target.value)}
              onBlur={() => target !== null && setTargetText(target.toFixed(2))}
              data-target
            />
            <span className={styles.stageSuffix} aria-hidden>
              {CHART}
            </span>
          </span>
        </label>
        <label className={styles.stageField}>
          <span className={styles.stageLabel}>Chance</span>
          <span className={styles.stageInput}>
            <input inputMode="decimal" value={chanceShown} disabled={busy} aria-label="Win chance, percent" onChange={(e) => typeChance(e.target.value)} onBlur={leaveChance} data-chance />
            <span className={styles.stageSuffix} aria-hidden>
              %
            </span>
          </span>
        </label>
      </div>
      <p className={`${kit.stageNote} ${styles.note}`} aria-live="polite" data-note>
        {note}
      </p>
    </>
  );

  return (
    <>
      <div className={kit.wrap} data-limbo data-phase={phase} data-mode={mode}>
        <div className={`${kit.game} ${styles.frame}`}>
          <aside className={kit.controls} aria-label="Bet" data-controls>
            {controls}
          </aside>
          <div className={`${kit.stage} ${styles.stage}`} data-stage>
            {stage}
          </div>
          <div className={styles.bar}>
            <span className={styles.barGroup}>
              <button type="button" className={styles.barButton} onClick={() => setDialog("how")} data-how-to>
                <InfoIcon />
                How to play
              </button>
              <button
                type="button"
                className={styles.barButton}
                aria-pressed={settings.sound}
                aria-label={settings.sound ? "Sound on" : "Sound off"}
                title={settings.sound ? "Sound on" : "Sound off"}
                onClick={() => saveSettings({ ...settings, sound: !settings.sound })}
                data-sound-toggle
              >
                {SPEAKER}
                {settings.sound ? "Sound" : "Muted"}
              </button>
              <button type="button" className={styles.barButton} aria-pressed={fast} aria-label="Fast roll" title="Fast roll" onClick={() => setFast(!fast)} data-fast>
                {BOLT}
                Fast
              </button>
            </span>
            <span className={styles.barBrand} aria-hidden>
              Csgo<b>Neo</b>
            </span>
            <button type="button" className={styles.barButton} onClick={() => setDialog("fair")} data-fairness>
              <ShieldIcon />
              Provably fair
            </button>
          </div>
        </div>
      </div>
      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={busy}
          intro="A game is one roll: the multiplier that comes up."
          verify={(server, client, nonce) => `Rolled ${times(rollOf(server, client, nonce))}`}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How to play Limbo"
          onClose={() => setDialog(null)}
          steps={[
            "Choose a bet and a multiplier, or type the chance you want and the multiplier follows. The higher the multiplier, the lower the chance: the house's 90% share over the multiplier, so 2.00x wins 45% of the time.",
            "Press Bet. The number climbs from 1.00x and turns green the moment it passes your multiplier; stop short and it turns red. A win pays the bet times the multiplier.",
            "Auto repeats the bet, raising or resetting it as you win or lose, until the number of bets or a profit or loss limit stops it.",
          ]}
          note="Rolls run from 1.00x up to 1,000,000x. About one in nine comes up 1.00x exactly."
        />
      )}
    </>
  );
}
