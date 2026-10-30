"use client";

import { useState, type ReactNode } from "react";
import { GAMES } from "@/lib/home";
import type { MyBet } from "@/lib/profile";
import { CheckIcon, CoinIcon, CopyIcon, GAME_ICONS } from "@/components/home/icons";
import styles from "./Profile.module.css";

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const titleOf = (slug: string) => GAMES.find((g) => g.slug === slug)?.title ?? slug;

/** The player's bets as flat bars, like the live bets on the home page:
    the game, whether it won, the bet, what came back and when. */
export default function BetTable({ children }: { children: ReactNode }) {
  return (
    <table className={`${styles.table} ${styles.bets}`}>
      <thead>
        <tr>
          <th scope="col">Game</th>
          <th scope="col">Status</th>
          <th scope="col" className={styles.num}>
            Bet
          </th>
          <th scope="col" className={styles.num}>
            Won
          </th>
          <th scope="col" className={`${styles.num} ${styles.wide}`}>
            Time
          </th>
        </tr>
      </thead>
      {children}
    </table>
  );
}

/**
 * One bet: its row, and under it, once the row's clicked, what proves it
 * was fair, each value copied with a click. Rows that should be out of
 * sight (another game, another page) are passed hidden.
 */
export function BetRow({ bet, hidden }: { bet: MyBet; hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const Icon = GAME_ICONS[bet.game];
  const won = bet.multiplier >= 1;
  const proof = [
    ["Bet ID", String(bet.id)],
    ["Multiplier", `${bet.multiplier.toFixed(2)}×`],
    ["Seed hash", bet.hash],
    ["Client seed", bet.client],
    ["Nonce", String(bet.nonce)],
    ["Roll", bet.roll],
  ];

  const copy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? "" : c)), 1200);
  };

  return (
    <tbody className={styles.bet} hidden={hidden} data-bet data-game={bet.game} data-open={open}>
      {/* The row opens with a click anywhere on it; its button is there for
          the keyboard, and a click on that reaches the row too. */}
      <tr className={styles.betMain} onClick={() => setOpen(!open)} data-bet-main>
        <td>
          <button type="button" className={styles.game} aria-expanded={open} aria-controls={`bet-${bet.id}`} data-bet-toggle>
            <Icon />
            {titleOf(bet.game)}
          </button>
        </td>
        <td className={won ? styles.won : styles.lost}>{won ? "Won" : "Loss"}</td>
        <td className={styles.num}>
          <span className={`${styles.amount} tabular`}>
            <CoinIcon />
            {money.format(bet.wager)}
          </span>
        </td>
        <td className={styles.num}>
          <span className={`${styles.amount} ${won ? styles.win : styles.loss} tabular`}>
            <CoinIcon />
            {money.format(bet.wager * bet.multiplier)}
          </span>
        </td>
        <td className={`${styles.num} ${styles.wide} ${styles.when}`}>{bet.when}</td>
      </tr>
      <tr id={`bet-${bet.id}`} className={styles.proofRow} hidden={!open} data-bet-details>
        <td colSpan={5}>
          <dl className={styles.proof}>
            {proof.map(([label, value]) => (
              <div key={label} className={styles.proofItem}>
                <dt>{label}</dt>
                <dd>
                  <button
                    type="button"
                    className={styles.proofValue}
                    title={`Copy ${value}`}
                    onClick={() => copy(label, value)}
                    data-copy={value}
                    data-copied={copied === label}
                  >
                    <span>{value}</span>
                    <CopyIcon className={styles.copyIcon} />
                    <CheckIcon className={styles.copiedIcon} />
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </td>
      </tr>
    </tbody>
  );
}
