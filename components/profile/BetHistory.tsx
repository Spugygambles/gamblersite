"use client";

import { useState } from "react";
import { GAMES } from "@/lib/home";
import { MY_BETS } from "@/lib/profile";
import { ChevronIcon } from "@/components/home/icons";
import BetTable, { BetRow } from "./BetTable";
import styles from "./Profile.module.css";

const TABS = [["all", "All"], ...GAMES.map((g) => [g.slug, g.title])];
const PER_PAGE = 8;

/**
 * Every bet the player's made lately, newest first, eight to a page, with
 * a tab for each game. The rows are all there; the ones on other pages or
 * for other games are hidden, so a click doesn't wait on anything. The
 * pager shows three page numbers at a time.
 */
export default function BetHistory() {
  const [game, setGame] = useState("all");
  const [page, setPage] = useState(1);

  const list = MY_BETS.filter((b) => game === "all" || b.game === game);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = new Set(list.slice((page - 1) * PER_PAGE, page * PER_PAGE));
  const start = Math.max(1, Math.min(page - 1, pages - 2));

  return (
    <div data-bet-history>
      <h2 className={styles.title}>Bet history</h2>
      <div className={styles.gameTabs} role="group" aria-label="Game">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={styles.gameTab}
            aria-pressed={game === id}
            onClick={() => {
              setGame(id);
              setPage(1);
            }}
            data-bet-game={id}
          >
            {label}
          </button>
        ))}
      </div>

      <BetTable>
        {MY_BETS.map((b) => (
          <BetRow key={b.id} bet={b} hidden={!shown.has(b)} />
        ))}
        <tbody hidden={list.length > 0} data-bet-empty>
          <tr>
            <td colSpan={5} className={styles.none}>
              No bets on this game yet.
            </td>
          </tr>
        </tbody>
      </BetTable>

      <nav className={styles.pager} aria-label="Pages">
        <button type="button" className={styles.pageButton} aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} data-page="prev">
          <ChevronIcon direction="left" />
        </button>
        {[start, start + 1, start + 2].map((n, i) => (
          <button
            key={i}
            type="button"
            className={styles.pageButton}
            aria-current={n === page ? "page" : undefined}
            hidden={n > pages}
            onClick={() => setPage(n)}
            data-page-slot
          >
            {n}
          </button>
        ))}
        <span className={styles.pageGap} hidden={start + 2 >= pages} data-page-gap>
          …
        </span>
        <button type="button" className={styles.pageButton} aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)} data-page="next">
          <ChevronIcon direction="right" />
        </button>
      </nav>
    </div>
  );
}
