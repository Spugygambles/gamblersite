"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { FairDialog, GameFrame, History, HowTo, Readout, Tools, kit } from "@/components/game/kit";
import { CoinIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import { CASES, caseBySlug, riskOf, spinCase, type CaseDef, type CaseItem } from "@/lib/cases";
import { wagered } from "@/lib/gems";
import { takeNonce } from "@/lib/seeds";
import { TIERS, tierOf } from "@/lib/tiers";
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import CaseImage from "./CaseImage";
import Reel from "./Reel";
import styles from "./Cases.module.css";

type Phase = "idle" | "spinning" | "done";
type Past = { id: number; text: string; won: boolean | null };

const HISTORY = 12;
const pct = (odds: number) => `${(odds * 100).toFixed(odds < 0.001 ? 3 : 2)}%`;

// the list's ways of being shown
type Risk = "all" | "high" | "low";
type Sort = "high" | "low" | "name";
const RISKS: [Risk, string][] = [
  ["all", "All"],
  ["high", "High Risk"],
  ["low", "Low Risk"],
];
// a case's risk, as a band and its colour: green, blue, yellow, red
function riskBand(r: number): [string, string] {
  return r < 0.33 ? ["low", "#49c56a"] : r < 0.6 ? ["fair", "#4e8de0"] : r < 0.8 ? ["high", "#e9b949"] : ["extreme", "#e3415e"];
}

// ?case=<slug> on the page's address picks a case; the server has no address
const noSubscribe = () => () => {};
const queriedCase = () => (typeof location === "undefined" ? null : new URLSearchParams(location.search).get("case"));

/**
 * Case opening. Pick a case, open it for its price, and the reel stops on
 * the skin it gives. The skin's
 * value goes straight to the balance, the site having no inventory yet.
 * Each case lists everything inside with the odds. The item comes from the
 * shared provably-fair seeds (lib/cases.ts).
 */
export default function CaseOpening() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const queried = useSyncExternalStore(noSubscribe, queriedCase, () => null);
  const [chosen, setChosen] = useState<string | null>(null);
  const slug = chosen ?? (queried && caseBySlug(queried) ? queried : CASES[0].slug);
  const selected = caseBySlug(slug) ?? CASES[0];

  const [phase, setPhase] = useState<Phase>("idle");
  const [fast, setFast] = useState(false);
  const [winner, setWinner] = useState<CaseItem | null>(null);
  const [spinSeed, setSpinSeed] = useState(1);
  const [result, setResult] = useState<{ item: CaseItem; from: CaseDef } | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<Risk>("all");
  const [sort, setSort] = useState<Sort>("high");
  const live = useRef<{ phase: Phase; item: CaseItem | null; from: CaseDef | null }>({ phase: "idle", item: null, from: null });
  const pastId = useRef(0);

  const spinning = phase === "spinning";
  const canOpen = !spinning && balance >= selected.price;
  const why = spinning ? "" : balance < selected.price ? "Not enough balance" : "";

  const pickCase = (s: string) => {
    if (spinning) return;
    setChosen(s);
    setResult(null);
    setNote("");
    setPhase("idle");
    live.current = { phase: "idle", item: null, from: null };
  };

  const open = () => {
    if (!canOpen || live.current.phase === "spinning") return;
    const c = selected;
    addToBalance(-c.price);
    wagered(c.price);
    const s = takeNonce();
    const item = spinCase(c, s.serverSeed, s.clientSeed, s.nonce);
    live.current = { phase: "spinning", item, from: c };
    setWinner(item);
    setSpinSeed(s.nonce + 1);
    setResult(null);
    setNote("");
    setPhase("spinning");
  };

  // the reel's stopped: the skin is sold to the balance
  const settle = () => {
    const { item, from } = live.current;
    if (live.current.phase !== "spinning" || !item || !from) return;
    addToBalance(item.skin.price);
    recordOutcome(Math.round(item.skin.price - from.price));
    live.current = { phase: "done", item, from };
    setPhase("done");
    setResult({ item, from });
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: money.format(item.skin.price), won: item.skin.price >= from.price }, ...h].slice(0, HISTORY));
    setNote(`Unboxed ${item.skin.name}, sold for ${money.format(item.skin.price)}`);
  };

  const best = selected.items[0];

  // the list as asked for: by name, by risk, in order
  const wanted = query.trim().toLowerCase();
  const shown = CASES.filter((c) => (!wanted || c.name.toLowerCase().includes(wanted)) && (risk === "all" || (risk === "high" ? riskOf(c) >= 0.5 : riskOf(c) < 0.5))).sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "low" ? a.price - b.price : b.price - a.price));

  return (
    <div className={styles.wrap} data-cases data-phase={phase} data-selected-case={selected.slug}>
      <GameFrame
        controls={
          <>
            <div className={styles.chosen}>
              <span className={kit.fieldLabel}>Case</span>
              <span className={styles.chosenName} data-chosen-name>
                {selected.name}
              </span>
            </div>
            <Readout
              label="Price"
              value={
                <>
                  <CoinIcon />
                  {money.format(selected.price)}
                </>
              }
              attr="data-price"
            />
            <div className={kit.readouts}>
              <Readout
                label="Pays on average"
                value={
                  <>
                    <CoinIcon />
                    {money.format(selected.value)}
                  </>
                }
              />
              <Readout label={`Best drop, ${pct(best.odds)}`} value={<span className={styles.bestName}>{best.skin.name}</span>} />
            </div>
            <div className={kit.go}>
              <button type="button" className={kit.primary} disabled={!canOpen} onClick={open} data-open>
                {spinning ? "Opening…" : `Open for ${money.format(selected.price)}`}
              </button>
              <button type="button" className={kit.iconButton} aria-pressed={fast} aria-label="Fast open" title="Fast open" onClick={() => setFast(!fast)} data-fast>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
                </svg>
              </button>
            </div>
            {why && (
              <p className={kit.why} data-why>
                {why}
              </p>
            )}
            <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
          </>
        }
        stage={
          <>
            <History items={history} label="Last drops" />
            <div className={styles.stageBody}>
              <div className={styles.caseHead}>
                <span className={styles.caseArt}>
                  <CaseImage slug={selected.slug} image={selected.image} width={200} height={150} />
                </span>
                <div className={styles.caseText}>
                  <h2 className={styles.caseName}>{selected.name}</h2>
                  <p className={styles.caseMeta}>
                    {selected.items.length} skins inside, worth {money.format(selected.items[selected.items.length - 1].skin.price)} to{" "}
                    {money.format(best.skin.price)}
                  </p>
                </div>
              </div>
              <Reel items={selected.items} winner={winner} spinning={spinning} fast={fast} seed={spinSeed} onDone={settle} label={`${selected.name} reel`} casePrice={selected.price} />
              {result && (
                <div
                  className={styles.result}
                  style={{ "--tier": TIERS[tierOf(result.item.skin.price, selected.price)].color } as CSSProperties}
                  data-result
                  data-skin={result.item.skin.slug}
                  data-value={result.item.skin.price}
                  data-tier={tierOf(result.item.skin.price, selected.price)}
                >
                  <span className={styles.resultArt}>
                    <SkinArt skin={result.item.skin} />
                  </span>
                  <span className={styles.resultText}>
                    <span className={styles.resultName}>{result.item.skin.name}</span>
                    <span className={styles.resultOdds}>
                      {result.item.skin.rarity} · {pct(result.item.odds)} odds
                    </span>
                  </span>
                  <span className={`${styles.resultPrice} tabular`}>
                    <CoinIcon />
                    {money.format(result.item.skin.price)}
                    <small>sold to your balance</small>
                  </span>
                </div>
              )}
            </div>
            <p className={kit.stageNote} aria-live="polite" data-note>
              {note}
            </p>
          </>
        }
      />

      <section className={styles.section} aria-labelledby="cases-all">
        <div className={styles.gridHead}>
          <h2 id="cases-all" className={styles.heading}>
            All cases <small data-case-count>({shown.length})</small>
          </h2>
          <div className={styles.controls}>
            <label className={styles.search}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input type="search" placeholder="Search by case name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search by case name" data-case-search />
            </label>
            <div className={styles.riskTabs} role="tablist" aria-label="Risk">
              {RISKS.map(([id, label]) => (
                <button key={id} type="button" role="tab" className={styles.riskTab} aria-selected={risk === id} onClick={() => setRisk(id)} data-risk-tab={id}>
                  {label}
                </button>
              ))}
            </div>
            <label className={styles.sort}>
              Sort by:
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} data-case-sort>
                <option value="high">Price High-Low</option>
                <option value="low">Price Low-High</option>
                <option value="name">Name A-Z</option>
              </select>
            </label>
          </div>
        </div>
        <ul className={styles.cases} data-case-grid>
          {shown.map((c) => {
            const r = riskOf(c);
            const [band, color] = riskBand(r);
            return (
              <li key={c.slug}>
                <button type="button" className={styles.caseCard} aria-pressed={c.slug === selected.slug} disabled={spinning} onClick={() => pickCase(c.slug)} data-case={c.slug} data-selected={c.slug === selected.slug || undefined}>
                  <span className={styles.cardArt}>
                    <CaseImage slug={c.slug} image={c.image} width={160} height={120} />
                  </span>
                  <span className={styles.cardName}>{c.name}</span>
                  <span className={`${styles.cardPrice} tabular`}>
                    <CoinIcon />
                    {money.format(c.price)}
                  </span>
                  <span className={styles.risk} style={{ "--pos": `${Math.round(8 + r * 84)}%`, "--risk": color } as CSSProperties} title={`Risk: ${band}`} data-risk={band}>
                    <i />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {shown.length === 0 && <p className={styles.none}>No case by that name.</p>}
      </section>

      <section className={styles.section} aria-labelledby="cases-inside">
        <h2 id="cases-inside" className={styles.heading}>
          Inside {selected.name}
        </h2>
        <ul className={styles.contents} data-contents>
          {selected.items.map((it) => (
            <li key={it.skin.slug} className={styles.item} style={{ "--tier": TIERS[tierOf(it.skin.price, selected.price)].color } as CSSProperties} data-tier={tierOf(it.skin.price, selected.price)}>
              <span className={styles.itemArt}>
                <SkinArt skin={it.skin} />
              </span>
              <span className={styles.itemName}>{it.skin.finish}</span>
              <span className={styles.itemWeapon}>{it.skin.weapon}</span>
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
      </section>

      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={spinning}
          intro="One draw decides which skin a case gives, against the odds listed under it."
          verify={(server, client, nonce) => {
            const it = spinCase(selected, server, client, nonce);
            return `${selected.name} lands on ${it.skin.name} (${money.format(it.skin.price)}) for that nonce`;
          }}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How cases work"
          onClose={() => setDialog(null)}
          steps={[
            "Pick a case from the list. Everything inside it, and the odds of each skin, are shown underneath.",
            "Open it for its price.",
            "The reel runs and stops on your skin. Its value is sold to your balance straight away, since the site has no inventory yet.",
            "A case costs what it pays on average plus the house's 10%, and every drop can be checked under Provably fair.",
          ]}
        />
      )}
    </div>
  );
}
