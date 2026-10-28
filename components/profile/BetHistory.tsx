"use client";

import { useState } from "react";
import { MY_BETS } from "@/lib/profile";
import BetTable from "./BetTable";
import styles from "./Profile.module.css";

const FILTERS = [
  ["all", "All"],
  ["wins", "Wins"],
  ["losses", "Losses"],
] as const;

/** Every bet the player's made lately, newest first; tabs show just the
    wins or just the losses. */
export default function BetHistory() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const wins = MY_BETS.filter((b) => b.multiplier >= 1).length;

  return (
    <>
      <h2 className={styles.title}>Bet history</h2>
      <div className={styles.sectionHead}>
        <p className={styles.lead}>
          Your last {MY_BETS.length} bets: {wins} won, {MY_BETS.length - wins} lost.
        </p>
        <div className={styles.filters} role="group" aria-label="Show">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" className={styles.filter} aria-pressed={filter === id} onClick={() => setFilter(id)} data-bet-filter={id}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.betList} data-filter={filter}>
        <BetTable bets={MY_BETS} />
      </div>
    </>
  );
}
