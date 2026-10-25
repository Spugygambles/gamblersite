// Content for the homepage. Swap PLAYER for the signed-in user once auth is
// wired up.

export type GameTheme = {
  /** The tile's colour at the bottom; the top fades to near-black. */
  tint: string;
  /** A lighter edge, brightened on hover. */
  rim: string;
};

export type GameInfo = {
  slug: string;
  title: string;
  subtitle: string;
  theme: GameTheme;
  /** How big the art sits in the tile (% of its width) and where its middle
      is (% down the tile). */
  art: { size: number; y: number };
};

export const GAMES: GameInfo[] = [
  { slug: "case-battles", title: "Battles", subtitle: "VS Players", theme: { tint: "#5e2630", rim: "#b04a5c" }, art: { size: 62, y: 36 } },
  { slug: "cases", title: "Cases", subtitle: "Unbox Skins", theme: { tint: "#52417d", rim: "#9479dd" }, art: { size: 56, y: 36 } },
  { slug: "upgrader", title: "Upgrade", subtitle: "Your Skins", theme: { tint: "#273a7a", rim: "#5872d8" }, art: { size: 52, y: 34.5 } },
  { slug: "mines", title: "Mines", subtitle: "Find The Gems", theme: { tint: "#5b442c", rim: "#b38a5c" }, art: { size: 45, y: 33 } },
  { slug: "keno", title: "Keno", subtitle: "Lucky Numbers", theme: { tint: "#4e2462", rim: "#9d52c2" }, art: { size: 45, y: 33 } },
  { slug: "crash", title: "Crash", subtitle: "To The Moon", theme: { tint: "#1f2e6f", rim: "#4f68d8" }, art: { size: 56, y: 32 } },
  { slug: "limbo", title: "Limbo", subtitle: "Aim Higher", theme: { tint: "#245242", rim: "#4aa682" }, art: { size: 56, y: 35 } },
  { slug: "coinflip", title: "Coinflip", subtitle: "Heads Or Tails", theme: { tint: "#604633", rim: "#bb8a5e" }, art: { size: 56, y: 35 } },
  { slug: "blackjack", title: "Blackjack", subtitle: "Hit Or Stand", theme: { tint: "#57263f", rim: "#ad4f7c" }, art: { size: 52, y: 34 } },
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
