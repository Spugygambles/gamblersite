"use client";

import { useState, type CSSProperties } from "react";
import CaseImage from "@/components/cases/CaseImage";
import { kit } from "@/components/game/kit";
import { CoinIcon, EyeIcon, ChevronIcon } from "@/components/home/icons";
import { Modal } from "@/components/mines/Dialogs";
import SkinArt from "@/components/upgrader/SkinArt";
import { COIN_CASES, MAX_ROUNDS, costOf } from "@/lib/battles";
import type { CaseDef } from "@/lib/cases";
import { TIERS, tierOf } from "@/lib/tiers";
import { money } from "@/lib/upgrader";
import styles from "./AddCases.module.css";

/** The price bands the list can be cut to, in Robux: the top is left out. */
export const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Any", min: 0, max: Infinity },
  { label: "Under 1,000", min: 0, max: 1000 },
  { label: "1,000 – 10,000", min: 1000, max: 10000 },
  { label: "10,000 – 50,000", min: 10000, max: 50000 },
  { label: "50,000 – 250,000", min: 50000, max: 250000 },
  { label: "250,000+", min: 250000, max: Infinity },
];

export type PickSort = "high" | "low" | "az" | "za";

const byName = (a: CaseDef, b: CaseDef) => a.name.localeCompare(b.name);

export const PICK_SORTS: Record<PickSort, { label: string; order: (a: CaseDef, b: CaseDef) => number }> = {
  high: { label: "Price (High To Low)", order: (a, b) => b.price - a.price || byName(a, b) },
  low: { label: "Price (Low To High)", order: (a, b) => a.price - b.price || byName(a, b) },
  az: { label: "Name (A To Z)", order: byName },
  za: { label: "Name (Z To A)", order: (a, b) => byName(b, a) },
};

/** The cases that match a search and a price band, in the order asked for. */
export function pickList(cases: CaseDef[], query: string, range: number, sort: PickSort) {
  const q = query.trim().toLowerCase();
  const { min, max } = PRICE_RANGES[range] ?? PRICE_RANGES[0];
  return cases.filter((c) => c.price >= min && c.price < max && (!q || c.name.toLowerCase().includes(q))).sort(PICK_SORTS[sort].order);
}

const pct = (odds: number) => `${(odds * 100).toFixed(odds < 0.001 ? 3 : 2)}%`;

/** The orange box on the window's title. */
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden className={styles.box}>
    <path d="M12 2.5 3 7l9 4.5L21 7z" fill="#f2a964" />
    <path d="M3 7v10l9 4.5v-10z" fill="#c86d31" />
    <path d="M21 7v10l-9 4.5v-10z" fill="#e58a47" />
    <path d="M3 7v4l9 4.5v-4z" fill="#b85f27" />
    <path d="M21 7v4l-9 4.5v-4z" fill="#d87a39" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

/**
 * The Add Cases window: every case a battle can be fought over, cut by a
 * search and a price band and put in order. A click on a case adds it to
 * the battle (the pill that appears takes one away or adds another), the
 * eye shows what's inside, and the bottom keeps count.
 */
