import { useSyncExternalStore } from "react";
import { createStore } from "./store";

/*
 * The player's record across every game: how much was wagered, how many
 * games were won and lost, and the biggest single win. The games report
 * each result as it settles; the account page shows the totals. Kept in
 * the browser until the site has accounts.
 */

export type Stats = { wagered: number; games: number; won: number; lost: number; biggest: number };
const KEY = "csgoneo.stats";
const START: Stats = { wagered: 0, games: 0, won: 0, lost: 0, biggest: 0 };
const cents = (n: number) => Math.round(n);

function load(): Stats {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const s = JSON.parse(saved);
      if (typeof s.wagered === "number") return { ...START, ...s };
    }
  } catch {}
  return START;
}

function save(next: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export const statsStore = createStore<Stats>(START, load);
export const useStats = () => useSyncExternalStore(statsStore.subscribe, statsStore.get, statsStore.server);

/** A stake placed, on any game. */
export function addWagered(coins: number) {
  const s = statsStore.get();
  statsStore.set(save({ ...s, wagered: cents(s.wagered + coins) }));
}

/** A game settled: what it made or lost, net of the stake. A push counts as a game, neither won nor lost. */
export function recordOutcome(net: number) {
  const s = statsStore.get();
  const n = cents(net);
  statsStore.set(save({ ...s, games: s.games + 1, won: s.won + (n > 0 ? 1 : 0), lost: s.lost + (n < 0 ? 1 : 0), biggest: Math.max(s.biggest, n) }));
}
