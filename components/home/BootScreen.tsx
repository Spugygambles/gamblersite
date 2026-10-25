import type { CSSProperties } from "react";
import styles from "./BootScreen.module.css";

// What the firmware prints as the site starts up.
const LINES: [string, string][] = [
  ["NEO BIOS v2.6.1  (C) 2026 CSGONEO", ""],
  ["CPU  CASE ENGINE X9 @ 4.20GHZ", "OK"],
  ["MEM  65536K SKIN CACHE", "OK"],
  ["MOUNT /dev/wallet", "OK"],
  ["LOAD cases battles upgrader mines keno crash limbo coinflip blackjack", "OK"],
  ["LINK secure channel", "OK"],
];

// A firmware boot screen over the page as it loads: the lines print, a bar
// fills, ACCESS GRANTED, and the screen switches off to show the site. The
// timing is all CSS; public/neo/effects.js lets a click or key skip it.
export default function BootScreen() {
  return (
    <div className={styles.boot} data-boot aria-hidden>
      <div className={styles.screen}>
        {LINES.map(([text, status], i) => (
          <p key={text} className={styles.line} style={{ "--i": i } as CSSProperties}>
            <span>{text}</span>
            {status && <span className={styles.ok}>[ {status} ]</span>}
          </p>
        ))}
        <p className={styles.line} style={{ "--i": LINES.length } as CSSProperties}>
          <span className={styles.bar}>
            <span />
          </span>
        </p>
        <p className={styles.granted}>
          ACCESS GRANTED<span className={styles.cursor} />
        </p>
      </div>
    </div>
  );
}
