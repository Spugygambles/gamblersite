import { burstMultiplier } from "./fair";
import { KEEP } from "./house";

/*
 * Limbo maths. The player names a target multiplier; a roll comes up (the
 * same climbing multiplier Crash uses) and the bet wins the target if the
 * roll reaches it. The chance is the house's share over the target, and
 * the two fields on the stage are each other's inverse: name a chance
 * and the multiplier follows.
 */

export const MIN_TARGET = 1.01;
export const MAX_TARGET = 1_000_000;

/** The target as typed, to the cent, or null if it's not one. */
export function parseTarget(text: string): number | null {
  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  const t = Math.round(n * 100) / 100;
  return t >= MIN_TARGET && t <= MAX_TARGET ? t : null;
}

/** The chance the roll reaches `target`. */
export const chanceOf = (target: number) => (target >= MIN_TARGET ? Math.min(KEEP, KEEP / target) : 0);

/** The target a chance (in percent) stands for, or null when no target gives it. */
export function targetFromChance(text: string): number | null {
  const pct = Number(text);
  if (!Number.isFinite(pct) || pct <= 0) return null;
  const t = Math.round(((KEEP * 100) / pct) * 100) / 100;
  return t >= MIN_TARGET && t <= MAX_TARGET ? t : null;
}

export const payoutOf = (bet: number, target: number) => Math.round(bet * target);
/** What a win adds beyond the stake. */
export const profitOf = (bet: number, target: number) => payoutOf(bet, target) - bet;

/** The roll for a game, from the seeds and nonce. */
export const rollOf = (serverSeed: string, clientSeed: string, nonce: number) => burstMultiplier(serverSeed, clientSeed, nonce);

export const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
/** A multiplier for display: "2.31x", "1,234.5x". */
export const times = (m: number) => `${m >= 1000 ? whole.format(m) : m.toFixed(2)}x`;
/** A chance as the field shows it, to eight places. */
export const chanceText = (chance: number) => (chance * 100).toFixed(8);
export const percent = (chance: number) => `${(chance * 100).toFixed(2)}%`;
