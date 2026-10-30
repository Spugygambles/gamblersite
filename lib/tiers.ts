/*
 * An item's tier: what it's worth against the case it came from. Grey is
 * no profit (worth the case's price or less) and gets no glow; blue is a
 * win up to 2.5 times the case, purple up to 6.5 times, gold beyond.
 */

export type Tier = "grey" | "blue" | "purple" | "gold";

export const TIERS: Record<Tier, { color: string; name: string }> = {
  grey: { color: "#8d90b3", name: "No profit" },
  blue: { color: "#4e8de0", name: "Up to 2.5×" },
  purple: { color: "#9a62e0", name: "2.5× to 6.5×" },
  gold: { color: "#e9b949", name: "Over 6.5×" },
};

/** The tier of an item worth `value` from a case costing `casePrice`. */
export function tierOf(value: number, casePrice: number): Tier {
  if (!(casePrice > 0) || value <= casePrice) return "grey";
  const x = value / casePrice;
  return x <= 2.5 ? "blue" : x <= 6.5 ? "purple" : "gold";
}

export const tierColor = (value: number, casePrice: number) => TIERS[tierOf(value, casePrice)].color;
