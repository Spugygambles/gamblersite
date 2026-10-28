"use client";

import { useState, type ReactNode } from "react";
import { count, GAMES, PLAYER, usd } from "@/lib/home";
import { MY_BETS, PROFILE } from "@/lib/profile";
import { avatarOf } from "@/components/home/avatar";
import { DepositIcon, StackIcon, WithdrawIcon } from "@/components/home/icons";
import BetTable from "./BetTable";
import styles from "./Profile.module.css";

const STATS = [
  { label: "Deposits", value: PROFILE.deposited, Icon: DepositIcon },
  { label: "Withdrawals", value: PROFILE.withdrawn, Icon: WithdrawIcon },
  { label: "Wagered", value: PROFILE.wagered, Icon: StackIcon },
];

const SWITCHES = [
  { id: "hide-stats", title: "Hide my stats", text: "Hide my wagers and wins from other players.", on: false },
  { id: "anonymous", title: "Anonymous bets", text: "Show my bets as Hidden in the live feed.", on: false },
  { id: "mentions", title: "Chat mentions", text: "Notify me when someone mentions me or replies to me in chat.", on: true },
];

const best = PROFILE.biggestWin;
const bestGame = GAMES.find((g) => g.slug === best.game)?.title;

/** A text field with its own Save, which wakes up once the text changes. */
function SavedField({ label, value, placeholder, hint, wide }: { label: string; value: string; placeholder?: string; hint?: ReactNode; wide?: boolean }) {
  const [saved, setSaved] = useState(value);
  const [text, setText] = useState(value);
  const id = `field-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <span className={styles.inputRow}>
        <input
          id={id}
          className={styles.input}
          value={text}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setText(e.target.value)}
          data-field
        />
        <button type="button" className={styles.save} disabled={text === saved} onClick={() => setSaved(text)} data-save>
          Save
        </button>
      </span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

/**
 * The profile: who the player is and how far through their level, what's
 * gone in, out and been wagered, their last few bets, and their account
 * details and privacy switches.
 */
export default function Overview({ onAllBets }: { onAllBets: () => void }) {
  const [switches, setSwitches] = useState(() => Object.fromEntries(SWITCHES.map((s) => [s.id, s.on])));
  const progress = Math.round((PROFILE.xp / PROFILE.xpNext) * 100);

  return (
    <>
      <h2 className={styles.title}>Profile</h2>

      <div className={styles.identity}>
        <span className={styles.face} style={{ background: avatarOf(PLAYER.name) }} aria-hidden>
          {PLAYER.name[0]}
        </span>
        <div className={styles.who}>
          <p className={styles.nameRow}>
            <span className={styles.name}>{PLAYER.name}</span>
            <span className={styles.levelBadge}>
              <span className="sr-only">Level </span>
              {PLAYER.level}
            </span>
            <span className={`${styles.id} tabular`}>(ID: {PROFILE.id})</span>
          </p>
          <p className={styles.since}>Member since {PROFILE.memberSince}</p>
        </div>
        <div className={styles.xpSide}>
          {!PROFILE.emailVerified && (
            <button type="button" className={styles.verify}>
              Verify email
            </button>
          )}
          <span className={`${styles.xpText} tabular`}>
            {count.format(PROFILE.xp)}/{count.format(PROFILE.xpNext)} XP
          </span>
        </div>
        <span className={styles.xpBar} role="progressbar" aria-label={`Level ${PLAYER.level + 1}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>

      <ul className={styles.stats}>
        {STATS.map(({ label, value, Icon }) => (
          <li key={label} className={styles.stat}>
            <Icon className={styles.statIcon} />
            <span className={styles.statText}>
              <span className={`${styles.statValue} tabular`}>{usd.format(value)}</span>
              <span className={styles.statLabel}>{label}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.sectionHead}>
        <div>
          <h3 className={styles.subtitle}>Recent bets</h3>
          <p className={`${styles.summary} tabular`}>
            {count.format(PROFILE.bets)} bets, {((PROFILE.wins / PROFILE.bets) * 100).toFixed(1)}% won. Best win{" "}
            {usd.format(best.wager * best.multiplier)} on {bestGame}.
          </p>
        </div>
        <button type="button" className={styles.more} onClick={onAllBets} data-profile-goto="bets">
          View all
        </button>
      </div>
      <BetTable bets={MY_BETS.slice(0, 5)} />

      <h3 className={styles.subtitle}>Account details</h3>
      <div className={styles.fields}>
        <SavedField label="Username" value={PLAYER.name} />
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <span className={styles.readout}>
            {PROFILE.email}
            {!PROFILE.emailVerified && <span className={styles.unverified}>Not verified</span>}
          </span>
        </div>
        <SavedField
          label="Steam trade URL"
          value=""
          placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…"
          wide
          hint={
            <>
              Skins you withdraw are sent here.{" "}
              <a href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noreferrer">
                Find yours on Steam
              </a>
            </>
          }
        />
      </div>

      <ul className={styles.switches}>
        {SWITCHES.map((s) => (
          <li key={s.id}>
            <label className={styles.switchRow}>
              <button
                type="button"
                role="switch"
                aria-checked={switches[s.id]}
                className={styles.switch}
                onClick={() => setSwitches({ ...switches, [s.id]: !switches[s.id] })}
                data-switch
              >
                <span className={styles.knob} />
              </button>
              <span className={styles.switchWords}>
                <span className={styles.switchTitle}>{s.title}</span>
                <span className={styles.switchText}>{s.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
