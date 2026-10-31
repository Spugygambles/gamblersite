"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { FairDialog, HowTo, Tools } from "@/components/game/kit";
import { ChevronIcon, CoinIcon } from "@/components/home/icons";
import { saveSettings, useSettings } from "@/components/mines/stores";
import SkinArt from "@/components/upgrader/SkinArt";
import { spinCase, type CaseDef, type CaseItem } from "@/lib/cases";
import { weighted } from "@/lib/fair";
import { wagered } from "@/lib/gems";
import { takeNonce } from "@/lib/seeds";
import { recordOutcome } from "@/lib/stats";
import { TIERS, tierOf } from "@/lib/tiers";
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import CaseImage from "./CaseImage";
import Reel from "./Reel";
import { caseSfx, warmCaseSfx } from "./sounds";
import styles from "./Cases.module.css";

type Phase = "idle" | "spinning" | "done";
type Spin = { winner: CaseItem; seed: number };

/** How many of the case can be opened at once, a reel each. */
const COUNTS = [1, 2, 3, 4];
/** How much later each reel after the first lands, in ms. */
const STAGGER = 160;

// odds as the cards show them: 2%, 1.5%, 0.025%
const pct = (odds: number) => `${Number((odds * 100).toFixed(odds < 0.001 ? 3 : 2))}%`;

const SpeakerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 8.6a4.6 4.6 0 0 1 0 6.8M18 6.2a8 8 0 0 1 0 11.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </svg>
);

function Switch({ on, label, icon, onChange, attr }: { on: boolean; label: string; icon: ReactNode; onChange: () => void; attr: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} title={label} className={styles.switch} onClick={onChange} {...{ [attr]: "" }}>
      {icon}
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </button>
  );
}

/**
 * A case's page, after Rostake's: the way back to the list and the
 * switches at the top, the case and its reel between two markers, then how
 * many to open (a reel each), the button that opens them for their price
 * and a demo spin that costs nothing and pays nothing. Under it all,
 * everything the case can drop with its odds. Each opening is drawn from
 * the shared provably-fair seeds (lib/cases.ts); its value goes straight
 * to the balance, the site having no inventory yet.
 */
