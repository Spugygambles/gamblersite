"use client";

import { useId, type CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./MinesArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one round; keep in step with --play in MinesArt.module.css.
const PLAY_MS = 3400;

// A 3x3 board, numbered row by row. The player clicks five gems, then hits the
// bomb, and the tiles nobody clicked are revealed in a wave spreading out from
// it. Times are ms into the round.
const SIZE = 3;
const CLICKS = [4, 1, 5, 7, 3];
const FIRST_CLICK = 750;
const CLICK_GAP = 300;
const BOMB = 6;
const BOMB_AT = 2350;
const REVEAL_AT = 2800;
const REVEAL_STEP = 60;

type Kind = "gem" | "bomb" | "rest";
type Tile = { kind: Kind; at: number };

const BOARD: Tile[] = Array.from({ length: SIZE * SIZE }, (_, i) => {
  const click = CLICKS.indexOf(i);
  if (click >= 0) return { kind: "gem", at: FIRST_CLICK + click * CLICK_GAP };
  if (i === BOMB) return { kind: "bomb", at: BOMB_AT };
  const ring = Math.max(
    Math.abs(Math.floor(i / SIZE) - Math.floor(BOMB / SIZE)),
    Math.abs((i % SIZE) - (BOMB % SIZE)),
  );
  return { kind: "rest", at: REVEAL_AT + ring * REVEAL_STEP };
});

// Green embers drifting up behind the board; see Embers.
const EMBERS: Ember[] = [
  { x: -24, y: 104, size: 4.5, rise: 150, sway: 5, speed: 1, phase: 0.15 },
  { x: -8, y: 120, size: 6, rise: 170, sway: -6, speed: 1, phase: 0.6 },
  { x: 8, y: 96, size: 3.5, rise: 135, sway: 4, speed: 2, phase: 0.35 },
  { x: 26, y: 126, size: 5, rise: 185, sway: 6, speed: 1, phase: 0.85 },
  { x: 44, y: 110, size: 3, rise: 150, sway: -4, speed: 2, phase: 0.7 },
  { x: 60, y: 130, size: 6, rise: 190, sway: -5, speed: 1, phase: 0.3 },
  { x: 76, y: 104, size: 3.5, rise: 145, sway: 5, speed: 2, phase: 0.95 },
  { x: 92, y: 124, size: 5, rise: 180, sway: -6, speed: 1, phase: 0.5 },
  { x: 108, y: 100, size: 4, rise: 130, sway: 4, speed: 2, phase: 0.1 },
  { x: 124, y: 118, size: 6, rise: 165, sway: -5, speed: 1, phase: 0.75 },
];

export default function MinesArt() {
  // The round plays as the page loads; each hover clears the board and plays
  // it again.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
      style={{ "--bomb-at": `${BOMB_AT}ms` } as CSSProperties}
    >
      <div className={styles.glow} />
      <div className={styles.ambient}>
        <Embers embers={EMBERS} />
      </div>

      <div className={styles.scene}>
        <div className={styles.board}>
          {BOARD.map((tile, i) => (
            <BoardTile key={i} index={i} {...tile} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardTile({ kind, at, index }: Tile & { index: number }) {
  return (
    <div
      className={styles.tile}
      data-kind={kind}
      style={{ "--i": index, "--t": `${at}ms` } as CSSProperties}
    >
      <div className={styles.sideBottom} />
      <div className={styles.sideLeft} />
      <div className={styles.sideRight} />
      <div className={styles.top}>
        {kind === "rest" ? (
          <>
            <div className={styles.restTint} />
            <Gem className={styles.flatGem} />
          </>
        ) : (
          <>
            <div className={styles.lit} />
            <div className={styles.dropShadow} />
            <div className={styles.ripple} />
            <div className={styles.flash} />
          </>
        )}
      </div>

      {/* Clicked tiles pop their gem (or the bomb) out toward the viewer. */}
      {kind !== "rest" && (
        <div className={styles.sprite}>
          <div className={styles.pop}>
            <div className={styles.bob}>
              {kind === "gem" ? (
                <>
                  <Gem className={styles.gem} />
                  <span className={styles.twinkle} />
                </>
              ) : (
                <Bomb />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// The site's faceted green gem, with a light sheen from the top and a little
// shade toward the point.
function Gem({ className }: { className: string }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 100 90">
      <defs>
        <clipPath id={`${id}-shape`}>
          <polygon points="4,30 32,8 68,8 96,30 50,88" />
        </clipPath>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <polygon points="4,30 32,8 38,30" fill="#4ce854" />
      <polygon points="32,8 68,8 62,30 38,30" fill="#22a62e" />
      <polygon points="68,8 96,30 62,30" fill="#62f26e" />
      <polygon points="32,8 68,8 64,13 36,13" fill="#9cf0a4" />
      <polygon points="4,30 38,30 50,88" fill="#168f1a" />
      <polygon points="38,30 62,30 50,88" fill="#25b827" />
      <polygon points="62,30 96,30 50,88" fill="#1fab21" />
      <rect width="100" height="90" fill={`url(#${id}-sheen)`} clipPath={`url(#${id}-shape)`} />
      <polygon points="12,28 29,13 33,15 18,29" fill="#fff" opacity="0.45" />
      <polyline
        points="4,30 96,30"
        fill="none"
        stroke="#c9ffcd"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// The site's red bomb, with its fuse spark drawn separately so it can crackle.
function Bomb() {
  const id = useId();
  return (
    <svg className={styles.bomb} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`${id}-body`} cx="0.36" cy="0.34" r="0.72">
          <stop offset="0" stopColor="#ff8a8a" />
          <stop offset="0.45" stopColor="#e63c3c" />
          <stop offset="1" stopColor="#9b1616" />
        </radialGradient>
      </defs>
      <g className={styles.bombBody}>
        <path
          d="M66 24c2-8 9-13 18-12"
          fill="none"
          stroke="#ececf0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="56" y="19" width="18" height="13" rx="3" fill="#b82626" transform="rotate(40 65 25.5)" />
        <circle cx="44" cy="60" r="34" fill={`url(#${id}-body)`} />
        <ellipse cx="25" cy="58" rx="4.5" ry="11" fill="#fff" opacity="0.35" transform="rotate(12 25 58)" />
        <path d="M57 41l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#fff" />
      </g>
      <g className={styles.spark}>
        <polygon
          points="86,1 88.6,7.2 95,5 91.2,10.6 97,14 90.4,14 89.4,20.6 86,15 81.4,19.6 82.2,13.2 76,11.2 82.2,8.6 79.6,2.6 85.2,6.6"
          fill="#ffb02e"
        />
        <circle cx="86.6" cy="10.6" r="3.2" fill="#fff3b0" />
      </g>
    </svg>
  );
}
