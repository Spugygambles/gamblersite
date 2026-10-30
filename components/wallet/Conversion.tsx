"use client";

import { useId, useState } from "react";
import { CoinIcon } from "@/components/home/icons";
import { robuxFor, usdFor } from "@/lib/robux";
import type { Coin } from "./coins";
import styles from "./Conversion.module.css";

type Field = "robux" | "usd" | "coin";

// dollars with the cents only when there are some: 10, 12.5, 0.07
const dollars = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));
// a coin amount to seven places, trailing noughts dropped: 0.1043282, 10
const coins = (n: number) => String(Number(n.toFixed(7)));
const parse = (v: string) => (v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * The amounts, three ways: whichever one was typed last is kept as typed
 * and the other two follow from it at the coin's rate, so a price that
 * comes in later moves them too. `dollars` is what it all comes to.
 */
export function useConversion(rate: number) {
  const [typed, setTyped] = useState<{ field: Field; text: string }>({ field: "usd", text: "10" });
  const n = parse(typed.text);
  const dollarsNow = n === null ? null : typed.field === "usd" ? n : typed.field === "robux" ? usdFor(n) : n * rate;
  const text = (field: Field, make: (d: number) => string) => (typed.field === field ? typed.text : dollarsNow === null ? "" : make(dollarsNow));
  return {
    dollars: dollarsNow,
    robux: dollarsNow === null ? 0 : Math.round(robuxFor(dollarsNow)),
    texts: {
      robux: text("robux", (d) => String(Math.round(robuxFor(d)))),
      usd: text("usd", dollars),
      coin: text("coin", (d) => coins(d / rate)),
    },
    type: (field: Field, value: string) => setTyped({ field, text: value }),
  };
}

/** Robux one side, dollars the other, and the coin after that: type in any one and the others follow. */
export default function Conversion({ coin, title, conversion }: { coin: Coin; title: string; conversion: ReturnType<typeof useConversion> }) {
  const id = useId();
  const Mark = coin.icon;
  const { texts, type } = conversion;
  return (
    <section className={styles.panel} aria-labelledby={id}>
      <h3 id={id} className={styles.title}>
        {title}
      </h3>
      <div className={styles.conversion}>
        <label className={styles.box}>
          <CoinIcon className={styles.boxIcon} />
          <input className={`${styles.amount} tabular`} inputMode="numeric" aria-label="Robux" value={texts.robux} onChange={(e) => type("robux", e.target.value)} data-robux />
        </label>
        <span className={styles.equals} aria-hidden>
          =
        </span>
        <label className={styles.box}>
          <span className={styles.dollar} aria-hidden>
            $
          </span>
          <input className={`${styles.amount} tabular`} inputMode="decimal" aria-label="US dollars" value={texts.usd} onChange={(e) => type("usd", e.target.value)} data-usd />
        </label>
        <span className={styles.equals} aria-hidden>
          =
        </span>
        <label className={styles.box}>
          <span className={styles.boxTile} style={{ background: coin.color }} aria-hidden>
            <Mark />
          </span>
          <input className={`${styles.amount} tabular`} inputMode="decimal" aria-label={coin.ticker} value={texts.coin} onChange={(e) => type("coin", e.target.value)} data-coin-amount />
        </label>
      </div>
    </section>
  );
}
