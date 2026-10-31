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
 * where the name is cut off, the fourth entry names the picture. Only the
 * pictures listed in ITEM_PICTURES are in; an item without one shows a
 * drawn stand-in until its picture comes.
 *
 * An item can be worth a different amount in two cases: each case keeps the
 * value it was listed at. Holy Hair down to Inferno Royale came from a video
 * of Rostake's dollar prices, their names written out in full; the rest are
 * as Rostake's case pages show them.
 */

/** Robux to the dollar, as Rostake counts them. */
export const ROSTAKE_ROBUX_PER_USD = 500;

export type Content = [name: string, robux: number, percent: number, picture?: string];

/** The items whose pictures are in, as public/items/<slug>.webp; the rest show a stand-in. */
export const ITEM_PICTURES = new Set([
  "black-iron-king-of-the-night",
  "black-sparkle-time-fedora",
  "blue-clockwork-headphones",
  "cardinal-fedora",
  "cw-ultimate-amethyst-addiction",
  "cw-ultimate-emerald-entropy",
  "cw-ultimate-rose-quartz-rebellion",
  "cw-ultimate-ruby-rapture",
  "cw-ultimate-wulfinite-will",
  "dominus-infernus",
  "fiery-horns-of-the-netherworld",
  "firebrand",
  "frozen-horns-of-the-frigid-planes",
  "fuchsia-fantastique",
  "green-sparkle-time-fedora",
  "knee-busting-knife-of-madness",
  "midnight-blue-shaggy",
  "midnight-blue-sparkle-time-fedora",
  "mystic-sword-of-the-flames",
  "pastel-rainbow-shaggy",
  "perfectly-legitimate-business-hat",
  "purple-sparkle-time-fedora",
  "rainbow-fedora",
  "rainbow-shaggy",
  "red-sparkle-time-fedora",
  "sinister-fedora",
  "sky-blue-sparkle-time-fedora",
  "sparkle-time-fedora",
  "stickmasterlukes-peanut-butter-sparkle-time",
  "striped-red-fedora",
  "telamon-hair",
  "the-void-star",
  "tix-shaggy",
  "wc-ultimates-aquamarine-attitude",
  "wc-ultimates-garnet-gratitude",
  "wc-ultimates-pink-diamond-distraction",
  "white-sparkle-time-fedora",
  "wings-of-fire",
]);

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
  "ultimate-50-50": [
    ["Steampunk Bobbie", 1758699, 5],
    ["A Dark Presence", 1656993, 10],
    ["Hooded Spacelord", 1559293, 15],
    ["Dark Assassin", 1371499, 20],
    ["Gucci Dionysus Bag", 365, 10],
    ["Gucci Spiked Baske...", 310, 10],
    ["Gucci Horsebit 1955...", 291, 10],
    ["Gucci Geometric Bag", 251, 10],
    ["Gucci GG Marmont ...", 209, 10],
  ],
  "midas-touch": [
    ["Bling $$ Necklace", 10045444, 1],
    ["Dominus Aureus", 6287191, 2],
    ["Dominus Pittacium", 4536989, 2],
    ["): Gold Ollie", 2854081, 5],
    ["Golden Antlers", 391171, 22.5],
    ["Gold King of the Nig...", 271196, 22.5],
    ["Grimgold Periastron...", 212475, 22.5],
    ["Golden Crown of W...", 45603, 22.5],
  ],
  "astra-dreams": [
    ["Dominus Astra", 14321557, 1],
    ["Archduke of the Fe...", 8008237, 2.5],
    ["CW Ultimate: Sapph...", 749405, 8],
    ["): Purple Indy", 623370, 10],
    ["Hooded Spacelord", 290715, 15],
    ["Purple Queen of the...", 149213, 28],
    ["Beautiful Hair for Be...", 6593, 35.5],
  ],
  "federation-case": [
    ["Duke of the Federat...", 12469832, 0.5],
    ["Archduke of the Fe...", 8008237, 1],
    ["Earl of the Federation", 3222834, 1.5],
    ["Disgraced Baron of ...", 2352361, 2],
    ["Countess of the Fe...", 2294176, 2.5],
    ["Duke of the Fallen F...", 1402140, 3],
    ["Disgraced Starston...", 364985, 39.5],
    ["Emerald Starstone ...", 85343, 50],
  ],
  "after-life": [
    ["Eerie Pumpkin Head", 6275664, 2],
    ["Ghosdeeri", 1187251, 8.5],
    ["Eyes of Emeraldwra...", 1119314, 10],
    ["Ghostwalker", 1043436, 9.5],
    ["Masked Hood of th...", 102157, 10],
    ["The Riddling Skull", 7418, 15],
    ["Not-so-friendly Gh...", 625, 20],
    ["Evil Scarecrow", 95, 25],
  ],
};
