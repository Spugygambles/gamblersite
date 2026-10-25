import Link from "next/link";
import styles from "./Wordmark.module.css";

// The brand is the name alone: SPUGY, set wide, with a lit purple full stop.
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`${styles.wordmark} ${className}`} aria-label="Spugy home">
      <span className={styles.word} aria-hidden>
        SPUGY
      </span>
      <span className={styles.dot} aria-hidden />
    </Link>
  );
}
