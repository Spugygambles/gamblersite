import Link from "next/link";
import { PLAYER } from "@/lib/home";
import { GiftIcon } from "./icons";
import styles from "./EventsRow.module.css";

const SEGMENTS = 20;

// The player's level, on a bar of lit segments, and today's free case.
export default function RewardsCard() {
  const lit = Math.round((PLAYER.levelProgress / 100) * SEGMENTS);
  return (
    <section className={`${styles.card} ${styles.rewards}`} aria-labelledby="level-title">
      <div className={styles.levelHead}>
        <span className={styles.badge} aria-hidden>
          {PLAYER.level}
        </span>
        <h3 id="level-title" className={styles.title}>
          Level <span className={styles.gold}>{PLAYER.level}</span>
        </h3>
        <span className={`${styles.pct} tabular`}>{PLAYER.levelProgress}%</span>
      </div>
      <div
        className={styles.segments}
        role="progressbar"
        aria-label={`Progress to level ${PLAYER.level + 1}`}
        aria-valuenow={PLAYER.levelProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={i < lit ? styles.on : undefined} />
        ))}
      </div>
      <p className={styles.text}>
        {100 - PLAYER.levelProgress}% to level {PLAYER.level + 1}
      </p>
      <Link href="/rewards" className={styles.button}>
        <GiftIcon />
        Claim daily case
      </Link>
    </section>
  );
}
