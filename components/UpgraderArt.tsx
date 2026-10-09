"use client";

import { Montserrat } from "next/font/google";
import { useId, type CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./UpgraderArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// The site's heavy number face (see LimboArt).
const montserrat = Montserrat({ weight: "800", subsets: ["latin"] });

// Length of one spin: it must outlast the last animation in
// UpgraderArt.module.css (the purple wash settling, ending at 2800 + 900 =
// 3700ms).
const PLAY_MS = 3800;

// The win zone: ZONE degrees of the ring clockwise from the top, a 10% chance
// for a 10x upgrade. Keep in step with --rest in UpgraderArt.module.css, where
// the pointer lands inside it.
const ZONE = 36;
const RING_R = 46;
const ZONE_LEN = (ZONE / 360) * 2 * Math.PI * RING_R;

// Sparks thrown off the pointer as it lands in the zone, and off the new
// value as it bursts in, in cqw.
const TIP_SPARKS = [
  { dx: -14, dy: -12, size: 5 },
  { dx: 2, dy: -18, size: 4 },
  { dx: 16, dy: -10, size: 5 },
  { dx: 18, dy: 6, size: 4 },
  { dx: -16, dy: 6, size: 4 },
];

const VALUE_SPARKS = [
  { dx: -50, dy: -16, size: 7 },
  { dx: -36, dy: 18, size: 5 },
  { dx: -12, dy: -24, size: 6 },
  { dx: 14, dy: -23, size: 5 },
  { dx: 38, dy: 16, size: 6 },
  { dx: 52, dy: -12, size: 7 },
];

// Purple embers drifting up beside the dial; see Embers.
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
  // The dial spins as the page loads; each hover sets $10 back in and spins
  // again.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);
  const id = useId();

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

      <div className={styles.dial}>
        <div className={styles.face} />

        {/* The white ring and, over it, the purple zone that wins. */}
        <svg className={styles.ring} viewBox="0 0 100 100">
          <defs>
            <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <circle className={styles.track} cx="50" cy="50" r={RING_R} />
          <g transform="rotate(-90 50 50)">
            <circle
              className={styles.zoneGlow}
              cx="50"
              cy="50"
              r={RING_R}
              strokeDasharray={`${ZONE_LEN} 999`}
              filter={`url(#${id}-glow)`}
            />
            <circle
              className={styles.zone}
              cx="50"
              cy="50"
              r={RING_R}
              strokeDasharray={`${ZONE_LEN} 999`}
            />
          </g>
        </svg>
        <div className={styles.glint} />
        <div className={styles.wave} />

        {/* The pointer runs round inside the ring; a trail follows it while
            it's fast. */}
        <div className={styles.pointer}>
          <div className={styles.trail} />
          <span className={styles.marker} />
          <span className={styles.tipBurst}>
            {TIP_SPARKS.map((s, i) => (
              <Spark key={i} {...s} />
            ))}
          </span>
        </div>

        <div className={`${styles.value} ${montserrat.className}`}>
          {VALUE_SPARKS.map((s, i) => (
            <Spark key={i} {...s} />
          ))}
          <span className={styles.from}>$10.00</span>
          <span className={styles.to}>$100.00</span>
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
