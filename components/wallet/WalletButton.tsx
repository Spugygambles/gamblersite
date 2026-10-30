"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/mines/Dialogs";
import WalletPanel from "./WalletPanel";

/**
 * The header's Wallet: a link to the wallet's own page that, with scripts
 * running, opens the wallet as a window over the page instead.
 */
export default function WalletButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
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
        <Modal title="Wallet" wide onClose={() => setOpen(false)}>
          <WalletPanel />
        </Modal>
      )}
    </>
  );
}
