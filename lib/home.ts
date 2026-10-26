// Content for the homepage. Everything below is sample data: swap PLAYER for
// the signed-in user once auth is wired up, and the cases, prices, odds and
// drops for the real ones from the backend.

export type GameInfo = {
  slug: string;
  title: string;
  /** How big the art sits on its tile (% of the tile's width) and where its
      middle is (% down the art area). */
  art: { size: number; y: number };
  /** Players in the game right now. */
  playing: number;
  tag?: "Hot" | "New";
};

export const GAMES: GameInfo[] = [
  { slug: "case-battles", title: "Battles", art: { size: 62, y: 50 }, playing: 342 },
  { slug: "cases", title: "Cases", art: { size: 56, y: 50 }, playing: 1284 },
  { slug: "upgrader", title: "Upgrader", art: { size: 62, y: 50 }, playing: 214, tag: "New" },
  { slug: "mines", title: "Mines", art: { size: 56, y: 50 }, playing: 509 },
  { slug: "keno", title: "Keno", art: { size: 56, y: 50 }, playing: 77 },
  { slug: "crash", title: "Crash", art: { size: 64, y: 48 }, playing: 1032, tag: "Hot" },
  { slug: "limbo", title: "Limbo", art: { size: 68, y: 50 }, playing: 168 },
  { slug: "coinflip", title: "Coinflip", art: { size: 66, y: 50 }, playing: 251 },
  { slug: "blackjack", title: "Blackjack", art: { size: 62, y: 50 }, playing: 133 },
];

export const PLAYER = {
  name: "Spugy",
  balance: 0,
  gems: 5,
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
  { name: "Obi", level: 88, text: "anyone tried the new year case yet" },
  { name: "tiko", level: 14, text: "pulled a glock water elemental from it" },
  { name: "rook", level: 56, text: "keno with 4 picks is underrated" },
  { name: "kyro", level: 42, text: "gg on that karambit" },
  { name: "MaxiM", level: 18, text: "anyone up for a 2v2? toxic case" },
  { name: "nova", level: 63, text: "crash went 31x and i cashed at 2 lol" },
  { system: "rain", text: "$186.20 of rain was shared by 41 players" },
  { name: "deadeye", level: 9, text: "how do i get the daily case" },
  { name: "Spl1t", level: 77, text: "rewards, it's in the menu on the left" },
  { name: "frostbyte", level: 25, text: "upgrader hit three in a row for me" },
  { name: "lunar", level: 51, text: "race is close this week" },
  { name: "MaxiM", level: 18, text: "2v2 is up in battles, join" },
  { name: "zenn", level: 34, text: "found a turkey in mines lol" },
  { system: "event", text: "Happy Thanksgiving! The Turkey Hunt is on until Monday." },
  { name: "Obi", level: 88, text: "happy thanksgiving all, good luck" },
];

/** The pot in chat's rain, split between the players who join before it falls. */
export const RAIN_POT = 248.6;

// CS2 rarity colours, as the game shows them.
export type Rarity = "milspec" | "restricted" | "classified" | "covert" | "gold";

export const RARITY: Record<Rarity, { name: string; color: string }> = {
  milspec: { name: "Mil-Spec", color: "#4b69ff" },
  restricted: { name: "Restricted", color: "#8847ff" },
  classified: { name: "Classified", color: "#d32ce6" },
  covert: { name: "Covert", color: "#eb4b4b" },
  gold: { name: "Rare Special", color: "#e4ae39" },
};

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

export type Drop = { weapon: string; skin: string; price: number; rarity: Rarity; from: string };

export const SAMPLE_DROPS: Drop[] = [
  { weapon: "AK-47", skin: "Redline", price: 42.1, rarity: "classified", from: "toxic" },
  { weapon: "AWP", skin: "Asiimov", price: 96.3, rarity: "covert", from: "music-box" },
  { weapon: "Glock-18", skin: "Water Elemental", price: 9.85, rarity: "classified", from: "new-year" },
  { weapon: "★ Karambit", skin: "Doppler", price: 1240, rarity: "gold", from: "toxic" },
  { weapon: "AK-47", skin: "Elite Build", price: 3.2, rarity: "milspec", from: "new-year" },
  { weapon: "M4A1-S", skin: "Printstream", price: 212.4, rarity: "covert", from: "music-box" },
  { weapon: "AK-47", skin: "Slate", price: 4.2, rarity: "restricted", from: "new-year" },
  { weapon: "USP-S", skin: "Kill Confirmed", price: 58.7, rarity: "covert", from: "toxic" },
  { weapon: "M4A4", skin: "Desolate Space", price: 14.8, rarity: "classified", from: "music-box" },
  { weapon: "MP9", skin: "Starlight Protector", price: 36.2, rarity: "covert", from: "toxic" },
  { weapon: "UMP-45", skin: "Primal Saber", price: 2.9, rarity: "classified", from: "new-year" },
  { weapon: "Desert Eagle", skin: "Printstream", price: 47.5, rarity: "covert", from: "music-box" },
];

export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const count = new Intl.NumberFormat("en-US");
