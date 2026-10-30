"use client";

import { useEffect, useRef, useState } from "react";
import { BetField, Choices, FairDialog, GameFrame, History, HowTo, ModeTabs, Readout, Tools, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { wagered } from "@/lib/gems";
import { MAX_TARGET, MIN_TARGET, QUICK, chanceOf, money, parseTarget, payoutOf, percent, rollOf, times } from "@/lib/limbo";
import { takeNonce } from "@/lib/seeds";
import { addToBalance, walletBalance } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import styles from "./Limbo.module.css";

type Mode = "manual" | "auto";
type Phase = "idle" | "rolling" | "won" | "lost";
type Adjust = { mode: "reset" | "increase"; pct: string };
type Roll = { result: number; target: number; bet: number; won: boolean };
type Past = { id: number; text: string; won: boolean };

const HISTORY = 10;
// the number climbs to the roll over this long, or the fast way
const ROLL_MS = 900;
const FAST_MS = 300;
const AUTO_PAUSE = 600;
// the scale under the number runs from 1× to this, log-wise
const SCALE_TOP = 1000;
const TICKS = [1, 2, 5, 10, 100, 1000];

const toCents = (n: number) => Math.round(n * 100) / 100;
const place = (m: number) => `${(Math.log10(Math.min(Math.max(m, 1), SCALE_TOP)) / Math.log10(SCALE_TOP)) * 100}%`;

/**
 * Limbo. Name a target multiplier and bet; a roll climbs from 1.00× and
 * the bet pays the target if the roll reaches it. The roll comes from the
 * shared provably-fair seeds.
 */
export default function Limbo() {
  const bet = useBet("10.00");
  const [mode, setMode] = useState<Mode>("manual");
  const [targetText, setTargetText] = useState("2.00");
  const [phase, setPhase] = useState<Phase>("idle");
  const [last, setLast] = useState<Roll | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [fast, setFast] = useState(false);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const numberRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
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
  const payout = target ? payoutOf(bet.bet, target) : 0;
  const canBet = !busy && bet.ok && target !== null;

  // ---- Rolling ---------------------------------------------------------------------------

  const settle = () => {
    const p = live.current.pending;
    if (!p) return;
    if (p.won) addToBalance(payoutOf(p.bet, p.target));
    recordOutcome(p.won ? Math.round((payoutOf(p.bet, p.target) - p.bet) * 100) / 100 : -p.bet);
    const next: Phase = p.won ? "won" : "lost";
    live.current = { phase: next, pending: null };
    setPhase(next);
    setLast(p);
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: times(p.result), won: p.won }, ...h].slice(0, HISTORY));
    setNote(p.won ? `${times(p.result)} reached your ${times(p.target)}: ${money.format(payoutOf(p.bet, p.target))} to your balance` : `${times(p.result)}, under your ${times(p.target)}`);
    if (auto.current.running) afterRound(p);
  };

  // the number climbs from 1.00× to the roll, quick at first and slowing in
  const climb = (result: number, ms: number) => {
    cancelAnimationFrame(frame.current);
    const el = numberRef.current;
    let t0 = -1;
    const tick = (now: number) => {
      if (t0 < 0) t0 = now;
      const p = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      if (el) el.textContent = times(p < 1 ? 1 + (result - 1) * eased : result);
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
    setNote("");
    climb(result, fast ? FAST_MS : ROLL_MS);
  };

  const placeBet = () => {
    if (!canBet || target === null || live.current.phase === "rolling") return;
    roll(bet.bet, target);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

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
    a.profit = toCents(a.profit + (p.won ? payoutOf(p.bet, p.target) - p.bet : -p.bet));
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
      setNote(betNow > walletBalance() ? "Not enough balance for the next bet" : "The bet or the target isn't right");
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
    Object.assign(auto.current, { running: true, timer: 0, done: 0, profit: 0, startBet: bet.bet });
    setRunning(true);
    runRound();
  };

  useEffect(() => {
    const a = auto.current;
    return () => clearTimeout(a.timer);
  }, []);

  // ---- The controls ----------------------------------------------------------------------

  const switchMode = (m: Mode) => {
    if (busy || m === mode) return;
    setMode(m);
  };

  const controls = (
    <>
      <ModeTabs modes={[["manual", "Manual"], ["auto", "Auto"]] as const} mode={mode} onChange={switchMode} disabled={busy} />
      <BetField bet={bet} disabled={busy} />
      <label className={kit.field}>
        <span className={kit.fieldHead}>
          <span className={kit.fieldLabel}>Target multiplier</span>
          <span className={`${kit.fieldMax} ${target === null ? kit.fieldBad : ""}`}>
            {MIN_TARGET.toFixed(2)}× to {new Intl.NumberFormat("en-US").format(MAX_TARGET)}×
          </span>
        </span>
        <span className={styles.targetRow}>
          <input
            className={kit.input}
            inputMode="decimal"
            value={targetText}
            disabled={busy}
            aria-invalid={target === null ? true : undefined}
            onChange={(e) => setTargetText(e.target.value.replace(/[^\d.]/g, ""))}
            onBlur={() => target !== null && setTargetText(target.toFixed(2))}
            data-target
          />
          <span className={styles.targetX} aria-hidden>
            ×
          </span>
        </span>
      </label>
      <Choices label="Quick targets" options={QUICK.map((q) => ({ value: q, label: `${q}×` }))} onChange={(q) => !busy && setTargetText(q.toFixed(2))} disabled={busy} attr="data-quick" />
      <div className={kit.readouts}>
        <Readout label="Win chance" value={target ? percent(chance) : "—"} attr="data-chance" />
        <Readout label="Payout on win" value={target && bet.bet > 0 ? money.format(payout) : "—"} attr="data-payout" />
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

      <div className={kit.go}>
        {mode === "manual" ? (
          <button type="button" className={kit.primary} disabled={!canBet} onClick={placeBet} data-place-bet>
            {rolling ? "Rolling…" : "Bet"}
          </button>
        ) : running ? (
          <button type="button" className={kit.stop} onClick={stopAuto} data-stop-auto>
            Stop auto
          </button>
        ) : (
          <button type="button" className={kit.primary} disabled={!canBet} onClick={startAuto} data-start-auto>
            Start auto
          </button>
        )}
        <button type="button" className={kit.iconButton} aria-pressed={fast} aria-label="Fast roll" title="Fast roll" onClick={() => setFast(!fast)} data-fast>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
          </svg>
        </button>
      </div>

      <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
    </>
  );

  // ---- The stage ------------------------------------------------------------------------------

  const shownTarget = target ?? last?.target ?? 2;
  const stage = (
    <>
      <History items={history} />
      <div className={styles.board} data-board>
        <div className={styles.numberWrap}>
          <span ref={numberRef} className={`${styles.number} tabular`} data-result data-outcome={phase === "won" ? "won" : phase === "lost" ? "lost" : undefined}>
            {last ? times(last.result) : "1.00×"}
          </span>
          <span className={styles.numberLabel}>{phase === "won" ? "Over the target" : phase === "lost" ? "Under the target" : rolling ? "Rolling" : last ? "Last roll" : "Set a target and bet"}</span>
        </div>
        <div className={styles.scale} aria-hidden>
          <span className={styles.track} />
          {TICKS.map((t, i) => (
            <span key={t} className={`${styles.tick} ${i === 0 ? styles.tickStart : i === TICKS.length - 1 ? styles.tickEnd : ""}`} style={{ left: place(t) }}>
              {t >= 1000 ? "1,000×" : `${t}×`}
            </span>
          ))}
          <span className={styles.targetMark} style={{ left: `clamp(44px, ${place(shownTarget)}, calc(100% - 44px))` }} data-target-mark>
            <b className="tabular">Target {times(shownTarget)}</b>
          </span>
          {last && phase !== "rolling" && <span className={styles.resultMark} style={{ left: place(last.result) }} data-outcome={last.won ? "won" : "lost"} />}
        </div>
      </div>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </>
  );

  return (
    <>
      <GameFrame controls={controls} stage={stage} attrs={{ "data-limbo": "", "data-phase": phase, "data-mode": mode }} />
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
            "Choose a bet and a target multiplier. The higher the target, the lower the chance: the house's 90% share over the target, so 2× wins 45% of the time.",
            "Press Bet. A number climbs from 1.00×. Land on or above your target and you win the bet times the target.",
            "Auto repeats the bet, raising or resetting it as you win or lose, until the number of bets or a profit or loss limit stops it.",
          ]}
          note="Rolls run from 1.00× up to 1,000,000×. About one in nine comes up 1.00× exactly."
        />
      )}
    </>
  );
}
