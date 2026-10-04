"use client";

import Embers, { type Ember } from "./Embers";
import Glints, { type Glint } from "./Glints";
import styles from "./BlackjackArt.module.css";
import { useBannerPlay } from "./useBannerPlay";

// Length of one deal; keep in step with --deal in BlackjackArt.module.css.
const DEAL_MS = 1400;

// Embers drifting up behind the cards and glints around them; see Embers and
// Glints.
const EMBERS: Ember[] = [
  { x: -24, y: 118, size: 4.5, rise: 150, sway: 5, speed: 1, phase: 0.4 },
  { x: -10, y: 104, size: 6, rise: 170, sway: -6, speed: 1, phase: 0.05 },
  { x: 6, y: 130, size: 3.5, rise: 140, sway: 4, speed: 2, phase: 0.6 },
  { x: 22, y: 112, size: 5, rise: 185, sway: 6, speed: 1, phase: 0.7 },
  { x: 38, y: 138, size: 3, rise: 150, sway: -4, speed: 2, phase: 0.2 },
  { x: 54, y: 120, size: 6, rise: 190, sway: -5, speed: 1, phase: 0.55 },
  { x: 70, y: 134, size: 3.5, rise: 145, sway: 5, speed: 2, phase: 0.85 },
  { x: 86, y: 108, size: 5, rise: 175, sway: -6, speed: 1, phase: 0.25 },
  { x: 100, y: 126, size: 4, rise: 135, sway: 4, speed: 2, phase: 0.45 },
  { x: 114, y: 114, size: 6, rise: 165, sway: -5, speed: 1, phase: 0.9 },
  { x: 126, y: 132, size: 3, rise: 155, sway: -4, speed: 2, phase: 0.15 },
];

const GLINTS: Glint[] = [
  { x: -20, y: 14, size: 11, start: 0.1 },
  { x: 120, y: 60, size: 12, start: 0.36 },
  { x: 50, y: -6, size: 7, start: 0.6 },
  { x: 114, y: 4, size: 9, start: 0.78 },
  { x: -24, y: 72, size: 8, start: 0.86 },
];

type Suit = "clubs" | "hearts";

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
      <div className={styles.glow} />
      <div className={styles.ambient}>
        <div className={styles.floor} />
        <Embers embers={EMBERS} />
      </div>
      <div className={styles.burst} />
      <div className={styles.shadow} />

      <div className={styles.hand}>
        <Card rank="A" suit="clubs" className={styles.ace} />
        <Card rank="K" suit="hearts" className={styles.king} />
        <span className={styles.total}>21</span>
      </div>

      <Glints glints={GLINTS} />
    </div>
  );
}

function Card({ rank, suit, className }: { rank: string; suit: Suit; className: string }) {
  return (
    <div className={`${styles.card} ${suit === "hearts" ? styles.red : styles.black} ${className}`}>
      <span className={styles.rank}>{rank}</span>
      <SuitIcon suit={suit} className={styles.pip} />
      <SuitIcon suit={suit} className={styles.bigPip} />
    </div>
  );
}

function SuitIcon({ suit, className }: { suit: Suit; className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {suit === "hearts" ? (
        <path d="M12 21.6C11.4 21 2.2 14.7 2.2 8.4 2.2 5.2 4.6 2.8 7.6 2.8c1.9 0 3.5 1.1 4.4 2.6.9-1.5 2.5-2.6 4.4-2.6 3 0 5.4 2.4 5.4 5.6 0 6.3-9.2 12.6-9.8 13.2z" />
      ) : (
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
