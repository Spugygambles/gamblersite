"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GRIDS, maxMines, minePositions, money, multiplier, payoutOf, times, type Grid } from "@/lib/mines";
import { randomHex } from "@/lib/sha256";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { CoinIcon, GearIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import Board, { type Phase } from "./Board";
import { FairnessDialog, HowToDialog } from "./Dialogs";
import { Bomb, Gem } from "./pieces";
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

const toCents = (n: number) => Math.round(n * 100) / 100;
const parseBet = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? toCents(n) : 0;
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
  const [mines, setMines] = useState(3);
  const [betText, setBetText] = useState("10.00");
  const [phase, setPhase] = useState<Phase>("idle");
  const [game, setGame] = useState<Game>(NO_GAME);
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
  const canBet = !busy && bet > 0 && !short;
  // what's on the board: the next game's setup, or the game on it
  const onBoard = phase === "idle" ? { tiles: grid, mines } : game;
  const gemsLeft = onBoard.tiles - onBoard.mines - (phase === "idle" ? 0 : picks);

  // ---- Starting and ending games ---------------------------------------------------

  const resetBoard = useCallback((tiles?: number) => {
    setPhase("idle");
    setGame((g) => ({ ...g, tiles: tiles ?? g.tiles, positions: [], revealed: [], hit: null }));
    setResult(null);
    setNote("");
  }, []);

  // Draws a board for the next nonce and takes the bet.
  const start = useCallback(
    (betNow: number): Game => {
      const s = seedStore.get();
      const positions = minePositions(s.serverSeed, s.clientSeed, s.nonce, grid, mines);
      seedStore.set({ ...s, nonce: s.nonce + 1 });
      addToBalance(-betNow);
      const fresh: Game = { tiles: grid, mines, bet: betNow, positions, revealed: [], hit: null };
      setGame(fresh);
      setResult(null);
      setPhase("playing");
      setNote("");
      return fresh;
    },
    [grid, mines],
  );

  const finish = useCallback((g: Game, won: boolean) => {
    const m = won ? multiplier(g.tiles, g.mines, g.revealed.length) : 0;
    const payout = won ? payoutOf(g.bet, m) : 0;
    if (won) addToBalance(payout);
    const id = ++pastId.current;
    setPhase(won ? "won" : "lost");
    setResult(won ? { mult: m, payout } : null);
    setHistory((h) => [{ id, mult: m, won }, ...h].slice(0, HISTORY));
    const cleared = g.revealed.length === g.tiles - g.mines;
    setNote(won ? `${cleared ? "Cleared the board" : "Cashed out"} at ${times(m)} for ${money.format(payout)}` : "You hit a mine");
    return payout;
  }, []);

  const placeBet = () => {
    if (!canBet) return;
    start(bet);
  };

  const pick = (i: number) => {
    if (!playing || game.revealed.includes(i)) return;
    if (game.positions.includes(i)) {
      const g = { ...game, hit: i };
      setGame(g);
      finish(g, false);
      return;
    }
    const g = { ...game, revealed: [...game.revealed, i] };
    setGame(g);
    // every safe tile turned over: nothing left to risk
    if (g.revealed.length === g.tiles - g.mines) finish(g, true);
  };

  const cashout = () => {
    if (!playing || picks === 0) return;
    finish(game, true);
  };

  const random = () => {
    if (!playing) return;
    const hidden = Array.from({ length: game.tiles }, (_, i) => i).filter((i) => !game.revealed.includes(i));
    pick(hidden[Math.floor(Math.random() * hidden.length)]);
  };

  // ---- Auto -------------------------------------------------------------------------

  const stopAuto = useCallback(() => {
    auto.current.running = false;
    clearTimeout(auto.current.timer);
    setRunning(false);
  }, []);

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
      a.profit = toCents(a.profit + profit);
      const adjust = won ? onWin : onLoss;
      const pct = Number(adjust.pct) || 0;
      const nextBet = adjust.mode === "increase" && pct > 0 ? toCents(betNow * (1 + pct / 100)) : a.startBet;
      setBetText(nextBet.toFixed(2));
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
        cur = { ...cur, hit: i };
        setGame(cur);
        finish(cur, false);
        after(-betNow, false);
        return;
      }
      cur = { ...cur, revealed: [...cur.revealed, i] };
      setGame(cur);
      step += 1;
      if (step < order.length && cur.revealed.length < cur.tiles - cur.mines) {
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
    if (!canBet || selected.length === 0) return;
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
    setMines((n) => Math.min(n, maxMines(g)));
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

  const setBet = (n: number) => setBetText(Math.max(0.01, toCents(n)).toFixed(2));
  const profitNow = toCents(payoutOf(game.bet, mult) - game.bet);
  const profitNext = toCents(payoutOf(game.bet, next) - game.bet);

  // The payouts ladder: what each count of gems pays on this board, the
  // first six steps and the full clear, for the bet that's typed in.
  const safe = onBoard.tiles - onBoard.mines;
  const ladder = Array.from({ length: Math.max(0, Math.min(6, safe - 1)) }, (_, i) => i + 1).map((n) => ({ picks: n, mult: multiplier(onBoard.tiles, onBoard.mines, n) }));
  const ladderGap = ladder.length + 1 < safe;
  const clear = { picks: safe, mult: multiplier(onBoard.tiles, onBoard.mines, safe) };

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
                onChange={(e) => setBetText(e.target.value.replace(/[^\d.]/g, ""))}
                onBlur={() => bet > 0 && setBetText(bet.toFixed(2))}
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
            <span className={styles.fieldLabel}>Number of mines</span>
            <select className={styles.select} value={mines} disabled={busy} onChange={(e) => setMines(Number(e.target.value))} data-mines-count>
              {Array.from({ length: maxMines(grid) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
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
              <>
                <button type="button" className={styles.primary} disabled={!canBet} onClick={placeBet} data-place-bet>
                  Place bet
                </button>
                <div className={styles.ladder} data-ladder>
                  <div className={styles.ladderHead}>
                    <span>Payouts</span>
                    <span className="tabular">{bet > 0 ? `on ${money.format(bet)}` : ""}</span>
                  </div>
                  <ol className={styles.ladderRows}>
                    {[...ladder, clear].map((row) => (
                      <li key={row.picks} className={styles.ladderRow} data-clear={row.picks === safe ? "" : undefined}>
                        {ladderGap && row.picks === safe && <span className={styles.ladderGap} aria-hidden />}
                        <span>{row.picks === safe && safe > 1 ? `All ${safe} gems` : `${row.picks} gem${row.picks === 1 ? "" : "s"}`}</span>
                        <span className={`${styles.ladderMult} tabular`}>{times(row.mult)}</span>
                        <span className={`${styles.ladderPay} tabular`}>{bet > 0 ? money.format(payoutOf(bet, row.mult)) : ""}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
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
                    placeholder="0.00"
                    value={stopProfit}
                    disabled={running}
                    onChange={(e) => setStopProfit(e.target.value.replace(/[^\d.]/g, ""))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Stop on loss</span>
                  <input
                    className={styles.input}
                    inputMode="decimal"
                    placeholder="0.00"
                    value={stopLoss}
                    disabled={running}
                    onChange={(e) => setStopLoss(e.target.value.replace(/[^\d.]/g, ""))}
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
              tiles={onBoard.tiles}
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
          <div className={styles.counts}>
            <span className={styles.count}>
              <Gem className={styles.countIcon} />
              <b className="tabular" data-gems-left>
                {gemsLeft}
              </b>
              gems
            </span>
            <span className={styles.count}>
              <Bomb className={styles.countIcon} />
              <b className="tabular">{onBoard.mines}</b>
              mines
            </span>
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
