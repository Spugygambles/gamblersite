import Image from "next/image";
import type { CSSProperties } from "react";
import { caseBySlug, RARITY, SAMPLE_DROPS, usd } from "@/lib/home";
import styles from "./DropTicker.module.css";

// The latest unboxings, running past like a market ticker: each drop on a
// card lit in its rarity colour, with the case it came out of. The list is
// drawn twice so the loop has no seam; the copy is hidden from screen readers.
export default function DropTicker() {
  const drops = [...SAMPLE_DROPS, ...SAMPLE_DROPS];

  return (
    <section className={styles.ticker} aria-label="Live drops">
      <div className={styles.label}>
        <span className={styles.pulse} aria-hidden />
        Live drops
      </div>
      <div className={styles.viewport}>
        <ul className={styles.track}>
          {drops.map((d, i) => {
            const from = caseBySlug(d.from);
            return (
              <li
                key={i}
                className={styles.drop}
                style={{ "--rarity": RARITY[d.rarity].color } as CSSProperties}
                aria-hidden={i >= SAMPLE_DROPS.length || undefined}
              >
                <Image className={styles.thumb} src={from.thumb} alt="" width={160} height={160} unoptimized />
                <span className={styles.what}>
                  <span className={styles.weapon}>{d.weapon}</span>
                  <span className={styles.skin}>{d.skin}</span>
                </span>
                <span className={`${styles.price} tabular`}>{usd.format(d.price)}</span>
                <span className="sr-only">from the {from.name} case</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
