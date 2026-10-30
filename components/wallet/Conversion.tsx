"use client";

import { useId, useState } from "react";
import { CoinIcon } from "@/components/home/icons";
import { ROBUX_PER_USD, robuxFor, usdFor } from "@/lib/robux";
import styles from "./Conversion.module.css";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// dollars with the cents only when there are some: 10, 12.5, 0.07
const dollars = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/** Robux one side, dollars the other: either one typed, and the other follows. */
export default function Conversion() {
  const id = useId();
  const [robux, setRobux] = useState("5000");
  const [usd, setUsd] = useState("10");

  const typeRobux = (v: string) => {
    setRobux(v);
    const n = Number(v);
    setUsd(v.trim() && Number.isFinite(n) ? dollars(usdFor(n)) : "");
  };
  const typeUsd = (v: string) => {
    setUsd(v);
    const n = Number(v);
    setRobux(v.trim() && Number.isFinite(n) ? String(Math.round(robuxFor(n))) : "");
  };

  return (
    <section className={styles.panel} aria-labelledby={id}>
      <h3 id={id} className={styles.title}>
        Currency Conversion
      </h3>
      <div className={styles.conversion}>
        <label className={styles.box}>
          <CoinIcon className={styles.boxIcon} />
          <input className={`${styles.amount} tabular`} inputMode="numeric" aria-label="Robux" value={robux} onChange={(e) => typeRobux(e.target.value)} data-robux />
        </label>
        <span className={styles.equals} aria-hidden>
          =
        </span>
        <label className={styles.box}>
          <span className={styles.dollar} aria-hidden>
            $
          </span>
          <input className={`${styles.amount} tabular`} inputMode="decimal" aria-label="US dollars" value={usd} onChange={(e) => typeUsd(e.target.value)} data-usd />
        </label>
      </div>
      <p className={styles.line}>{whole.format(ROBUX_PER_USD)} Robux to the dollar.</p>
    </section>
  );
}
