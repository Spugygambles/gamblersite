import Image from "next/image";
import Link from "next/link";
import { caseBySlug, PLAYER } from "@/lib/home";
import { ChevronIcon } from "./icons";
import styles from "./EventsRow.module.css";

// Today's free case, with the player's progress to the next level.
export default function RewardsCard() {
  const daily = caseBySlug("new-year");
  return (
    <Link href="/rewards" className={styles.card}>
      <span className={styles.well} aria-hidden>
        <Image className={styles.daily} src={daily.thumb} alt="" width={160} height={160} unoptimized />
      </span>
      <span className={styles.body}>
        <span className={styles.kicker}>Rewards · Level {PLAYER.level}</span>
        <span className={styles.title}>Claim daily case</span>
        <span className={styles.level}>
          <span
            className={styles.bar}
            role="progressbar"
            aria-label={`Progress to level ${PLAYER.level + 1}`}
            aria-valuenow={PLAYER.levelProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${PLAYER.levelProgress}%` }} />
          </span>
          <span className="tabular">{PLAYER.levelProgress}%</span>
        </span>
      </span>
      <ChevronIcon direction="right" className={styles.go} />
    </Link>
  );
}
