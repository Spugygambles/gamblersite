"use client";

import { useState } from "react";
import { CoinIcon } from "@/components/home/icons";
import { ROBUX_PER_USD, robuxFor, usdFor } from "@/lib/robux";
import styles from "./Deposit.module.css";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// dollars with the cents only when there are some: 10, 12.5, 0.07
const dollars = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/**
 * The deposit page, for now the conversion alone: Robux on one side, dollars
 * on the other, either one typed and the other following. Taking money
 * waits on accounts.
 */
export default function Deposit() {
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
    <div className={styles.wrap} data-deposit>
      <h1 className={styles.title}>Deposit</h1>

      <section className={styles.panel} aria-labelledby="conversion-title">
        <h2 id="conversion-title" className={styles.panelTitle}>
          Currency Conversion
        </h2>
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

      <p className={styles.note}>Deposits open once accounts are live. The balance you play with for now is sample Robux.</p>
    </div>
  );
}
