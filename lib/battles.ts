import { CASES, type CaseDef, type CaseItem } from "./cases";
import { draws, weighted } from "./fair";
import { BET_PLAYERS } from "./home";

/*
 * Case battles: two to four seats open the same cases round by round, and
 * the seat (or team) whose drops are worth the most takes every drop. The
 * house's share is in the case prices (lib/cases.ts), nowhere else. One
 * nonce covers a battle: the drops come from its draws in order, round by
 * round and seat by seat, so a battle can be worked out again from its
 * seeds.
 */

export type Mode = "1v1" | "1v1v1" | "2v2";
export const MODES: { id: Mode; seats: number; label: string }[] = [
  { id: "1v1", seats: 2, label: "1v1" },
  { id: "1v1v1", seats: 3, label: "1v1v1" },
  { id: "2v2", seats: 4, label: "2v2" },
];
export const seatsOf = (mode: Mode) => MODES.find((m) => m.id === mode)!.seats;
/** Seats 0 and 1 are one team in 2v2, 2 and 3 the other. */
export const teamOf = (mode: Mode, seat: number) => (mode === "2v2" ? Math.floor(seat / 2) : seat);

/** The cases a battle can be made of: the ones sold for coins. */
export const COIN_CASES: CaseDef[] = CASES.filter((c) => c.gems === null);
export const MAX_ROUNDS = 8;

const cents = (n: number) => Math.round(n * 100) / 100;
export const costOf = (cases: CaseDef[]) => cents(cases.reduce((sum, c) => sum + c.price, 0));

/** Every seat's drop in every round: drops[round][seat], draw index round × seats + seat. */
export function battleDrops(cases: CaseDef[], seats: number, serverSeed: string, clientSeed: string, nonce: number): CaseItem[][] {
  const r = draws(serverSeed, clientSeed, nonce, cases.length * seats);
  return cases.map((c, round) => Array.from({ length: seats }, (_, seat) => c.items[weighted(c.items.map((it) => it.weight), r[round * seats + seat])]));
}

/** What each seat's drops come to, over the rounds given. */
export function totalsOf(drops: CaseItem[][], seats: number): number[] {
  return Array.from({ length: seats }, (_, seat) => cents(drops.reduce((sum, round) => sum + (round[seat]?.skin.price ?? 0), 0)));
}

/** The pot: every drop's value. */
export const potOf = (drops: CaseItem[][]) => cents(drops.flat().reduce((sum, it) => sum + it.skin.price, 0));

/**
 * The winning seats: the highest total, or in 2v2 the team with the
 * higher total (both its seats). A tie goes to the lower seat (or team),
 * the first to sit down.
 */
export function winnersOf(totals: number[], mode: Mode): number[] {
  if (mode === "2v2") {
    const a = cents(totals[0] + totals[1]);
    const b = cents(totals[2] + totals[3]);
    return a >= b ? [0, 1] : [2, 3];
  }
  let best = 0;
  totals.forEach((t, i) => {
    if (t > totals[best]) best = i;
  });
  return [best];
}

/** A winner's share of the pot: all of it, or half in 2v2. */
export const shareOf = (pot: number, mode: Mode) => cents(mode === "2v2" ? pot / 2 : pot);

// ---- The lobby's sample battles ---------------------------------------------------------

export type LobbyBattle = { id: number; mode: Mode; cases: CaseDef[]; players: (string | null)[] };

// Small, repeatable random numbers, so the lobby is the same on the server and the client.
function seeded(seed: number) {
  let a = (seed * 2654435761 + 1) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample players for the seats still open, none of them twice. */
export function fillSeats(seats: (string | null)[], seed: number, taken: string[] = []): string[] {
  const rand = seeded(seed + 11);
  const used = new Set([...taken, ...seats.filter((s): s is string => !!s)]);
  return seats.map((s) => {
    if (s) return s;
    let name = BET_PLAYERS[Math.floor(rand() * BET_PLAYERS.length)];
    for (let tries = 0; used.has(name) && tries < 40; tries++) name = BET_PLAYERS[Math.floor(rand() * BET_PLAYERS.length)];
    used.add(name);
    return name;
  });
}

/** A sample battle for the lobby: a mode, two to five cases, and most seats taken, one often open. */
export function lobbyBattle(id: number): LobbyBattle {
  const rand = seeded(id * 7919);
  const mode = MODES[Math.floor(rand() * MODES.length)].id;
  const rounds = 2 + Math.floor(rand() * 4);
  const cases = Array.from({ length: rounds }, () => COIN_CASES[Math.floor(rand() * COIN_CASES.length)]);
  const seats = seatsOf(mode);
  // the first four battles always have a seat open; later ones sometimes fill up
  const open = id <= 4 || rand() < 0.6 ? 1 : 0;
  const players = fillSeats(Array.from({ length: seats }, () => null), id * 13).map((p, i) => (i === seats - 1 && open ? null : p));
  return { id, mode, cases, players };
}

export const LOBBY: LobbyBattle[] = Array.from({ length: 7 }, (_, i) => lobbyBattle(i + 1));

/** A battle in words, round by round, for checking it from its seeds. */
export function describeBattle(cases: CaseDef[], mode: Mode, names: string[], serverSeed: string, clientSeed: string, nonce: number): string {
  const seats = seatsOf(mode);
  const drops = battleDrops(cases, seats, serverSeed, clientSeed, nonce);
  const totals = totalsOf(drops, seats);
  const winners = winnersOf(totals, mode);
  const rounds = drops.map((round, r) => `Round ${r + 1} (${cases[r].name}): ${round.map((it, seat) => `${names[seat]} ${it.skin.name}`).join(", ")}`);
  const who = winners.map((w) => names[w]).join(" and ");
  return `${rounds.join(". ")}. Winner: ${who} with ${totals.filter((_, i) => winners.includes(i)).reduce((a, b) => a + b, 0).toFixed(2)} of the ${potOf(drops).toFixed(2)} pot.`;
}
