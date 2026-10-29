"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Bomb, Gem } from "./pieces";
import styles from "./Mines.module.css";

export type Phase = "idle" | "playing" | "won" | "lost";

type TileLook = "sealed" | "gem" | "mine" | "gemDim" | "mineDim";

// What each tile shows: while playing, the player's gems and the rest
// sealed; once the game's over, everything, with what the player didn't
// turn over dimmed and the mine they hit lit.
function lookOf(i: number, phase: Phase, positions: number[], revealed: number[], hit: number | null): TileLook {
  if (revealed.includes(i)) return "gem";
  if (phase === "playing" || phase === "idle") return "sealed";
  if (i === hit) return "mine";
  return positions.includes(i) ? "mineDim" : "gemDim";
}

// Press a tile and move the pointer this far, and from there it turns over
// every sealed tile it passes until it's let go. Holding still does
// nothing, and a plain click is still a click. The trace shows the last
// stretch of the path.
const START_PX = 8;
const TRAIL = 48;

type Sweep = { pointerId: number; x0: number; y0: number; active: boolean; points: string[]; fade: number; suppressUntil: number };

/**
 * The board: `tiles` square buttons. While a game's on, a click turns a
 * tile over, and pressing then sweeping the pointer across the board
 * turns over every sealed tile it passes. Between games in auto mode, a
 * click marks a tile for the autobet. Each tile says what it shows for
 * screen readers.
 */
export default function Board({
  tiles,
  phase,
  positions,
  revealed,
  hit,
  selected,
  selecting,
  onPick,
  onToggle,
}: {
  tiles: number;
  phase: Phase;
  positions: number[];
  revealed: number[];
  hit: number | null;
  /** Tiles marked for the autobet. */
  selected: number[];
  /** Whether a click marks a tile (auto mode, between games). */
  selecting: boolean;
  onPick: (i: number) => void;
  onToggle: (i: number) => void;
}) {
  const n = Math.sqrt(tiles);
  const playing = phase === "playing";
  const boardRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPolylineElement>(null);
  // what the pointer handlers need from the latest render
  const latest = useRef({ playing, onPick });
  useEffect(() => {
    latest.current = { playing, onPick };
  });
  const sweep = useRef<Sweep>({ pointerId: -1, x0: 0, y0: 0, active: false, points: [], fade: 0, suppressUntil: 0 });

  const draw = useCallback(() => lineRef.current?.setAttribute("points", sweep.current.points.join(" ")), []);

  const stop = useCallback(() => {
    const s = sweep.current;
    if (s.active) {
      s.active = false;
      // the click the browser fires on release isn't another pick
      s.suppressUntil = performance.now() + 400;
      try {
        boardRef.current?.releasePointerCapture(s.pointerId);
      } catch {}
      boardRef.current?.removeAttribute("data-dragging");
      traceRef.current?.setAttribute("data-fading", "");
      s.fade = window.setTimeout(() => {
        s.points = [];
        draw();
        traceRef.current?.removeAttribute("data-fading");
      }, 700);
    }
    s.pointerId = -1;
  }, [draw]);

  const tileUnder = (x: number, y: number) => document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-tile]") ?? null;
  const reveal = (el: HTMLElement | null) => {
    if (el?.dataset.look === "sealed") latest.current.onPick(Number(el.dataset.tile));
  };
  const addPoint = (x: number, y: number) => {
    const r = boardRef.current?.getBoundingClientRect();
    if (!r) return;
    const s = sweep.current;
    s.points.push(`${(x - r.left).toFixed(1)},${(y - r.top).toFixed(1)}`);
    if (s.points.length > TRAIL) s.points.shift();
    draw();
  };

  // the pointer's moved far enough: from here it turns tiles over as it goes
  const begin = () => {
    const s = sweep.current;
    const board = boardRef.current;
    if (!board) return;
    try {
      board.setPointerCapture(s.pointerId);
    } catch {}
    // no capture means the pointer's already gone
    if (!board.hasPointerCapture(s.pointerId)) {
      s.pointerId = -1;
      return;
    }
    s.active = true;
    clearTimeout(s.fade);
    traceRef.current?.removeAttribute("data-fading");
    s.points = [];
    board.setAttribute("data-dragging", "");
    // the trace starts where the press was
    addPoint(s.x0, s.y0);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!playing || e.button !== 0 || !e.isPrimary) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
    if (el?.dataset.look !== "sealed") return;
    stop();
    const s = sweep.current;
    s.pointerId = e.pointerId;
    s.x0 = e.clientX;
    s.y0 = e.clientY;
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const s = sweep.current;
    if (e.pointerId !== s.pointerId) return;
    if (!latest.current.playing) {
      stop();
      return;
    }
    if (!s.active) {
      if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < START_PX) return;
      begin();
      if (!s.active) return;
    }
    addPoint(e.clientX, e.clientY);
    reveal(tileUnder(e.clientX, e.clientY));
  };

  const onPointerEnd = (e: ReactPointerEvent) => {
    if (e.pointerId === sweep.current.pointerId) stop();
  };

  // the game ending (a mine, a cash out) ends a sweep in progress
  useEffect(() => {
    if (!playing) stop();
  }, [playing, stop]);

  useEffect(() => {
    const s = sweep.current;
    return () => clearTimeout(s.fade);
  }, []);

  return (
    <div
      ref={boardRef}
      className={styles.board}
      style={{ "--n": n } as CSSProperties}
      role="grid"
      aria-label={`${n} by ${n} board`}
      data-board
      data-phase={phase}
      data-hit={hit !== null ? "" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      onContextMenu={(e) => playing && e.preventDefault()}
    >
      {Array.from({ length: tiles }, (_, i) => {
        const look = lookOf(i, phase, positions, revealed, hit);
        const marked = selected.includes(i);
        const pickable = playing && look === "sealed";
        const label = { sealed: "hidden", gem: "gem", mine: "the mine you hit", gemDim: "gem, not picked", mineDim: "mine" }[look];
        return (
          <button
            key={i}
            type="button"
            className={styles.tile}
            // the order it was turned over in sets its animation's delay
            style={{ "--i": revealed.includes(i) ? revealed.indexOf(i) : i } as CSSProperties}
            data-look={look}
            data-marked={marked || undefined}
            data-tile={i}
            disabled={!pickable && !selecting}
            aria-label={`Tile ${i + 1}, ${label}${marked ? ", marked" : ""}`}
            aria-pressed={selecting ? marked : undefined}
            onClick={() => {
              if (performance.now() < sweep.current.suppressUntil) return;
              if (pickable) onPick(i);
              else if (selecting) onToggle(i);
            }}
          >
            <span className={styles.face} aria-hidden>
              {(look === "gem" || look === "gemDim") && <Gem className={styles.gem} />}
              {(look === "mine" || look === "mineDim") && <Bomb className={styles.bomb} />}
            </span>
          </button>
        );
      })}
      <svg ref={traceRef} className={styles.trace} aria-hidden>
        <polyline ref={lineRef} className={styles.traceLine} points="" />
      </svg>
    </div>
  );
}
