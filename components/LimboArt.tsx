"use client";

import { useId, type CSSProperties } from "react";
import styles from "./LimboArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one launch: it must outlast the last animation in
// LimboArt.module.css (the win glow settling, ending at 2050 + 900 = 2950ms).
const PLAY_MS = 3000;

// Star streaks rushing past the rocket. x and top are % of the art's stage,
// len its height in cqw; `speed` is how many times each falls per --cycle and
// `phase` how far along it starts.
const STREAKS = [
  { x: -30, len: 9, speed: 2, phase: 0.1 },
  { x: -18, len: 14, speed: 1, phase: 0.55 },
  { x: -6, len: 7, speed: 3, phase: 0.3 },
  { x: 5, len: 11, speed: 2, phase: 0.8 },
  { x: 14, len: 16, speed: 1, phase: 0.05 },
  { x: 24, len: 8, speed: 3, phase: 0.65 },
  { x: 33, len: 12, speed: 2, phase: 0.4 },
  { x: 42, len: 6, speed: 3, phase: 0.92 },
  { x: 58, len: 13, speed: 1, phase: 0.35 },
  { x: 67, len: 8, speed: 3, phase: 0.15 },
  { x: 76, len: 15, speed: 2, phase: 0.7 },
  { x: 86, len: 7, speed: 3, phase: 0.5 },
  { x: 95, len: 12, speed: 1, phase: 0.85 },
  { x: 106, len: 9, speed: 2, phase: 0.25 },
  { x: 118, len: 14, speed: 1, phase: 0.6 },
  { x: 130, len: 8, speed: 3, phase: 0.75 },
  { x: -36, len: 11, speed: 3, phase: 0.45 },
  { x: -12, len: 8, speed: 2, phase: 0.95 },
  { x: 0, len: 15, speed: 1, phase: 0.2 },
  { x: 19, len: 10, speed: 3, phase: 0.85 },
  { x: 81, len: 10, speed: 3, phase: 0.05 },
  { x: 100, len: 16, speed: 1, phase: 0.45 },
  { x: 112, len: 7, speed: 3, phase: 0.35 },
  { x: 136, len: 12, speed: 2, phase: 0.95 },
];

// Smoke puffs rolling out from the pad at launch: where each drifts to, in
// cqw, and how big it gets.
const PUFFS = [
  { dx: -38, dy: -5, size: 30 },
  { dx: -22, dy: -12, size: 35 },
  { dx: -8, dy: -2, size: 27 },
  { dx: 9, dy: -4, size: 28 },
  { dx: 24, dy: -11, size: 34 },
  { dx: 39, dy: -6, size: 31 },
];

// Sparks thrown out of the multiplier as it lands, in cqw.
const SPARKS = [
  { dx: -60, dy: -15, size: 9 },
  { dx: -42, dy: 20, size: 7 },
  { dx: -18, dy: -28, size: 8 },
  { dx: 20, dy: -26, size: 7 },
  { dx: 45, dy: 18, size: 8 },
  { dx: 62, dy: -12, size: 9 },
];

export default function LimboArt() {
  // The rocket launches as the page loads; each hover sets it back on the
  // pad and launches it again.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
    >
      <div className={styles.glow} />
      <div className={styles.winGlow} />

      <div className={styles.warp}>
        {STREAKS.map((s, i) => (
          <span
            key={i}
            className={styles.streak}
            style={
              {
                left: `${s.x}%`,
                height: `${s.len}cqw`,
                animationDuration: `calc(var(--cycle) / ${s.speed})`,
                animationDelay: `calc(var(--cycle) * ${-s.phase / s.speed})`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.pad} />
      {PUFFS.map((p, i) => (
        <span
          key={i}
          className={styles.puff}
          style={
            {
              width: `${p.size}cqw`,
              "--k": i,
              "--dx": `${p.dx}cqw`,
              "--dy": `${p.dy}cqw`,
            } as CSSProperties
          }
        />
      ))}

      <div className={styles.rocket}>
        <div className={styles.hover}>
          <div className={styles.shake}>
            <div className={styles.flamePower}>
              <Flame />
            </div>
            <Rocket />
          </div>
        </div>
      </div>

      {/* The multiplier counts up as the rocket climbs, then lands green. */}
      <div className={styles.readout}>
        <span className={styles.ring} />
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className={styles.spark}
            style={
              {
                width: `${s.size}cqw`,
                "--dx": `${s.dx}cqw`,
                "--dy": `${s.dy}cqw`,
              } as CSSProperties
            }
          />
        ))}
        <span className={styles.num} aria-hidden />
      </div>
    </div>
  );
}

// A white rocket with red nose and fins, shaded like a cylinder.
function Rocket() {
  const id = useId();
  const body = "M30 3C40 12 45 28 45 46V84Q45 88 41 88H19Q15 88 15 84V46C15 28 20 12 30 3Z";
  return (
    <svg className={styles.ship} viewBox="0 0 60 120">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aeb6d2" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#e2e6f5" />
          <stop offset="1" stopColor="#959dbb" />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b81f42" />
          <stop offset="0.4" stopColor="#ff5a78" />
          <stop offset="1" stopColor="#d33152" />
        </linearGradient>
        <radialGradient id={`${id}-glass`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9ef0ff" />
          <stop offset="0.5" stopColor="#2a8fe6" />
          <stop offset="1" stopColor="#0d3a85" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d="M15 60 4 90Q3.5 94 8 93l7-5Z" fill="#c42a4b" />
      <path d="M45 60 56 90Q56.5 94 52 93l-7-5Z" fill="#ff5072" />
      <path d="M20 88h20l-2.5 8h-15Z" fill="#4a5068" />
      <rect x="19" y="86.5" width="22" height="3" rx="1" fill="#6b7290" />
      <path d={body} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="10" y="0" width="40" height="26" fill={`url(#${id}-red)`} />
        <rect x="10" y="64" width="40" height="5" fill={`url(#${id}-red)`} />
        <rect x="10" y="25.4" width="40" height="0.8" fill="#000" opacity="0.18" />
      </g>
      <circle cx="30" cy="44" r="9" fill="#c7cee6" />
      <circle cx="30" cy="44" r="6.5" fill={`url(#${id}-glass)`} />
      <ellipse cx="27.6" cy="41.4" rx="2.2" ry="1.4" fill="#fff" opacity="0.75" transform="rotate(-30 27.6 41.4)" />
      <path d="M30 70l3 26q-3 3-6 0Z" fill="#e23c5c" />
    </svg>
  );
}

// The exhaust: a hot white core inside a yellow-to-red plume.
function Flame() {
  const id = useId();
  return (
    <svg className={styles.flame} viewBox="0 0 30 64">
      <defs>
        <radialGradient id={`${id}-outer`} cx="0.5" cy="0.1" r="0.95">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.3" stopColor="#ffb547" />
          <stop offset="0.65" stopColor="#ff5d3a" />
          <stop offset="1" stopColor="#ff3d6e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.05" r="0.9">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.6" stopColor="#fff4c8" />
          <stop offset="1" stopColor="#ffd36b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M15 0C26 0 30 16 22 36 19 45 17 54 15 64 13 54 11 45 8 36 0 16 4 0 15 0Z" fill={`url(#${id}-outer)`} />
      <path d="M15 1C21 1 23 10 19 22 17.5 27 16 33 15 40 14 33 12.5 27 11 22 7 10 9 1 15 1Z" fill={`url(#${id}-core)`} />
    </svg>
  );
}
