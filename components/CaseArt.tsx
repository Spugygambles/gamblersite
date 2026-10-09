"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./CaseArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one opening: it must outlast the last animation in
// CaseArt.module.css (the last bubble, ending at 600 + 5 * 60 + 1100 =
// 2000ms).
const PLAY_MS = 2100;

const LAYERS = ["base", "loot", "launcher"] as const;

// Sparkles that twinkle round the case as it pops: where each sits, as % of
// the stage, and how big it is.
const SPARKLES = [
  { x: 6, y: 8, size: 9 },
  { x: 88, y: 2, size: 11 },
  { x: 104, y: 40, size: 8 },
  { x: -8, y: 46, size: 10 },
  { x: 32, y: -8, size: 8 },
  { x: 68, y: -12, size: 9 },
  { x: 96, y: 74, size: 7 },
];

// Toxic bubbles that boil up out of the open case, in cqw.
const BUBBLES = [
  { dx: -14, size: 6 },
  { dx: 6, size: 8 },
  { dx: -4, size: 5 },
  { dx: 16, size: 7 },
  { dx: -22, size: 5 },
  { dx: 24, size: 6 },
];

// Green spores drifting up round the case; see Embers.
const EMBERS: Ember[] = [
  { x: -28, y: 118, size: 5, rise: 170, sway: 3, speed: 1, phase: 0.15 },
  { x: -16, y: 128, size: 4, rise: 150, sway: -3, speed: 2, phase: 0.6 },
  { x: 2, y: 112, size: 5.5, rise: 180, sway: 3, speed: 1, phase: 0.85 },
  { x: 22, y: 124, size: 3.5, rise: 160, sway: -2, speed: 2, phase: 0.3 },
  { x: 44, y: 116, size: 4.5, rise: 170, sway: 3, speed: 1, phase: 0.45 },
  { x: 64, y: 130, size: 4, rise: 175, sway: -3, speed: 2, phase: 0.95 },
  { x: 84, y: 114, size: 5.5, rise: 165, sway: 3, speed: 1, phase: 0.7 },
  { x: 104, y: 126, size: 3.5, rise: 155, sway: -2, speed: 2, phase: 0.1 },
  { x: 124, y: 118, size: 5, rise: 180, sway: 3, speed: 1, phase: 0.35 },
];

export default function CaseArt() {
  // The case pops as the page loads and again on each hover.
  const { ref, playing, replays } = useBannerPlay(PLAY_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
    >
      <div className={styles.aura} />
      <div className={styles.ambient}>
        <Embers embers={EMBERS} />
      </div>
      <div className={styles.pad} />
      <div className={styles.ring} />
      <div className={styles.shadow} />
      <div className={styles.burst} />

      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className={styles.bubble}
          style={{ width: `${b.size}cqw`, "--k": i, "--dx": `${b.dx}cqw` } as CSSProperties}
        />
      ))}

      <div className={styles.float}>
        <div className={styles.hop}>
          <div className={styles.enter}>
            {/* The case in three layers so its loot can pop out and drop
                back: the case itself, the skull mask with the launcher lying
                across it, and the striped launcher out front. Together at
                rest they make up the whole picture. */}
            <div className={styles.caseBox}>
              {LAYERS.map((layer) => (
                <Image
                  key={layer}
                  className={layer === "base" ? styles.layer : `${styles.layer} ${styles[layer]}`}
                  src={`/cases/toxic-case-${layer}.png`}
                  alt=""
                  width={764}
                  height={752}
                  // Served as-is: already sized for sharp high-DPI screens.
                  unoptimized
                  loading="eager"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={
            { left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}cqw`, "--k": i } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
