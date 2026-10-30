"use client";

import { useEffect, useRef, useState } from "react";
import { kit } from "@/components/game/kit";
import { ChevronIcon, CoinIcon } from "@/components/home/icons";
import { money } from "@/lib/money";
import { priceOf, startPrices, usePrices } from "@/lib/prices";
import { MIN_DEPOSIT_USD, MIN_WITHDRAW_USD } from "@/lib/robux";
import Conversion, { useConversion } from "./Conversion";
import { COINS, WarnIcon, type Coin } from "./coins";
import styles from "./Wallet.module.css";

export type WalletTab = "deposit" | "withdraw" | "promo";
/** Where the wallet is: which tab, and the coin picked on it, if one is. */
export type WalletView = { tab: WalletTab; coin: Coin | null };
export const WALLET_START: WalletView = { tab: "deposit", coin: null };

const TABS: [WalletTab, string][] = [
  ["deposit", "Deposit"],
  ["withdraw", "Withdraw"],
  ["promo", "Promo Code"],
];
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** The heading once a coin is picked: the way back, and what's being done. */
export function StepTitle({ view, onView }: { view: WalletView; onView: (v: WalletView) => void }) {
  return (
    <span className={styles.stepHead}>
      <button type="button" className={styles.backArrow} aria-label="All methods" onClick={() => onView({ ...view, coin: null })} data-wallet-back>
        <ChevronIcon direction="left" />
      </button>
      {view.tab === "deposit" ? "Crypto Deposit" : "Crypto Withdraw"}
    </span>
  );
}

/**
 * The wallet: Deposit, Withdraw and Promo Code. The money tabs list the
 * ways in and out (crypto, for now); a coin picked brings its own screen.
 * The coins' prices start coming when the wallet opens, every half hour.
 * Moving money waits on accounts, and says so.
 */
export default function WalletPanel({ view, onView }: { view: WalletView; onView: (v: WalletView) => void }) {
  const { tab, coin } = view;
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => startPrices(), []);

  const pick = (t: WalletTab) => {
    onView({ tab: t, coin: null });
    setNote("");
  };

  return (
    <div className={styles.panel} data-wallet-panel data-tab={tab}>
      {!coin && (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Wallet">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" role="tab" className={styles.tab} aria-selected={tab === id} onClick={() => pick(id)} data-wallet-tab={id}>
                {label}
              </button>
            ))}
          </div>
          <hr className={styles.rule} />
        </>
      )}

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
        <CoinStep key={`${tab}-${coin.id}`} view={view} coin={coin} onView={onView} />
      ) : (
        <section aria-labelledby="wallet-crypto">
          <h3 id="wallet-crypto" className={styles.group}>
            Crypto
          </h3>
          <div className={styles.coins}>
            {COINS.map((c) => (
              <button key={c.id} type="button" className={styles.coin} onClick={() => onView({ tab, coin: c })} data-wallet-coin={c.id}>
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

/**
 * One coin's screen. Depositing: the coin (and the others to swap to), its
 * rate, the network warning, the conversion and the button. Withdrawing:
 * the amount to take out, the address it goes to, and what it costs.
 */
function CoinStep({ view, coin, onView }: { view: WalletView; coin: Coin; onView: (v: WalletView) => void }) {
  const prices = usePrices();
  const rate = priceOf(prices, coin.id, coin.usd);
  const conversion = useConversion(rate);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const depositing = view.tab === "deposit";
  const doing = depositing ? "Deposit" : "Withdraw";
  const min = depositing ? MIN_DEPOSIT_USD : MIN_WITHDRAW_USD;
  const enough = conversion.dollars !== null && conversion.dollars >= min;
  const ready = depositing || (enough && address.trim().length > 0);
  return (
    <section className={styles.step} aria-label={`${doing} with ${coin.name}`} data-wallet-step={coin.id}>
      <CoinSelect coin={coin} onPick={(c) => onView({ ...view, coin: c })} />
      <p className={styles.rate} title={prices.at ? `Updated ${clock.format(new Date(prices.at))}; prices come every half hour` : "A placeholder rate until the price comes in"} data-coin-rate>
        1 {coin.ticker} ≈ {usd.format(rate)}
      </p>
      {depositing && (
        <>
          <p className={styles.warn} role="note">
            <WarnIcon />
            <span>
              Only send {coin.name} ({coin.ticker}) on {coin.network}. We cannot recover funds sent to the wrong network.
            </span>
          </p>
          <hr className={styles.rule} />
        </>
      )}
      <Conversion coin={coin} title={depositing ? "Currency Conversion" : "Enter Withdraw Amount"} conversion={conversion} />
      <p className={styles.small}>Min Amount: {usd.format(min)}</p>
      {!depositing && (
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="wallet-address">
            Your {coin.name} Address
          </label>
          <input id="wallet-address" className={kit.input} value={address} placeholder={`Enter your ${coin.name} address`} autoComplete="off" spellCheck={false} onChange={(e) => setAddress(e.target.value)} data-wallet-address />
          <p className={styles.small}>Always double check the address and the amount before sending. We cannot recover funds sent to the wrong address.</p>
        </div>
      )}
      {!depositing && <hr className={styles.rule} />}
      <div className={styles.actions}>
        <span className={styles.note} aria-live="polite" data-wallet-note>
          {note}
        </span>
        {!depositing && (
          <span className={styles.total}>
            <span className={styles.totalLabel}>Total Cost</span>
            <b className="tabular" data-wallet-total={conversion.robux}>
              <CoinIcon />
              {money.format(conversion.robux)}
            </b>
          </span>
        )}
        <button type="button" className={`${kit.primary} ${styles.go}`} disabled={!ready} onClick={() => setNote(`${doing}s open once accounts are live. Nothing was sent.`)} data-wallet-go>
          {doing}
        </button>
      </div>
    </section>
  );
}

/** The coin on its own row, with the others under a caret. */
function CoinSelect({ coin, onPick }: { coin: Coin; onPick: (c: Coin) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  return (
    <div ref={box} className={styles.select} data-coin-select>
      <button type="button" className={styles.selectButton} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-coin-toggle>
        <CoinTile coin={coin} small />
        <b>{coin.name}</b>
        <small>({coin.ticker})</small>
        <ChevronIcon className={styles.selectCaret} direction={open ? "left" : "down"} />
      </button>
      {open && (
        <ul className={styles.selectList} role="listbox" aria-label="Coin">
          {COINS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={c.id === coin.id}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
                data-coin-option={c.id}
              >
                <CoinTile coin={c} small />
                {c.name} <small>({c.ticker})</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CoinTile({ coin, small }: { coin: Coin; small?: boolean }) {
  const Icon = coin.icon;
  return (
    <span className={`${styles.coinIcon} ${small ? styles.coinIconSmall : ""}`} style={{ background: coin.color }} aria-hidden>
      <Icon />
    </span>
  );
}
