"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./CoinflipArt.module.css";

// Length of one throw; keep in step with --throw in CoinflipArt.module.css.
const THROW_MS = 1250;

// Stacked discs between the two faces that give the coin a visible rim mid-flip.
const EDGE_LAYERS = 12;

// Glowing embers drifting up behind the coin. Positions, sizes, rise and sway
// are percentages of the coin; `speed` is how many times it rises per cycle and
// `phase` is how far into its rise it starts, so they don't all appear at once.
const EMBERS = [
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

// Positions and sizes are percentages of the coin. `start` staggers when each
// glint fires, as a fraction of its twinkle (half the cycle).
const SPARKLES = [
  { x: -8, y: 12, size: 11, start: 0.05 },
  { x: 112, y: 64, size: 12, start: 0.32 },
  { x: 50, y: -18, size: 7, start: 0.56 },
  { x: 104, y: 6, size: 9, start: 0.74 },
  { x: -14, y: 74, size: 8, start: 0.78 },
];

type Face = "heads" | "tails";

export default function CoinflipArt() {
  const stageRef = useRef<HTMLDivElement>(null);
  // The first render is already mid-throw, so the CSS tosses the coin once as
  // the page loads (before this script has even run) and it lands on heads.
  const [face, setFace] = useState<Face>("heads");
  const [flipping, setFlipping] = useState(true);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (flipping) {
      const timer = setTimeout(() => setFlipping(false), THROW_MS);
      return () => clearTimeout(timer);
    }

    // Between throws, flip again whenever the mouse moves onto the banner.
    const banner = stage.closest("[data-game-banner]") ?? stage;
    const flip = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Make sure the browser has seen the last throw end, so the throw
      // animations restart instead of staying on their final frame.
      void stage.offsetWidth;
      setFace((current) => (current === "heads" ? "tails" : "heads"));
      setFlipping(true);
    };
    banner.addEventListener("mouseenter", flip);
    return () => banner.removeEventListener("mouseenter", flip);
  }, [flipping]);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-face={face}
      data-flipping={flipping || undefined}
    >
      <div className={`${styles.glow} ${styles.glowHeads}`} />
      <div className={`${styles.glow} ${styles.glowTails}`} />
      <div className={styles.ambient}>
        <div className={styles.aura} />
        <div className={styles.floor} />
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className={styles.ember}
            style={
              {
                left: `${e.x}%`,
                top: `${e.y}%`,
                width: `${e.size}%`,
                animationDuration: `calc(var(--cycle) / ${e.speed})`,
                animationDelay: `calc(var(--cycle) * ${-e.phase / e.speed})`,
                "--rise": `${e.rise}cqw`,
                "--sway": `${e.sway}cqw`,
              } as CSSProperties
            }
          />
        ))}
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

      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}%`,
            animationDelay: `calc(var(--cycle) * ${s.start / 2})`,
          }}
        />
      ))}
    </div>
  );
}
