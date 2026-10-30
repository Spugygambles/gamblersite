import { CASES, type CaseDef, type CaseItem } from "./cases";
import { draws, weighted } from "./fair";
import { BET_PLAYERS } from "./home";

/*
 * Case battles: two to four seats open the same cases round by round, and
 * the gamemode says who takes the drops: as a rule the seat (or team) whose
 * drops are worth the most. The house's share is in the case prices
 * (lib/cases.ts), nowhere else. One nonce covers a battle: the drops come
 * from its draws in order, round by round and seat by seat, and one draw
 * more decides the coinflip and jackpot modes, so a battle can be worked
 * out again from its seeds.
 */

export type Mode = "1v1" | "1v1v1" | "1v1v1v1" | "2v2";
export const MODES: { id: Mode; seats: number; label: string; kind: "Solo battle" | "Team battle" }[] = [
  { id: "1v1", seats: 2, label: "1v1", kind: "Solo battle" },
  { id: "1v1v1", seats: 3, label: "1v1v1", kind: "Solo battle" },
  { id: "1v1v1v1", seats: 4, label: "1v1v1v1", kind: "Solo battle" },
  { id: "2v2", seats: 4, label: "2v2", kind: "Team battle" },
];
export const seatsOf = (mode: Mode) => MODES.find((m) => m.id === mode)!.seats;
/** Seats 0 and 1 are one team in 2v2, 2 and 3 the other; every other mode is each seat for itself. */
export const teamOf = (mode: Mode, seat: number) => (mode === "2v2" ? Math.floor(seat / 2) : seat);
/** The sides, each a list of seats. */
export const teamsOf = (mode: Mode): number[][] => (mode === "2v2" ? [[0, 1], [2, 3]] : Array.from({ length: seatsOf(mode) }, (_, i) => [i]));

/** How a battle is won. Standard is the one with no card picked: the biggest haul wins. */
export type Gamemode = "standard" | "crazy" | "terminal" | "group" | "coinflip" | "jackpot";
export const GAMEMODES: { id: Exclude<Gamemode, "standard">; name: string; blurb: string }[] = [
  { id: "crazy", name: "Crazy", blurb: "The one who unboxes the LEAST amount wins the battle!" },
  { id: "terminal", name: "Terminal", blurb: "Only the LAST case counts, the rest are ignored!" },
  { id: "group", name: "Group", blurb: "Play together as a group, all winnings are split equally!" },
  { id: "coinflip", name: "Coinflip", blurb: "The battle ends with a coinflip that decides the winner!" },
  { id: "jackpot", name: "Jackpot", blurb: "The battle ends with a jackpot that decides the winner!" },
];
export const gamemodeName = (g: Gamemode) => GAMEMODES.find((m) => m.id === g)?.name ?? "";

/** The extras a battle can be made with. `borrow` is the share of the seat's cost borrowed, 0 to MAX_BORROW. */
export type Options = { borrow: number; fund: boolean; private: boolean; fast: boolean; gold: boolean };
export const NO_OPTIONS: Options = { borrow: 0, fund: false, private: false, fast: false, gold: false };
/** The most of a seat that can be borrowed. */
export const MAX_BORROW = 0.9;
/** The share of a win the player keeps when borrowing: the lender takes the borrowed share. */
export const keptShare = (borrow: number) => Math.round((1 - borrow) * 100) / 100;

/** The cases a battle can be made of: the ones sold for coins. */
export const COIN_CASES: CaseDef[] = CASES.filter((c) => c.gems === null);
export const MAX_ROUNDS = 8;

const cents = (n: number) => Math.round(n * 100) / 100;
/** A seat's cost: the cases' prices together. */
export const costOf = (cases: CaseDef[]) => cents(cases.reduce((sum, c) => sum + c.price, 0));
/** What making the battle costs: a seat, or every seat when the maker funds them all, less what's borrowed. */
export const makeCostOf = (cases: CaseDef[], mode: Mode, options: Options) => cents(costOf(cases) * (options.fund ? seatsOf(mode) : 1) * keptShare(options.borrow));

/** Every seat's drop in every round: drops[round][seat], draw index round × seats + seat. */
export function battleDrops(cases: CaseDef[], seats: number, serverSeed: string, clientSeed: string, nonce: number): CaseItem[][] {
  const r = draws(serverSeed, clientSeed, nonce, cases.length * seats);
  return cases.map((c, round) => Array.from({ length: seats }, (_, seat) => c.items[weighted(c.items.map((it) => it.weight), r[round * seats + seat])]));
}

