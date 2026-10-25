import Link from "next/link";
import styles from "./Wordmark.module.css";

// The brand is the name alone: CSGO in white, NEO in the accent colour.
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`${styles.wordmark} ${className}`} aria-label="CsgoNeo home">
      <span className={styles.word} aria-hidden>
        CSGO<span className={styles.neo}>NEO</span>
      </span>
    </Link>
  );
}
