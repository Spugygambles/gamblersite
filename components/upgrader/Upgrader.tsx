"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { wagered } from "@/lib/gems";
import { rotateSeeds, takeNonce, useSeeds } from "@/lib/seeds";
import { SKINS, WEARS, skinBySlug, type Skin } from "@/lib/skins";
import { MAX_ITEMS, MAX_MULT, MIN_BET, chanceOf, isWin, money, multiplierOf, percent, rollOf, times } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { CheckIcon, CloseIcon, CoinIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import { FairnessDialog, HowToDialog } from "./Dialogs";
import SkinArt from "./SkinArt";
import Wheel from "./Wheel";
import styles from "./Upgrader.module.css";

type Mode = "manual" | "auto";
type Phase = "idle" | "spinning" | "won" | "lost";
type Spin = { won: boolean; bet: number; target: number; mult: number; chance: number; roll: number; items: Skin[] };
type Past = { id: number; won: boolean; mult: number };

const QUICK = [1.5, 2, 5, 10, 25];
const ZONES = [1, 2, 3, 4, 5];
const RANGES: { id: string; label: string; min: number; max: number }[] = [
  { id: "any", label: "Any", min: 0, max: Infinity },
  { id: "u10", label: "Under 10", min: 0, max: 10 },
  { id: "10-100", label: "10 to 100", min: 10, max: 100 },
  { id: "100-1k", label: "100 to 1,000", min: 100, max: 1000 },
  { id: "1k+", label: "1,000 and up", min: 1000, max: Infinity },
];
const HISTORY = 12;
// a spin: four turns of the ring over SPIN_MS, or one turn over FAST_MS
const SPIN_MS = 4200;
const FAST_MS = 900;
const AUTO_PAUSE = 700;

const toCents = (n: number) => Math.round(n * 100) / 100;
const parseBet = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? toCents(n) : 0;
};

/**
 * The Upgrader. Type a bet, pick up to four skins worth more, and spin:
 * the ring turns and stops under the pointer, and orange under it means
 * the skins are won (their value goes to the balance, until the site has
 * an inventory). The roll comes from the shared provably-fair seeds.
 */
