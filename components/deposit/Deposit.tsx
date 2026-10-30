"use client";

import { useState } from "react";
import WalletPanel, { StepTitle, WALLET_START, type WalletView } from "@/components/wallet/WalletPanel";
import styles from "./Deposit.module.css";

/** The wallet as a page of its own, for a link straight to it. */
export default function Deposit() {
  const [view, setView] = useState<WalletView>(WALLET_START);
  return (
    <div className={styles.wrap} data-deposit>
      <h1 className={styles.title}>{view.coin ? <StepTitle view={view} onView={setView} /> : "Wallet"}</h1>
      <div className={styles.card}>
        <WalletPanel view={view} onView={setView} />
      </div>
    </div>
  );
}
