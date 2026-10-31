import { KEEP } from "./house";
import { SKINS, type Skin } from "./skins";
import { draws, weighted } from "./fair";

/*
 * The cases: what's in each and the odds, from which the price follows.
 * A case holds skins from a band of values; the dearer a skin, the rarer
 * it is (weight falls with price). A case costs its expected payout over
 * the house's share.
 */

export type CaseItem = { skin: Skin; weight: number; odds: number };
export type CaseDef = {
  slug: string;
  name: string;
  image: string;
  /** Robux. */
  price: number;
  /** Gems, for a case given rather than sold: none now. */
  gems: number | null;
  items: CaseItem[];
  /** What a spin pays on average, in Robux. */
  value: number;
};

const money = (n: number) => Math.round(n);

/** Skins in a band, dearest rarest: weight is price to the minus 1.15. */
function contents(lo: number, hi: number, limit = 14): CaseItem[] {
  const skins = SKINS.filter((s) => s.price >= lo && s.price <= hi)
    .sort((a, b) => b.price - a.price)
    .filter((s, i, all) => all.findIndex((x) => x.slug === s.slug) === i);
  // spread the picks over the band rather than taking the dearest
  const step = Math.max(1, Math.floor(skins.length / limit));
  const chosen = skins.filter((_, i) => i % step === 0).slice(0, limit);
  const weights = chosen.map((s) => Math.pow(s.price, -1.15));
  const total = weights.reduce((a, b) => a + b, 0);
  return chosen.map((skin, i) => ({ skin, weight: weights[i], odds: weights[i] / total }));
}

function build(slug: string, name: string, image: string, band: [number, number], gems: number | null): CaseDef {
  const items = contents(band[0], band[1]);
  const value = money(items.reduce((sum, it) => sum + it.odds * it.skin.price, 0));
  return { slug, name, image, price: gems ? 0 : money(value / KEEP), gems, items, value };
}

export const CASES: CaseDef[] = [
  build("music-box", "Music Box", "/cases/music-box-case-thumb.png", [250, 55000], null),
  build("toxic", "Toxic", "/cases/toxic-case-thumb.png", [1000, 225000], null),
  build("new-year", "New Year", "/cases/new-year-case-thumb.png", [5000, 950000], null),
];

export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);

/** The item a spin lands on: the draw against the odds. */
export function spinCase(c: CaseDef, serverSeed: string, clientSeed: string, nonce: number): CaseItem {
  const [draw] = draws(serverSeed, clientSeed, nonce, 1);
  return c.items[weighted(c.items.map((it) => it.weight), draw)];
}
