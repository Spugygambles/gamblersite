"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GRIDS, maxMines, MIN_BET, minePositions, money, multiplier, payoutOf, times, type Grid } from "@/lib/mines";
import { wagered } from "@/lib/gems";
import { recordOutcome } from "@/lib/stats";
import { randomHex } from "@/lib/sha256";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { CoinIcon, GearIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import Board, { type Phase } from "./Board";
import { FairnessDialog, HowToDialog } from "./Dialogs";
import { play } from "./sounds";
import { saveSettings, seedStore, useSeeds, useSettings } from "./stores";
import styles from "./Mines.module.css";

type Mode = "manual" | "auto";
type Adjust = { mode: "reset" | "increase"; pct: string };
type Game = { tiles: number; mines: number; bet: number; positions: number[]; revealed: number[]; hit: number | null };
type Past = { id: number; mult: number; won: boolean };

const HISTORY = 12;
// how fast an autobet turns tiles over, and its pause before the next round
const AUTO_STEP = 170;
const AUTO_PAUSE = 700;
const NO_GAME: Game = { tiles: 25, mines: 3, bet: 0, positions: [], revealed: [], hit: null };

const robux = (n: number) => Math.round(n);
const oneOf = (list: number[]) => list[Math.floor(Math.random() * list.length)];
const parseBet = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? robux(n) : 0;
};

/**
 * Mines. Pick a bet, a board and how many mines, place the bet, turn over
 * tiles for gems and cash out before you hit a mine. Auto plays a marked
 * set of tiles round after round. Boards are drawn provably fair from the
 * server seed, the player's client seed and a nonce (lib/mines.ts); the
 * seeds live in the browser until the game is wired to the server, which
 * will hold the server seed and do the draw.
 */
