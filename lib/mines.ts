// Mines: the maths and the provably fair draw. The board has `tiles`
// squares with `mines` under them; each safe tile the player turns over
// multiplies the bet, and they can cash out at any point. Hit a mine and the
// bet's gone.

import { hmacSha256, sha256, toHex, utf8 } from "./sha256";

/** The boards on offer, as how many tiles each has. */
export const GRIDS = [25, 36, 49, 64] as const;
export type Grid = (typeof GRIDS)[number];

/** How much of a fair payout the player keeps: a 1% house edge. */
export const KEEP = 0.99;

export const MIN_BET = 0.01;

/** At least one tile has to be safe. */
export const maxMines = (tiles: number) => tiles - 1;

/** What `picks` safe tiles in a row pay, as a multiplier of the bet. The
    odds of surviving them are C(tiles - mines, picks) / C(tiles, picks); the
    payout is the house's share of the inverse, to the cent. */
export function multiplier(tiles: number, mines: number, picks: number): number {
  if (picks <= 0) return 1;
  if (picks > tiles - mines) return 0;
  let odds = 1;
  for (let i = 0; i < picks; i++) odds *= (tiles - mines - i) / (tiles - i);
  // a hair added first, so 1.125 lands on 1.13 and not on 1.12 through
  // floating point
  return Math.round((KEEP / odds) * 100 + 1e-7) / 100;
}

export const payoutOf = (bet: number, mult: number) => Math.round(bet * mult * 100) / 100;

/** The hash of a server seed, shown before a game so the seed can be
    checked against it after. */
export const seedHash = (serverSeed: string) => toHex(sha256(utf8(serverSeed)));

// Numbers in [0, 1) drawn from HMAC-SHA256(serverSeed, clientSeed:nonce:round),
// four bytes each, eight a round, as many rounds as it takes.
function draws(serverSeed: string, clientSeed: string, nonce: number, count: number): number[] {
  const out: number[] = [];
  for (let round = 0; out.length < count; round++) {
    const h = hmacSha256(utf8(serverSeed), utf8(`${clientSeed}:${nonce}:${round}`));
    for (let i = 0; i + 4 <= h.length && out.length < count; i += 4) {
      out.push((((h[i] << 24) | (h[i + 1] << 16) | (h[i + 2] << 8) | h[i + 3]) >>> 0) / 2 ** 32);
    }
  }
  return out;
}

/** Where the mines are for a game: the tiles shuffled by the draws
    (Fisher-Yates, from the end), the first `mines` of them, in order. The
    same seeds and nonce always give the same mines, which is what lets a
    player check a game once the server seed is revealed. */
export function minePositions(serverSeed: string, clientSeed: string, nonce: number, tiles: number, mines: number): number[] {
  const r = draws(serverSeed, clientSeed, nonce, tiles - 1);
  const order = Array.from({ length: tiles }, (_, i) => i);
  for (let i = tiles - 1; i > 0; i--) {
    const j = Math.floor(r[tiles - 1 - i] * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, mines).sort((a, b) => a - b);
}

export const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A multiplier for show: two decimals and a ×. */
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
/** A multiplier for display: "1.13×", "2,277.00×", "1.83B×". */
export const times = (mult: number) => `${mult >= 1e6 ? compact.format(mult) : money.format(mult)}×`;
