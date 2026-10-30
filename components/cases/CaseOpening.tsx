"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { FairDialog, GameFrame, History, HowTo, Readout, Tools, kit } from "@/components/game/kit";
import { CoinIcon, GemIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import { CASES, caseBySlug, spinCase, type CaseDef, type CaseItem } from "@/lib/cases";
import { consumeClaimed, useGems, wagered } from "@/lib/gems";
import { count } from "@/lib/home";
import { takeNonce } from "@/lib/seeds";
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import Reel from "./Reel";
import styles from "./Cases.module.css";

type Phase = "idle" | "spinning" | "done";
type Past = { id: number; text: string; won: boolean | null };

const HISTORY = 12;
const pct = (odds: number) => `${(odds * 100).toFixed(odds < 0.001 ? 3 : 2)}%`;

// ?case=<slug> on the page's address picks a case; the server has no address
const noSubscribe = () => () => {};
const queriedCase = () => (typeof location === "undefined" ? null : new URLSearchParams(location.search).get("case"));

/**
 * Case opening. Pick a case, open it for its price (or use one claimed in
 * the Gem Vault), and the reel stops on the skin it gives. The skin's
 * value goes straight to the balance, the site having no inventory yet.
 * Each case lists everything inside with the odds. The item comes from the
 * shared provably-fair seeds (lib/cases.ts).
 */
export default function CaseOpening() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const { claimed } = useGems();
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
  const live = useRef<{ phase: Phase; item: CaseItem | null; from: CaseDef | null }>({ phase: "idle", item: null, from: null });
  const pastId = useRef(0);

  const spinning = phase === "spinning";
  const have = claimed[selected.slug] ?? 0;
  const gemCase = selected.gems !== null;
  const canOpen = !spinning && (gemCase ? have > 0 : balance >= selected.price);
  const why = spinning ? "" : gemCase ? (have > 0 ? "" : "Claim one in the Gem Vault first") : balance < selected.price ? "Not enough balance" : "";

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
    if (gemCase) {
      if (!consumeClaimed(c.slug)) return;
    } else {
      addToBalance(-c.price);
      wagered(c.price);
    }
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
    recordOutcome(Math.round((item.skin.price - (from.gems ? 0 : from.price)) * 100) / 100);
    live.current = { phase: "done", item, from };
    setPhase("done");
    setResult({ item, from });
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: money.format(item.skin.price), won: from.gems ? null : item.skin.price >= from.price }, ...h].slice(0, HISTORY));
    setNote(`Unboxed ${item.skin.name}, sold for ${money.format(item.skin.price)}`);
  };

  const best = selected.items[0];

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
            {gemCase ? (
              <Readout
                label="Claimed in the Gem Vault"
                value={
                  <>
                    <GemIcon className={styles.gemIcon} />
                    {count.format(selected.gems ?? 0)} · {have} to open
                  </>
                }
                attr="data-claimed"
              />
            ) : (
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
            )}
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
              {gemCase && have === 0 ? (
                <a href="/gems" className={kit.secondary} data-claim-link>
                  Claim one in the Gem Vault
                </a>
              ) : (
                <button type="button" className={kit.primary} disabled={!canOpen} onClick={open} data-open>
                  {spinning ? "Opening…" : gemCase ? `Open · ${have} claimed` : `Open for ${money.format(selected.price)}`}
                </button>
              )}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.image} alt="" width={200} height={150} />
                </span>
                <div className={styles.caseText}>
                  <h2 className={styles.caseName}>{selected.name}</h2>
                  <p className={styles.caseMeta}>
                    {selected.items.length} skins inside, worth {money.format(selected.items[selected.items.length - 1].skin.price)} to{" "}
                    {money.format(best.skin.price)}
                  </p>
                </div>
              </div>
              <Reel items={selected.items} winner={winner} spinning={spinning} fast={fast} seed={spinSeed} onDone={settle} label={`${selected.name} reel`} />
              {result && (
                <div className={styles.result} style={{ "--rarity": result.item.skin.color } as CSSProperties} data-result data-skin={result.item.skin.slug} data-value={result.item.skin.price}>
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
        <h2 id="cases-all" className={styles.heading}>
          All cases
        </h2>
        <ul className={styles.cases} data-case-grid>
          {CASES.map((c) => {
            const n = claimed[c.slug] ?? 0;
            return (
              <li key={c.slug}>
                <button type="button" className={styles.caseCard} aria-pressed={c.slug === selected.slug} disabled={spinning} onClick={() => pickCase(c.slug)} data-case={c.slug} data-selected={c.slug === selected.slug || undefined}>
                  <span className={styles.cardArt}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" width={160} height={120} loading="lazy" decoding="async" />
                  </span>
                  <span className={styles.cardName}>{c.name}</span>
                  <span className={`${styles.cardPrice} tabular`}>
                    {c.gems ? (
                      <>
                        <GemIcon className={styles.gemIcon} />
                        {count.format(c.gems)}
                      </>
                    ) : (
                      <>
                        <CoinIcon />
                        {money.format(c.price)}
                      </>
                    )}
                  </span>
                  {n > 0 && (
                    <span className={styles.cardClaimed} data-card-claimed>
                      {n} claimed
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="cases-inside">
        <h2 id="cases-inside" className={styles.heading}>
          Inside {selected.name}
        </h2>
        <ul className={styles.contents} data-contents>
          {selected.items.map((it) => (
            <li key={it.skin.slug} className={styles.item} style={{ "--rarity": it.skin.color } as CSSProperties}>
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
            "Open it for its price, or use a case you claimed with gems in the Gem Vault.",
            "The reel runs and stops on your skin. Its value is sold to your balance straight away, since the site has no inventory yet.",
            "A case costs what it pays on average plus the house's 10%, and every drop can be checked under Provably fair.",
          ]}
        />
      )}
    </div>
  );
}
