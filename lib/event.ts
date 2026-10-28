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

/** The harvest calendar: a gift a day, the last a case. `claimed` days are
    behind the player, `today` is open, the rest are locked. */
export const CALENDAR: { day: number; gift: string; leaves?: number; caseId?: string }[] = [
  { day: 1, gift: "10 leaves", leaves: 10 },
  { day: 2, gift: "10 leaves", leaves: 10 },
  { day: 3, gift: "15 leaves", leaves: 15 },
  { day: 4, gift: "15 leaves", leaves: 15 },
  { day: 5, gift: "20 leaves", leaves: 20 },
  { day: 6, gift: "25 leaves", leaves: 25 },
  { day: 7, gift: "Maple Grove", caseId: "maple-grove" },
  { day: 8, gift: "25 leaves", leaves: 25 },
  { day: 9, gift: "30 leaves", leaves: 30 },
  { day: 10, gift: "30 leaves", leaves: 30 },
  { day: 11, gift: "35 leaves", leaves: 35 },
  { day: 12, gift: "40 leaves", leaves: 40 },
  { day: 13, gift: "50 leaves", leaves: 50 },
  { day: 14, gift: "Golden Turkey", caseId: "golden-turkey" },
];

/** The calendar day the player's on. */
export const TODAY = 6;

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
