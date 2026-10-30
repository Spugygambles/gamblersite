"use client";

import { useId, useState } from "react";
import { CoinIcon } from "@/components/home/icons";
import { ROBUX_PER_USD, robuxFor, usdFor } from "@/lib/robux";
import type { Coin } from "./coins";
import styles from "./Conversion.module.css";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// dollars with the cents only when there are some: 10, 12.5, 0.07
const dollars = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));
// a coin amount to seven places, trailing noughts dropped: 0.1043282, 10
const coins = (n: number) => String(Number(n.toFixed(7)));

/**
 * Robux one side, dollars the other, and the coin's amount after that when
 * a coin is given: type in any one and the others follow.
 */
export default function Conversion({ coin }: { coin?: Coin }) {
  const id = useId();
  const [robux, setRobux] = useState("5000");
  const [usd, setUsd] = useState("10");
  const [amount, setAmount] = useState(coin ? coins(10 / coin.usd) : "");

  // the three follow one another from the dollars
  const settle = (dollarsNow: number | null, from: "robux" | "usd" | "coin") => {
    if (dollarsNow === null) {
      if (from !== "robux") setRobux("");
      if (from !== "usd") setUsd("");
      if (from !== "coin") setAmount("");
      return;
    }
    if (from !== "robux") setRobux(String(Math.round(robuxFor(dollarsNow))));
    if (from !== "usd") setUsd(dollars(dollarsNow));
    if (coin && from !== "coin") setAmount(coins(dollarsNow / coin.usd));
  };
  const parse = (v: string) => (v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
  const typeRobux = (v: string) => {
    setRobux(v);
    const n = parse(v);
    settle(n === null ? null : usdFor(n), "robux");
  };
  const typeUsd = (v: string) => {
    setUsd(v);
    settle(parse(v), "usd");
  };
  const typeCoin = (v: string) => {
    setAmount(v);
    const n = parse(v);
    settle(n === null || !coin ? null : n * coin.usd, "coin");
  };
  const Mark = coin?.icon;

  return (
    <section className={styles.panel} aria-labelledby={id}>
      <h3 id={id} className={styles.title}>
        Currency Conversion
      </h3>
      <div className={styles.conversion} data-three={coin ? "" : undefined}>
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
        {coin && Mark && (
          <>
            <span className={styles.equals} aria-hidden>
              =
            </span>
            <label className={styles.box}>
              <span className={styles.boxTile} style={{ background: coin.color }} aria-hidden>
                <Mark />
              </span>
              <input className={`${styles.amount} tabular`} inputMode="decimal" aria-label={coin.ticker} value={amount} onChange={(e) => typeCoin(e.target.value)} data-coin-amount />
            </label>
          </>
        )}
      </div>
      {!coin && <p className={styles.line}>{whole.format(ROBUX_PER_USD)} Robux to the dollar.</p>}
    </section>
  );
}
