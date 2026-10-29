import type { CSSProperties } from "react";
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

/**
 * The board: `tiles` square buttons. While a game's on, a click turns a
 * tile over; between games in auto mode, a click marks a tile for the
 * autobet to turn over. Each tile says what it shows for screen readers.
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
  return (
    <div
      className={styles.board}
      style={{ "--n": n } as CSSProperties}
      role="grid"
      aria-label={`${n} by ${n} board`}
      data-board
      data-phase={phase}
      data-hit={hit !== null ? "" : undefined}
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
            onClick={() => (pickable ? onPick(i) : selecting ? onToggle(i) : undefined)}
          >
            <span className={styles.face} aria-hidden>
              {(look === "gem" || look === "gemDim") && <Gem className={styles.gem} />}
              {(look === "mine" || look === "mineDim") && <Bomb className={styles.bomb} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
