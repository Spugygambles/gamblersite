// The player's balance, shared by everything that shows or changes it: the
// header's wallet and the games. It starts from PLAYER.balance on the
// server and the client alike, and moves as the player bets and wins. Sample
// money until the wallet is wired to the server.

import { PLAYER } from "./home";

let balance = PLAYER.balance;
const listeners = new Set<() => void>();

export const walletBalance = () => balance;

/** What the server rendered with, so the first client render agrees. */
export const walletStart = () => PLAYER.balance;

export function subscribeWallet(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setBalance(amount: number) {
  balance = Math.round(amount * 100) / 100;
  listeners.forEach((l) => l());
}

export const addToBalance = (amount: number) => setBalance(balance + amount);
