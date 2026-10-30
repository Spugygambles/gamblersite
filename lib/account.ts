import { useSyncExternalStore } from "react";
import { PLAYER } from "./home";
import { createStore } from "./store";

/*
 * The player's account details that they can change: the name they show,
 * their Steam trade URL, whether their profile is private, and which
 * sign-ins are connected. Sample values until the site has accounts; what
 * the player changes is kept in the browser. Logging out of the sample
 * account clears everything the browser kept, balance and gems included.
 */

export type Account = { name: string; tradeUrl: string; privateProfile: boolean; google: boolean; discord: boolean };
const KEY = "csgoneo.account";
const START: Account = { name: PLAYER.name, tradeUrl: "", privateProfile: false, google: false, discord: true };

function load(): Account {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return { ...START, ...JSON.parse(saved) };
  } catch {}
  return START;
}

export const accountStore = createStore<Account>(START, load);
export const useAccount = () => useSyncExternalStore(accountStore.subscribe, accountStore.get, accountStore.server);

export function saveAccount(changes: Partial<Account>) {
  const next = { ...accountStore.get(), ...changes };
  accountStore.set(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

/** Everything the browser keeps for the sample account. */
export const KEPT_KEYS = ["csgoneo.balance", "csgoneo.gems", "csgoneo.stats", "csgoneo.account"];

/** Logging out of the sample account: back to the starting balance, gems and name. */
export function resetSample() {
  try {
    KEPT_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
