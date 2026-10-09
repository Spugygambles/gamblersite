"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import type { CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./BattleArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// The site's heavy number face (see LimboArt), at its heaviest for the VS.
const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

// Length of one battle: it must outlast the last animation in
// BattleArt.module.css (the last sparkle, ending at 1000 + 4 * 110 + 700 =
// 2140ms).
const PLAY_MS = 2200;

// Sparks thrown out of the clash between the cases, in cqw.
const SPARKS = [
  { dx: -30, dy: -26, size: 7 },
  { dx: -8, dy: -34, size: 6 },
  { dx: 16, dy: -30, size: 7 },
  { dx: 32, dy: -10, size: 6 },
  { dx: 26, dy: 20, size: 5 },
  { dx: -24, dy: 22, size: 5 },
  { dx: -34, dy: -4, size: 6 },
  { dx: 4, dy: 30, size: 5 },
];

// Sparkles that twinkle over the cases after the clash, as % of the stage.
const SPARKLES = [
  { x: -14, y: 12, size: 8 },
  { x: 22, y: 6, size: 6 },
  { x: 78, y: 4, size: 7 },
  { x: 112, y: 14, size: 8 },
  { x: 50, y: 18, size: 6 },
];

// Embers drifting up behind each case, in that case's color; see Embers.
const EMBERS_LEFT: Ember[] = [
  { x: -30, y: 118, size: 5, rise: 170, sway: 3, speed: 1, phase: 0.15 },
  { x: -14, y: 128, size: 4, rise: 150, sway: -3, speed: 2, phase: 0.6 },
  { x: 4, y: 112, size: 5.5, rise: 180, sway: 3, speed: 1, phase: 0.85 },
  { x: 24, y: 124, size: 3.5, rise: 160, sway: -2, speed: 2, phase: 0.3 },
];

const EMBERS_RIGHT: Ember[] = [
  { x: 76, y: 116, size: 4.5, rise: 170, sway: 3, speed: 1, phase: 0.45 },
  { x: 96, y: 130, size: 4, rise: 175, sway: -3, speed: 2, phase: 0.95 },
  { x: 114, y: 114, size: 5.5, rise: 165, sway: 3, speed: 1, phase: 0.7 },
  { x: 130, y: 126, size: 3.5, rise: 155, sway: -2, speed: 2, phase: 0.1 },
];

const CASES = [
  { side: "left", src: "/battles/new-year-case.png", width: 576, height: 582 },
  { side: "right", src: "/battles/music-box-case.png", width: 1088, height: 844 },
] as const;

export default function BattleArt() {
  // The battle plays as the page loads; each hover clashes the cases again.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
    >
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.embersLeft}>
        <Embers embers={EMBERS_LEFT} />
      </div>
      <div className={styles.embersRight}>
        <Embers embers={EMBERS_RIGHT} />
      </div>

      {CASES.map((c) => (
        <div key={c.side} className={styles.side} data-side={c.side}>
          <div className={styles.shadow} />
          <div className={styles.slide}>
            <div className={styles.clash}>
              <div className={styles.float}>
                <Image
                  className={styles.case}
                  src={c.src}
                  alt=""
                  width={c.width}
                  height={c.height}
                  // Served as-is: already sized for sharp high-DPI screens.
                  unoptimized
                  loading="eager"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Where the cases meet: the flash, shockwave and sparks of the clash,
          and the VS that slams down between them. */}
      <div className={styles.center}>
        <span className={styles.flash} />
        <span className={styles.flare} />
        <span className={styles.ring} />
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className={styles.spark}
            style={{ width: `${s.size}cqw`, "--dx": `${s.dx}cqw`, "--dy": `${s.dy}cqw` } as CSSProperties}
          />
        ))}
        <div className={styles.vsSlam}>
          <span className={`${styles.vs} ${montserrat.className}`}>VS</span>
        </div>
      </div>

      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}cqw`, "--k": i } as CSSProperties}
        />
      ))}
    </div>
  );
}
