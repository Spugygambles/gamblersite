// Content for the homepage. Swap PLAYER for the signed-in user once auth is
// wired up.

export type GameTheme = {
  /** The tile's colour at the bottom; the top fades to near-black. */
  tint: string;
  /** A lighter edge for hover, and the subtitle tint. */
  rim: string;
  sub: string;
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
  { slug: "case-battles", title: "Battles", subtitle: "VS Players", theme: { tint: "#5e2630", rim: "#b04a5c", sub: "#ecd0d3" }, art: { size: 62, y: 36 } },
  { slug: "cases", title: "Cases", subtitle: "Unbox Skins", theme: { tint: "#52417d", rim: "#9479dd", sub: "#ddd2f5" }, art: { size: 56, y: 36 } },
  { slug: "upgrader", title: "Upgrade", subtitle: "Your Skins", theme: { tint: "#273a7a", rim: "#5872d8", sub: "#d3dbfa" }, art: { size: 52, y: 34.5 } },
  { slug: "mines", title: "Mines", subtitle: "Find The Gems", theme: { tint: "#5b442c", rim: "#b38a5c", sub: "#f0e1cd" }, art: { size: 45, y: 33 } },
  { slug: "keno", title: "Keno", subtitle: "Lucky Numbers", theme: { tint: "#4e2462", rim: "#9d52c2", sub: "#ecd2f5" }, art: { size: 45, y: 33 } },
  { slug: "crash", title: "Crash", subtitle: "To The Moon", theme: { tint: "#1f2e6f", rim: "#4f68d8", sub: "#d0d9fb" }, art: { size: 60, y: 36 } },
  { slug: "limbo", title: "Limbo", subtitle: "Aim Higher", theme: { tint: "#245242", rim: "#4aa682", sub: "#cdeee0" }, art: { size: 56, y: 35 } },
  { slug: "coinflip", title: "Coinflip", subtitle: "Heads Or Tails", theme: { tint: "#604633", rim: "#bb8a5e", sub: "#f2e0cc" }, art: { size: 56, y: 35 } },
  { slug: "blackjack", title: "Blackjack", subtitle: "Hit Or Stand", theme: { tint: "#57263f", rim: "#ad4f7c", sub: "#f2d2e1" }, art: { size: 52, y: 34 } },
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
