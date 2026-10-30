"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/mines/Dialogs";
import WalletPanel, { StepTitle, WALLET_START, type WalletView } from "./WalletPanel";

/**
 * The header's Wallet: a link to the wallet's own page that, with scripts
 * running, opens the wallet as a window over the page instead. The window
 * is headed Wallet, or by the step once a coin is picked.
 */
export default function WalletButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<WalletView>(WALLET_START);
  const close = () => {
    setOpen(false);
    setView(WALLET_START);
  };
  return (
    <>
      <Link
        href="/deposit"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        data-wallet-open
      >
        Wallet
      </Link>
      {open && (
        <Modal title={view.coin ? <StepTitle view={view} onView={setView} /> : "Wallet"} label="Wallet" wide onClose={close}>
          <WalletPanel view={view} onView={setView} />
        </Modal>
      )}
    </>
  );
}