export default function AddCases({
  picked,
  onAdd,
  onLess,
  onClose,
}: {
  picked: CaseDef[];
  onAdd: (c: CaseDef) => void;
  /** Takes the last one of the case out of the battle. */
  onLess: (c: CaseDef) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(0);
  const [sort, setSort] = useState<PickSort>("high");
  const [viewing, setViewing] = useState<CaseDef | null>(null);
  const shown = pickList(COIN_CASES, query, range, sort);
  const full = picked.length >= MAX_ROUNDS;
  const countOf = (c: CaseDef) => picked.filter((p) => p.slug === c.slug).length;

  return (
    <>
      <Modal
        title={
          <span className={styles.title}>
            <BoxIcon /> Add Cases
          </span>
        }
        label="Add Cases"
        onClose={onClose}
        full
      >
        <div className={styles.window} data-picker>
          <div className={styles.bar}>
            <div className={styles.tabs} role="tablist" aria-label="Case list">
              <button type="button" role="tab" className={styles.tab} aria-selected="true">
                Original
              </button>
            </div>
            <label className={styles.select}>
              <span>Price Range:</span>
              <b data-pick-range-label>{PRICE_RANGES[range].label}</b>
              <ChevronIcon />
              <select className={styles.cover} value={range} aria-label="Price range" onChange={(e) => setRange(Number(e.target.value))} data-pick-range>
                {PRICE_RANGES.map((r, i) => (
                  <option key={r.label} value={i}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              <span>Sort:</span>
              <b data-pick-sort-label>{PICK_SORTS[sort].label}</b>
              <ChevronIcon />
              <select className={styles.cover} value={sort} aria-label="Sort" onChange={(e) => setSort(e.target.value as PickSort)} data-pick-sort>
                {(Object.keys(PICK_SORTS) as PickSort[]).map((id) => (
                  <option key={id} value={id}>
                    {PICK_SORTS[id].label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.search}>
              <SearchIcon />
              <input type="search" placeholder="Search for cases..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search for cases" data-pick-search />
            </label>
          </div>

          <ul className={styles.grid} aria-label="Cases" data-pick-grid>
            {shown.map((c) => {
              const n = countOf(c);
              return (
                <li key={c.slug} className={styles.case} data-pick={c.slug} data-picked={n > 0 ? n : undefined}>
                  <button type="button" className={styles.add} aria-label={`Add ${c.name}, ${money.format(c.price)}`} disabled={full} onClick={() => onAdd(c)} data-add-case={c.slug}>
                    <span className={styles.art}>
                      <CaseImage slug={c.slug} image={c.image} width={220} height={165} />
                    </span>
                    <span className={styles.name}>{c.name}</span>
                    <span className={`${styles.price} tabular`}>
                      <CoinIcon />
                      {money.format(c.price)}
                    </span>
                  </button>
                  <button type="button" className={styles.view} aria-label={`What's inside ${c.name}`} title="What's inside" onClick={() => setViewing(c)} data-pick-view={c.slug}>
                    <EyeIcon />
                  </button>
                  {n > 0 && (
                    <span className={styles.count}>
                      <button type="button" className={styles.step} aria-label={`One ${c.name} fewer`} onClick={() => onLess(c)} data-less-case={c.slug}>
                        −
                      </button>
                      <b className="tabular" data-count={n}>
                        {n}
                      </b>
                      <button type="button" className={styles.step} aria-label={`One ${c.name} more`} disabled={full} onClick={() => onAdd(c)} data-more-case={c.slug}>
                        +
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
            {shown.length === 0 && (
              <li className={styles.none} data-pick-none>
                No case by that name{range ? " in that price range" : ""}.
              </li>
            )}
          </ul>

          <div className={styles.foot}>
            <span className={styles.sum}>
              Total cases: <b data-pick-count>{picked.length}</b>
            </span>
            <span className={styles.sum}>
              Total selected:{" "}
              <b className="tabular">
                <CoinIcon />
                <span data-pick-total>{money.format(costOf(picked))}</span>
              </b>
            </span>
            <button type="button" className={`${kit.primary} ${styles.go}`} onClick={onClose} data-picker-done>
              Continue
            </button>
          </div>
        </div>
      </Modal>

      {viewing && (
        <Modal
          title={
            <span className={styles.title}>
              <CaseImage slug={viewing.slug} image={viewing.image} width={44} height={33} /> {viewing.name}
            </span>
          }
          label={`Inside ${viewing.name}`}
          onClose={() => setViewing(null)}
          wide
        >
          <p className={styles.insideNote}>
            {viewing.items.length} items inside, {money.format(viewing.price)} a round. The odds under each are the chance a round drops it.
          </p>
          <ul className={styles.inside} aria-label={`Inside ${viewing.name}`} data-case-inside>
            {viewing.items.map((it) => (
              <li key={it.skin.slug} className={styles.item} style={{ "--tier": TIERS[tierOf(it.skin.price, viewing.price)].color } as CSSProperties}>
                <span className={styles.itemArt}>
                  <SkinArt skin={it.skin} />
                </span>
                <span className={styles.itemName}>{it.skin.finish}</span>
                {it.skin.weapon && <span className={styles.itemWeapon}>{it.skin.weapon}</span>}
                <span className={styles.itemFoot}>
                  <span className={`${styles.itemPrice} tabular`}>
                    <CoinIcon />
                    {money.format(it.skin.price)}
                  </span>
                  <span className={`${styles.itemOdds} tabular`}>{pct(it.odds)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.insideFoot}>
            <button
              type="button"
              className={`${kit.primary} ${styles.go}`}
              disabled={full}
              onClick={() => {
                onAdd(viewing);
                setViewing(null);
              }}
              data-inside-add
            >
              Add to battle
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
