// Content for the homepage. Everything below is sample data: swap PLAYER for
// the signed-in user once auth is wired up, and the cases, prices, odds and
// drops for the real ones from the backend.

export type GameTheme = {
  /** The tile's colour: dark at the bottom, light toward the top. */
  tint: string;
  rim: string;
};

export type GameInfo = {
  slug: string;
  title: string;
  subtitle: string;
  theme: GameTheme;
  /** How big the art sits on its tile (% of the tile's width) and where its
      middle is (% down the art area). */
  art: { size: number; y: number };
  /** Players in the game right now. */
  playing: number;
  tag?: "Hot" | "New";
};

export const GAMES: GameInfo[] = [
  { slug: "case-battles", title: "Battles", subtitle: "VS players", theme: { tint: "#2b0f0c", rim: "#a2401f" }, art: { size: 62, y: 50 }, playing: 342 },
  { slug: "cases", title: "Cases", subtitle: "Unbox skins", theme: { tint: "#1b1240", rim: "#4a2fa0" }, art: { size: 56, y: 50 }, playing: 1284 },
  { slug: "upgrader", title: "Upgrader", subtitle: "Level up your skins", theme: { tint: "#2c1d6e", rim: "#6c4ce0" }, art: { size: 62, y: 50 }, playing: 214, tag: "New" },
  { slug: "mines", title: "Mines", subtitle: "Find the gems", theme: { tint: "#0d3d3f", rim: "#1f8a83" }, art: { size: 56, y: 50 }, playing: 509 },
  { slug: "keno", title: "Keno", subtitle: "Lucky numbers", theme: { tint: "#4a1559", rim: "#a33bc4" }, art: { size: 56, y: 50 }, playing: 77 },
  { slug: "crash", title: "Crash", subtitle: "Cash out in time", theme: { tint: "#172a6b", rim: "#3b63e0" }, art: { size: 64, y: 48 }, playing: 1032, tag: "Hot" },
  { slug: "limbo", title: "Limbo", subtitle: "Aim higher", theme: { tint: "#123f2c", rim: "#2f9a5f" }, art: { size: 68, y: 50 }, playing: 168 },
  { slug: "coinflip", title: "Coinflip", subtitle: "Heads or tails", theme: { tint: "#4a3112", rim: "#c0832c" }, art: { size: 66, y: 50 }, playing: 251 },
  { slug: "blackjack", title: "Blackjack", subtitle: "Hit or stand", theme: { tint: "#4a1424", rim: "#b0344f" }, art: { size: 62, y: 50 }, playing: 133 },
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
