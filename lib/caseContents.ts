/*
 * What's in the cases whose contents are in so far, as Rostake lists them:
 * each item with its value in dollars and its chance of dropping, in
 * percent. The values show in Robux at the site's rate (lib/robux.ts), and
 * an item's picture is public/items/<slug>.webp. A case not listed here is
 * filled with stand-in skins, its odds tuned to its price (lib/cases.ts).
 *
 * An item can be worth a different amount in two cases: each case keeps the
 * value it was listed at.
 */

export type Content = [name: string, usd: number, percent: number];

export const CONTENTS: Record<string, Content[]> = {
  "e-boy-case": [
    ["Sky Blue Sparkle Time Fedora", 24008.35, 2],
    ["Black Iron King of the Night", 14606.55, 5],
    ["White Sparkle Time Fedora", 6820.71, 6],
    ["The Void Star", 6510.96, 10],
    ["Frozen Horns of the Frigid Planes", 4501.33, 17],
    // listed at no value: it came with a toy code and can't be traded
    ["Knee Busting Knife of Madness", 0, 60],
  ],
  "holy-hair": [
    ["Rainbow Shaggy", 27856.42, 5],
    ["Telamon Hair", 4793.34, 7],
    ["Tix Shaggy", 4743.17, 8],
    ["Pastel Rainbow Shaggy", 3698.04, 10],
    ["Fuchsia Fantastique", 571, 10],
    ["Midnight Blue Shaggy", 381.66, 20],
    ["Stickmasterluke's Peanut Butter Sparkle Time", 212.97, 40],
  ],
  "fedora-fiasco": [
    ["Midnight Blue Sparkle Time Fedora", 22657.68, 1],
    ["Purple Sparkle Time Fedora", 21776.2, 1.5],
    ["Black Sparkle Time Fedora", 11629.99, 2.5],
    ["Green Sparkle Time Fedora", 9855.48, 3],
    ["Red Sparkle Time Fedora", 9742.99, 3],
    ["White Sparkle Time Fedora", 6025.48, 4],
    ["Sparkle Time Fedora", 3290.25, 5],
    ["Sinister Fedora", 208.76, 5],
    ["Rainbow Fedora", 125.26, 5],
    ["Cardinal Fedora", 25.72, 15],
    ["Striped Red Fedora", 9.06, 25],
    ["Perfectly Legitimate Business Hat", 7.9, 30],
  ],
  "max-volume": [
    ["CW Ultimate: Ruby Rapture", 11642.82, 4.5],
    ["WC Ultimates: Pink Diamond Distraction", 9077.26, 3.5],
    ["WC Ultimates: Aquamarine Attitude", 8477.26, 3],
    ["CW Ultimate: Emerald Entropy", 6133, 2.5],
    ["WC Ultimates - Garnet Gratitude", 5498.08, 2.5],
    ["CW Ultimate: Wulfinite Will", 3831.99, 1.5],
    ["CW Ultimate: Rose Quartz Rebellion", 3652.44, 1.5],
    ["CW Ultimate: Amethyst Addiction", 2991.4, 1],
    ["Blue Clockwork Headphones", 12.15, 80],
  ],
  "inferno-royale": [
    ["Dominus Infernus", 29946.17, 4],
    ["Fiery Horns of the Netherworld", 4658.12, 5],
    ["CW Ultimate: Wulfinite Will", 1831.99, 6],
    ["Firebrand", 822.65, 7],
    ["Mystic Sword of the Flames", 63.99, 8],
    ["Wings of Fire", 1.5, 70],
  ],
};
