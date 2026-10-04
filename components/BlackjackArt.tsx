"use client";

import type { CSSProperties } from "react";
import styles from "./BlackjackArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one deal; keep in step with --deal in BlackjackArt.module.css.
const DEAL_MS = 1400;

type Suit = "spades" | "hearts" | "diamonds" | "clubs";

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

// Suits drifting up behind the hand. Positions, sizes and rise are % of the
// stage; `speed` is how many times each rises per --cycle, `phase` how far
// into its rise it starts, and `spin` how far it turns on the way up.
const DRIFT: {
  suit: Suit;
  x: number;
  y: number;
  size: number;
  rise: number;
  speed: number;
  phase: number;
  spin: number;
}[] = [
  { suit: "spades", x: -20, y: 112, size: 9, rise: 150, speed: 1, phase: 0.1, spin: 50 },
  { suit: "hearts", x: -4, y: 130, size: 7, rise: 170, speed: 1, phase: 0.6, spin: -40 },
  { suit: "diamonds", x: 14, y: 118, size: 6, rise: 140, speed: 2, phase: 0.35, spin: 60 },
  { suit: "clubs", x: 32, y: 136, size: 8, rise: 180, speed: 1, phase: 0.85, spin: -50 },
  { suit: "hearts", x: 52, y: 122, size: 6, rise: 160, speed: 2, phase: 0.2, spin: 45 },
  { suit: "spades", x: 70, y: 134, size: 7, rise: 175, speed: 1, phase: 0.45, spin: -35 },
  { suit: "diamonds", x: 88, y: 114, size: 8, rise: 150, speed: 1, phase: 0.7, spin: 55 },
  { suit: "clubs", x: 106, y: 128, size: 6, rise: 165, speed: 2, phase: 0.9, spin: -45 },
  { suit: "hearts", x: 122, y: 118, size: 9, rise: 145, speed: 1, phase: 0.3, spin: 40 },
];

// Suits that burst out from behind the cards as they land in the fan: dx/dy
// are where each one ends up (% of the stage) and spin how far it turns.
const POPS: { suit: Suit; dx: number; dy: number; spin: number }[] = [
  { suit: "hearts", dx: -88, dy: -52, spin: -120 },
  { suit: "spades", dx: -98, dy: 8, spin: 90 },
  { suit: "diamonds", dx: -76, dy: 64, spin: -80 },
  { suit: "clubs", dx: -20, dy: -92, spin: 140 },
  { suit: "hearts", dx: 80, dy: -66, spin: 110 },
  { suit: "clubs", dx: 100, dy: 2, spin: -100 },
  { suit: "diamonds", dx: 78, dy: 66, spin: 70 },
  { suit: "spades", dx: 24, dy: -96, spin: -130 },
];

export default function BlackjackArt() {
  // The stacked cards slide apart as the page loads; each hover gathers them
  // back up and deals them out again.
  const { ref, playing, replays } = useBannerPlay(DEAL_MS);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-playing={playing || undefined}
      data-intro={replays === 0 || undefined}
    >
      <div className={styles.glowAce} />
      <div className={styles.glowKing} />
      <div className={styles.floor} />

      {DRIFT.map((d, i) => (
        <SuitIcon
          key={i}
          suit={d.suit}
          className={`${styles.drift} ${isRed(d.suit) ? styles.red : styles.light}`}
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}%`,
              animationDuration: `calc(var(--cycle) / ${d.speed})`,
              animationDelay: `calc(var(--cycle) * ${-d.phase / d.speed})`,
              "--rise": `${d.rise}cqw`,
              "--spin": `${d.spin}deg`,
            } as CSSProperties
          }
        />
      ))}

      {POPS.map((p, i) => (
        <SuitIcon
          key={i}
          suit={p.suit}
          className={`${styles.pop} ${isRed(p.suit) ? styles.red : styles.light}`}
          style={
            {
              "--dx": `${p.dx}cqw`,
              "--dy": `${p.dy}cqw`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}

      <div className={styles.shadow} />

      <div className={styles.hand}>
        <Card rank="A" suit="clubs" className={styles.ace} />
        <Card rank="K" suit="hearts" className={styles.king} />
      </div>
    </div>
  );
}

function Card({ rank, suit, className }: { rank: string; suit: Suit; className: string }) {
  return (
    <div className={`${styles.card} ${isRed(suit) ? styles.red : styles.black} ${className}`}>
      <span className={styles.rank}>{rank}</span>
      <SuitIcon suit={suit} className={styles.pip} />
      <SuitIcon suit={suit} className={styles.bigPip} />
    </div>
  );
}

function SuitIcon({
  suit,
  className,
  style,
}: {
  suit: Suit;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      {suit === "hearts" && (
        <path d="M12 21.6C11.4 21 2.2 14.7 2.2 8.4 2.2 5.2 4.6 2.8 7.6 2.8c1.9 0 3.5 1.1 4.4 2.6.9-1.5 2.5-2.6 4.4-2.6 3 0 5.4 2.4 5.4 5.6 0 6.3-9.2 12.6-9.8 13.2z" />
      )}
      {suit === "diamonds" && (
        <path d="M12 2.2c2.4 3.6 4.9 6.8 7.8 9.8-2.9 3-5.4 6.2-7.8 9.8-2.4-3.6-4.9-6.8-7.8-9.8 2.9-3 5.4-6.2 7.8-9.8z" />
      )}
      {suit === "spades" && (
        <path d="M12 2.5C9.6 6 3.5 9.4 3.5 13.6c0 2.6 2 4.5 4.4 4.5 1.5 0 2.8-.7 3.4-1.8-.2 2.1-1 3.9-2.6 5.4h6.6c-1.6-1.5-2.4-3.3-2.6-5.4.6 1.1 1.9 1.8 3.4 1.8 2.4 0 4.4-1.9 4.4-4.5C20.5 9.4 14.4 6 12 2.5z" />
      )}
      {suit === "clubs" && (
        <>
          <circle cx="12" cy="7.2" r="4.7" />
          <circle cx="6.9" cy="13.6" r="4.7" />
          <circle cx="17.1" cy="13.6" r="4.7" />
          <circle cx="12" cy="12.5" r="3.2" />
          <path d="M12 12.5c0 4-1.2 7.1-3.4 9.3h6.8C13.2 19.6 12 16.5 12 12.5z" />
        </>
      )}
    </svg>
  );
}
