"use client";

import { useSyncExternalStore } from "react";
import { subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** The balance in the header, kept up to date as the player bets and
    wins. data-wallet-balance lets the preview, which has no React in its
    header, write the number in too. */
export default function WalletBalance() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  return (
    <span className="tabular" data-wallet-balance>
      {money.format(balance)}
    </span>
  );
}
