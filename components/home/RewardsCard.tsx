import Link from "next/link";
import { PLAYER } from "@/lib/home";
import { GiftIcon } from "./icons";
import styles from "./EventsRow.module.css";

// The player's level and today's free case.
export default function RewardsCard() {
  return (
    <section className={`${styles.card} ${styles.rewards}`} aria-labelledby="rewards-title">
      <div className={styles.rewardsHead}>
        <span className={styles.hex} aria-hidden>
          {PLAYER.level}
        </span>
        <div>
          <p className={styles.kicker}>Rewards</p>
          <h2 id="rewards-title" className={styles.level}>
            Level {PLAYER.level}
          </h2>
        </div>
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
        <span className={styles.fill} style={{ width: `${PLAYER.levelProgress}%` }} />
      </div>
      <p className={styles.next}>
        <span>{100 - PLAYER.levelProgress}% to level {PLAYER.level + 1}</span>
        <span>Unlocks a level case</span>
      </p>

      <Link href="/rewards" className={styles.daily}>
        <span className={styles.giftBox} aria-hidden>
          <GiftIcon />
        </span>
        <span className={styles.dailyText}>
          <strong>Daily case</strong>
          <span>Ready to open</span>
        </span>
        <span className={styles.claim}>Claim</span>
      </Link>
    </section>
  );
}
