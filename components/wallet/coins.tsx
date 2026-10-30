import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/**
 * A way in and out of the wallet: a coin, with its mark on a tile of its
 * colour, the network it moves on, and what one is worth in dollars (a
 * placeholder rate until a price feed is wired).
 */
export type Coin = { id: string; name: string; ticker: string; color: string; network: string; usd: number; icon: (p: P) => React.JSX.Element };

const EthIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.2 5.6 12.5l6.4 3.8 6.4-3.8z" />
    <path d="M12 17.6 5.6 13.8 12 22.4l6.4-8.6z" opacity="0.72" />
  </svg>
);

const LtcIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M9.6 3.5h3.4l-1.7 8.1 2.2-.8-.5 2.3-2.2.8L9.9 18h7.4l-.7 3H5.2l1.5-6.6-2 .8.5-2.3 2-.8z" />
  </svg>
);

const SolIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M6.6 15.7a.6.6 0 0 1 .4-.2h12.6a.3.3 0 0 1 .2.5l-2.5 2.5a.6.6 0 0 1-.4.2H4.3a.3.3 0 0 1-.2-.5zM6.6 5.5a.6.6 0 0 1 .4-.2h12.6a.3.3 0 0 1 .2.5l-2.5 2.5a.6.6 0 0 1-.4.2H4.3a.3.3 0 0 1-.2-.5zM17.3 10.6a.6.6 0 0 0-.4-.2H4.3a.3.3 0 0 0-.2.5l2.5 2.5a.6.6 0 0 0 .4.2h12.6a.3.3 0 0 0 .2-.5z" />
  </svg>
);

const UsdtIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M5.2 4.5h13.6v3h-5.1v2c3.4.2 5.9 1 5.9 2s-2.5 1.8-5.9 2V20h-3.4v-6.5c-3.4-.2-5.9-1-5.9-2s2.5-1.8 5.9-2v-2H5.2z" />
  </svg>
);

const UsdcIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...p}>
    <circle cx="12" cy="12" r="9.2" strokeWidth="2" strokeDasharray="20.5 8.4" transform="rotate(-30 12 12)" />
    <path d="M12 5.8v12.4M9.2 14.8c.5 1.1 1.6 1.8 2.9 1.8 1.7 0 2.9-.9 2.9-2.2 0-1.3-1-1.9-2.9-2.3-1.9-.4-2.9-1-2.9-2.3 0-1.3 1.2-2.1 2.9-2.1 1.2 0 2.2.5 2.7 1.4" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

/** The warning's triangle. */
export const WarnIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden {...p}>
    <path d="M12 3.5 2.5 20h19z" />
    <path d="M12 9.5v5M12 17.2v.3" />
  </svg>
);

export const COINS: Coin[] = [
  { id: "eth", name: "Ethereum", ticker: "ETH", color: "#5d7be6", network: "the Ethereum network", usd: 2247.29, icon: EthIcon },
  { id: "ltc", name: "Litecoin", ticker: "LTC", color: "#9aa5b5", network: "the Litecoin network", usd: 71.4, icon: LtcIcon },
  { id: "sol", name: "Solana", ticker: "SOL", color: "#1fc98a", network: "the Solana network", usd: 95.85, icon: SolIcon },
  { id: "usdt", name: "Tether", ticker: "USDT", color: "#26a17b", network: "Ethereum (ERC-20)", usd: 1, icon: UsdtIcon },
  { id: "usdc", name: "USD Coin", ticker: "USDC", color: "#2775ca", network: "Ethereum (ERC-20)", usd: 1, icon: UsdcIcon },
];
