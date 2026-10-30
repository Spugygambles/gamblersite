import { SKINS, type Skin } from "./skins";

/**
 * The cases in the Gem Vault, cheapest first, each priced in gems and
 * holding skins worth roughly `worth` coins. The renders are the site's
 * own (scripts/event-art renders them).
 */
export type GemCase = { slug: string; name: string; gems: number; image: string; worth: [number, number] };

export const GEM_CASES: GemCase[] = [
  { slug: "pumpkin-patch", name: "Pumpkin Patch", gems: 2, image: "/gems/cases/pumpkin-patch.webp", worth: [250, 6000] },
  { slug: "corn-maze", name: "Corn Maze", gems: 5, image: "/gems/cases/corn-maze.webp", worth: [1000, 15000] },
  { slug: "cranberry-bog", name: "Cranberry Bog", gems: 10, image: "/gems/cases/cranberry-bog.webp", worth: [2500, 30000] },
  { slug: "gravy-boat", name: "Gravy Boat", gems: 25, image: "/gems/cases/gravy-boat.webp", worth: [5000, 75000] },
  { slug: "wishbone", name: "Wishbone", gems: 50, image: "/gems/cases/wishbone.webp", worth: [10000, 150000] },
  { slug: "flannel-season", name: "Flannel Season", gems: 100, image: "/gems/cases/flannel-season.webp", worth: [20000, 300000] },
  { slug: "maple-grove", name: "Maple Grove", gems: 250, image: "/gems/cases/maple-grove.webp", worth: [50000, 750000] },
  { slug: "harvest-moon", name: "Harvest Moon", gems: 1000, image: "/gems/cases/harvest-moon.webp", worth: [200000, 2500000] },
  { slug: "cornucopia", name: "Cornucopia", gems: 5000, image: "/gems/cases/cornucopia.webp", worth: [750000, 6500000] },
  { slug: "golden-feast", name: "Golden Feast", gems: 10000, image: "/gems/cases/golden-turkey.webp", worth: [1500000, 6500000] },
];

/** A look inside a case: the skins in its band, dearest first. */
export const inside = (c: GemCase): Skin[] =>
  SKINS.filter((s) => s.price >= c.worth[0] && s.price <= c.worth[1])
    .sort((a, b) => b.price - a.price)
    .slice(0, 8);
