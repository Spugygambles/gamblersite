"use client";

import Image from "next/image";
import Embers, { type Ember } from "./Embers";
import Glints, { type Glint } from "./Glints";
import styles from "./CoinflipArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one throw; keep in step with --throw in CoinflipArt.module.css.
const THROW_MS = 1250;

// Stacked discs between the two faces that give the coin a visible rim mid-flip.
const EDGE_LAYERS = 12;

// Embers drifting up behind the coin and glints around it; see Embers and Glints.
const EMBERS: Ember[] = [
  { x: -26, y: 112, size: 4.5, rise: 140, sway: 5, speed: 1, phase: 0.15 },
  { x: -12, y: 132, size: 7, rise: 175, sway: -6, speed: 1, phase: 0.6 },
  { x: 4, y: 100, size: 4, rise: 125, sway: 4, speed: 2, phase: 0.35 },
  { x: 18, y: 140, size: 5, rise: 185, sway: 6, speed: 1, phase: 0.85 },
  { x: 34, y: 116, size: 3, rise: 150, sway: -4, speed: 2, phase: 0.7 },
  { x: 50, y: 146, size: 6, rise: 190, sway: -5, speed: 1, phase: 0.3 },
  { x: 66, y: 112, size: 4, rise: 145, sway: 5, speed: 2, phase: 0.95 },
  { x: 82, y: 136, size: 5, rise: 180, sway: -6, speed: 1, phase: 0.5 },
  { x: 96, y: 102, size: 4, rise: 130, sway: 4, speed: 2, phase: 0.1 },
  { x: 110, y: 128, size: 6, rise: 165, sway: -5, speed: 1, phase: 0.75 },
  { x: 124, y: 110, size: 4.5, rise: 140, sway: 6, speed: 1, phase: 0.4 },
  { x: 132, y: 138, size: 3, rise: 160, sway: -4, speed: 2, phase: 0.55 },
];

const GLINTS: Glint[] = [
  { x: -8, y: 12, size: 11, start: 0.05 },
  { x: 112, y: 64, size: 12, start: 0.32 },
  { x: 50, y: -18, size: 7, start: 0.56 },
  { x: 104, y: 6, size: 9, start: 0.74 },
  { x: -14, y: 74, size: 8, start: 0.78 },
];

export default function CoinflipArt() {
  // The intro throw lands on heads; each hover flips it to the other face.
  const { ref, playing, replays } = useBannerPlay(THROW_MS);
  const face = replays % 2 === 0 ? "heads" : "tails";

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-face={face}
      data-flipping={playing || undefined}
    >
      <div className={`${styles.glow} ${styles.glowHeads}`} />
      <div className={`${styles.glow} ${styles.glowTails}`} />
      <div className={styles.ambient}>
        <div className={styles.aura} />
        <div className={styles.floor} />
        <Embers embers={EMBERS} />
      </div>
      <div className={styles.shadow} />
      <div className={`${styles.ring} ${styles.ringHeads}`} />
      <div className={`${styles.ring} ${styles.ringTails}`} />

      <div className={styles.float}>
        <div className={styles.toss}>
          <div className={styles.coin}>
            <div className={`${styles.face} ${styles.heads}`}>
              <Image
                className={styles.faceImg}
                src="/coinflip/heads.png"
                alt=""
                width={464}
                height={464}
                // Served as-is: re-encoding blurs the pixel-art edges.
                unoptimized
                loading="eager"
                draggable={false}
              />
            </div>
            {/* A tilted face shows the far half of the rim, so each half is
                colored to match the face on the opposite side. */}
            {Array.from({ length: EDGE_LAYERS }, (_, i) => (
              <div
                key={i}
                className={`${styles.edge} ${i < EDGE_LAYERS / 2 ? styles.edgeTails : styles.edgeHeads}`}
                style={{
                  transform: `translateZ(calc(var(--depth) * ${0.5 - (i + 0.5) / EDGE_LAYERS}))`,
                }}
              />
            ))}
            <div className={`${styles.face} ${styles.tails}`}>
              <Image
                className={styles.faceImg}
                src="/coinflip/tails.png"
                alt=""
                width={464}
                height={464}
                unoptimized
                loading="eager"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <Glints glints={GLINTS} />
    </div>
  );
}
