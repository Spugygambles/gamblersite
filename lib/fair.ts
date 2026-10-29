import { hmacSha256, utf8 } from "./sha256";
import { KEEP } from "./house";

export { seedHash } from "./seeds";

/*
 * The draws every game is built on: numbers in [0, 1) from
 * HMAC-SHA256(serverSeed, clientSeed:nonce:round), four bytes each, eight a
 * round. The same seeds and nonce always give the same numbers, which is
 * what lets a player check a game once the server seed is revealed.
 */

/** `count` numbers in [0, 1) for a game. */
export function draws(serverSeed: string, clientSeed: string, nonce: number, count: number): number[] {
  const out: number[] = [];
  for (let round = 0; out.length < count; round++) {
    const h = hmacSha256(utf8(serverSeed), utf8(`${clientSeed}:${nonce}:${round}`));
    for (let i = 0; i + 4 <= h.length && out.length < count; i += 4) {
      out.push((((h[i] << 24) | (h[i + 1] << 16) | (h[i + 2] << 8) | h[i + 3]) >>> 0) / 2 ** 32);
    }
  }
  return out;
}

/** The first draw, as a 32-bit integer. */
export function uint32(serverSeed: string, clientSeed: string, nonce: number): number {
  const h = hmacSha256(utf8(serverSeed), utf8(`${clientSeed}:${nonce}:0`));
  return ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0;
}

/** `list` shuffled by the draws (Fisher-Yates, from the end). */
export function shuffle<T>(list: readonly T[], serverSeed: string, clientSeed: string, nonce: number): T[] {
  const out = [...list];
  const r = draws(serverSeed, clientSeed, nonce, out.length - 1);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r[out.length - 1 - i] * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A multiplier that climbs until it bursts, the way Crash and Limbo pay:
 * the house's share of 2^32 / (2^32 - h), floored to the cent, never
 * under 1.00. One draw in ten (the house's share) lands on 1.00 exactly.
 */
export function burstMultiplier(serverSeed: string, clientSeed: string, nonce: number): number {
  const h = uint32(serverSeed, clientSeed, nonce);
  const raw = (KEEP * 2 ** 32) / (2 ** 32 - h);
  return Math.max(1, Math.floor(raw * 100) / 100);
}

/** `count` of `pool` picked without replacement, in the order drawn. */
export function pick<T>(pool: readonly T[], count: number, serverSeed: string, clientSeed: string, nonce: number): T[] {
  return shuffle(pool, serverSeed, clientSeed, nonce).slice(0, count);
}

/** Which of `weights` a draw lands on: the cumulative share it falls in. */
export function weighted(weights: readonly number[], draw: number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i] / total;
    if (draw < acc) return i;
  }
  return weights.length - 1;
}