/** The draw after the drops' draws: it settles the coinflip and jackpot modes. */
export function deciderOf(rounds: number, seats: number, serverSeed: string, clientSeed: string, nonce: number): number {
  return draws(serverSeed, clientSeed, nonce, rounds * seats + 1)[rounds * seats];
}

/** What each seat's drops come to, over the rounds given. */
export function totalsOf(drops: CaseItem[][], seats: number): number[] {
  return Array.from({ length: seats }, (_, seat) => cents(drops.reduce((sum, round) => sum + (round[seat]?.skin.price ?? 0), 0)));
}

/** The pot: every drop's value. */
export const potOf = (drops: CaseItem[][]) => cents(drops.flat().reduce((sum, it) => sum + it.skin.price, 0));

const sideTotal = (totals: number[], side: number[]) => cents(side.reduce((sum, seat) => sum + totals[seat], 0));

/**
 * The winning seats in a standard battle: the highest total, or in 2v2 the
 * team with the higher total (both its seats). A tie goes to the lower
 * seat (or team), the first to sit down.
 */
export function winnersOf(totals: number[], mode: Mode): number[] {
  return highest(totals, mode, teamsOf(mode));
}

function highest(totals: number[], mode: Mode, sides: number[][]): number[] {
  let best = sides[0];
  for (const side of sides.slice(1)) if (sideTotal(totals, side) > sideTotal(totals, best)) best = side;
  return best;
}

function lowest(totals: number[], sides: number[][]): number[] {
  let worst = sides[0];
  for (const side of sides.slice(1)) if (sideTotal(totals, side) < sideTotal(totals, worst)) worst = side;
  return worst;
}

export type Settled = { totals: number[]; winners: number[] };

/** Who takes the battle, by its gamemode. `decider` is the draw after the drops' (deciderOf). */
export function settle(drops: CaseItem[][], mode: Mode, gamemode: Gamemode, decider: number): Settled {
  const seats = seatsOf(mode);
  const sides = teamsOf(mode);
  const totals = totalsOf(drops, seats);
  let winners: number[];
  switch (gamemode) {
    case "crazy":
      winners = lowest(totals, sides);
      break;
    case "terminal":
      winners = highest(totalsOf(drops.slice(-1), seats), mode, sides);
      break;
    case "group":
      winners = sides.flat();
      break;
    case "coinflip":
      winners = sides[Math.min(sides.length - 1, Math.floor(decider * sides.length))];
      break;
    case "jackpot": {
      const weights = sides.map((s) => sideTotal(totals, s));
      winners = weights.some((w) => w > 0) ? sides[weighted(weights, decider)] : sides[Math.min(sides.length - 1, Math.floor(decider * sides.length))];
      break;
    }
    default:
      winners = highest(totals, mode, sides);
  }
  return { totals, winners };
}

/** A winner's share of the pot: all of it, or split between the winning seats. */
export const shareOf = (pot: number, winners: number) => cents(pot / Math.max(1, winners));

/** The result in words: who, and by what rule. */
export function resultLine(gamemode: Gamemode, who: string, several: boolean): string {
  switch (gamemode) {
    case "crazy":
      return `${who} ${several ? "win" : "wins"} with the lowest haul`;
    case "terminal":
      return `${who} ${several ? "win" : "wins"} on the last case`;
    case "group":
      return "Everyone shares the pot";
    case "coinflip":
      return `The coin lands on ${who}`;
    case "jackpot":
      return `The jackpot lands on ${who}`;
    default:
      return `${who} ${several ? "take" : "takes"} the pot`;
  }
}

// ---- The lobby's battles ----------------------------------------------------------------

