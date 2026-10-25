"use client";

import type { CSSProperties } from "react";
import { RARITY, SAMPLE_DROPS, usd } from "@/lib/home";
import { useOnlineCount } from "./useOnlineCount";
import styles from "./DropTicker.module.css";

// A thin strip of the latest unboxings, running like a market ticker. The
// list is drawn twice so the loop has no seam; the copy is hidden from screen
// readers.
export default function DropTicker() {
  const online = useOnlineCount();
  const drops = [...SAMPLE_DROPS, ...SAMPLE_DROPS];

  return (
    <section className={styles.ticker} aria-label="Live drops">
      <div className={styles.label}>
        <span className={styles.pulse} aria-hidden />
        <span className={styles.live}>Live drops</span>
        <span className={styles.online}>
          <span className="tabular">{online}</span> online
        </span>
      </div>
      <div className={styles.viewport}>
        <ul className={styles.track}>
          {drops.map((d, i) => (
            <li
              key={i}
              className={styles.drop}
              style={{ "--rarity": RARITY[d.rarity].color } as CSSProperties}
              aria-hidden={i >= SAMPLE_DROPS.length || undefined}
            >
              <span className={styles.gem} aria-hidden />
              <span className={styles.weapon}>{d.weapon}</span>
              <span className={styles.skin}>{d.skin}</span>
              <span className={`${styles.price} tabular`}>{usd.format(d.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
