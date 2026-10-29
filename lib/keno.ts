import { KEEP } from "./house";
import { pick } from "./fair";

/*
 * Keno maths. Forty numbers, ten drawn; the player picks one to ten and
 * is paid by how many of theirs come up, from a table for the risk they
 * chose. Each table's shape is set here (where it starts paying, how fast
 * it climbs, how big the top is) and then scaled so that, over the odds
 * of every hit count, it pays the house's share back: KEEP of the bet.
 */

export const NUMBERS = 40;
export const DRAWN = 10;
export const MIN_PICKS = 1;
export const MAX_PICKS = 10;
/** No table pays more than this on one hit count. */
export const CAP = 1000;

export const BOARD: readonly number[] = Array.from({ length: NUMBERS }, (_, i) => i + 1);

export const RISKS = ["classic", "low", "medium", "high"] as const;
export type Risk = (typeof RISKS)[number];
export const RISK_LABEL: Record<Risk, string> = { classic: "Classic", low: "Low", medium: "Medium", high: "High" };

/** n choose k, exactly enough in doubles for 40. */
function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let out = 1;
  for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i;
  return out;
}

/** The chance of exactly k hits with n numbers picked: C(n,k)·C(40-n,10-k) / C(40,10). */
export function hitChance(n: number, k: number): number {
  return (choose(n, k) * choose(NUMBERS - n, DRAWN - k)) / choose(NUMBERS, DRAWN);
}

// A table's shape: the first hit count that pays, the jump from that to
// the next, the growth each hit after, a boost on the full house, and (for
// the gentlest tables) something back on a miss when only a number or two
// is picked.
type Shape = { threshold: (n: number) => number; first: number; growth: number; boost: number; miss?: (n: number) => number };

const SHAPES: Record<Risk, Shape> = {
  classic: { threshold: (n) => Math.max(1, Math.ceil(n / 3.4)), first: 2.8, growth: 2.4, boost: 1.6, miss: (n) => (n === 1 ? 0.25 : 0) },
  low: { threshold: (n) => Math.max(1, Math.ceil(n / 4)), first: 2.2, growth: 2.0, boost: 2.4, miss: (n) => (n === 1 ? 0.45 : 0) },
  medium: { threshold: (n) => Math.max(1, Math.ceil(n / 3.4)), first: 3.2, growth: 3.0, boost: 2.0 },
  high: { threshold: (n) => Math.max(1, Math.ceil(n / 2)), first: 5, growth: 4.5, boost: 1.8 },
};

function shapeOf(risk: Risk, n: number): number[] {
  const { threshold, first, growth, boost, miss } = SHAPES[risk];
  const t = threshold(n);
  const s = Array.from({ length: n + 1 }, () => 0);
  if (miss) s[0] = miss(n);
  for (let k = t; k <= n; k++) s[k] = k === t ? 1 : first * Math.pow(growth, k - t - 1);
  s[n] *= boost;
  return s;
}

/** The shape scaled so the expected return is KEEP, no entry over CAP, to the cent. */
function normalize(shape: number[], n: number): number[] {
  const p = shape.map((_, k) => hitChance(n, k));
  const capped = new Set<number>();
  let m = [...shape];
  for (let round = 0; round < shape.length; round++) {
    const cappedReturn = [...capped].reduce((sum, k) => sum + p[k] * CAP, 0);
    const shapeReturn = shape.reduce((sum, v, k) => sum + (capped.has(k) ? 0 : p[k] * v), 0);
    const f = (KEEP - cappedReturn) / shapeReturn;
    m = shape.map((v, k) => (capped.has(k) ? CAP : v * f));
    const over = m.map((v, k) => (!capped.has(k) && v > CAP ? k : -1)).filter((k) => k >= 0);
    if (!over.length) break;
    over.forEach((k) => capped.add(k));
  }
  return m.map((v) => Math.round(v * 100) / 100);
}

/** TABLES[risk][picks][hits]: what a hit count pays, as a multiplier of the bet. */
export const TABLES: Record<Risk, number[][]> = Object.fromEntries(
  RISKS.map((risk) => [risk, [[], ...Array.from({ length: MAX_PICKS }, (_, i) => normalize(shapeOf(risk, i + 1), i + 1))]]),
) as Record<Risk, number[][]>;

export const multiplier = (risk: Risk, picks: number, hits: number) => TABLES[risk][picks]?.[hits] ?? 0;
export const maxMultiplier = (risk: Risk, picks: number) => (picks >= MIN_PICKS ? Math.max(...TABLES[risk][picks]) : 0);

/** What a table pays back over the odds, as a share of the bet: KEEP, give or take the rounding. */
export const expectedReturn = (risk: Risk, picks: number) => TABLES[risk][picks].reduce((sum, m, k) => sum + hitChance(picks, k) * m, 0);

/** The ten numbers drawn for a game, in the order they come up. */
export const drawNumbers = (serverSeed: string, clientSeed: string, nonce: number) => pick(BOARD, DRAWN, serverSeed, clientSeed, nonce);

export const describeDraw = (drawn: number[]) => `Drew ${[...drawn].sort((a, b) => a - b).join(", ")}`;

/** `count` numbers off the board at random, for the Auto pick button. */
export function randomPicks(count: number): number[] {
  const pool = [...BOARD];
  const out: number[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out.sort((a, b) => a - b);
}
