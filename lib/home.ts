// Content for the homepage. Everything below is sample data: swap PLAYER for
// the signed-in user once auth is wired up, and the cases, chat and bets for
// the real ones from the backend.

export type GameInfo = {
  slug: string;
  title: string;
  /** How big the art sits on its tile (% of the tile's width) and where its
      middle is (% down the art area). */
  art: { size: number; y: number };
  /** Players in the game right now. */
  tag?: "Hot" | "New";
};

export const GAMES: GameInfo[] = [
  { slug: "case-battles", title: "Battles", art: { size: 62, y: 50 } },
  { slug: "cases", title: "Cases", art: { size: 56, y: 50 } },
  { slug: "upgrader", title: "Upgrader", art: { size: 62, y: 50 }, tag: "New" },
  { slug: "mines", title: "Mines", art: { size: 56, y: 50 } },
  { slug: "keno", title: "Keno", art: { size: 56, y: 50 } },
  { slug: "crash", title: "Crash", art: { size: 64, y: 48 }, tag: "Hot" },
  { slug: "limbo", title: "Limbo", art: { size: 68, y: 50 } },
  { slug: "coinflip", title: "Coinflip", art: { size: 66, y: 50 } },
  { slug: "blackjack", title: "Blackjack", art: { size: 62, y: 50 } },
];

export const PLAYER = {
  name: "Spugy",
  /** Sample money to try the games with. */
  balance: 1000,
  /** Gems to start with: earned as the player wagers (lib/gems.ts), spent in the Gem Vault. */
  gems: 12,
  level: 70,
  /** Progress through the current level, 0-100. */
  levelProgress: 54,
};

export const ONLINE_START = 517;

export type ChatMessage =
  | { name: string; level: number; text: string; mine?: boolean }
  /** A note from the site: rain that fell, or an event. */
  | { system: "rain" | "event"; text: string };

// What chat shows before anyone types, until it's wired to the chat server.
export const CHAT_SAMPLE: ChatMessage[] = [
  { name: "vexx", level: 22, text: "morning chat" },
  { name: "hydra", level: 83, text: "morning" },
  { name: "Obi", level: 88, text: "anyone tried the new year case yet" },
  { name: "tiko", level: 14, text: "pulled a glock water elemental from it" },
  { name: "hydra", level: 83, text: "music box case is so clean" },
  { name: "rook", level: 56, text: "keno with 4 picks is underrated" },
  { name: "kyro", level: 42, text: "gg on that karambit" },
  { name: "mira", level: 47, text: "just hit 12x on limbo" },
  { name: "MaxiM", level: 18, text: "anyone up for a 2v2? toxic case" },
  { name: "nova", level: 63, text: "crash went 31x and i cashed at 2 lol" },
  { name: "sk8r", level: 29, text: "classic" },
  { system: "rain", text: "$186.20 of rain was shared by 41 players" },
  { name: "jaxx", level: 12, text: "first day here, what should i open" },
  { name: "Pele", level: 20, text: "mines on 3 bombs is my comfort game" },
  { name: "deadeye", level: 9, text: "how do i get the daily case" },
  { name: "Spl1t", level: 77, text: "rewards, it's in the menu on the left" },
  { name: "frostbyte", level: 25, text: "upgrader hit three in a row for me" },
  { name: "Wren", level: 38, text: "when does the race reset" },
  { name: "lunar", level: 51, text: "monday. it's close this week" },
  { name: "MaxiM", level: 18, text: "2v2 is up in battles, join" },
  { name: "zenn", level: 34, text: "swept a whole row in mines lol" },
  { name: "dusk", level: 70, text: "got one in keno, 3 left to find" },
  { system: "event", text: "Gems are live: every 10.00 you wager earns one. Spend them in the Gem Vault." },
  { name: "ghostR", level: 31, text: "who else is waiting on the rain" },
  { name: "Obi", level: 88, text: "happy thanksgiving all, good luck" },
];

/** The pot in chat's rain, split between the players who join before it falls. */
export const RAIN_POT = 248.6;

export type CaseInfo = {
  slug: string;
  name: string;
  /** A small square picture of the case, for lists. */
  thumb: string;
};

export const CASES: CaseInfo[] = [
  { slug: "toxic", name: "Toxic", thumb: "/cases/toxic-case-thumb.png" },
  { slug: "new-year", name: "New Year", thumb: "/cases/new-year-case-thumb.png" },
  { slug: "music-box", name: "Music Box", thumb: "/cases/music-box-case-thumb.png" },
];

export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug)!;

// ---- Live bets ------------------------------------------------------------

export type Bet = {
  id: number;
  /** The game's slug, from GAMES. */
  game: string;
  /** Null for a player who hides their name. */
  player: string | null;
  wager: number;
  /** What the wager was multiplied by: 0 for a loss. */
  multiplier: number;
};

export const BET_PLAYERS = [
  "kyro", "MaxiM", "nova", "deadeye", "Spl1t", "frostbyte", "lunar", "zenn", "Obi", "vexx",
  "tiko", "rook", "ghostR", "mira", "jaxx", "Pele", "sk8r", "dusk", "Wren", "hydra",
];

const WAGERS = [0.25, 0.5, 1, 2, 2.5, 5, 10, 12.5, 20, 25, 50, 100, 250];

/**
 * A bet, from a source of random numbers between 0 and 1: about four in ten
 * lose, most wins are small, and a few are big. A case always pays out
 * something, so a losing case is worth less than it cost rather than
 * nothing.
 */
export function makeBet(id: number, random: () => number): Bet {
  const game = GAMES[Math.floor(random() * GAMES.length)].slug;
  const player = random() < 0.15 ? null : BET_PLAYERS[Math.floor(random() * BET_PLAYERS.length)];
  const wager = WAGERS[Math.floor(random() * WAGERS.length)];
  const r = random();
  let multiplier = r < 0.42 ? 0 : r < 0.82 ? 1.1 + random() * 1.9 : r < 0.95 ? 3 + random() * 17 : 20 + random() * 280;
  if (multiplier === 0 && game === "cases") multiplier = 0.1 + random() * 0.8;
  return { id, game, player, wager, multiplier: Math.round(multiplier * 100) / 100 };
}

// Small deterministic random numbers, so the sample bets are the same on the
// server and the client.
function seeded(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/** The latest bets, newest first, until the table is wired to the server. */
export const SAMPLE_BETS: Bet[] = (() => {
  const random = seeded(7);
  return Array.from({ length: 120 }, (_, i) => makeBet(120 - i, random));
})();

export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const count = new Intl.NumberFormat("en-US");
