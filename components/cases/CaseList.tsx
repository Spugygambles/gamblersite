"use client";

import type { CSSProperties, MouseEvent } from "react";
import { CoinIcon } from "@/components/home/icons";
import { CASES, riskOf } from "@/lib/cases";
import { money } from "@/lib/upgrader";
import CaseImage from "./CaseImage";
import styles from "./Cases.module.css";

export type Risk = "all" | "high" | "low";
export type Sort = "high" | "low" | "name";

const RISKS: [Risk, string][] = [
  ["all", "All"],
  ["high", "High Risk"],
  ["low", "Low Risk"],
];

// a case's risk, as a band and its colour: green, blue, yellow, red
function riskBand(r: number): [string, string] {
  return r < 0.33 ? ["low", "#49c56a"] : r < 0.6 ? ["fair", "#4e8de0"] : r < 0.8 ? ["high", "#e9b949"] : ["extreme", "#e3415e"];
}

/**
 * Every case, as a grid to pick from: searched by name, cut to the high or
 * the low risk ones, in an order. A case opens on its own page, the address
 * saying which (?case=<slug>), so it can be linked to and Back comes here.
 */
export default function CaseList({
  query,
  risk,
  sort,
  onQuery,
  onRisk,
  onSort,
  onOpen,
}: {
  query: string;
  risk: Risk;
  sort: Sort;
  onQuery: (q: string) => void;
  onRisk: (r: Risk) => void;
  onSort: (s: Sort) => void;
  onOpen: (slug: string) => void;
}) {
  const wanted = query.trim().toLowerCase();
  const shown = CASES.filter((c) => (!wanted || c.name.toLowerCase().includes(wanted)) && (risk === "all" || (risk === "high" ? riskOf(c) >= 0.5 : riskOf(c) < 0.5))).sort((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : sort === "low" ? a.price - b.price : b.price - a.price,
  );

  // a plain click opens the case here; a click for a new tab is the browser's
  const follow = (e: MouseEvent, slug: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onOpen(slug);
  };

  return (
    <section className={styles.list} aria-labelledby="cases-title" data-case-list>
      <h2 id="cases-title" className={styles.title}>
        Cases <small data-case-count>({shown.length})</small>
      </h2>
      <div className={styles.listBar}>
        <label className={styles.search}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input type="search" placeholder="Search by case name" value={query} onChange={(e) => onQuery(e.target.value)} aria-label="Search by case name" data-case-search />
        </label>
        <div className={styles.riskTabs} role="tablist" aria-label="Risk">
          {RISKS.map(([id, label]) => (
            <button key={id} type="button" role="tab" className={styles.riskTab} aria-selected={risk === id} onClick={() => onRisk(id)} data-risk-tab={id}>
              {label}
            </button>
          ))}
        </div>
        <label className={styles.sort}>
          Sort by:
          <select value={sort} onChange={(e) => onSort(e.target.value as Sort)} data-case-sort>
            <option value="high">Price High-Low</option>
            <option value="low">Price Low-High</option>
            <option value="name">Name A-Z</option>
          </select>
        </label>
      </div>
      <ul className={styles.cases} data-case-grid>
        {shown.map((c) => {
          const r = riskOf(c);
          const [band, color] = riskBand(r);
          return (
            <li key={c.slug}>
              <a href={`?case=${c.slug}`} className={styles.caseCard} onClick={(e) => follow(e, c.slug)} data-case={c.slug}>
                <span className={styles.cardArt}>
                  <CaseImage slug={c.slug} image={c.image} width={180} height={135} />
                </span>
                <span className={styles.cardName}>{c.name}</span>
                <span className={`${styles.cardPrice} tabular`}>
                  <CoinIcon />
                  {money.format(c.price)}
                </span>
                <span className={styles.risk} style={{ "--pos": `${Math.round(8 + r * 84)}%`, "--risk": color } as CSSProperties} title={`Risk: ${band}`} data-risk={band}>
                  <i />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className={styles.none}>No case by that name.</p>}
    </section>
  );
}
