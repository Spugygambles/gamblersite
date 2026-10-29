import { burstMultiplier } from "./fair";
import { KEEP } from "./house";

/*
 * Limbo maths. The player names a target multiplier; a roll comes up (the
 * same climbing multiplier Crash uses) and the bet wins the target if the
 * roll reaches it. The chance is the house's share over the target.
 */

export const MIN_TARGET = 1.01;
export const MAX_TARGET = 1_000_000;
export const QUICK = [2, 3, 5, 10, 50, 100];

/** The target as typed, to the cent, or null if it's not one. */
export function parseTarget(text: string): number | null {
  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  const t = Math.round(n * 100) / 100;
  return t >= MIN_TARGET && t <= MAX_TARGET ? t : null;
}

/** The chance the roll reaches `target`. */
export const chanceOf = (target: number) => (target >= MIN_TARGET ? Math.min(KEEP, KEEP / target) : 0);

export const payoutOf = (bet: number, target: number) => Math.round(bet * target * 100) / 100;

/** The roll for a game, from the seeds and nonce. */
export const rollOf = (serverSeed: string, clientSeed: string, nonce: number) => burstMultiplier(serverSeed, clientSeed, nonce);

export const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
/** A multiplier for display: "2.31×", "1,234.5×". */
export const times = (m: number) => `${m >= 1000 ? whole.format(m) : m.toFixed(2)}×`;
export const percent = (chance: number) => `${(chance * 100).toFixed(2)}%`;
