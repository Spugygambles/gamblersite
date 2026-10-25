import { CoinIcon, PumpkinIcon, TrophyIcon } from "./icons";
import styles from "./PromoArt.module.css";

// Small scenes for the promo cards. Each sits in the bottom right corner of
// its card, about 170 x 130.

export function BonusArt() {
  return (
    <div className={styles.scene}>
      {[0, 1, 2, 3, 4].map((i) => (
        <CoinIcon key={i} className={styles.stackCoin} style={{ bottom: 8 + i * 8, left: 18 + (i % 2) * 3 }} />
      ))}
      <CoinIcon className={styles.flipCoin} />
      <span className={styles.bonusTag}>+10%</span>
    </div>
  );
}

export function PumpkinArt() {
  return (
    <div className={styles.scene}>
      <PumpkinIcon className={styles.pumpkinSmall} />
      <PumpkinIcon className={styles.pumpkinBig} />
      <svg className={styles.bat} viewBox="0 0 40 18" aria-hidden>
        <path d="M20 6c1-3 2-4 2-4l1 3c3-3 8-3 10-1-2 0-3 2-3 4-2-1-4 0-5 2-2-1-3-1-5 0-2-2-3-2-5-2-1-2-3-4-5-4-2-2 7-2 10 1l1-3s1 1 2 4Z" fill="#1b0f24" />
      </svg>
    </div>
  );
}

export function RaceArt() {
  return (
    <div className={styles.scene}>
      <span className={styles.podium} />
      <TrophyIcon className={styles.trophy} />
      <span className={`${styles.spark} ${styles.s1}`} />
      <span className={`${styles.spark} ${styles.s2}`} />
      <span className={`${styles.spark} ${styles.s3}`} />
    </div>
  );
}