export default function CasePage({ c, backHref, onBack }: { c: CaseDef; backHref: string; onBack: () => void }) {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const settings = useSettings();
  const [count, setCount] = useState(1);
  const [fast, setFast] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [spins, setSpins] = useState<Spin[]>([]);
  const [result, setResult] = useState<{ items: CaseItem[]; demo: boolean } | null>(null);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const live = useRef({ phase: "idle" as Phase, landed: 0, items: [] as CaseItem[], demo: false, cost: 0 });

  const spinning = phase === "spinning";
  const cost = c.price * count;
  const canOpen = !spinning && balance >= cost;
  const why = !spinning && balance < cost ? "Not enough balance" : "";

  useEffect(() => warmCaseSfx(), []);

  // leaving while the reels still run: what they hold is paid out all the same
  useEffect(() => {
    const l = live.current;
    return () => {
      if (l.phase !== "spinning" || l.demo) return;
      const total = l.items.reduce((sum, it) => sum + it.skin.price, 0);
      addToBalance(total);
      recordOutcome(Math.round(total - l.cost));
      l.phase = "done";
    };
  }, []);

  const begin = (picked: Spin[], demo: boolean, paid: number) => {
    Object.assign(live.current, { phase: "spinning", landed: 0, items: picked.map((p) => p.winner), demo, cost: paid });
    setSpins(picked);
    setResult(null);
    setPhase("spinning");
    caseSfx("open");
  };

  const open = () => {
    if (!canOpen || live.current.phase === "spinning") return;
    addToBalance(-cost);
    wagered(cost);
    const picked = Array.from({ length: count }, () => {
      const s = takeNonce();
      return { winner: spinCase(c, s.serverSeed, s.clientSeed, s.nonce), seed: s.nonce + 1 };
    });
    begin(picked, false, cost);
  };

  // a spin for show: drawn on the spot, nothing paid either way
  const demo = () => {
    if (live.current.phase === "spinning") return;
    const weights = c.items.map((it) => it.weight);
    const picked = Array.from({ length: count }, () => ({ winner: c.items[weighted(weights, Math.random())], seed: 1 + Math.floor(Math.random() * 1e9) }));
    begin(picked, true, 0);
  };

  // a reel has stopped; with the last, the drops are sold to the balance
  const landed = () => {
    const l = live.current;
    if (l.phase !== "spinning") return;
    l.landed += 1;
    if (l.landed < l.items.length) return;
    const total = l.items.reduce((sum, it) => sum + it.skin.price, 0);
    if (!l.demo) {
      addToBalance(total);
      recordOutcome(Math.round(total - l.cost));
    }
    l.phase = "done";
    setPhase("done");
    setResult({ items: l.items, demo: l.demo });
    caseSfx(total >= c.price * l.items.length ? "win" : "lose");
  };

  const pickCount = (n: number) => {
    if (live.current.phase === "spinning") return;
    live.current.phase = "idle";
    setCount(n);
    setSpins([]);
    setResult(null);
    setPhase("idle");
  };

  const total = result ? result.items.reduce((sum, it) => sum + it.skin.price, 0) : 0;

  return (
    <div className={styles.page} data-cases data-phase={phase} data-selected-case={c.slug}>
      <div className={styles.topBar}>
        <a
          href={backHref}
          className={styles.back}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onBack();
          }}
          data-back-to-cases
        >
          <ChevronIcon direction="left" />
          Back to cases
        </a>
        <div className={styles.switches}>
          <Switch on={settings.sound} label={settings.sound ? "Sound on" : "Sound off"} icon={<SpeakerIcon />} onChange={() => saveSettings({ ...settings, sound: !settings.sound })} attr="data-sound-toggle" />
          <Switch on={fast} label="Fast open" icon={<BoltIcon />} onChange={() => setFast(!fast)} attr="data-fast" />
          <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
        </div>
      </div>

      <div className={styles.head}>
        <span className={styles.headArt}>
          <CaseImage slug={c.slug} image={c.image} width={200} height={150} />
        </span>
        <h2 className={styles.headName} data-chosen-name>
          {c.name}
        </h2>
      </div>

      <div className={styles.reelZone}>
        <span className={styles.pointerDown} aria-hidden />
        <div className={styles.reels} data-reels={count}>
          {Array.from({ length: count }, (_, i) => (
            <Reel
              key={`${count}-${i}`}
              items={c.items}
              winner={spins[i]?.winner ?? null}
              spinning={spinning}
              fast={fast}
              seed={spins[i]?.seed ?? i + 1}
              onDone={landed}
              label={count > 1 ? `${c.name} reel ${i + 1}` : `${c.name} reel`}
              casePrice={c.price}
              extraMs={i * STAGGER}
              idle={!spins[i]}
              onTick={i === 0 ? () => caseSfx("tick") : undefined}
            />
          ))}
        </div>
        <span className={styles.pointerUp} aria-hidden />
      </div>

      <div className={styles.openRow} data-controls>
        <div className={styles.counts} role="group" aria-label="How many to open">
          {COUNTS.map((n) => (
            <button key={n} type="button" className={styles.count} aria-pressed={count === n} disabled={spinning} onClick={() => pickCount(n)} data-open-count={n}>
              {n}x
            </button>
          ))}
        </div>
        <button type="button" className={styles.openButton} disabled={!canOpen} onClick={open} data-open>
          {spinning ? (
            "Opening…"
          ) : (
            <>
              Open {count} {count > 1 ? "cases" : "case"} for <CoinIcon />
              <span className="tabular">{money.format(cost)}</span>
            </>
          )}
        </button>
        <button type="button" className={styles.demoButton} disabled={spinning} onClick={demo} data-demo>
          Demo Spin
        </button>
      </div>
      {why && (
        <p className={styles.why} data-why>
          {why}
        </p>
      )}

      {result && (
        <div className={styles.result} aria-live="polite" data-result data-skin={result.items[0].skin.slug} data-value={total} data-demo={result.demo || undefined}>
          <ul className={styles.resultItems}>
            {result.items.map((it, i) => {
              const tier = tierOf(it.skin.price, c.price);
              return (
                <li key={i} className={styles.resultItem} style={{ "--tier": TIERS[tier].color } as CSSProperties} data-tier={tier}>
                  <span className={styles.resultArt}>
                    <SkinArt skin={it.skin} />
                  </span>
                  <span className={styles.resultText}>
                    <span className={styles.resultName}>{it.skin.name}</span>
                    <span className={`${styles.resultValue} tabular`}>
                      <CoinIcon />
                      {money.format(it.skin.price)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.resultNote}>
            {result.demo ? (
              "Demo spin: nothing was paid or won"
            ) : (
              <>
                <b className="tabular">{money.format(total)}</b> sold to your balance
              </>
            )}
          </p>
        </div>
      )}

      <hr className={styles.rule} />

      <section className={styles.drops} aria-labelledby="possible-drops">
        <h2 id="possible-drops" className={styles.dropsHead}>
          Possible drops
        </h2>
        <ul className={styles.dropGrid} data-contents>
          {c.items.map((it) => {
            const tier = tierOf(it.skin.price, c.price);
            return (
              <li key={it.skin.slug} className={styles.drop} style={{ "--tier": TIERS[tier].color } as CSSProperties} data-tier={tier}>
                <span className={styles.dropOdds}>{pct(it.odds)}</span>
                <span className={styles.dropArt}>
                  <SkinArt skin={it.skin} />
                </span>
                <span className={styles.dropName} title={it.skin.name}>
                  {it.skin.name}
                </span>
                <span className={`${styles.dropPrice} tabular`}>
                  <CoinIcon />
                  {money.format(it.skin.price)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={spinning}
          intro="One draw decides what a case gives, against the odds listed under it. Opening several takes a draw each, one nonce after another."
          verify={(server, client, nonce) => {
            const it = spinCase(c, server, client, nonce);
            return `${c.name} lands on ${it.skin.name} (${money.format(it.skin.price)}) for that nonce`;
          }}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How cases work"
          onClose={() => setDialog(null)}
          steps={[
            "Everything the case can drop, and the odds of each, is listed under Possible drops.",
            "Pick how many to open, from one to four, and open them for their price: a reel spins for each.",
            "Each reel stops on your drop. Its value is sold to your balance straight away, since the site has no inventory yet.",
            "A demo spin shows what you might get, for nothing and paying nothing.",
            "A case costs what it pays back on average plus the house's 10%, and every opening can be checked under Provably fair.",
          ]}
        />
      )}
    </div>
  );
}
