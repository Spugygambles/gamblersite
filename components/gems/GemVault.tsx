"use client";

import { useState, type CSSProperties } from "react";
import { Modal } from "@/components/mines/Dialogs";
import { CoinIcon, EyeIcon, GemIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import { GEM_CASES, inside, type GemCase } from "@/lib/gemCases";
import { GEM_PER, claimCase, useGems } from "@/lib/gems";
import { count } from "@/lib/home";
import { money } from "@/lib/upgrader";
import styles from "./GemVault.module.css";

// Three violet gems, the big one in front, with a few sparks about them.
function GemCluster({ className }: { className?: string }) {
  const gem = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points="0,22 16,0 56,0 72,22 36,80" fill="#7a3fd9" />
      <polygon points="16,0 56,0 72,22 0,22" fill="#b07dff" />
      <polygon points="16,0 28,22 0,22" fill="#cfaeff" />
      <polygon points="56,0 72,22 44,22" fill="#9a62f5" />
      <polygon points="28,22 44,22 36,80" fill="#a070ff" />
      <polygon points="0,22 28,22 36,80" fill="#8b4fe8" />
      <polyline points="0,22 72,22" fill="none" stroke="#efe4ff" strokeOpacity="0.55" strokeWidth="1.5" />
    </g>
  );
  const spark = (x: number, y: number, s: number) => <path d={`M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z`} fill="#e6d6ff" opacity="0.8" />;
  return (
    <svg className={className} viewBox="0 0 170 125" aria-hidden>
      {gem(4, 48, 0.6)}
      {gem(118, 56, 0.5)}
      {gem(50, 20, 1)}
      {spark(26, 30, 5)}
      {spark(146, 38, 4)}
      {spark(132, 108, 3.5)}
    </svg>
  );
}

/**
 * The Gem Vault: what gems are (one for every GEM_PER coins wagered), how
 * many the player has and how far the next one is, and the cases they
 * buy. Claiming a case spends the gems and keeps the case for opening.
 */
export default function GemVault() {
  const { gems, toward, claimed } = useGems();
  const [peek, setPeek] = useState<GemCase | null>(null);
  const [note, setNote] = useState("");
  const pct = Math.min(100, (toward / GEM_PER) * 100);

  const claim = (c: GemCase) => {
    if (claimCase(c.slug, c.gems)) setNote(`${c.name} is in your cases. Opening them comes next.`);
  };

  return (
    <div className={styles.wrap} data-gems-page>
      <section className={styles.hero} aria-labelledby="vault-title">
        <GemCluster className={styles.heroArt} />
        <div>
          <h1 id="vault-title" className={styles.title}>
            Gem Vault
          </h1>
          <p className={styles.lead}>
            Every {money.format(GEM_PER)} you wager on any game earns a gem. Gems open the cases below.
          </p>
        </div>
      </section>

      <div className={styles.strip}>
        <div className={styles.have}>
          <GemIcon className={styles.haveIcon} />
          <span>
            <b className="tabular" data-gems-have>
              {count.format(gems)}
            </b>{" "}
            gems
          </span>
        </div>
        <div className={styles.next}>
          <span className={styles.nextLabel}>Next gem</span>
          <span className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={GEM_PER} aria-valuenow={toward} aria-label="Wagered toward your next gem">
            <span className={styles.barFill} style={{ width: `${pct}%` }} />
          </span>
          <span className={`${styles.nextValue} tabular`} data-next-gem>
            {money.format(toward)} / {money.format(GEM_PER)}
          </span>
        </div>
        <div className={styles.earn}>
          <span>Earn more</span>
          <a href="/mines" className={styles.earnLink}>
            Mines
          </a>
          <a href="/upgrader" className={styles.earnLink}>
            Upgrader
          </a>
        </div>
      </div>

      <section aria-labelledby="cases-title">
        <div className={styles.head}>
          <h2 id="cases-title" className={styles.heading}>
            Gem cases <span className={styles.pill}>New</span>
          </h2>
          <p className={styles.sub}>Spend your gems on a case. A claimed case waits in your cases until you open it.</p>
        </div>
        <p className={styles.note} aria-live="polite" data-note>
          {note}
        </p>
        <ul className={styles.grid}>
          {GEM_CASES.map((c) => {
            const short = c.gems - gems;
            const owned = claimed[c.slug] ?? 0;
            return (
              <li key={c.slug} className={styles.card} data-gem-case={c.slug}>
                <button type="button" className={styles.peek} aria-label={`What's inside ${c.name}`} onClick={() => setPeek(c)} data-peek>
                  <EyeIcon />
                </button>
                <span className={styles.art}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" width={240} height={180} loading="lazy" decoding="async" />
                </span>
                <h3 className={styles.name}>{c.name}</h3>
                <button
                  type="button"
                  className={styles.claim}
                  disabled={short > 0}
                  onClick={() => claim(c)}
                  title={short > 0 ? `${count.format(short)} more gems to go` : `Claim ${c.name} for ${count.format(c.gems)} gems`}
                  data-claim
                >
                  <GemIcon className={styles.claimIcon} />
                  <span className="tabular">{count.format(c.gems)}</span>
                </button>
                <span className={styles.under}>
                  {owned > 0 ? (
                    <span className={styles.owned} data-owned>
                      {owned} in your cases
                    </span>
                  ) : short > 0 ? (
                    <span className="tabular">{count.format(short)} more to go</span>
                  ) : (
                    <span className={styles.ready}>Ready to claim</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {peek && (
        <Modal title={`Inside ${peek.name}`} onClose={() => setPeek(null)} wide>
          <p className={styles.peekLead}>
            Skins worth {money.format(peek.worth[0])} to {money.format(peek.worth[1])}. The dearest of them:
          </p>
          <ul className={styles.peekList} data-peek-list>
            {inside(peek).map((s) => (
              <li key={s.slug} className={styles.peekItem} style={{ "--rarity": s.color } as CSSProperties}>
                <span className={styles.peekArt}>
                  <SkinArt skin={s} />
                </span>
                <span className={styles.peekName}>
                  {s.finish}
                  <small>{s.weapon}</small>
                </span>
                <span className={`${styles.peekPrice} tabular`}>
                  <CoinIcon />
                  {money.format(s.price)}
                </span>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
