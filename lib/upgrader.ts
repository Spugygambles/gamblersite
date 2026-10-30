import { KEEP } from "./house";
import { hmacSha256, utf8 } from "./sha256";

/*
 * Upgrader maths. The player puts coins on the line for skins worth more;
 * the chance of getting them is the fair odds (bet over target) less the
 * house's share. A spin is one roll, 0 up to 1, drawn from the seeds and
 * nonce; the wheel shows it as an angle, and the win zones as stretches of
 * the ring.
 */

export const MAX_ITEMS = 4;
/** The target has to be worth more than the bet, and no more than this many times it. */
export const MAX_MULT = 100;
export const MIN_BET = 50;

export const multiplierOf = (bet: number, target: number) => (bet > 0 ? target / bet : 0);

/** The chance of winning `target` on `bet`: the fair odds, less the house's share. */
export const chanceOf = (bet: number, target: number) => (bet > 0 && target > bet ? Math.min((KEEP * bet) / target, KEEP) : 0);

/** The roll for a spin, 0 up to 1: the first four bytes of HMAC-SHA256(serverSeed, clientSeed:nonce:0). */
export function rollOf(serverSeed: string, clientSeed: string, nonce: number): number {
  const h = hmacSha256(utf8(serverSeed), utf8(`${clientSeed}:${nonce}:0`));
  return (((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0) / 2 ** 32;
}

/**
 * The winning stretches of the wheel, as fractions of a turn clockwise
 * from the top: `zones` equal arcs spread evenly round the ring, together
 * covering `chance` of it.
 */
export function zonesOf(chance: number, zones: number): [number, number][] {
  const each = chance / zones;
  return Array.from({ length: zones }, (_, k) => [k / zones, k / zones + each]);
}

export const isWin = (roll: number, chance: number, zones: number) => zonesOf(chance, zones).some(([a, b]) => roll >= a && roll < b);

export const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const percent = (chance: number) => `${(chance * 100).toFixed(2)}%`;
export const times = (mult: number) => `${(mult >= 100 ? mult.toFixed(0) : mult.toFixed(2))}×`;
