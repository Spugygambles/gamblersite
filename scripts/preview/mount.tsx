// What every bundled page of the preview does: mount the game where the
// snapshot has it, and keep the plain-HTML header's balance in step with
// the wallet (which holds in the browser between pages).
import { createRoot } from "react-dom/client";
import type { ReactElement } from "react";
import { subscribeWallet, walletBalance } from "@/lib/wallet";
import { mountWallet } from "./wallet";

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
// the built pages, by the site's paths (see build.py LINKS)
const PAGES: Record<string, string> = {
  "/": "index.html",
  "/mines": "mines.html",
  "/upgrader": "upgrader.html",
  "/cases": "cases.html",
  "/case-battles": "case-battles.html",
  "/crash": "crash.html",
  "/limbo": "limbo.html",
  "/keno": "keno.html",
  "/coinflip": "coinflip.html",
  "/blackjack": "blackjack.html",
  "/account": "account.html",
  "/deposit": "deposit.html",
  "/terms": "terms.html",
};

export function mount(selector: string, element: ReactElement) {
  // files the games fetch themselves (sounds) are beside the page here; see lib/assets.ts
  document.documentElement.setAttribute("data-preview", "");
  // the header's Wallet opens its window over the page
  mountWallet();
  const root = document.querySelector(selector);
  if (root) {
    root.replaceChildren();
    createRoot(root).render(element);
    root.setAttribute("data-mounted", "");
    // React writes an href or src only when it changes, so a rewritten one
    // holds: links point at the built pages, the site's own images at the
    // copies beside them. The case items' pictures, too many to publish one
    // file each, come packed in items.js (see build.py) where a page has it.
    const packed = (globalThis as { __itemPictures?: Record<string, string> }).__itemPictures;
    const relink = () => {
      root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
        const to = PAGES[a.getAttribute("href") ?? ""];
        if (to) a.setAttribute("href", to);
      });
      root.querySelectorAll<HTMLImageElement>('img[src^="/"]').forEach((img) => {
        const src = img.getAttribute("src") ?? "";
        const item = /^\/items\/([a-z0-9-]+)\.webp$/.exec(src);
        img.setAttribute("src", (item && packed?.[item[1]]) || src.slice(1));
      });
    };
    relink();
    new MutationObserver(relink).observe(root, { childList: true, subtree: true });
  }
  const header = () => {
    document.querySelectorAll("[data-wallet-balance]").forEach((el) => (el.textContent = money.format(walletBalance())));
  };
  header();
  subscribeWallet(header);
}
