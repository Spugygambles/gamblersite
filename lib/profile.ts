// The signed-in player's account, for the profile window. Like PLAYER, it's
// sample data until accounts are wired to the server.

import { makeBet, PLAYER, type Bet } from "./home";

export const PROFILE = {
  id: 302114,
  memberSince: "March 14, 2025",
  email: "sp••••@example.com",
  emailVerified: false,
  /** Experience through the current level, and what the next one takes. */
  xp: 12420,
  xpNext: 23000,
  deposited: 4850,
  withdrawn: 3120.4,
  wagered: 28416.75,
  bets: 3482,
  wins: 1657,
  biggestWin: { game: "crash", wager: 25, multiplier: 49.6 },
  favouriteGame: "crash",
};

/** What the player is up or down: what came out, and what's in the wallet,
    less what went in. */
export const NET = PROFILE.withdrawn + PLAYER.balance - PROFILE.deposited;

export type MyBet = Bet & { when: string };

// Small deterministic random numbers, so the server and the browser draw
// the same bets.
function seeded(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const ago = (minutes: number) =>
  minutes < 60 ? `${minutes} min ago` : minutes < 1440 ? `${Math.floor(minutes / 60)} h ago` : `${Math.floor(minutes / 1440)} d ago`;

/** The player's last 25 bets, newest first. */
export const MY_BETS: MyBet[] = (() => {
  const random = seeded(31);
  let minutes = 2;
  return Array.from({ length: 25 }, (_, i) => {
    const bet = { ...makeBet(25 - i, random), player: PLAYER.name, when: ago(minutes) };
    minutes += 3 + Math.floor(random() * (i < 10 ? 14 : 220));
    return bet;
  });
})();

export type Transaction = {
  kind: "deposit" | "withdrawal";
  method: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
};

export const TRANSACTIONS: Transaction[] = [
  { kind: "withdrawal", method: "Bitcoin", amount: 420.4, status: "Pending", date: "Oct 27, 2026" },
  { kind: "deposit", method: "CS2 skins", amount: 250, status: "Completed", date: "Oct 25, 2026" },
  { kind: "deposit", method: "Litecoin", amount: 100, status: "Completed", date: "Oct 19, 2026" },
  { kind: "withdrawal", method: "CS2 skins", amount: 1240, status: "Completed", date: "Oct 11, 2026" },
  { kind: "deposit", method: "Visa card", amount: 500, status: "Failed", date: "Oct 11, 2026" },
  { kind: "deposit", method: "Ethereum", amount: 1000, status: "Completed", date: "Sep 30, 2026" },
  { kind: "withdrawal", method: "Litecoin", amount: 860, status: "Completed", date: "Sep 18, 2026" },
  { kind: "deposit", method: "CS2 skins", amount: 600, status: "Completed", date: "Sep 2, 2026" },
];

export const SESSIONS = [
  { device: "Chrome on Windows", place: "Chicago, US", when: "Active now", current: true },
  { device: "Safari on iPhone", place: "Chicago, US", when: "2 days ago", current: false },
  { device: "Firefox on macOS", place: "Denver, US", when: "Oct 12, 2026", current: false },
];

/** How long a player can lock their account for. */
export const BREAKS = ["24 hours", "7 days", "30 days", "6 months"];
