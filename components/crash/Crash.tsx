"use client";

import { useEffect, useRef, useState } from "react";
import { BetField, FairDialog, GameFrame, History, HowTo, ModeTabs, Readout, Tools, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CoinIcon } from "@/components/home/icons";
import { CRASHED_MS, WINDOW_MS, crashPoint, money, multiplierAt, payoutOf, ticks, times } from "@/lib/crash";
import { wagered } from "@/lib/gems";
import { takeNonce } from "@/lib/seeds";
import { addToBalance, walletBalance } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import styles from "./Crash.module.css";

type Phase = "waiting" | "flying" | "crashed";
type Mode = "manual" | "auto";
type Past = { id: number; text: string; won: boolean | null };
type Round = { nonce: number; crashAt: number; startedAt: number; points: [number, number][] };
/** The player's bet in the round: what's on it, where it cashes out by itself, and where it did. */
type Live = { amount: number; autoAt: number | null; cashedAt: number | null };

// the chart's box and its margins (left for the multipliers, bottom for the seconds)
const W = 640;
const H = 360;
const PL = 48;
const PR = 18;
const PT = 18;
const PB = 30;
const HISTORY = 14;
const MAX_POINTS = 1500;
const MIN_STEP_S = 0.04;

// the clock, outside the component so no render can read it
const clock = () => performance.now();

const parseMult = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) && n >= 1.01 ? Math.round(n * 100) / 100 : null;
};

/**
 * Crash. Rounds run on their own: a six-second window to bet, then the
 * multiplier climbs until it bursts at the round's crash point (one draw
 * from the shared seeds). A bet placed in the window pays bet times the
 * multiplier it's cashed out at, by hand or at the auto cash-out; a bet
 * still riding at the crash is lost. Auto plays the same bet round after
 * round with an auto cash-out, stopping at a count or a profit or loss.
 */
