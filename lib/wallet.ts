// The player's balance, shared by everything that shows or changes it: the
// header's wallet and the games. It starts from PLAYER.balance on the
// server and, the first time, in the browser, and moves as the player bets
// and wins. Sample money, kept in the browser between pages and visits,
// until the wallet is wired to the server.

import { PLAYER } from "./home";
import { createStore } from "./store";

const KEY = "csgoneo.balance";

function load(): number {
  try {
    const saved = localStorage.getItem(KEY);
    const n = Number(saved);
    if (saved !== null && Number.isFinite(n) && n >= 0) return n;
  } catch {}
  return PLAYER.balance;
}

const store = createStore<number>(PLAYER.balance, load);

export const walletBalance = () => store.get();

/** What the server rendered with, so the first client render agrees. */
export const walletStart = () => PLAYER.balance;

export const subscribeWallet = store.subscribe;

export function setBalance(amount: number) {
  const next = Math.round(amount);
  store.set(next);
  try {
    localStorage.setItem(KEY, String(next));
  } catch {}
}

export const addToBalance = (amount: number) => setBalance(walletBalance() + amount);
