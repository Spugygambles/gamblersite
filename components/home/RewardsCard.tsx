import Link from "next/link";
import { PLAYER } from "@/lib/home";
import styles from "./EventsRow.module.css";

// The player's level and today's free case.
export default function RewardsCard() {
  return (
    <section className={`${styles.card} ${styles.rewards}`} aria-labelledby="level-title">
      <div className={styles.levelHead}>
        <h3 id="level-title" className={styles.title}>
          Level {PLAYER.level}
        </h3>
        <span className={`${styles.pct} tabular`}>{PLAYER.levelProgress}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={`Progress to level ${PLAYER.level + 1}`}
        aria-valuenow={PLAYER.levelProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${PLAYER.levelProgress}%` }} />
      </div>
      <p className={styles.text}>
        {100 - PLAYER.levelProgress}% to level {PLAYER.level + 1}
      </p>
      <Link href="/rewards" className={styles.button}>
        Claim daily case
      </Link>
    </section>
  );
}
