"use client";

import { Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./UpgraderArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// The site's heavy number face (see LimboArt).
const montserrat = Montserrat({ weight: "800", subsets: ["latin"] });

// Length of one spin: it must outlast the last animation in
// UpgraderArt.module.css (the green wash settling, ending at 2800 + 900 =
// 3700ms).
const PLAY_MS = 3800;

// Sparks thrown off the pointer as it lands in the zone, and off the new
// value as it bursts in, in cqw.
const TIP_SPARKS = [
  { dx: -14, dy: -10, size: 5 },
  { dx: 2, dy: -17, size: 4 },
  { dx: 15, dy: -9, size: 5 },
  { dx: 17, dy: 6, size: 4 },
  { dx: -16, dy: 5, size: 4 },
];

const VALUE_SPARKS = [
  { dx: -48, dy: -16, size: 7 },
  { dx: -34, dy: 18, size: 5 },
  { dx: -12, dy: -24, size: 6 },
  { dx: 14, dy: -23, size: 5 },
  { dx: 36, dy: 16, size: 6 },
  { dx: 50, dy: -12, size: 7 },
];

// Green embers drifting up beside the dial; see Embers.
const EMBERS: Ember[] = [
  { x: -30, y: 118, size: 5.5, rise: 170, sway: 3, speed: 1, phase: 0.15 },
  { x: -22, y: 128, size: 4, rise: 150, sway: -3, speed: 2, phase: 0.6 },
  { x: -12, y: 110, size: 6, rise: 180, sway: 3, speed: 1, phase: 0.85 },
  { x: 112, y: 116, size: 5, rise: 170, sway: -3, speed: 1, phase: 0.45 },
  { x: 122, y: 128, size: 4, rise: 160, sway: 2, speed: 2, phase: 0.95 },
  { x: 130, y: 112, size: 5.5, rise: 175, sway: -3, speed: 1, phase: 0.7 },
  { x: 20, y: 132, size: 4, rise: 160, sway: 3, speed: 2, phase: 0.3 },
  { x: 80, y: 130, size: 4.5, rise: 165, sway: -3, speed: 2, phase: 0.1 },
];

export default function UpgraderArt() {
  // The dial spins as the page loads; each hover sets $1 back in and spins
  // again.
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
      <div className={styles.shadow} />

      <div className={styles.scene}>
        <div className={styles.disc}>
          <div className={styles.ticks} />
          <div className={styles.track} />
          <div className={styles.sweep} />
          <div className={styles.arc} />
          <div className={styles.arcGlow} />
          <div className={styles.plate} />
          <div className={styles.wave} />

          {/* The pointer rides the track; a trail follows it while it's fast. */}
          <div className={styles.pointer}>
            <div className={styles.tail} />
            <span className={styles.bead} />
            <span className={styles.marker} />
            <span className={styles.tipBurst}>
              {TIP_SPARKS.map((s, i) => (
                <Spark key={i} {...s} />
              ))}
            </span>
          </div>

          {/* Lifted off the dial and turned to face the viewer. */}
          <div className={`${styles.value} ${montserrat.className}`}>
            {VALUE_SPARKS.map((s, i) => (
              <Spark key={i} {...s} />
            ))}
            <span className={styles.from}>$1.00</span>
            <span className={styles.to}>$100.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spark({ dx, dy, size }: { dx: number; dy: number; size: number }) {
  return (
    <span
      className={styles.spark}
      style={{ width: `${size}cqw`, "--dx": `${dx}cqw`, "--dy": `${dy}cqw` } as CSSProperties}
    />
  );
}