export default function Upgrader() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const seeds = useSeeds();

  const [mode, setMode] = useState<Mode>("manual");
  const [betText, setBetText] = useState("10.00");
  const [zones, setZones] = useState(1);
  const [fast, setFast] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"high" | "low" | "name">("high");
  const [range, setRange] = useState("any");
  // a quick multiplier pressed with nothing picked: the list narrows to skins at about that multiple of the bet
  const [around, setAround] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Spin | null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<Past[]>([]);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const live = useRef<{ phase: Phase; pending: Spin | null }>({ phase: "idle", pending: null });
  const settleTimer = useRef(0);
  const pastId = useRef(0);

  // auto
  const [autoBets, setAutoBets] = useState("");
  const [stopProfit, setStopProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [running, setRunning] = useState(false);
  const auto = useRef({ running: false, timer: 0, done: 0, profit: 0 });

  const bet = parseBet(betText);
  const spinning = phase === "spinning";
  const busy = spinning || running;
  const items = selected.map(skinBySlug).filter((s): s is Skin => !!s);
  const target = toCents(items.reduce((sum, s) => sum + s.price, 0));
  const mult = multiplierOf(bet, target);
  const chance = chanceOf(bet, target);
  const short = bet > balance;
  const why =
    bet <= 0 ? "Type a bet to start" : short ? "Not enough balance" : items.length === 0 ? "Pick a skin to play for" : target <= bet ? "Pick skins worth more than your bet" : mult > MAX_MULT ? `Over ${MAX_MULT}× your bet` : "";
  const canSpin = !busy && !why;

  // ---- The list ----------------------------------------------------------------------

  const list = (() => {
    const q = query.trim().toLowerCase();
    const r = RANGES.find((x) => x.id === range) ?? RANGES[0];
    const lo = around && bet > 0 ? bet * around * 0.7 : r.min;
    const hi = around && bet > 0 ? bet * around * 1.4 : r.max;
    const shown: Skin[] = [];
    let hidden = 0;
    for (const s of SKINS) {
      if (q && !s.name.toLowerCase().includes(q)) continue;
      if (s.price < lo || s.price > hi) continue;
      if (bet > 0 && s.price > bet * MAX_MULT) {
        hidden += 1;
        continue;
      }
      shown.push(s);
    }
    shown.sort((a, b) => (sort === "high" ? b.price - a.price : sort === "low" ? a.price - b.price : a.name.localeCompare(b.name)));
    return { shown, hidden };
  })();

  const toggle = (slug: string) => {
    if (busy) return;
    setSelected((sel) => {
      if (sel.includes(slug)) return sel.filter((x) => x !== slug);
      const s = skinBySlug(slug);
      if (!s || sel.length >= MAX_ITEMS || (bet > 0 && s.price <= bet)) return sel;
      return [...sel, slug];
    });
    setAround(null);
  };

  // ---- The bet -------------------------------------------------------------------------

  const setBet = (n: number) => setBetText(Math.min(Math.max(MIN_BET, toCents(n)), Math.max(MIN_BET, balance)).toFixed(2));

  // A quick multiplier: with skins picked, the bet that makes them that
  // multiple; with none, the list narrows to skins around it.
  const quick = (m: number) => {
    if (busy) return;
    if (items.length > 0) setBet(target / m);
    else if (bet > 0) {
      setAround(m);
      setRange("any");
    }
  };

  // ---- Spinning -------------------------------------------------------------------------

  const stopAuto = () => {
    auto.current.running = false;
    clearTimeout(auto.current.timer);
    setRunning(false);
  };

  const nextRound = useRef<() => void>(() => {});
  const afterRound = (p: Spin) => {
    const a = auto.current;
    a.done += 1;
    a.profit = toCents(a.profit + (p.won ? p.target - p.bet : -p.bet));
    const limit = Number(autoBets) || 0;
    const profitStop = Number(stopProfit) || 0;
    const lossStop = Number(stopLoss) || 0;
    if ((limit > 0 && a.done >= limit) || (profitStop > 0 && a.profit >= profitStop) || (lossStop > 0 && -a.profit >= lossStop)) {
      setNote(`Auto done: ${a.done} spin${a.done === 1 ? "" : "s"}, ${a.profit >= 0 ? "+" : "−"}${money.format(Math.abs(a.profit))}`);
      stopAuto();
      return;
    }
    a.timer = window.setTimeout(() => nextRound.current(), AUTO_PAUSE);
  };

  const settle = () => {
    const p = live.current.pending;
    if (!p) return;
    if (p.won) addToBalance(p.target);
    const next: Phase = p.won ? "won" : "lost";
    live.current = { phase: next, pending: null };
    setPhase(next);
    setResult(p);
    const id = ++pastId.current;
    setHistory((h) => [{ id, won: p.won, mult: p.mult }, ...h].slice(0, HISTORY));
    setNote(p.won ? `${p.items.map((s) => s.name).join(", ")}: ${money.format(p.target)} to your balance` : `No luck: rolled ${percent(p.roll)} of the wheel`);
    if (auto.current.running) afterRound(p);
  };

  const spin = (betNow: number) => {
    const t = target;
    const ch = chanceOf(betNow, t);
    const s = takeNonce();
    const roll = rollOf(s.serverSeed, s.clientSeed, s.nonce);
    const won = isWin(roll, ch, zones);
    addToBalance(-betNow);
    wagered(betNow);
    const pending: Spin = { won, bet: betNow, target: t, mult: multiplierOf(betNow, t), chance: ch, roll, items };
    live.current = { phase: "spinning", pending };
    setPhase("spinning");
    setResult(null);
    setNote("");
    // the ring turns on from where it is and stops with the roll under the pointer
    const angle = roll * 360;
    const turns = fast ? 1 : 4;
    setRotation((rot) => rot + ((((-angle - rot) % 360) + 360) % 360) + turns * 360);
    clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settle, (fast ? FAST_MS : SPIN_MS) + 80);
  };

  const upgrade = () => {
    if (!canSpin || live.current.phase === "spinning") return;
    spin(bet);
  };

  // ---- Auto -------------------------------------------------------------------------------

  const runRound = () => {
    const a = auto.current;
    if (!a.running) return;
    if (bet <= 0 || bet > walletBalance() || !items.length || target <= bet || mult > MAX_MULT) {
      setNote(bet > walletBalance() ? "Not enough balance for the next spin" : "The bet or the skins changed");
      stopAuto();
      return;
    }
    spin(bet);
  };
  useEffect(() => {
    nextRound.current = runRound;
  });

  const startAuto = () => {
    if (!canSpin || auto.current.running) return;
    Object.assign(auto.current, { running: true, timer: 0, done: 0, profit: 0 });
    setRunning(true);
    runRound();
  };

  useEffect(() => {
    const a = auto.current;
    return () => {
      clearTimeout(a.timer);
      clearTimeout(settleTimer.current);
    };
  }, []);

  const switchMode = (m: Mode) => {
    if (busy || m === mode) return;
    setMode(m);
  };

  // ---- The hub: what the wheel says ---------------------------------------------------------

  const hub =
    phase === "won" && result ? (
      <>
        <span className={`${styles.hubBig} ${styles.hubWin} tabular`} data-result="won">
          WIN
        </span>
        <span className={`${styles.hubSub} tabular`}>+{money.format(result.target)}</span>
      </>
    ) : phase === "lost" && result ? (
      <>
        <span className={`${styles.hubBig} ${styles.hubLoss}`} data-result="lost">
          LOST
        </span>
        <span className={`${styles.hubSub} tabular`}>{times(result.mult)} missed</span>
      </>
    ) : items.length && bet > 0 && !why ? (
      <>
        <span className={`${styles.hubBig} tabular`} data-chance>
          {percent(chance)}
        </span>
        <span className={styles.hubSub}>
          chance at <b className="tabular" data-multiplier>{times(mult)}</b>
        </span>
      </>
    ) : (
      <span className={styles.hubLead}>{items.length === 0 ? "Pick a skin to start" : why}</span>
    );

  return (
    <div className={styles.wrap} data-upgrader data-phase={phase} data-mode={mode}>
      <div className={styles.top}>
        <aside className={styles.controls} aria-label="Bet" data-controls>
          <div className={styles.modes} role="tablist" aria-label="Mode">
            {(["manual", "auto"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} className={styles.modeTab} disabled={busy} onClick={() => switchMode(m)} data-mode-tab={m}>
                {m === "manual" ? "Manual" : "Auto"}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Bet amount</span>
            <span className={styles.betRow}>
              <CoinIcon className={styles.betCoin} />
              <input
                className={styles.betInput}
                inputMode="decimal"
                value={betText}
                disabled={busy}
                aria-invalid={short && !busy ? true : undefined}
                onChange={(e) => setBetText(e.target.value.replace(/[^\d.]/g, ""))}
                onBlur={() => bet > 0 && setBetText(bet.toFixed(2))}
                data-bet
              />
              <button type="button" className={styles.betStep} disabled={busy} onClick={() => setBet(bet / 2)} data-bet-half>
                ½
              </button>
              <button type="button" className={styles.betStep} disabled={busy} onClick={() => setBet(bet * 2)} data-bet-double>
                2×
              </button>
              <button type="button" className={styles.betStep} disabled={busy} onClick={() => setBet(balance)} data-bet-max>
                Max
              </button>
            </span>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={Math.max(MIN_BET, balance)}
              step={0.01}
              value={Math.min(bet, balance)}
              disabled={busy}
              aria-label="Bet amount"
              onChange={(e) => setBet(Number(e.target.value))}
              data-bet-range
            />
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Choose multiplier</span>
            <div className={styles.choices} role="group" aria-label="Quick multiplier">
              {QUICK.map((m) => (
                <button key={m} type="button" className={styles.choice} disabled={busy || (!items.length && bet <= 0)} onClick={() => quick(m)} data-quick={m}>
                  {m}×
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Zones</span>
            <div className={styles.choices} role="radiogroup" aria-label="Zones">
              {ZONES.map((z) => (
                <button key={z} type="button" role="radio" aria-checked={zones === z} className={styles.choice} disabled={busy} onClick={() => setZones(z)} data-zones={z}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          {mode === "auto" && (
            <>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Number of spins</span>
                <input className={styles.input} inputMode="numeric" placeholder="∞" value={autoBets} disabled={running} onChange={(e) => setAutoBets(e.target.value.replace(/\D/g, ""))} data-auto-bets />
              </label>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Stop on profit</span>
                  <input className={styles.input} inputMode="decimal" placeholder="0.00" value={stopProfit} disabled={running} onChange={(e) => setStopProfit(e.target.value.replace(/[^\d.]/g, ""))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Stop on loss</span>
                  <input className={styles.input} inputMode="decimal" placeholder="0.00" value={stopLoss} disabled={running} onChange={(e) => setStopLoss(e.target.value.replace(/[^\d.]/g, ""))} />
                </label>
              </div>
            </>
          )}

          <div className={styles.go}>
            {mode === "manual" ? (
              <button type="button" className={styles.primary} disabled={!canSpin} onClick={upgrade} data-upgrade>
                {spinning ? "Spinning…" : "Upgrade"}
              </button>
            ) : running ? (
              <button type="button" className={styles.stop} onClick={stopAuto} data-stop-auto>
                Stop auto
              </button>
            ) : (
              <button type="button" className={styles.primary} disabled={!canSpin} onClick={startAuto} data-start-auto>
                Start auto
              </button>
            )}
            <button type="button" className={styles.fast} aria-pressed={fast} aria-label="Fast spin" title="Fast spin" onClick={() => setFast(!fast)} data-fast>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
              </svg>
            </button>
          </div>
          {why && !busy && (
            <p className={styles.why} data-why>
              {why}
            </p>
          )}

          <div className={styles.tools}>
            <button type="button" className={styles.tool} aria-label="Provably fair" onClick={() => setDialog("fair")} data-fairness>
              <ShieldIcon />
            </button>
            <button type="button" className={styles.tool} aria-label="How it works" onClick={() => setDialog("how")} data-how-to>
              <InfoIcon />
            </button>
          </div>
        </aside>

        <div className={styles.stage}>
          <ol className={styles.history} aria-label="Last spins" data-history>
            {history.map((h) => (
              <li key={h.id} className={`${styles.past} ${h.won ? styles.pastWon : styles.pastLost} tabular`}>
                {times(h.mult)}
              </li>
            ))}
          </ol>
          <Wheel chance={chance} zones={zones} rotation={rotation} spinMs={fast ? FAST_MS : SPIN_MS}>
            <div className={styles.hubText} data-hub>
              {hub}
            </div>
          </Wheel>
          <p className={styles.stageNote} aria-live="polite" data-note>
            {note}
          </p>
        </div>

        <aside className={styles.picked} aria-label="Your pick" data-picked>
          <div className={styles.pickedHead}>
            <span className={styles.fieldLabel}>Playing for</span>
            <span className={styles.pickedCount}>
              <b data-selected-count>{items.length}</b>/{MAX_ITEMS}
            </span>
          </div>
          <ul className={styles.slots}>
            {Array.from({ length: MAX_ITEMS }, (_, i) => {
              const s = items[i];
              return s ? (
                <li key={s.slug} className={styles.slot} style={{ "--rarity": s.color } as React.CSSProperties} data-slot={s.slug}>
                  <span className={styles.slotArt}>
                    <SkinArt skin={s} />
                  </span>
                  <span className={styles.slotName}>{s.finish}</span>
                  <span className={styles.slotWeapon}>{s.weapon}</span>
                  <span className={`${styles.slotPrice} tabular`}>
                    <CoinIcon />
                    {money.format(s.price)}
                  </span>
                  <button type="button" className={styles.slotRemove} aria-label={`Remove ${s.name}`} disabled={busy} onClick={() => toggle(s.slug)}>
                    <CloseIcon />
                  </button>
                </li>
              ) : (
                <li key={`empty-${i}`} className={styles.slotEmpty} aria-hidden>
                  {i === 0 && items.length === 0 ? "Pick from the list below" : ""}
                </li>
              );
            })}
          </ul>
          <div className={styles.pickedFoot}>
            <span className={styles.fieldLabel}>Total</span>
            <span className={`${styles.pickedTotal} tabular`} data-target>
              <CoinIcon />
              {money.format(target)}
            </span>
            <button type="button" className={styles.linkish} disabled={busy || !items.length} onClick={() => setSelected([])} data-clear>
              Clear
            </button>
          </div>
        </aside>
      </div>

      <div className={styles.bar}>
        <input className={styles.search} type="search" placeholder="Search skins…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search skins" data-search />
        <label className={styles.barField}>
          <span>Sort</span>
          <select className={styles.barSelect} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} data-sort>
            <option value="high">High to low</option>
            <option value="low">Low to high</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className={styles.barField}>
          <span>Price</span>
          <select
            className={styles.barSelect}
            value={around ? "around" : range}
            onChange={(e) => {
              setAround(null);
              setRange(e.target.value === "around" ? "any" : e.target.value);
            }}
            data-range
          >
            {around && <option value="around">About {around}× your bet</option>}
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.barInfo}>
          <span>
            {list.shown.length} skin{list.shown.length === 1 ? "" : "s"}
          </span>
          {list.hidden > 0 && (
            <span className={styles.barHidden} data-hidden-note>
              {list.hidden} hidden, over {MAX_MULT}× your bet
            </span>
          )}
        </div>
      </div>

      <ul className={styles.grid} aria-label="Skins" data-grid>
        {list.shown.map((s) => {
          const on = selected.includes(s.slug);
          const under = bet > 0 && s.price <= bet;
          const full = !on && selected.length >= MAX_ITEMS;
          return (
            <li key={s.slug}>
              <button
                type="button"
                className={styles.card}
                style={{ "--rarity": s.color } as React.CSSProperties}
                aria-pressed={on}
                disabled={busy || (!on && (under || full))}
                onClick={() => toggle(s.slug)}
                data-item={s.slug}
                data-selected={on || undefined}
                data-under={under || undefined}
                title={under ? "Worth no more than your bet" : full ? `You can pick ${MAX_ITEMS} skins` : undefined}
              >
                <span className={styles.cardArt}>
                  <SkinArt skin={s} />
                </span>
                <span className={styles.cardName}>{s.finish}</span>
                <span className={styles.cardWeapon}>
                  {s.weapon} <i>{WEARS[s.wear]}</i>
                </span>
                <span className={`${styles.cardPrice} tabular`}>
                  <CoinIcon />
                  {money.format(s.price)}
                </span>
                {on && (
                  <span className={styles.cardCheck} aria-hidden>
                    <CheckIcon />
                  </span>
                )}
                {under && <span className={styles.cardTag}>Under your bet</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {dialog === "fair" && <FairnessDialog onClose={() => setDialog(null)} seeds={seeds} busy={busy} onRotate={(c) => !busy && rotateSeeds(c)} />}
      {dialog === "how" && <HowToDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