export default function Crash() {
  const bet = useBet();
  const [mode, setMode] = useState<Mode>("manual");
  const [phase, setPhase] = useState<Phase>("waiting");
  const [countdown, setCountdown] = useState(WINDOW_MS / 1000);
  const [placed, setPlaced] = useState(false);
  const [cashed, setCashed] = useState<number | null>(null);
  const [crashedAt, setCrashedAt] = useState<number | null>(null);
  const [axes, setAxes] = useState({ xMax: 8, yMax: 2 });
  const [history, setHistory] = useState<Past[]>([]);
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [autoText, setAutoText] = useState("");
  const [autoRounds, setAutoRounds] = useState("");
  const [stopProfit, setStopProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [running, setRunning] = useState(false);

  // the loop's own state, outside React: the phase as it is this instant,
  // the round in flight, the player's bet in it, and the timers
  const loop = useRef({
    phase: "waiting" as Phase,
    windowEnd: 0,
    round: null as Round | null,
    live: null as Live | null,
    raf: 0,
    timer: 0,
    tick: 0,
    lastAxes: 0,
    auto: { running: false, done: 0, profit: 0 },
  });
  const pastId = useRef(0);
  // what the loop needs from the latest render
  const latest = useRef({ bet: bet.bet, betOk: bet.ok, autoAt: null as number | null, autoRounds: "", stopProfit: "", stopLoss: "" });
  useEffect(() => {
    latest.current = { bet: bet.bet, betOk: bet.ok, autoAt: parseMult(autoText), autoRounds, stopProfit, stopLoss };
  });
  // the parts of the chart drawn every frame, straight into the DOM
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const bigRef = useRef<HTMLSpanElement>(null);
  const cashRef = useRef<HTMLSpanElement>(null);
  const payRef = useRef<HTMLSpanElement>(null);

  // ---- Drawing -------------------------------------------------------------------------

  const scales = (xMax: number, yMax: number) => ({
    x: (t: number) => PL + (t / xMax) * (W - PL - PR),
    y: (m: number) => H - PB - ((m - 1) / (yMax - 1)) * (H - PB - PT),
  });

  const paint = (t: number, m: number, live: Live | null) => {
    const L = loop.current;
    const r = L.round;
    if (!r) return;
    const xMax = Math.max(8, t * 1.12);
    const yMax = Math.max(2, 1 + (m - 1) * 1.2);
    const { x, y } = scales(xMax, yMax);
    const pts = r.points;
    let d = "";
    for (let i = 0; i < pts.length; i++) d += `${i ? "L" : "M"}${x(pts[i][0]).toFixed(1)} ${y(pts[i][1]).toFixed(1)}`;
    pathRef.current?.setAttribute("d", d);
    areaRef.current?.setAttribute("d", d ? `${d}L${x(t).toFixed(1)} ${H - PB}L${PL} ${H - PB}Z` : "");
    dotRef.current?.setAttribute("cx", x(t).toFixed(1));
    dotRef.current?.setAttribute("cy", y(m).toFixed(1));
    if (bigRef.current) bigRef.current.textContent = times(m);
    if (live && live.cashedAt === null) {
      const pay = money.format(payoutOf(live.amount, m));
      if (cashRef.current) cashRef.current.textContent = pay;
      if (payRef.current) payRef.current.textContent = pay;
    }
    const now = clock();
    if (now - L.lastAxes > 120) {
      L.lastAxes = now;
      setAxes({ xMax, yMax });
    }
  };

  const clearChart = () => {
    pathRef.current?.setAttribute("d", "");
    areaRef.current?.setAttribute("d", "");
    dotRef.current?.setAttribute("cx", String(PL));
    dotRef.current?.setAttribute("cy", String(H - PB));
  };

  // ---- The rounds ----------------------------------------------------------------------

  const stopAuto = (why?: string) => {
    const L = loop.current;
    L.auto.running = false;
    setRunning(false);
    if (why) setNote(why);
  };

  const placeBet = (): boolean => {
    const L = loop.current;
    const { bet: amount, betOk, autoAt } = latest.current;
    if (L.phase !== "waiting" || L.live || !betOk || amount > walletBalance()) return false;
    addToBalance(-amount);
    wagered(amount);
    L.live = { amount, autoAt, cashedAt: null };
    setPlaced(true);
    setCashed(null);
    setNote("");
    return true;
  };

  const cashOut = (at?: number) => {
    const L = loop.current;
    const live = L.live;
    const r = L.round;
    if (!live || live.cashedAt !== null || L.phase !== "flying" || !r) return;
    const now = multiplierAt(clock() - r.startedAt);
    // too late: the frame that's coming will crash it
    if (now >= r.crashAt) return;
    const m = Math.round((at ?? now) * 100) / 100;
    const payout = payoutOf(live.amount, m);
    live.cashedAt = m;
    addToBalance(payout);
    recordOutcome(Math.round(payout - live.amount));
    setCashed(m);
    setNote(`Cashed out at ${times(m)} for ${money.format(payout)}`);
  };

  const afterRound = (live: Live | null, r: Round) => {
    const L = loop.current;
    const a = L.auto;
    if (!a.running) return;
    if (live) {
      a.done += 1;
      a.profit = Math.round(a.profit + (live.cashedAt !== null ? payoutOf(live.amount, live.cashedAt) - live.amount : -live.amount));
    }
    const limit = Number(latest.current.autoRounds) || 0;
    const profitStop = Number(latest.current.stopProfit) || 0;
    const lossStop = Number(latest.current.stopLoss) || 0;
    if ((limit > 0 && a.done >= limit) || (profitStop > 0 && a.profit >= profitStop) || (lossStop > 0 && -a.profit >= lossStop)) {
      stopAuto(`Auto done: ${a.done} round${a.done === 1 ? "" : "s"}, ${a.profit >= 0 ? "+" : "−"}${money.format(Math.abs(a.profit))}. Last crash ${times(r.crashAt)}.`);
    }
  };

  const crash = () => {
    const L = loop.current;
    const r = L.round;
    if (!r) return;
    cancelAnimationFrame(L.raf);
    L.phase = "crashed";
    const live = L.live;
    const won = live ? live.cashedAt !== null : null;
    const { x, y } = scales(Math.max(8, r.points[r.points.length - 1][0] * 1.12), Math.max(2, 1 + (r.crashAt - 1) * 1.2));
    dotRef.current?.setAttribute("cx", x(r.points[r.points.length - 1][0]).toFixed(1));
    dotRef.current?.setAttribute("cy", y(r.crashAt).toFixed(1));
    setPhase("crashed");
    setCrashedAt(r.crashAt);
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: times(r.crashAt), won }, ...h].slice(0, HISTORY));
    if (live && !won) {
      recordOutcome(-live.amount);
      setNote(`Crashed at ${times(r.crashAt)}: the ${money.format(live.amount)} is gone`);
    }
    else if (live && won) setNote(`Crashed at ${times(r.crashAt)}, after you cashed out at ${times(live.cashedAt!)}`);
    else setNote(`Crashed at ${times(r.crashAt)}`);
    afterRound(live, r);
    L.timer = window.setTimeout(startWindow, CRASHED_MS);
  };

  const frame = () => {
    const L = loop.current;
    const r = L.round;
    if (!r || L.phase !== "flying") return;
    const t = (clock() - r.startedAt) / 1000;
    const m = multiplierAt(t * 1000);
    if (m >= r.crashAt) {
      crash();
      return;
    }
    if (t - r.points[r.points.length - 1][0] >= MIN_STEP_S) {
      r.points.push([t, m]);
      if (r.points.length > MAX_POINTS) r.points.splice(1, 1);
    }
    const live = L.live;
    if (live && live.cashedAt === null && live.autoAt !== null && m >= live.autoAt) cashOut(live.autoAt);
    paint(t, m, live);
    L.raf = requestAnimationFrame(frame);
  };

  const startFlight = () => {
    const L = loop.current;
    const s = takeNonce();
    L.round = { nonce: s.nonce, crashAt: crashPoint(s.serverSeed, s.clientSeed, s.nonce), startedAt: clock(), points: [[0, 1]] };
    L.phase = "flying";
    L.lastAxes = 0;
    setPhase("flying");
    setAxes({ xMax: 8, yMax: 2 });
    if (!L.live) setNote("");
    L.raf = requestAnimationFrame(frame);
  };

  const startWindow = () => {
    const L = loop.current;
    L.phase = "waiting";
    L.round = null;
    L.live = null;
    L.windowEnd = clock() + WINDOW_MS;
    setPhase("waiting");
    setPlaced(false);
    setCashed(null);
    setCrashedAt(null);
    setCountdown(WINDOW_MS / 1000);
    clearChart();
    // auto: the bet for this round goes on at once
    if (L.auto.running && !placeBet()) stopAuto(latest.current.betOk ? "Auto stopped: not enough balance for the next round" : "Auto stopped: the bet's not right");
  };

  const tick = () => {
    const L = loop.current;
    if (L.phase !== "waiting") return;
    const left = Math.max(0, L.windowEnd - clock());
    setCountdown(left / 1000);
    if (left <= 0) startFlight();
  };

  // the rounds start once the page is up, and stop with it
  const api = useRef({ tick });
  useEffect(() => {
    api.current = { tick };
  });
  useEffect(() => {
    const L = loop.current;
    L.windowEnd = clock() + WINDOW_MS;
    L.tick = window.setInterval(() => api.current.tick(), 100);
    return () => {
      clearInterval(L.tick);
      clearTimeout(L.timer);
      cancelAnimationFrame(L.raf);
    };
  }, []);

  const startAuto = () => {
    const L = loop.current;
    if (L.auto.running || !bet.ok) return;
    if (parseMult(autoText) === null) {
      setNote("Auto needs a cash-out multiplier of 1.01 or more");
      return;
    }
    L.auto = { running: true, done: 0, profit: 0 };
    setRunning(true);
    setNote("");
    if (L.phase === "waiting" && !L.live) placeBet();
  };

  // ---- The controls --------------------------------------------------------------------

  const flying = phase === "flying";
  const waiting = phase === "waiting";
  const liveNow = placed && cashed === null;
  const busy = running;
  const autoAt = parseMult(autoText);

  const mainButton =
    flying && liveNow ? (
      <button type="button" className={kit.primary} onClick={() => cashOut()} data-cashout>
        <span>
          Cash out <span ref={cashRef}>{money.format(bet.bet)}</span>
        </span>
      </button>
    ) : placed ? (
      <button type="button" className={kit.primary} disabled data-place-bet>
        {cashed !== null ? `Cashed out at ${times(cashed)}` : waiting ? "Bet placed" : "Riding…"}
      </button>
    ) : (
      <button type="button" className={kit.primary} disabled={!waiting || !bet.ok} onClick={placeBet} data-place-bet>
        {waiting ? "Place bet" : "Next round soon"}
      </button>
    );

  const controls = (
    <>
      <ModeTabs modes={[["manual", "Manual"], ["auto", "Auto"]] as const} mode={mode} onChange={setMode} disabled={busy} />
      <BetField bet={bet} disabled={busy || placed} />
      <label className={kit.field}>
        <span className={kit.fieldHead}>
          <span className={kit.fieldLabel}>Auto cash out</span>
          <span className={kit.fieldMax}>{mode === "auto" ? "1.01× or more" : "optional"}</span>
        </span>
        <input
          className={kit.input}
          inputMode="decimal"
          placeholder={mode === "auto" ? "2.00" : "off"}
          value={autoText}
          disabled={busy || (placed && !waiting)}
          aria-invalid={autoText !== "" && autoAt === null ? true : undefined}
          onChange={(e) => setAutoText(e.target.value.replace(/[^\d.]/g, ""))}
          data-auto-cashout
        />
      </label>

      {mode === "manual" ? (
        <>
          {placed && (
            <div className={kit.readouts}>
              <Readout
                label={cashed !== null ? `Cashed out (${times(cashed)})` : flying ? "Payout now" : "On the line"}
                value={
                  <>
                    <CoinIcon />
                    <span ref={payRef}>{money.format(cashed !== null ? payoutOf(bet.bet, cashed) : bet.bet)}</span>
                  </>
                }
                up={cashed !== null}
                attr="data-payout"
              />
            </div>
          )}
          {mainButton}
        </>
      ) : (
        <>
          <label className={kit.field}>
            <span className={kit.fieldLabel}>Number of rounds</span>
            <input className={kit.input} inputMode="numeric" placeholder="∞" value={autoRounds} disabled={running} onChange={(e) => setAutoRounds(e.target.value.replace(/\D/g, ""))} data-auto-rounds />
          </label>
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
          {running ? (
            <button type="button" className={kit.stop} onClick={() => stopAuto("Auto stopped")} data-stop-auto>
              Stop auto
            </button>
          ) : (
            <button type="button" className={kit.primary} disabled={!bet.ok || autoAt === null} onClick={startAuto} data-start-auto>
              Start auto
            </button>
          )}
          {running && (
            <p className={kit.autoHint} data-auto-status>
              Betting {money.format(bet.bet)} each round, cashing out at {times(autoAt ?? 1.01)}.
            </p>
          )}
        </>
      )}

      <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
    </>
  );

  // ---- The stage -----------------------------------------------------------------------

  const { x, y } = scales(axes.xMax, axes.yMax);
  const yTicks = ticks(1, axes.yMax).filter((v) => v > 1);
  const xTicks = ticks(0, axes.xMax).filter((v) => v > 0);

  const stage = (
    <>
      <History items={history} label="Last crashes" />
      <div className={styles.chartWrap}>
        <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <g className={styles.grid}>
            {yTicks.map((v) => (
              <line key={`y${v}`} x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} />
            ))}
            {xTicks.map((v) => (
              <line key={`x${v}`} x1={x(v)} x2={x(v)} y1={PT} y2={H - PB} />
            ))}
          </g>
          <g className={styles.labels}>
            {yTicks.map((v) => (
              <text key={`yl${v}`} x={PL - 8} y={y(v) + 4} textAnchor="end">
                {v.toFixed(2)}×
              </text>
            ))}
            {xTicks.map((v) => (
              <text key={`xl${v}`} x={x(v)} y={H - PB + 18} textAnchor="middle">
                {v}s
              </text>
            ))}
          </g>
          <path ref={areaRef} className={styles.area} d="" />
          <path ref={pathRef} className={styles.line} d="" />
          <circle ref={dotRef} className={styles.dot} r="5" cx={PL} cy={H - PB} />
        </svg>
        {placed && (
          <span className={styles.stake}>
            <CoinIcon />
            <b className="tabular">{money.format(bet.bet)}</b> {cashed !== null ? `cashed out at ${times(cashed)}` : "riding"}
          </span>
        )}
        <div className={styles.center}>
          {waiting ? (
            <>
              <span className={styles.lead}>Next round in</span>
              <span className={`${styles.big} tabular`} data-countdown>
                {countdown.toFixed(1)}s
              </span>
              <span className={styles.bar} aria-hidden>
                <span className={styles.barFill} style={{ width: `${(countdown / (WINDOW_MS / 1000)) * 100}%` }} />
              </span>
            </>
          ) : flying ? (
            <>
              <span ref={bigRef} className={`${styles.big} tabular`} data-multiplier>
                1.00×
              </span>
              {cashed !== null && <span className={`${styles.sub} ${styles.green}`}>Cashed out at {times(cashed)}</span>}
            </>
          ) : (
            <>
              <span className={styles.lead}>Crashed at</span>
              <span className={`${styles.big} ${styles.red} tabular`} data-crashed-at>
                {crashedAt !== null ? times(crashedAt) : ""}
              </span>
            </>
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
      <GameFrame controls={controls} stage={stage} attrs={{ "data-crash": "", "data-phase": phase, "data-mode": mode }} />
      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={false}
          intro="One draw decides where each round crashes; rounds run whether you bet or not, so the nonce counts every one."
          verify={(server, client, nonce) => `Crashed at ${times(crashPoint(server, client, nonce))}`}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How to play Crash"
          onClose={() => setDialog(null)}
          steps={[
            "Rounds run on their own. While the countdown's on, place your bet; an auto cash-out multiplier is optional.",
            "The multiplier climbs from 1.00×. Your payout is your bet times the multiplier, so it climbs with it.",
            "Cash out before it crashes to take the payout. A bet still riding at the crash is lost.",
            "Auto plays the same bet every round and cashes out at your multiplier, until a round count or a profit or loss limit.",
          ]}
          note="The house keeps 10%: one round in ten crashes at 1.00× before anyone can cash out, and the rest are drawn fair."
        />
      )}
    </>
  );
}
