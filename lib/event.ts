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

/** How the player's hunt is going. */
export const MY_HUNT = {
  turkeys: 7,
  leaves: PLAYER.leaves,
  rank: 48,
  hunters: 2914,
};

export type RewardKind = "leaves" | "case" | "coins" | "badge" | "cup";

/** Rewards for turkeys caught, given out as each count is reached. */
export const MILESTONES: { turkeys: number; reward: string; kind: RewardKind }[] = [
  { turkeys: 3, reward: "50 leaves", kind: "leaves" },
  { turkeys: 10, reward: "Harvest Case", kind: "case" },
  { turkeys: 25, reward: "2.50 coins", kind: "coins" },
  { turkeys: 50, reward: "Turkey badge", kind: "badge" },
  { turkeys: 100, reward: "25.00 coins", kind: "cup" },
];

/** The shop: what leaves buy. */
export const SHOP: { name: string; about: string; price: number; kind: RewardKind; panel: string }[] = [
  { name: "1.00 coins", about: "Straight onto your balance.", price: 60, kind: "coins", panel: "#26443a" },
  { name: "Race boost", about: "A tenth more race points for a day.", price: 90, kind: "cup", panel: "#33295a" },
  { name: "Harvest Case", about: "A free case with Thanksgiving skins.", price: 120, kind: "case", panel: "#1d3d4c" },
  { name: "Turkey badge", about: "A turkey by your name in chat.", price: 250, kind: "badge", panel: "#4f2430" },
];

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
  "Turkeys can turn up in any game, on bets of 0.10 coins or more.",
  "Click a turkey before it runs off to catch it. Each one pays 5 leaves.",
  "Milestone rewards land on your account as soon as you reach them.",
  "Leaderboard prizes are paid within a day of the hunt ending.",
  "Leaves don't carry over: spend them before the hunt ends.",
  "One account per player. Accounts that abuse the hunt are removed from it.",
];
