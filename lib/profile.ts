// The signed-in player's account, for the profile window. Like PLAYER in
// home.ts, it's sample data until accounts are wired to the server.

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
};

/** One of the player's bets, with what proves it was fair. */
export type MyBet = {
  id: number;
  /** The game's slug, from GAMES. */
  game: string;
  wager: number;
  /** What the wager was multiplied by: under 1 is a loss. */
  multiplier: number;
  /** When, in UTC, so the server and the browser write it the same. */
  when: string;
  /** Provably fair: the hash of the server's seed, the player's seed, the
      bet's number under that pair, and the roll they made. */
  hash: string;
  client: string;
  nonce: number;
  roll: string;
};

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

// The games the player's tried, the ones they play most first. They've
// never played blackjack, so its tab has nothing in it.
const PLAYED = [
  ["mines", 6],
  ["cases", 5],
  ["crash", 4],
  ["case-battles", 3],
  ["upgrader", 3],
  ["coinflip", 2],
  ["limbo", 2],
  ["keno", 1],
] as const;
const WAGERS = [0.1, 0.25, 0.5, 1, 2, 2.5, 5, 10, 12.5, 20, 25, 50, 100];
const stamp = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

/** The player's last 64 bets, newest first. */
export const MY_BETS: MyBet[] = (() => {
  const random = seeded(31);
  const hex = (n: number) => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(random() * 16)]).join("");
  const total = PLAYED.reduce((sum, [, weight]) => sum + weight, 0);
  const client = hex(16);
  let time = Date.UTC(2026, 9, 28, 22, 41);
  let id = 1539204118;
  return Array.from({ length: 64 }, (_, i) => {
    let pick = random() * total;
    const game = PLAYED.find(([, weight]) => (pick -= weight) < 0)?.[0] ?? "mines";
    const r = random();
    let multiplier = r < 0.45 ? 0 : r < 0.84 ? 1.1 + random() * 1.9 : r < 0.96 ? 3 + random() * 17 : 20 + random() * 80;
    // a case always pays out something, if less than it cost
    if (multiplier === 0 && game === "cases") multiplier = 0.05 + random() * 0.85;
    const bet = {
      id,
      game,
      wager: WAGERS[Math.floor(random() * WAGERS.length)],
      multiplier: Math.round(multiplier * 100) / 100,
      when: stamp.format(time),
      hash: hex(64),
      client,
      nonce: 1872 - i,
      roll: random().toFixed(8),
    };
    time -= (4 + Math.floor(random() * (i < 16 ? 40 : 1400))) * 60000;
    id -= 40 + Math.floor(random() * 4000);
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

/** How long a player can exclude themselves for. */
export const EXCLUSIONS = ["24 hours", "7 days", "30 days", "6 months", "Permanently"];
