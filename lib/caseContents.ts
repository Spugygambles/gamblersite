/*
 * What's in the cases whose contents are in so far, as Rostake shows them:
 * each item's name as its card shows it (a long one is cut off with "..."),
 * its value in Robux as Rostake counts them, and its chance of dropping in
 * percent. Rostake counts 500 Robux to the dollar; the site has its own
 * rate (lib/robux.ts), so each value goes into dollars and back out in the
 * site's Robux. A case with contents is priced from them, so the house
 * keeps 10% (lib/cases.ts).
 *
 * An item's picture is public/items/<slug>.webp, the slug of its name;
 * where the name is cut off, the fourth entry names the picture.
 *
 * An item can be worth a different amount in two cases: each case keeps the
 * value it was listed at. Holy Hair down to Inferno Royale came from a video
 * of Rostake's dollar prices, their names written out in full.
 */

/** Robux to the dollar, as Rostake counts them. */
export const ROSTAKE_ROBUX_PER_USD = 500;

export type Content = [name: string, robux: number, percent: number, picture?: string];

export const CONTENTS: Record<string, Content[]> = {
  "e-boy-case": [
    ["Sky Blue Sparkle Ti...", 12004176, 2, "sky-blue-sparkle-time-fedora"],
    ["Black Iron King of t...", 7303279, 5, "black-iron-king-of-the-night"],
    ["White Sparkle Time ...", 3410356, 6, "white-sparkle-time-fedora"],
    ["The Void Star", 3255482, 10],
    ["Frozen Horns of the...", 2250666, 17, "frozen-horns-of-the-frigid-planes"],
    ["Knee Busting Knife ...", 1, 60, "knee-busting-knife-of-madness"],
  ],
  "holy-hair": [
    ["Rainbow Shaggy", 13928210, 5],
    ["Telamon Hair", 2396670, 7],
    ["Tix Shaggy", 2371585, 8],
    ["Pastel Rainbow Shaggy", 1849020, 10],
    ["Fuchsia Fantastique", 285500, 10],
    ["Midnight Blue Shaggy", 190830, 20],
    ["Stickmasterluke's Peanut Butter Sparkle Time", 106485, 40],
  ],
  "fedora-fiasco": [
    ["Midnight Blue Sparkle Time Fedora", 11328840, 1],
    ["Purple Sparkle Time Fedora", 10888100, 1.5],
    ["Black Sparkle Time Fedora", 5814995, 2.5],
    ["Green Sparkle Time Fedora", 4927740, 3],
    ["Red Sparkle Time Fedora", 4871495, 3],
    ["White Sparkle Time Fedora", 3012740, 4],
    ["Sparkle Time Fedora", 1645125, 5],
    ["Sinister Fedora", 104380, 5],
    ["Rainbow Fedora", 62630, 5],
    ["Cardinal Fedora", 12860, 15],
    ["Striped Red Fedora", 4530, 25],
    ["Perfectly Legitimate Business Hat", 3950, 30],
  ],
  "max-volume": [
    ["CW Ultimate: Ruby Rapture", 5821410, 4.5],
    ["WC Ultimates: Pink Diamond Distraction", 4538630, 3.5],
    ["WC Ultimates: Aquamarine Attitude", 4238630, 3],
    ["CW Ultimate: Emerald Entropy", 3066500, 2.5],
    ["WC Ultimates - Garnet Gratitude", 2749040, 2.5],
    ["CW Ultimate: Wulfinite Will", 1915995, 1.5],
    ["CW Ultimate: Rose Quartz Rebellion", 1826220, 1.5],
    ["CW Ultimate: Amethyst Addiction", 1495700, 1],
    ["Blue Clockwork Headphones", 6075, 80],
  ],
  "inferno-royale": [
    ["Dominus Infernus", 14973085, 4],
    ["Fiery Horns of the Netherworld", 2329060, 5],
    ["CW Ultimate: Wulfinite Will", 915995, 6],
    ["Firebrand", 411325, 7],
    ["Mystic Sword of the Flames", 31995, 8],
    ["Wings of Fire", 750, 70],
  ],
};
