// Content for the homepage. Everything below is sample data: swap PLAYER for
// the signed-in user once auth is wired up, and the cases, prices, odds and
// drops for the real ones from the backend.

export type GameTheme = {
  /** The game's colour: its card's glow and tint. */
  tint: string;
  /** A lighter edge, brightened on hover. */
  rim: string;
};

export type GameInfo = {
  slug: string;
  title: string;
  subtitle: string;
  theme: GameTheme;
  /** How big the art sits on its card (% of the card's width) and where its
      middle is (% down the art area). */
  art: { size: number; y: number };
};

export const GAMES: GameInfo[] = [
  { slug: "case-battles", title: "Battles", subtitle: "VS players", theme: { tint: "#5e2630", rim: "#b04a5c" }, art: { size: 62, y: 50 } },
  { slug: "cases", title: "Cases", subtitle: "Unbox skins", theme: { tint: "#52417d", rim: "#9479dd" }, art: { size: 56, y: 50 } },
  { slug: "upgrader", title: "Upgrader", subtitle: "Level up your skins", theme: { tint: "#273a7a", rim: "#5872d8" }, art: { size: 62, y: 52 } },
  { slug: "mines", title: "Mines", subtitle: "Find the gems", theme: { tint: "#5b442c", rim: "#b38a5c" }, art: { size: 54, y: 52 } },
  { slug: "keno", title: "Keno", subtitle: "Lucky numbers", theme: { tint: "#4e2462", rim: "#9d52c2" }, art: { size: 54, y: 52 } },
  { slug: "crash", title: "Crash", subtitle: "Cash out in time", theme: { tint: "#1f2e6f", rim: "#4f68d8" }, art: { size: 64, y: 50 } },
  { slug: "limbo", title: "Limbo", subtitle: "Aim higher", theme: { tint: "#245242", rim: "#4aa682" }, art: { size: 68, y: 52 } },
  { slug: "coinflip", title: "Coinflip", subtitle: "Heads or tails", theme: { tint: "#604633", rim: "#bb8a5e" }, art: { size: 66, y: 52 } },
  { slug: "blackjack", title: "Blackjack", subtitle: "Hit or stand", theme: { tint: "#57263f", rim: "#ad4f7c" }, art: { size: 62, y: 52 } },
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
