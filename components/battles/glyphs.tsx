import type { SVGProps } from "react";
import type { Gamemode } from "@/lib/battles";

type P = SVGProps<SVGSVGElement>;

// line icons share one stroke
const Line = ({ children, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    {children}
  </svg>
);

/** Two seats on one side. */
export const TeamIcon = (p: P) => (
  <Line strokeWidth="2.6" {...p}>
    <path d="M10 15.5H7.5a3.5 3.5 0 0 1 0-7H10M14 8.5h2.5a3.5 3.5 0 0 1 0 7H14M8.5 12h7" />
  </Line>
);

/** The winner's crown. */
export const CrownIcon = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden {...p}>
    <path d="M2 12.5h12v1.5H2zM2 11 1 4l3.6 2.6L8 2l3.4 4.6L15 4l-1 7z" fill="currentColor" />
  </svg>
);

export const ArrowLeftIcon = (p: P) => (
  <Line {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Line>
);

/** Presets: four tiles. */
export const TilesIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
);

/** Randomize: sparkles. */
export const SparklesIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8zM18 14l.9 2.6 2.6.9-2.6.9L18 21l-.9-2.6-2.6-.9 2.6-.9zM18.5 2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm2 0h6V8a3 3 0 0 0-6 0z" />
  </svg>
);

export const BoltIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

/** Borrow: a coin with a dollar. */
export const BorrowIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm.9 4h-1.8v1.4c-1.7.3-2.8 1.4-2.8 2.9 0 1.6 1 2.4 3 2.9 1.4.4 1.8.7 1.8 1.3 0 .6-.6 1-1.5 1-1 0-1.7-.5-1.8-1.3H8c.1 1.6 1.2 2.7 3.1 3V18h1.8v-1.4c1.8-.3 2.9-1.4 2.9-3 0-1.7-1.1-2.5-3.1-3-1.3-.3-1.7-.6-1.7-1.2s.5-1 1.3-1c.9 0 1.4.5 1.5 1.2h1.9c-.1-1.5-1.1-2.6-2.8-2.9z" />
  </svg>
);

/** Fund money: a percent badge. */
export const FundIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 1.8l2.4 2.1 3.2-.4 1 3 2.9 1.4-.8 3.1 1.6 2.8-2.3 2.2.1 3.2-3.1.8-1.7 2.7-3-1.2-3 1.2-1.7-2.7-3.1-.8.1-3.2L1.9 13.8l1.6-2.8-.8-3.1 2.9-1.4 1-3 3.2.4zM9 8.5A1.5 1.5 0 1 0 9 11.5 1.5 1.5 0 1 0 9 8.5zm6 4A1.5 1.5 0 1 0 15 15.5 1.5 1.5 0 1 0 15 12.5zM14.6 8 8 16h1.6L16 8z" />
  </svg>
);

/** A seat: one person. */
export const SeatIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z" />
  </svg>
);

// ---- The gamemodes' icons, each in its own colour ---------------------------------------------

export const GAMEMODE_COLORS: Record<Exclude<Gamemode, "standard">, string> = {
  crazy: "#ef5a6f",
  terminal: "#e8d44c",
  group: "#7fd36b",
  coinflip: "#6fb5f0",
  jackpot: "#f08ad8",
  reaper: "#8f8ff0",
};

/** Crazy: a grinning face. */
const Crazy = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM8.2 9.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm7.6 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM7 14c.8 2.5 2.7 4 5 4s4.2-1.5 5-4H7z" />
    <path d="M6 5.5 8.5 8M18 5.5 15.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Terminal: a radiation mark. */
const Terminal = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm0 7.7a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM12 4.6a7.4 7.4 0 0 0-5.1 2.1l3.3 3.3c.5-.4 1.1-.7 1.8-.7s1.3.3 1.8.7l3.3-3.3A7.4 7.4 0 0 0 12 4.6zm-7.4 7.4c0 2 .8 3.8 2.1 5.1l3.3-3.3a2.9 2.9 0 0 1-.7-1.8zm12.1 5.1a7.4 7.4 0 0 0 2.1-5.1h-4.7c0 .7-.3 1.3-.7 1.8z" />
  </svg>
);

/** Group: three people. */
const Group = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <circle cx="12" cy="7" r="3.2" />
    <circle cx="5" cy="9" r="2.4" />
    <circle cx="19" cy="9" r="2.4" />
    <path d="M6.5 20c0-3.6 2.4-6 5.5-6s5.5 2.4 5.5 6zM1 18.5c0-2.6 1.6-4.4 4-4.4.7 0 1.3.1 1.8.4-1 1.1-1.6 2.5-1.7 4zm22 0h-4.1c-.1-1.5-.7-2.9-1.7-4 .5-.3 1.1-.4 1.8-.4 2.4 0 4 1.8 4 4.4z" />
  </svg>
);

/** Coinflip: a coin on its edge, turning. */
const Coinflip = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm.9 2.6v1a2.4 2.4 0 0 1 2 2.2h-1.7c0-.5-.5-.9-1.2-.9s-1.1.3-1.1.8c0 .4.4.7 1.4.9 1.8.4 2.7 1 2.7 2.4 0 1.1-.8 2-2.1 2.2v1h-1.8v-1A2.5 2.5 0 0 1 9 14.3h1.7c0 .6.6 1 1.3 1s1.2-.3 1.2-.8-.5-.7-1.6-1C10 13.2 9.2 12.5 9.2 11.2c0-1.1.8-1.9 1.9-2.2V8z" />
    <path d="M2 12h2M20 12h2M12 1v2M12 21v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Jackpot: a gem. */
const Jackpot = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M7 3h10l4.5 6L12 21 2.5 9zm1.1 2L5.6 8.4h3.1L10.2 5zm7.8 0h-2.1l1.5 3.4h3.1zM12 5.3 10.6 8.4h2.8zM5.3 10.4 10.7 17l-2-6.6zm5.1 0 1.6 7.1 1.6-7.1zm4.9 0-2 6.6 5.4-6.6z" />
  </svg>
);

/** Reaper: a scythe. */
const Reaper = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M20 4c-5.5-1-11 .8-14.5 4.5M20 4c-1 4.2-4.3 6.8-8.5 7.2M20 4 6.5 21" />
  </svg>
);

export const GAMEMODE_ICONS: Record<Exclude<Gamemode, "standard">, (p: P) => React.JSX.Element> = {
  crazy: Crazy,
  terminal: Terminal,
  group: Group,
  coinflip: Coinflip,
  jackpot: Jackpot,
  reaper: Reaper,
};
