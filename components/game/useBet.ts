"use client";

import { useState, useSyncExternalStore } from "react";
import { robux } from "@/lib/money";
import { subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";

export const parseBet = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? robux(n) : 0;
};

/**
 * The bet every game takes, in whole Robux: its text as typed, the number
 * it parses to, whether it's more than the balance, and the ½, 2× and Max
 * buttons' work. `min` is the smallest bet.
 */
export function useBet(start = "5000", min = 50) {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const [betText, setBetText] = useState(start);
  const bet = parseBet(betText);
  const short = bet > balance;
  const set = (n: number) => setBetText(String(Math.min(Math.max(min, robux(n)), Math.max(min, balance))));
  return {
    balance,
    bet,
    betText,
    short,
    /** The bet can be placed: it's something, and it's covered. */
    ok: bet >= min && !short,
    setBetText,
    set,
    half: () => set(bet / 2),
    double: () => set(bet * 2),
    max: () => set(balance),
    /** Tidies the text once the player's done typing. */
    blur: () => bet > 0 && setBetText(String(bet)),
    type: (text: string) => setBetText(text.replace(/\D/g, "")),
  };
}
