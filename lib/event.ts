// The Turkey Hunt: Thanksgiving's event. Turkeys turn up in any game; catch
// one and it pays out maple leaves, which buy things in the event's shop.
// The numbers here stand in until the event is wired to the server.

import { PLAYER } from "./home";

/** The hunt ends at the end of the Monday after Thanksgiving (the fourth
    Thursday in November), local time; next year's once it's over. */
export function huntEnds() {
  const now = new Date();
  const endOf = (year: number) => {
    const first = new Date(year, 10, 1).getDay();
    const thursday = 1 + ((4 - first + 7) % 7) + 21;
    return new Date(year, 10, thursday + 4, 23, 59, 59);
  };
  const end = endOf(now.getFullYear());
  return end > now ? end : endOf(now.getFullYear() + 1);
}

/** The hunt's prize pool, in dollars, as the banner shows it. */
export const PRIZE_POOL = "$25K";

/** How the player's hunt is going. */
export const MY_HUNT = {
  turkeys: 7,
  leaves: PLAYER.leaves,
  goldenTurkeys: 0,
  rank: 48,
  hunters: 2914,
};

/** The leaf shop's cases, cheapest first. Each picture is in
    public/event/cases, named by the case's id. */
export const CASES = [
  { id: "maple-grove", name: "Maple Grove", price: 10 },
  { id: "cranberry-bog", name: "Cranberry Bog", price: 25 },
  { id: "pumpkin-patch", name: "Pumpkin Patch", price: 50 },
  { id: "corn-maze", name: "Corn Maze", price: 100 },
  { id: "pilgrims-pride", name: "Pilgrim's Pride", price: 250 },
  { id: "gravy-boat", name: "Gravy Boat", price: 500 },
  { id: "harvest-moon", name: "Harvest Moon", price: 1000 },
  { id: "wishbone", name: "Wishbone", price: 2500 },
  { id: "flannel-season", name: "Flannel Season", price: 5000 },
  { id: "cornucopia", name: "Cornucopia", price: 10000 },
];

/** A day on the harvest calendar: what it takes to unlock its box (how
    much to wager and to deposit that day, either may be 0), and the odds
    of what's inside. The box is a mystery until it's opened. */
export type CalendarDay = {
  day: number;
  wager: number;
  deposit: number;
  /** What might be in the box, best last, with each one's chance in %. */
  odds: { reward: string; chance: number }[];
};

const LEAVES_OR_CASE = (low: number, high: number, caseName: string) => [
  { reward: `${low} leaves`, chance: 55 },
  { reward: `${high} leaves`, chance: 35 },
  { reward: `${caseName} case`, chance: 10 },
];

/** Two weeks of boxes. The asks climb through the hunt, with a deposit
    only on some days, and the last day's box can hold a Golden Turkey. */
export const CALENDAR: CalendarDay[] = [
  { day: 1, wager: 5, deposit: 0, odds: LEAVES_OR_CASE(5, 15, "Maple Grove") },
  { day: 2, wager: 10, deposit: 0, odds: LEAVES_OR_CASE(5, 15, "Maple Grove") },
  { day: 3, wager: 15, deposit: 0, odds: LEAVES_OR_CASE(10, 20, "Maple Grove") },
  { day: 4, wager: 20, deposit: 10, odds: LEAVES_OR_CASE(10, 25, "Cranberry Bog") },
  { day: 5, wager: 25, deposit: 0, odds: LEAVES_OR_CASE(15, 30, "Cranberry Bog") },
  { day: 6, wager: 40, deposit: 0, odds: LEAVES_OR_CASE(15, 35, "Pumpkin Patch") },
  { day: 7, wager: 50, deposit: 25, odds: LEAVES_OR_CASE(25, 50, "Pumpkin Patch") },
  { day: 8, wager: 50, deposit: 0, odds: LEAVES_OR_CASE(20, 40, "Pumpkin Patch") },
  { day: 9, wager: 75, deposit: 0, odds: LEAVES_OR_CASE(25, 50, "Corn Maze") },
  { day: 10, wager: 100, deposit: 25, odds: LEAVES_OR_CASE(30, 60, "Corn Maze") },
  { day: 11, wager: 100, deposit: 0, odds: LEAVES_OR_CASE(30, 75, "Pilgrim's Pride") },
  { day: 12, wager: 150, deposit: 0, odds: LEAVES_OR_CASE(40, 100, "Pilgrim's Pride") },
  { day: 13, wager: 200, deposit: 50, odds: LEAVES_OR_CASE(50, 125, "Gravy Boat") },
  {
    day: 14,
    wager: 250,
    deposit: 50,
    odds: [
      { reward: "100 leaves", chance: 50 },
      { reward: "250 leaves", chance: 30 },
      { reward: "Harvest Moon case", chance: 15 },
      { reward: "Golden Turkey", chance: 5 },
    ],
  },
];

/** The calendar day the player's on, and how far they've got today. */
export const TODAY = 6;
export const TODAY_SO_FAR = { wagered: 27.5, deposited: 0 };

/** What the days behind the player gave them. A day with nothing was
    missed: its box stays sealed. */
export const OPENED: Record<number, string> = {
  1: "5 leaves",
  2: "15 leaves",
  3: "Maple Grove case",
  5: "15 leaves",
};


/** The leaderboard's prizes, first to tenth, in coins. */
export const PRIZES = [750, 500, 300, 200, 150, 150, 125, 125, 100, 100];

/** The top ten hunters by turkeys caught. */
export const HUNTERS = [
  { name: "hydra", level: 83, turkeys: 412 },
  { name: "Obi", level: 88, turkeys: 377 },
  { name: "mira", level: 47, turkeys: 341 },
  { name: "kyro", level: 42, turkeys: 298 },
  { name: "dusk", level: 70, turkeys: 270 },
  { name: "Spl1t", level: 77, turkeys: 251 },
  { name: "nova", level: 63, turkeys: 233 },
  { name: "ghostR", level: 31, turkeys: 219 },
  { name: "Wren", level: 38, turkeys: 204 },
  { name: "rook", level: 56, turkeys: 196 },
];

export const RULES = [
  "Turkeys can turn up in any game, on bets of 0.10 coins or more. Click one before it runs off to catch it.",
  "You earn 1 leaf for every 5.00 coins wagered, adjusted by game, and 5 leaves for each turkey you catch.",
  "Golden Turkeys drop from case opens. Each one opens the Golden Turkey case once.",
  "Calendar gifts open one a day. A day you miss stays locked.",
  "Leaderboard prizes are paid within a day of the hunt ending. Leaves don't carry over.",
  "One account per player. Accounts that abuse the hunt are removed from it.",
];
