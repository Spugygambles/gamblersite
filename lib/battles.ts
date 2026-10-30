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

// ---- The lobby's battles ----------------------------------------------------------------

export type Status = "open" | "live" | "done";
export type LobbyBattle = {
  id: number;
  mode: Mode;
  cases: CaseDef[];
  /** A name per seat; null while a seat waits for a player. */
  players: (string | null)[];
  status: Status;
  /** Rounds played so far: all of them once it's done. */
  round: number;
  /** Every seat's drop in every round, for live and finished battles. */
  drops: CaseItem[][];
  /** Your seat, in a battle you played. */
  you: number | null;
};

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

// the sample battles' drops come from fixed seeds, so they're the same every visit
const SAMPLE_SERVER = "csgoneo-sample-battles";
const SAMPLE_CLIENT = "lobby";

/** A sample battle: a mode, two to six cases, and its seats; open with one free, live part way through, or finished. */
export function lobbyBattle(id: number, status: Status = "open"): LobbyBattle {
  const rand = seeded(id * 7919);
  const mode = MODES[Math.floor(rand() * MODES.length)].id;
  const rounds = 2 + Math.floor(rand() * 5);
  const cases = Array.from({ length: rounds }, () => COIN_CASES[Math.floor(rand() * COIN_CASES.length)]);
  const seats = seatsOf(mode);
  const full = fillSeats(Array.from({ length: seats }, () => null), id * 13);
  const players = status === "open" ? full.map((p, i) => (i === seats - 1 ? null : p)) : full;
  const drops = status === "open" ? [] : battleDrops(cases, seats, SAMPLE_SERVER, SAMPLE_CLIENT, id);
  const round = status === "done" ? rounds : status === "live" ? 1 + Math.floor(rand() * (rounds - 1)) : 0;
  return { id, mode, cases, players, status, round, drops, you: null };
}

/** The lobby to start with: four battles with a seat free, four under way, six finished. */
export const LOBBY: LobbyBattle[] = [
  ...Array.from({ length: 4 }, (_, i) => lobbyBattle(i + 1, "open")),
  ...Array.from({ length: 4 }, (_, i) => lobbyBattle(i + 5, "live")),
  ...Array.from({ length: 6 }, (_, i) => lobbyBattle(i + 9, "done")),
];

// ---- Your finished battles, kept in the browser ----------------------------------------------

type Kept = { id: number; mode: Mode; cases: string[]; players: string[]; you: number; drops: string[][] };
const KEY = "csgoneo.battles";
const KEEP = 10;

/** Keeps a battle you played, newest first, so it shows among the previous battles next time. */
export function keepBattle(b: LobbyBattle) {
  try {
    const kept: Kept[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    kept.unshift({ id: b.id, mode: b.mode, cases: b.cases.map((c) => c.slug), players: b.players.map((p) => p ?? "?"), you: b.you ?? 0, drops: b.drops.map((r) => r.map((it) => it.skin.slug)) });
    localStorage.setItem(KEY, JSON.stringify(kept.slice(0, KEEP)));
  } catch {}
}

/** The battles you played before, newest first. */
export function keptBattles(): LobbyBattle[] {
  try {
    const kept: Kept[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return kept.flatMap((k) => {
      const cases = k.cases.map((slug) => CASES.find((c) => c.slug === slug)).filter((c): c is CaseDef => !!c);
      if (cases.length !== k.cases.length) return [];
      const drops = k.drops.map((round, r) => round.map((slug) => cases[r].items.find((it) => it.skin.slug === slug) ?? cases[r].items[0]));
      return [{ id: k.id, mode: k.mode, cases, players: k.players, status: "done" as const, round: cases.length, drops, you: k.you }];
    });
  } catch {
    return [];
  }
}

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
