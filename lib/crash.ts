import { burstMultiplier } from "./fair";

/*
 * Crash maths. A round's multiplier climbs from 1.00× as e^(GROWTH·t),
 * doubling every six seconds, until it bursts at the round's crash point:
 * one draw from the seeds (lib/fair's burstMultiplier, the house's share
 * of 2^32 / (2^32 - h), so one round in ten crashes at 1.00× exactly).
 */

/** The betting window before a round, and how long the crash shows after. */
export const WINDOW_MS = 6000;
export const CRASHED_MS = 3000;

/** The climb's rate: e^(GROWTH·t) with t in seconds is 2.00× at 6 s. */
export const GROWTH = Math.LN2 / 6;
export const multiplierAt = (ms: number) => Math.exp(GROWTH * (ms / 1000));
export const msFor = (mult: number) => (Math.log(Math.max(1, mult)) / GROWTH) * 1000;

export const crashPoint = burstMultiplier;

export const payoutOf = (bet: number, mult: number) => Math.round(bet * mult);
export const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const times = (m: number) => `${m.toFixed(2)}×`;

/** Round numbers between `from` and `to`, about `want` of them, for an axis. */
export function ticks(from: number, to: number, want = 5): number[] {
  const span = to - from;
  if (span <= 0) return [from];
  const rough = span / want;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * pow).find((s) => span / s <= want + 1) ?? pow * 10;
  const out: number[] = [];
  for (let v = Math.ceil(from / step - 1e-9) * step; v <= to + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}