export default function MinesGame() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const seeds = useSeeds();
  const settings = useSettings();

  const [mode, setMode] = useState<Mode>("manual");
  const [grid, setGrid] = useState<Grid>(25);
  const [minesText, setMinesText] = useState("3");
  const [betText, setBetText] = useState("5000");
  const [phase, setPhase] = useState<Phase>("idle");
  const [game, setGame] = useState<Game>(NO_GAME);
  // The game as it stands this instant, ahead of React's render: a sweep
  // turns tiles over faster than renders come, so every pick reads this.
  const live = useRef({ phase: "idle" as Phase, game: NO_GAME });
  const [result, setResult] = useState<{ mult: number; payout: number } | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [note, setNote] = useState("");
  const pastId = useRef(0);

  // auto mode
  const [selected, setSelected] = useState<number[]>([]);
  const [autoBets, setAutoBets] = useState("");
  const [onWin, setOnWin] = useState<Adjust>({ mode: "reset", pct: "" });
  const [onLoss, setOnLoss] = useState<Adjust>({ mode: "reset", pct: "" });
  const [stopProfit, setStopProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [running, setRunning] = useState(false);
  const auto = useRef({ running: false, timer: 0, done: 0, profit: 0, startBet: 0 });

  const bet = parseBet(betText);
  const playing = phase === "playing";
  const busy = playing || running;
  const picks = game.revealed.length;
  const mult = multiplier(game.tiles, game.mines, picks);
  const next = multiplier(game.tiles, game.mines, picks + 1);
  const short = bet > balance;
  // the mines count is typed; anything outside 1 to one less than the tiles holds the bet
  const minesMax = maxMines(grid);
  const minesNum = /^\d+$/.test(minesText) ? Number(minesText) : NaN;
  const minesOk = minesNum >= 1 && minesNum <= minesMax;
  const mines = minesOk ? minesNum : 1;
  const canBet = !busy && bet > 0 && !short && minesOk;

  const setLive = (ph: Phase, g: Game) => {
    live.current = { phase: ph, game: g };
    setPhase(ph);
    setGame(g);
  };

  // ---- Starting and ending games ---------------------------------------------------

  const resetBoard = (tiles?: number) => {
    const g = live.current.game;
    setLive("idle", { ...g, tiles: tiles ?? g.tiles, positions: [], revealed: [], hit: null });
    setResult(null);
    setNote("");
  };

  // Draws a board for the next nonce and takes the bet.
  const start = (betNow: number): Game => {
    const s = seedStore.get();
    const positions = minePositions(s.serverSeed, s.clientSeed, s.nonce, grid, mines);
    seedStore.set({ ...s, nonce: s.nonce + 1 });
    addToBalance(-betNow);
    wagered(betNow);
    const fresh: Game = { tiles: grid, mines, bet: betNow, positions, revealed: [], hit: null };
    setLive("playing", fresh);
    setResult(null);
    setNote("");
    play("bet");
    return fresh;
  };

  const finish = (g: Game, won: boolean) => {
    const m = won ? multiplier(g.tiles, g.mines, g.revealed.length) : 0;
    const payout = won ? payoutOf(g.bet, m) : 0;
    if (won) addToBalance(payout);
    recordOutcome(won ? robux(payout - g.bet) : -g.bet);
    const id = ++pastId.current;
    setLive(won ? "won" : "lost", g);
    setResult(won ? { mult: m, payout } : null);
    setHistory((h) => [{ id, mult: m, won }, ...h].slice(0, HISTORY));
    const cleared = g.revealed.length === g.tiles - g.mines;
    setNote(won ? `${cleared ? "Cleared the board" : "Cashed out"} at ${times(m)} for ${money.format(payout)}` : "You hit a mine");
    if (won) play("win");
    return payout;
  };

  const placeBet = () => {
    if (!canBet || live.current.phase === "playing") return;
    start(bet);
  };

  const pick = (i: number) => {
    const { phase: ph, game: g0 } = live.current;
    if (ph !== "playing" || g0.revealed.includes(i)) return;
    if (g0.positions.includes(i)) {
      finish({ ...g0, hit: i }, false);
      return;
    }
    const g = { ...g0, revealed: [...g0.revealed, i] };
    // every safe tile turned over: nothing left to risk
    if (g.revealed.length === g.tiles - g.mines) {
      finish(g, true);
    } else {
      setLive("playing", g);
      play("gem", g.revealed.length);
    }
  };

  const cashout = () => {
    const { phase: ph, game: g } = live.current;
    if (ph !== "playing" || g.revealed.length === 0) return;
    finish(g, true);
  };

  const random = () => {
    const { phase: ph, game: g } = live.current;
    if (ph !== "playing") return;
    const hidden = Array.from({ length: g.tiles }, (_, i) => i).filter((i) => !g.revealed.includes(i));
    pick(oneOf(hidden));
  };

  // ---- Auto -------------------------------------------------------------------------

  const stopAuto = () => {
    auto.current.running = false;
    clearTimeout(auto.current.timer);
    setRunning(false);
  };

  // Plays one round over the marked tiles, then (through the ref, so each
  // round sees the latest settings) the next.
  const nextRound = useRef<(betNow: number) => void>(() => {});
  const runRound = (betNow: number) => {
    const a = auto.current;
    if (!a.running) return;
    if (betNow <= 0 || betNow > walletBalance()) {
      setNote(betNow > walletBalance() ? "Not enough balance for the next bet" : "The bet's too small");
      stopAuto();
      return;
    }
    let cur = start(betNow);
    const order = [...selected];
    let step = 0;

    // the round's over: settle, work out the next bet, stop or go again
    const after = (profit: number, won: boolean) => {
      a.done += 1;
      a.profit = robux(a.profit + profit);
      const adjust = won ? onWin : onLoss;
      const pct = Number(adjust.pct) || 0;
      const nextBet = adjust.mode === "increase" && pct > 0 ? robux(betNow * (1 + pct / 100)) : a.startBet;
      setBetText(String(nextBet));
      const limit = Number(autoBets) || 0;
      const profitStop = Number(stopProfit) || 0;
      const lossStop = Number(stopLoss) || 0;
      if ((limit > 0 && a.done >= limit) || (profitStop > 0 && a.profit >= profitStop) || (lossStop > 0 && -a.profit >= lossStop)) {
        setNote(`Autobet done: ${a.done} game${a.done === 1 ? "" : "s"}, ${a.profit >= 0 ? "+" : "−"}${money.format(Math.abs(a.profit))}`);
        stopAuto();
        return;
      }
      a.timer = window.setTimeout(() => nextRound.current(nextBet), AUTO_PAUSE);
    };

    const turn = () => {
      if (!a.running) return;
      const i = order[step];
      if (cur.positions.includes(i)) {
        finish({ ...cur, hit: i }, false);
        after(-betNow, false);
        return;
      }
      cur = { ...cur, revealed: [...cur.revealed, i] };
      step += 1;
      if (step < order.length && cur.revealed.length < cur.tiles - cur.mines) {
        setLive("playing", cur);
        play("gem", cur.revealed.length);
        a.timer = window.setTimeout(turn, AUTO_STEP);
      } else {
        const payout = finish(cur, true);
        after(payout - betNow, true);
      }
    };
    a.timer = window.setTimeout(turn, AUTO_STEP);
  };
  useEffect(() => {
    nextRound.current = runRound;
  });

  const startAuto = () => {
    if (!canBet || selected.length === 0 || auto.current.running) return;
    Object.assign(auto.current, { running: true, timer: 0, done: 0, profit: 0, startBet: bet });
    setRunning(true);
    runRound(bet);
  };

  useEffect(() => {
    const a = auto.current;
    return () => clearTimeout(a.timer);
  }, []);

  // ---- Mode, board size and mines -------------------------------------------------------

  const switchMode = (m: Mode) => {
    if (busy || m === mode) return;
    setMode(m);
    if (phase !== "idle") resetBoard();
  };

  const chooseGrid = (g: Grid) => {
    if (busy) return;
    setGrid(g);
    if (minesNum > maxMines(g)) setMinesText(String(maxMines(g)));
    setSelected([]);
    resetBoard(g);
  };

  const toggle = (i: number) => setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const rotate = (clientSeed: string) => {
    if (busy) return;
    const s = seedStore.get();
    seedStore.set({
      serverSeed: randomHex(32),
      clientSeed,
      nonce: 0,
      previous: { serverSeed: s.serverSeed, clientSeed: s.clientSeed, nonces: s.nonce },
    });
  };

  const setSound = (on: boolean) => {
    saveSettings({ ...settings, sound: on });
    if (on) play("tick");
  };

  // ---- Hotkeys ---------------------------------------------------------------------------

  useEffect(() => {
    if (!settings.hotkeys) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (dialog || t.closest("input, select, textarea, dialog")) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (mode !== "manual") return;
        if (playing) cashout();
        else placeBet();
      } else if (e.key === "r" || e.key === "R") {
        random();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---- The controls --------------------------------------------------------------------

  const setBet = (n: number) => setBetText(String(Math.max(MIN_BET, robux(n))));
  const profitNow = robux(payoutOf(game.bet, mult) - game.bet);
  const profitNext = robux(payoutOf(game.bet, next) - game.bet);

  return (
    <div className={styles.wrap} data-mines data-phase={phase} data-mode={mode} data-animations={settings.animations}>
      <div className={styles.game}>
        <aside className={styles.controls} aria-label="Bet" data-controls>
          <div className={styles.modes} role="tablist" aria-label="Mode">
            {(["manual", "auto"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={styles.modeTab}
                disabled={busy}
                onClick={() => switchMode(m)}
                data-mode-tab={m}
              >
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
                onChange={(e) => setBetText(e.target.value.replace(/\D/g, ""))}
                onBlur={() => bet > 0 && setBetText(String(bet))}
                data-bet
              />
              <button type="button" className={styles.betStep} disabled={busy} onClick={() => setBet(bet / 2)} data-bet-half>
                ½
              </button>
              <button type="button" className={styles.betStep} disabled={busy} onClick={() => setBet(Math.min(bet * 2, balance))} data-bet-double>
                2×
              </button>
            </span>
            {short && !busy && (
              <span className={styles.fieldHint} data-short>
                Not enough balance
              </span>
            )}
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Grid size</span>
            <div className={styles.grids} role="radiogroup" aria-label="Grid size">
              {GRIDS.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={grid === g}
                  className={styles.gridChoice}
                  disabled={busy}
                  onClick={() => chooseGrid(g)}
                  data-grid={g}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.fieldHead}>
              <span className={styles.fieldLabel}>Number of mines</span>
              <span className={`${styles.fieldMax} ${minesOk ? "" : styles.fieldBad}`} data-mines-max>
                1 to {minesMax}
              </span>
            </span>
            <input
              className={styles.input}
              inputMode="numeric"
              value={minesText}
              disabled={busy}
              aria-invalid={minesOk ? undefined : true}
              onChange={(e) => setMinesText(e.target.value.replace(/\D/g, "").slice(0, 2))}
              onBlur={() => setMinesText(String(Math.min(Math.max(minesNum || 1, 1), minesMax)))}
              data-mines-count
            />
          </label>

          {mode === "manual" ? (
            playing ? (
              <>
                <div className={styles.readouts}>
                  <p className={styles.readout}>
                    <span className={styles.readoutLabel}>Profit on next tile ({times(next)})</span>
                    <span className={`${styles.readoutValue} tabular`}>
                      <CoinIcon />
                      {money.format(profitNext)}
                    </span>
                  </p>
                  <p className={styles.readout}>
                    <span className={styles.readoutLabel}>Total profit ({times(mult)})</span>
                    <span className={`${styles.readoutValue} ${picks > 0 ? styles.up : ""} tabular`}>
                      <CoinIcon />
                      {money.format(profitNow)}
                    </span>
                  </p>
                </div>
                <button type="button" className={styles.secondary} onClick={random} data-random>
                  Pick a random tile
                </button>
                <button type="button" className={styles.primary} disabled={picks === 0} onClick={cashout} data-cashout>
                  {picks === 0 ? "Cash out" : `Cash out ${money.format(payoutOf(game.bet, mult))}`}
                </button>
              </>
            ) : (
              <button type="button" className={styles.primary} disabled={!canBet} onClick={placeBet} data-place-bet>
                Place bet
              </button>
            )
          ) : (
            <>
              <p className={styles.autoHint}>
                {selected.length === 0 ? "Mark the tiles to turn over on the board." : `${selected.length} tile${selected.length === 1 ? "" : "s"} marked.`}
              </p>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Number of bets</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  placeholder="∞"
                  value={autoBets}
                  disabled={running}
                  onChange={(e) => setAutoBets(e.target.value.replace(/\D/g, ""))}
                  data-auto-bets
                />
              </label>
              {(
                [
                  ["On win", onWin, setOnWin],
                  ["On loss", onLoss, setOnLoss],
                ] as const
              ).map(([label, value, set]) => (
                <div key={label} className={styles.field}>
                  <span className={styles.fieldLabel}>{label}</span>
                  <div className={styles.adjust}>
                    <div className={styles.adjustModes} role="radiogroup" aria-label={label}>
                      {(["reset", "increase"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={value.mode === m}
                          className={styles.adjustMode}
                          disabled={running}
                          onClick={() => set({ ...value, mode: m })}
                        >
                          {m === "reset" ? "Reset" : "Increase by"}
                        </button>
                      ))}
                    </div>
                    <span className={styles.pctRow}>
                      <input
                        className={styles.input}
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
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Stop on profit</span>
                  <input
                    className={styles.input}
                    inputMode="decimal"
                    placeholder="0"
                    value={stopProfit}
                    disabled={running}
                    onChange={(e) => setStopProfit(e.target.value.replace(/\D/g, ""))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Stop on loss</span>
                  <input
                    className={styles.input}
                    inputMode="decimal"
                    placeholder="0"
                    value={stopLoss}
                    disabled={running}
                    onChange={(e) => setStopLoss(e.target.value.replace(/\D/g, ""))}
                  />
                </label>
              </div>
              {running ? (
                <button type="button" className={styles.stop} onClick={stopAuto} data-stop-auto>
                  Stop autobet
                </button>
              ) : (
                <button type="button" className={styles.primary} disabled={!canBet || selected.length === 0} onClick={startAuto} data-start-auto>
                  Start autobet
                </button>
              )}
            </>
          )}

          <div className={styles.tools}>
            <div className={styles.settingsWrap}>
              <button
                type="button"
                className={styles.tool}
                aria-label="Settings"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen(!settingsOpen)}
                data-settings
              >
                <GearIcon />
              </button>
              {settingsOpen && (
                <div className={styles.settings} role="group" aria-label="Settings">
                  <label className={styles.setting}>
                    <input type="checkbox" checked={settings.sound} onChange={(e) => setSound(e.target.checked)} data-sound />
                    Sound
                  </label>
                  <label className={styles.setting}>
                    <input type="checkbox" checked={settings.animations} onChange={(e) => saveSettings({ ...settings, animations: e.target.checked })} />
                    Animations
                  </label>
                  <label className={styles.setting}>
                    <input type="checkbox" checked={settings.hotkeys} onChange={(e) => saveSettings({ ...settings, hotkeys: e.target.checked })} />
                    Hotkeys
                  </label>
                  <p className={styles.settingNote}>
                    <kbd>Space</kbd> bet or cash out, <kbd>R</kbd> random tile
                  </p>
                </div>
              )}
            </div>
            <button type="button" className={styles.tool} aria-label="Provably fair" onClick={() => setDialog("fair")} data-fairness>
              <ShieldIcon />
            </button>
            <button type="button" className={styles.tool} aria-label="How to play" onClick={() => setDialog("how")} data-how-to>
              <InfoIcon />
            </button>
          </div>
        </aside>

        <div className={styles.stage}>
          <ol className={styles.history} aria-label="Last games" data-history>
            {history.map((h) => (
              <li key={h.id} className={`${styles.past} ${h.won ? styles.pastWon : styles.pastLost} tabular`}>
                {times(h.mult)}
              </li>
            ))}
          </ol>
          <div className={styles.boardWrap}>
            <Board
              tiles={phase === "idle" ? grid : game.tiles}
              phase={phase}
              positions={game.positions}
              revealed={game.revealed}
              hit={game.hit}
              selected={mode === "auto" ? selected : []}
              selecting={mode === "auto" && !busy}
              onPick={pick}
              onToggle={toggle}
            />
            {phase === "won" && result && (
              <div className={styles.win} role="status" data-win>
                <span className={`${styles.winMult} tabular`}>{times(result.mult)}</span>
                <span className={`${styles.winPayout} tabular`}>
                  <CoinIcon />
                  {money.format(result.payout)}
                </span>
              </div>
            )}
          </div>
          <p className={styles.stageNote} aria-live="polite" data-note>
            {note}
          </p>
        </div>
      </div>

      {dialog === "fair" && <FairnessDialog onClose={() => setDialog(null)} seeds={seeds} busy={busy} onRotate={rotate} />}
      {dialog === "how" && <HowToDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
