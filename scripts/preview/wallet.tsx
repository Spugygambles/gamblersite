// The header's Wallet button in the preview: the snapshot's header is plain
// HTML, so this gives its button the window the site has, opened over the
// page rather than going to the wallet's page.
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/mines/Dialogs";
import WalletPanel from "@/components/wallet/WalletPanel";

// the button asks for the window with this event
const OPEN = "csgoneo:wallet";

function Wallet() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN, show);
    return () => window.removeEventListener(OPEN, show);
  }, []);
  return open ? (
    <Modal title="Wallet" wide onClose={() => setOpen(false)}>
      <WalletPanel />
    </Modal>
  ) : null;
}

export function mountWallet() {
  const buttons = document.querySelectorAll<HTMLAnchorElement>("[data-wallet-open]");
  if (!buttons.length) return;
  const host = document.createElement("div");
  document.body.appendChild(host);
  createRoot(host).render(<Wallet />);
  buttons.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.dispatchEvent(new Event(OPEN));
    }),
  );
}
