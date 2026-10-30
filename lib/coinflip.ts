import { draws } from "./fair";
import { BET_PLAYERS } from "./home";
import { KEEP } from "./house";

/*
 * Coinflip maths. Two players put the same amount on opposite faces of the
 * coin; the draw decides the face; the winner takes the pot less the
 * house's share. The lobby's sample flips are seeded so the server and
 * the browser draw the same ones.
 */

export type Side = "heads" | "tails";
export const SIDES: readonly Side[] = ["heads", "tails"];
/** The faces are the same coin in gold and in silver. */
export const SIDE_NAME: Record<Side, string> = { heads: "Gold", tails: "Silver" };
export const SIDE_IMAGE: Record<Side, string> = { heads: "/coinflip/heads.png", tails: "/coinflip/tails.png" };
export const other = (side: Side): Side => (side === "heads" ? "tails" : "heads");

/** Which face a flip lands on: the first draw, under a half for gold. */
export const flipOf = (serverSeed: string, clientSeed: string, nonce: number): Side => (draws(serverSeed, clientSeed, nonce, 1)[0] < 0.5 ? "heads" : "tails");

/** What the winner takes home: the pot, less the house's share. */
export const payoutOf = (bet: number) => Math.round(2 * bet * KEEP);

export type LobbyFlip = { id: number; player: string; side: Side; amount: number };

const AMOUNTS = [1250, 2500, 5000, 6250, 10000, 12500, 25000, 50000, 3750, 7500];

/** The n-th sample flip, the same every time. */
export function sampleFlip(n: number): LobbyFlip {
  const h = ((n + 1) * 2654435761) >>> 0;
  return {
    id: 1000 + n,
    player: BET_PLAYERS[h % BET_PLAYERS.length],
    side: (h >>> 8) % 2 === 0 ? "heads" : "tails",
    amount: AMOUNTS[(h >>> 16) % AMOUNTS.length],
  };
}

export const SAMPLE_FLIPS: LobbyFlip[] = Array.from({ length: 7 }, (_, i) => sampleFlip(i));

export const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
