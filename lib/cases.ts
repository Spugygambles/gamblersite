import { KEEP } from "./house";
import { robuxAt } from "./robux";
import { CASE_LIST } from "./caseList";
import { CONTENTS, ROSTAKE_ROBUX_PER_USD, type Content } from "./caseContents";
import { slugOf } from "./caseList";
import { SKINS, type Item, type Skin } from "./skins";
import { tierColor } from "./tiers";
import { draws, weighted } from "./fair";

/*
 * The cases: what's in each and the odds, and what each costs. A case is
 * priced first (lib/caseList.ts, and New Year below). A case whose
 * contents are in (lib/caseContents.ts) holds those items at their odds and
 * is priced from them instead, so the house keeps its share; the rest hold
 * stand-in skins, their odds tuned so that what a case pays on average is
 * the house's share of its price, the dearer the rarer.
 */

export type CaseItem = { skin: Item; weight: number; odds: number };
export type CaseDef = {
  slug: string;
  name: string;
  /** The picture, when it has one; a drawn case stands in till then. */
  image: string | null;
  /** Robux. */
  price: number;
  items: CaseItem[];
  /** What a spin pays on average, in Robux. */
  value: number;
};

const money = (n: number) => Math.round(n);
const byPrice = [...SKINS].sort((a, b) => a.price - b.price);

/** Up to `limit` skins spread over a band of values, dearest first; a thin band is widened to the nearest skins. */
function pick(lo: number, hi: number, limit = 14): Skin[] {
  let skins = byPrice.filter((s) => s.price >= lo && s.price <= hi);
  if (skins.length < 8) {
    const mid = Math.sqrt(lo * hi);
    skins = [...byPrice].sort((a, b) => Math.abs(Math.log(a.price / mid)) - Math.abs(Math.log(b.price / mid))).slice(0, 8);
  }
  skins = [...skins].filter((s, i, all) => all.findIndex((x) => x.slug === s.slug) === i).sort((a, b) => b.price - a.price);
  const step = Math.max(1, Math.floor(skins.length / limit));
  const spread = skins.filter((_, i) => i % step === 0).slice(0, limit - 1);
  // the cheapest always comes, so the odds can lean down to it
  const cheapest = skins[skins.length - 1];
  return spread.includes(cheapest) ? spread : [...spread, cheapest];
}

/** Weights that fall with price as price^-a, as odds. */
function oddsAt(skins: Skin[], a: number): CaseItem[] {
  const weights = skins.map((s) => Math.pow(s.price, -a));
  const total = weights.reduce((x, y) => x + y, 0);
  return skins.map((skin, i) => ({ skin, weight: weights[i], odds: weights[i] / total }));
}

const valueOf = (items: CaseItem[]) => items.reduce((sum, it) => sum + it.odds * it.skin.price, 0);

/** The odds that make the skins pay `target` on average: the steepness found by halving. */
function oddsFor(skins: Skin[], target: number): CaseItem[] {
  let lo = -3;
  let hi = 14;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (valueOf(oddsAt(skins, mid)) > target) lo = mid;
    else hi = mid;
  }
  return oddsAt(skins, (lo + hi) / 2);
}

/** A case priced first, its odds tuned to pay the house's share of that price. */
function buildTo(slug: string, name: string, price: number, image: string | null): CaseDef {
  const items = oddsFor(pick(price / 30, price * 20), price * KEEP);
  return { slug, name, image, price, items, value: money(valueOf(items)) };
}

/**
 * A case holding the items it's listed with, at the odds listed: tickets
 * out of 100,000, as Rostake counts them, so a 2.5% item holds 2,500. It's
 * priced from what it pays back on average, so the house keeps its share.
 */
function fromContents(slug: string, name: string, image: string | null, contents: Content[]): CaseDef {
  const weights = contents.map(([, , percent]) => Math.round(percent * 1000));
  const total = weights.reduce((x, y) => x + y, 0);
  const values = contents.map(([, robux]) => robuxAt(robux / ROSTAKE_ROBUX_PER_USD));
  const paid = values.reduce((sum, v, i) => sum + (v * weights[i]) / total, 0);
  const price = Math.round(paid / KEEP);
  const items = contents.map(([itemName, , , picture], i): CaseItem => {
    const itemSlug = slugOf(itemName);
    const skin: Item = { slug: itemSlug, name: itemName, weapon: "", finish: itemName, price: values[i], rarity: "", color: tierColor(values[i], price), kind: "accessory", image: `/items/${picture ?? itemSlug}.webp` };
    return { skin, weight: weights[i], odds: weights[i] / total };
  });
  return { slug, name, image, price, items, value: money(paid) };
}

const build = (slug: string, name: string, price: number, image: string | null) =>
  CONTENTS[slug] ? fromContents(slug, name, image, CONTENTS[slug]) : buildTo(slug, name, price, image);

export const CASES: CaseDef[] = [
  build("new-year", "New Year", robuxAt(47.63), "/cases/new-year-case-thumb.png"),
  ...CASE_LIST.map((c) => build(c.slug, c.name, c.price, c.image ?? null)),
];

/** The cases whose real contents are in. */
export const hasContents = (c: CaseDef) => c.slug in CONTENTS;

export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);

/** The chance a spin pays back at least the case's price. */
export const profitChance = (c: CaseDef) => c.items.reduce((sum, it) => sum + (it.skin.price >= c.price ? it.odds : 0), 0);

/**
 * How much of a gamble a case is, 0 to 1: a spin that pays back three
 * times in ten or more is no risk at all, one in ten is all risk.
 */
export const riskOf = (c: CaseDef) => Math.min(1, Math.max(0, (0.3 - profitChance(c)) / 0.2));

/** The item a spin lands on: the draw against the odds. */
export function spinCase(c: CaseDef, serverSeed: string, clientSeed: string, nonce: number): CaseItem {
  const [draw] = draws(serverSeed, clientSeed, nonce, 1);
  return c.items[weighted(c.items.map((it) => it.weight), draw)];
}
