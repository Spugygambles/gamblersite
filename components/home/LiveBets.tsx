"use client";

import { useEffect, useState } from "react";
import { makeBet, SAMPLE_BETS, type Bet } from "@/lib/home";
import { avatarOf } from "./avatar";
import { CoinIcon, GAME_ICONS } from "./icons";
import styles from "./LiveBets.module.css";

const NAMES: Record<string, string> = {
  "case-battles": "Case Battles",
  cases: "Cases",
  upgrader: "Upgrader",
  mines: "Mines",
  keno: "Keno",
  crash: "Crash",
  limbo: "Limbo",
  coinflip: "Coinflip",
  blackjack: "Blackjack",
};

const TABS = [
  { id: "all", label: "All bets", shows: () => true },
  { id: "big", label: "Big wins", shows: (b: Bet) => b.multiplier >= 1 && b.wager * b.multiplier >= 100 },
  { id: "lucky", label: "Lucky wins", shows: (b: Bet) => b.multiplier >= 10 },
] as const;

const ROWS = [10, 15, 20];

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * The latest bets across the site, newest on top, a new one every couple of
 * seconds. Tabs pick out the big wins (winning $100 or more) and the lucky
 * ones (10x or more). Sample bets until it's wired to the server.
 */
export default function LiveBets() {
  const [bets, setBets] = useState<Bet[]>(SAMPLE_BETS);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [rows, setRows] = useState(10);

  useEffect(() => {
    let id = SAMPLE_BETS[0].id;
    const t = setInterval(() => {
      id += 1;
      const bet = makeBet(id, Math.random);
      setBets((b) => [bet, ...b].slice(0, 200));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const shows = TABS.find((t) => t.id === tab)!.shows;
  const shown = bets.filter(shows).slice(0, rows);

  return (
    <div className={styles.bets}>
      <div className={styles.bar}>
        <div className={styles.tabs} role="tablist" aria-label="Which bets">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={styles.tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className={styles.rows}>
          <span className="sr-only">Rows to show</span>
          <select value={rows} onChange={(e) => setRows(Number(e.target.value))}>
            {ROWS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Game</th>
            <th scope="col" className={styles.player}>
              Player
            </th>
            <th scope="col" className={styles.num}>
              Wager
            </th>
            <th scope="col" className={`${styles.num} ${styles.mult}`}>
              Multiplier
            </th>
            <th scope="col" className={styles.num}>
              Payout
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((b) => {
            const Icon = GAME_ICONS[b.game];
            const payout = b.wager * b.multiplier;
            const won = b.multiplier >= 1;
            return (
              <tr key={b.id} className={b.id > SAMPLE_BETS[0].id ? styles.fresh : undefined}>
                <td>
                  <span className={styles.game}>
                    <Icon />
                    <span className={styles.label}>{NAMES[b.game]}</span>
                  </span>
                </td>
                <td className={styles.player}>
                  <span className={styles.who}>
                    <span
                      className={styles.avatar}
                      style={b.player ? { background: avatarOf(b.player) } : undefined}
                      aria-hidden
                    >
                      {b.player ? b.player[0].toUpperCase() : "?"}
                    </span>
                    <span className={`${styles.label} ${b.player ? "" : styles.hidden}`}>{b.player ?? "Hidden"}</span>
                  </span>
                </td>
                <td className={`${styles.num} tabular`}>
                  <span className={styles.amount}>
                    <CoinIcon />
                    {money.format(b.wager)}
                  </span>
                </td>
                <td className={`${styles.num} ${styles.mult}`}>
                  <span className={`${styles.chip} tabular ${won ? styles.up : ""}`}>{b.multiplier.toFixed(2)}×</span>
                </td>
                <td className={`${styles.num} tabular ${won ? styles.win : styles.loss}`}>
                  <span className={styles.amount}>
                    <CoinIcon />
                    {money.format(payout)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