export type Status = "open" | "live" | "done";
export type LobbyBattle = {
  id: number;
  mode: Mode;
  gamemode: Gamemode;
  options: Options;
  cases: CaseDef[];
  /** A name per seat; null while a seat waits for a player. */
  players: (string | null)[];
  status: Status;
  /** Rounds played so far: all of them once it's done. */
  round: number;
  /** Every seat's drop in every round, for live and finished battles. */
  drops: CaseItem[][];
  /** The draw that settles a coinflip or jackpot (deciderOf). */
  decider: number;
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

/** A sample battle: a mode, a gamemode now and then, two to six cases, and its seats; open with one free, live part way through, or finished. */
export function lobbyBattle(id: number, status: Status = "open"): LobbyBattle {
  const rand = seeded(id * 7919);
  const mode = MODES[Math.floor(rand() * MODES.length)].id;
  const rounds = 2 + Math.floor(rand() * 5);
  const cases = Array.from({ length: rounds }, () => COIN_CASES[Math.floor(rand() * COIN_CASES.length)]);
  const gamemode: Gamemode = rand() < 0.5 ? "standard" : GAMEMODES[Math.floor(rand() * GAMEMODES.length)].id;
  const options: Options = { ...NO_OPTIONS, gold: rand() < 0.2, fund: rand() < 0.15 };
  const seats = seatsOf(mode);
  const full = fillSeats(Array.from({ length: seats }, () => null), id * 13);
  const players = status === "open" ? full.map((p, i) => (i === seats - 1 ? null : p)) : full;
  const drops = status === "open" ? [] : battleDrops(cases, seats, SAMPLE_SERVER, SAMPLE_CLIENT, id);
  const decider = deciderOf(rounds, seats, SAMPLE_SERVER, SAMPLE_CLIENT, id);
  const round = status === "done" ? rounds : status === "live" ? 1 + Math.floor(rand() * (rounds - 1)) : 0;
  return { id, mode, gamemode, options, cases, players, status, round, drops, decider, you: null };
}

/** The sample battles to start with, three for trying things: one with a seat free, one under way, one finished. */
export const LOBBY: LobbyBattle[] = [lobbyBattle(1, "open"), lobbyBattle(5, "live"), lobbyBattle(9, "done")];

// ---- Your finished battles, kept in the browser ----------------------------------------------

type Kept = { id: number; mode: Mode; gamemode?: Gamemode; options?: Options; cases: string[]; players: string[]; you: number; drops: string[][]; decider?: number };
const KEY = "csgoneo.battles";
/** How many of the battles people play the list keeps. */
export const KEEP = 10;

/** Keeps a battle you played, newest first, so it shows among the previous battles next time. */
export function keepBattle(b: LobbyBattle) {
  try {
    const kept: Kept[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    kept.unshift({
      id: b.id,
      mode: b.mode,
      gamemode: b.gamemode,
      options: b.options,
      cases: b.cases.map((c) => c.slug),
      players: b.players.map((p) => p ?? "?"),
      you: b.you ?? 0,
      drops: b.drops.map((r) => r.map((it) => it.skin.slug)),
      decider: b.decider,
    });
    localStorage.setItem(KEY, JSON.stringify(kept.slice(0, KEEP)));
  } catch {}
}

/** The battles you played before, newest first. */
export function keptBattles(): LobbyBattle[] {
  try {
    const kept: Kept[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return kept.flatMap((k) => {
      if (!MODES.some((m) => m.id === k.mode)) return [];
      const cases = k.cases.map((slug) => CASES.find((c) => c.slug === slug)).filter((c): c is CaseDef => !!c);
      if (cases.length !== k.cases.length) return [];
      const drops = k.drops.map((round, r) => round.map((slug) => cases[r].items.find((it) => it.skin.slug === slug) ?? cases[r].items[0]));
      return [
        {
          id: k.id,
          mode: k.mode,
          gamemode: k.gamemode && GAMEMODES.some((g) => g.id === k.gamemode) ? k.gamemode : "standard",
          options: { ...NO_OPTIONS, ...k.options, borrow: typeof k.options?.borrow === "number" ? k.options.borrow : 0 },
          cases,
          players: k.players,
          status: "done" as const,
          round: cases.length,
          drops,
          decider: k.decider ?? 0,
          you: k.you,
        },
      ];
    });
  } catch {
    return [];
  }
}

/** A battle in words, round by round, for checking it from its seeds. */
export function describeBattle(cases: CaseDef[], mode: Mode, gamemode: Gamemode, names: string[], serverSeed: string, clientSeed: string, nonce: number): string {
  const seats = seatsOf(mode);
  const drops = battleDrops(cases, seats, serverSeed, clientSeed, nonce);
  const decider = deciderOf(cases.length, seats, serverSeed, clientSeed, nonce);
  const { totals, winners } = settle(drops, mode, gamemode, decider);
  const rounds = drops.map((round, r) => `Round ${r + 1} (${cases[r].name}): ${round.map((it, seat) => `${names[seat]} ${it.skin.name}`).join(", ")}`);
  const who = winners.map((w) => names[w]).join(" and ");
  const rule = gamemode === "standard" ? "" : ` (${gamemodeName(gamemode)}${gamemode === "coinflip" || gamemode === "jackpot" ? `, deciding draw ${decider.toFixed(6)}` : ""})`;
  return `${rounds.join(". ")}. Winner${rule}: ${who} with ${totals.filter((_, i) => winners.includes(i)).reduce((a, b) => a + b, 0).toFixed(2)} of the ${potOf(drops).toFixed(2)} pot.`;
}
