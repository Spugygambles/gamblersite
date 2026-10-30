import { useSyncExternalStore } from "react";
import { PLAYER } from "./home";
import { addWagered } from "./stats";
import { createStore } from "./store";

/*
 * Gems: the site's second currency, earned by playing and spent in the
 * Gem Vault on cases. Every GEM_PER Robux wagered on any game earns one;
 * `toward` carries the remainder between bets. Kept in the browser until
 * the site has accounts, so what's earned holds between pages and visits.
 */

/** Robux wagered for one gem. */
export const GEM_PER = 5000;
const KEY = "csgoneo.gems";

export type GemState = {
  gems: number;
  /** Robux wagered since the last gem, toward the next. */
  toward: number;
  /** Cases claimed from the vault, by slug: how many of each. */
  claimed: Record<string, number>;
};

const START: GemState = { gems: PLAYER.gems, toward: 0, claimed: {} };

function load(): GemState {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const s = JSON.parse(saved);
      if (typeof s.gems === "number" && typeof s.toward === "number") return { gems: s.gems, toward: s.toward, claimed: s.claimed ?? {} };
    }
  } catch {}
  return START;
}

function save(next: GemState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export const gemStore = createStore<GemState>(START, load);
export const useGems = () => useSyncExternalStore(gemStore.subscribe, gemStore.get, gemStore.server);

/** Counts a wager toward gems and hands out the ones it earned. */
export function wagered(coins: number): number {
  addWagered(coins);
  const s = gemStore.get();
  const toward = Math.round(s.toward + coins);
  const earned = Math.floor(toward / GEM_PER);
  gemStore.set(save({ ...s, gems: s.gems + earned, toward: toward - earned * GEM_PER }));
  return earned;
}

/** Spends gems on a case from the vault; false if there aren't enough. */
export function claimCase(slug: string, price: number): boolean {
  const s = gemStore.get();
  if (s.gems < price) return false;
  gemStore.set(save({ ...s, gems: s.gems - price, claimed: { ...s.claimed, [slug]: (s.claimed[slug] ?? 0) + 1 } }));
  return true;
}

/** Uses up one claimed case of this kind, for opening; false if there's none. */
export function consumeClaimed(slug: string): boolean {
  const s = gemStore.get();
  const have = s.claimed[slug] ?? 0;
  if (have < 1) return false;
  const claimed = { ...s.claimed, [slug]: have - 1 };
  if (claimed[slug] === 0) delete claimed[slug];
  gemStore.set(save({ ...s, claimed }));
  return true;
}
