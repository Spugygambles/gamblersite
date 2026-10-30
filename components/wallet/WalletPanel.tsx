"use client";

import { useState } from "react";
import { kit } from "@/components/game/kit";
import { ChevronIcon } from "@/components/home/icons";
import Conversion from "./Conversion";
import { COINS, type Coin } from "./coins";
import styles from "./Wallet.module.css";

export type WalletTab = "deposit" | "withdraw" | "promo";
const TABS: [WalletTab, string][] = [
  ["deposit", "Deposit"],
  ["withdraw", "Withdraw"],
  ["promo", "Promo Code"],
];

/**
 * The wallet: Deposit, Withdraw and Promo Code. The money tabs list the
 * ways in and out (crypto, for now) and, once one is picked, the
 * conversion to Robux. Moving money waits on accounts, and each step
 * says so.
 */
export default function WalletPanel({ start = "deposit" }: { start?: WalletTab }) {
  const [tab, setTab] = useState<WalletTab>(start);
  const [coin, setCoin] = useState<Coin | null>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const moving = tab === "deposit" ? "Deposit" : "Withdraw";

  const pick = (t: WalletTab) => {
    setTab(t);
    setCoin(null);
    setNote("");
  };

  return (
    <div className={styles.panel} data-wallet-panel data-tab={tab}>
      <div className={styles.tabs} role="tablist" aria-label="Wallet">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" className={styles.tab} aria-selected={tab === id} onClick={() => pick(id)} data-wallet-tab={id}>
            {label}
          </button>
        ))}
      </div>
      <hr className={styles.rule} />

      {tab === "promo" ? (
        <section className={styles.promo} aria-label="Promo code">
          <label className={styles.promoLabel} htmlFor="wallet-promo">
            Promo code
          </label>
          <div className={styles.promoRow}>
            <input id="wallet-promo" className={kit.input} value={code} placeholder="Enter a code" autoComplete="off" spellCheck={false} onChange={(e) => setCode(e.target.value.toUpperCase())} data-promo-code />
            <button type="button" className={kit.primary} disabled={!code.trim()} onClick={() => setNote(`${code.trim()} is noted. Promo codes are redeemed once accounts are live.`)} data-promo-redeem>
              Redeem
            </button>
          </div>
          <p className={styles.note} aria-live="polite" data-wallet-note>
            {note}
          </p>
        </section>
      ) : coin ? (
        <section className={styles.step} aria-label={`${moving} with ${coin.name}`} data-wallet-step={coin.id}>
          <button type="button" className={styles.back} onClick={() => setCoin(null)} data-wallet-back>
            <ChevronIcon direction="left" />
            All methods
          </button>
          <h3 className={styles.stepTitle}>
            <CoinTile coin={coin} />
            {moving} with {coin.name} <small>({coin.ticker})</small>
          </h3>
          <Conversion />
          <p className={styles.note}>
            {tab === "deposit"
              ? `Send ${coin.ticker} and the Robux land on your balance at that rate. Deposits open once accounts are live.`
              : `Your Robux go out as ${coin.ticker} at that rate. Withdrawals open once accounts are live.`}
          </p>
        </section>
      ) : (
        <section aria-labelledby="wallet-crypto">
          <h3 id="wallet-crypto" className={styles.group}>
            Crypto
          </h3>
          <div className={styles.coins}>
            {COINS.map((c) => (
              <button key={c.id} type="button" className={styles.coin} onClick={() => setCoin(c)} data-wallet-coin={c.id}>
                <CoinTile coin={c} />
                <span className={styles.coinName}>
                  {c.name} <small>({c.ticker})</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CoinTile({ coin }: { coin: Coin }) {
  const Icon = coin.icon;
  return (
    <span className={styles.coinIcon} style={{ background: coin.color }} aria-hidden>
      <Icon />
    </span>
  );
}
