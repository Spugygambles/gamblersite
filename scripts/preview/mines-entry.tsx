// The preview's copy of Mines: the game itself, bundled by esbuild with
// React and mounted where the page's snapshot has it, so the preview plays
// the real game. The header's balance is written in by hand, since the
// preview's header is plain HTML.
import { createRoot } from "react-dom/client";
import MinesGame from "@/components/mines/MinesGame";
import { subscribeWallet, walletBalance } from "@/lib/wallet";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const root = document.querySelector("[data-mines-root]");
if (root) {
  root.replaceChildren();
  createRoot(root).render(<MinesGame />);
}
subscribeWallet(() => {
  document.querySelectorAll("[data-wallet-balance]").forEach((el) => (el.textContent = money.format(walletBalance())));
});
