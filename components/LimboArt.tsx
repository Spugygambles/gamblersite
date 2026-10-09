"use client";

import { Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./LimboArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// The heavy, wide face closest to the site's Limbo multiplier.
const montserrat = Montserrat({ weight: "800", subsets: ["latin"] });

// Length of one roll: it must outlast the last animation in
// LimboArt.module.css (the green wash settling, ending at 1200 + 900 = 2100ms).
const PLAY_MS = 2200;

// Sparks thrown out of the multiplier as it lands, in cqw.
const SPARKS = [
  { dx: -62, dy: -20, size: 9 },
  { dx: -46, dy: 22, size: 7 },
  { dx: -20, dy: -30, size: 8 },
  { dx: 22, dy: -28, size: 7 },
  { dx: 48, dy: 20, size: 8 },
  { dx: 64, dy: -16, size: 9 },
];

// Green embers drifting up around the multiplier; see Embers.
const EMBERS: Ember[] = [
  { x: -28, y: 118, size: 5.9, rise: 170, sway: 3, speed: 1, phase: 0.15 },
  { x: -18, y: 128, size: 4.5, rise: 150, sway: -3, speed: 2, phase: 0.6 },
  { x: -6, y: 110, size: 6.5, rise: 180, sway: 3, speed: 1, phase: 0.85 },
  { x: 8, y: 124, size: 3.9, rise: 160, sway: -2, speed: 2, phase: 0.3 },
  { x: 24, y: 116, size: 5.2, rise: 170, sway: 3, speed: 1, phase: 0.45 },
  { x: 40, y: 130, size: 4.5, rise: 175, sway: -3, speed: 2, phase: 0.95 },
  { x: 58, y: 112, size: 5.9, rise: 165, sway: 3, speed: 1, phase: 0.7 },
  { x: 74, y: 126, size: 3.9, rise: 155, sway: -2, speed: 2, phase: 0.1 },
  { x: 92, y: 118, size: 6.5, rise: 180, sway: 3, speed: 1, phase: 0.35 },
  { x: 108, y: 128, size: 4.5, rise: 160, sway: -3, speed: 2, phase: 0.55 },
  { x: 122, y: 114, size: 5.2, rise: 170, sway: 2, speed: 1, phase: 0.8 },
];

export default function LimboArt() {
  // The multiplier rolls as the page loads; each hover rolls it again.
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
      <div className={styles.ambient}>
        <Embers embers={EMBERS} />
      </div>
      <div className={styles.flare} />

      {/* The multiplier rolls up from 1.00× and lands green. */}
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
        <span className={`${styles.num} ${montserrat.className}`} aria-hidden />
      </div>

      {/* The result drops into the corner, like the game's last-result pill. */}
      <span className={`${styles.pill} ${montserrat.className}`} aria-hidden>
        2.29×
      </span>
    </div>
  );
}
