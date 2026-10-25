import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./Wordmark.module.css";

// The brand is the name alone: CSGO in white, NEO lit up in neon, and a
// blinking cursor after it like a terminal prompt. It glitches now and then.
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`${styles.wordmark} ${className}`} aria-label="CsgoNeo home">
      <span
        className={`${styles.word} glitch`}
        data-text="CSGONEO"
        style={{ "--glitch-every": "7s", "--glitch-delay": "-2.2s" } as CSSProperties}
        aria-hidden
      >
        CSGO<span className={styles.neo}>NEO</span>
      </span>
      <span className={styles.cursor} aria-hidden />
    </Link>
  );
}
