"use client";

import { useId, type CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./KenoArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one round: it must outlast the last animation in
// KenoArt.module.css (the final hit's sparks, ending at
// DRAW_AT + 4 * DRAW_GAP + 380 + 600 = 3770ms).
const PLAY_MS = 3800;

// A 3x3 corner of the keno board, numbered like the site's. The player picks
// five numbers (purple), then five numbers are drawn: picked ones that come
// up are hits and flip over to show the gem, unpicked ones are misses and turn
// red. Times are ms into the round.
const NUMBERS = [11, 12, 13, 19, 20, 21, 27, 28, 29];
const PICKS = [12, 21, 28, 19, 20];
const PICK_AT = 600;
const PICK_GAP = 100;
const DRAWS = [21, 29, 20, 11, 28];
const DRAW_AT = 1350;
const DRAW_GAP = 360;

type Kind = "plain" | "pick" | "hit" | "miss";
type Tile = { n: number; kind: Kind; pick: number; draw: number };

const BOARD: Tile[] = NUMBERS.map((n) => {
  const pick = PICKS.indexOf(n);
  const draw = DRAWS.indexOf(n);
  const kind: Kind =
    pick >= 0 ? (draw >= 0 ? "hit" : "pick") : draw >= 0 ? "miss" : "plain";
  return {
    n,
    kind,
    pick: PICK_AT + Math.max(pick, 0) * PICK_GAP,
    draw: DRAW_AT + Math.max(draw, 0) * DRAW_GAP,
  };
});

// Sparks thrown out of a hit as it lands: where each ends up and how big it
// is, as % of the tile (a tile is 41cqw of the board's scene).
const SPARKS = [
  { dx: -66, dy: -52, size: 26 },
  { dx: 8, dy: -84, size: 20 },
  { dx: 70, dy: -44, size: 24 },
  { dx: 78, dy: 32, size: 18 },
  { dx: -74, dy: 28, size: 20 },
  { dx: -10, dy: 76, size: 16 },
];

// Purple embers drifting up beside the board; see Embers.
const EMBERS: Ember[] = [
  { x: -30, y: 118, size: 4.5, rise: 160, sway: 3, speed: 1, phase: 0.15 },
  { x: -27, y: 128, size: 5.5, rise: 180, sway: -3, speed: 1, phase: 0.6 },
  { x: -24, y: 108, size: 3.5, rise: 140, sway: 3, speed: 2, phase: 0.35 },
  { x: -33, y: 96, size: 3, rise: 150, sway: -2, speed: 2, phase: 0.8 },
  { x: 124, y: 112, size: 4, rise: 150, sway: -3, speed: 1, phase: 0.5 },
  { x: 127, y: 126, size: 6, rise: 175, sway: 3, speed: 1, phase: 0.95 },
  { x: 130, y: 104, size: 3.5, rise: 135, sway: -3, speed: 2, phase: 0.1 },
  { x: 133, y: 92, size: 3, rise: 145, sway: 2, speed: 2, phase: 0.65 },
  { x: 30, y: 130, size: 4, rise: 150, sway: 4, speed: 1, phase: 0.3 },
  { x: 70, y: 128, size: 3.5, rise: 160, sway: -4, speed: 2, phase: 0.75 },
];

export default function KenoArt() {
  // The round plays as the page loads; each hover clears the board and plays
  // it again.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
    >
      <div className={styles.glow} />
      <div className={styles.ambient}>
        <Embers embers={EMBERS} />
      </div>

      <div className={styles.scene}>
        <div className={styles.board}>
          {BOARD.map((tile, i) => (
            <BoardTile key={tile.n} index={i} {...tile} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardTile({ n, kind, pick, draw, index }: Tile & { index: number }) {
  return (
    <div
      className={styles.tile}
      data-kind={kind}
      style={
        { "--i": index, "--pick": `${pick}ms`, "--draw": `${draw}ms` } as CSSProperties
      }
    >
      {/* A hit flips over like a card to show its gem on the back. */}
      <div className={styles.flipper}>
        <div className={styles.front}>
          <span className={styles.num}>{n}</span>
          <div className={styles.flash} />
        </div>
        {kind === "hit" && (
          <div className={styles.back}>
            <GemFace n={n} />
            <div className={styles.shine} />
            <span className={styles.twinkle} />
          </div>
        )}
      </div>

      {kind === "hit" && (
        <>
          <div className={styles.wave} />
          <div className={styles.sparks}>
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className={styles.spark}
                style={
                  {
                    width: `${s.size}%`,
                    "--dx": `${s.dx * 0.41}cqw`,
                    "--dy": `${s.dy * 0.41}cqw`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// The site's hit tile: an octagonal purple gem with its number on the table,
// faceted around the rim and catching the light at the top right.
function GemFace({ n }: { n: number }) {
  const id = useId();
  const o = [
    [27, 7],
    [73, 7],
    [93, 27],
    [93, 73],
    [73, 93],
    [27, 93],
    [7, 73],
    [7, 27],
  ];
  const t = [
    [33, 20],
    [67, 20],
    [80, 33],
    [80, 67],
    [67, 80],
    [33, 80],
    [20, 67],
    [20, 33],
  ];
  // Rim facets clockwise from the top; the top-right one catches the light.
  const shades = ["#c25cfb", "#e2b0ff", "#b14bf9", "#9a35ef", "#a23cf3", "#9a35ef", "#b44ffb", "#bd57fa"];
  return (
    <svg className={styles.gem} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`${id}-table`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#d58afd" />
          <stop offset="1" stopColor="#bf5ff9" />
        </linearGradient>
      </defs>
      {shades.map((fill, i) => {
        const j = (i + 1) % 8;
        const pts = [o[i], o[j], t[j], t[i]].map((p) => p.join(",")).join(" ");
        return <polygon key={i} points={pts} fill={fill} />;
      })}
      <polygon points={t.map((p) => p.join(",")).join(" ")} fill={`url(#${id}-table)`} />
      <text className={styles.gemNum} x="50" y="51" textAnchor="middle" dominantBaseline="central">
        {n}
      </text>
    </svg>
  );
}
