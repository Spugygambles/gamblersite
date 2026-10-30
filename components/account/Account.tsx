"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { resetSample, saveAccount, useAccount } from "@/lib/account";
import { homeHref } from "@/lib/assets";
import { PLAYER } from "@/lib/home";
import { PROFILE } from "@/lib/profile";
import { useStats } from "@/lib/stats";
import { subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import { CheckIcon, ClockIcon, CopyIcon, DiscordIcon, LogoutIcon, SwapIcon, UserIcon, UsersIcon } from "@/components/home/icons";
import BetHistory from "@/components/profile/BetHistory";
import SelfExclusion from "@/components/profile/SelfExclusion";
import Transactions from "@/components/profile/Transactions";
import styles from "./Account.module.css";

type Tab = "profile" | "history" | "transactions" | "affiliates";
const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  { id: "history", label: "Game history", icon: <ClockIcon /> },
  { id: "transactions", label: "Transactions", icon: <SwapIcon /> },
  { id: "affiliates", label: "Affiliates", icon: <UsersIcon /> },
];
const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-US");

// which page the address's #hash asks for
const onHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const tabFromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? (h as Tab) : "profile";
};

/**
 * The account: a side menu and the page it picks. The profile shows who
 * the player is, their level, a summary of their play, the account's
 * details and settings; game history and transactions are the record;
 * affiliates is the player's link. The sample account's details that can
 * change are kept in the browser.
 */
export default function Account() {
  const tab = useSyncExternalStore(onHash, tabFromHash, () => "profile" as Tab);
  const account = useAccount();
  const stats = useStats();
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(account.name);
  const [tradeDraft, setTradeDraft] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);

  const go = (t: Tab) => {
    window.location.assign(`#${t}`);
    setNote("");
  };
  const net = Math.round(balance - PLAYER.balance);
  const tradeUrl = tradeDraft ?? account.tradeUrl;
  const tradeOk = tradeUrl === "" || /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/.test(tradeUrl.trim());
  const referral = `https://csgoneo.gg/r/${account.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;

  const saveName = () => {
    const name = draft.trim().slice(0, 20);
    if (name.length < 2) return;
    saveAccount({ name });
    setEditing(false);
    setNote("Name saved.");
  };

  const saveTrade = () => {
    if (!tradeOk) return;
    saveAccount({ tradeUrl: tradeUrl.trim() });
    setTradeDraft(null);
    setNote(tradeUrl.trim() ? "Trade URL saved." : "Trade URL cleared.");
  };

  const copy = () => {
    navigator.clipboard?.writeText(referral).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => setNote("Copy didn't work here; select the link and copy it."),
    );
  };

  const logout = () => {
    resetSample();
    window.location.assign(homeHref());
  };

  const profile = (
    <>
      <h1 className={styles.title}>Profile</h1>
      <p className={styles.lead}>Manage your profile, stats, and preferences.</p>

      <section className={styles.card} aria-label="Who you are" data-profile-card>
        <div className={styles.who}>
          <span className={styles.avatar} aria-hidden>
            {account.name[0]}
          </span>
          <div className={styles.whoText}>
            {editing ? (
              <form
                className={styles.nameForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  saveName();
                }}
              >
                <input className={styles.nameInput} value={draft} maxLength={20} autoFocus aria-label="Display name" onChange={(e) => setDraft(e.target.value)} data-name-input />
                <button type="submit" className={styles.primary} disabled={draft.trim().length < 2} data-name-save>
                  Save
                </button>
                <button type="button" className={styles.secondary} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <span className={styles.name}>
                <b data-display-name>{account.name}</b>
                <span className={styles.levelChip} title="Level">
                  {PLAYER.level}
                </span>
              </span>
            )}
            <span className={styles.since}>Member since {PROFILE.memberSince}</span>
          </div>
          {!editing && (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setDraft(account.name);
                setEditing(true);
              }}
              data-edit-name
            >
              Edit
            </button>
          )}
        </div>
        <div className={styles.levelRow}>
          <span>Level {PLAYER.level}</span>
          <span className="tabular">
            {count.format(PROFILE.xp)} / {count.format(PROFILE.xpNext)} XP
          </span>
        </div>
        <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={PROFILE.xpNext} aria-valuenow={PROFILE.xp} aria-label="Progress to the next level">
          <span className={styles.barFill} style={{ width: `${Math.min(100, (PROFILE.xp / PROFILE.xpNext) * 100)}%` }} />
        </div>
      </section>

      <h2 className={styles.heading}>Summary</h2>
      <div className={styles.tiles} data-summary>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Net profit</span>
          <b className={`${styles.tileValue} ${net > 0 ? styles.up : net < 0 ? styles.down : ""} tabular`} data-net-profit>
            {net > 0 ? "+" : net < 0 ? "−" : ""}
            {money.format(Math.abs(net))}
          </b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Total wagered</span>
          <b className={`${styles.tileValue} tabular`} data-total-wagered>
            {money.format(stats.wagered)}
          </b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Balance</span>
          <b className={`${styles.tileValue} tabular`} data-balance>
            {money.format(balance)}
          </b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Games won</span>
          <b className={`${styles.tileValue} tabular`} data-games-won>
            {count.format(stats.won)}
          </b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Games lost</span>
          <b className={`${styles.tileValue} tabular`} data-games-lost>
            {count.format(stats.lost)}
          </b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Biggest win</span>
          <b className={`${styles.tileValue} tabular`} data-biggest-win>
            {money.format(stats.biggest)}
          </b>
        </div>
      </div>

      <h2 className={styles.heading}>Account</h2>
      <div className={styles.rows}>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <b>Email address</b>
            <span>{PROFILE.email}</span>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <svg viewBox="0 0 24 24">
              <path
                d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"
                fill="currentColor"
                opacity="0.9"
              />
              <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="currentColor" opacity="0.7" />
              <path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" fill="currentColor" opacity="0.5" />
              <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" fill="currentColor" opacity="0.8" />
            </svg>
          </span>
          <div className={styles.rowText}>
            <b>Google account</b>
            <span>{account.google ? "Connected to Google" : "Connect Google to sign in to your account."}</span>
          </div>
          <button type="button" className={account.google ? styles.connected : styles.secondary} disabled={account.google} onClick={() => saveAccount({ google: true })} data-connect-google>
            {account.google ? "Connected" : "Connect"}
          </button>
        </div>
        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <DiscordIcon />
          </span>
          <div className={styles.rowText}>
            <b>Discord account</b>
            <span>{account.discord ? "Connected to Discord" : "Connect Discord for chat perks and giveaways."}</span>
          </div>
          <button type="button" className={account.discord ? styles.connected : styles.secondary} onClick={() => saveAccount({ discord: !account.discord })} data-connect-discord>
            {account.discord ? "Connected" : "Connect"}
          </button>
        </div>
        <div className={`${styles.row} ${styles.rowStack}`}>
          <div className={styles.rowHead}>
            <b>Steam trade URL</b>
            <a href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Get my trade URL
            </a>
          </div>
          <div className={styles.tradeRow}>
            <input
              className={styles.input}
              value={tradeUrl}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…"
              aria-label="Steam trade URL"
              aria-invalid={tradeOk ? undefined : true}
              onChange={(e) => setTradeDraft(e.target.value)}
              data-trade-url
            />
            <button type="button" className={styles.primary} disabled={tradeDraft === null || !tradeOk} onClick={saveTrade} data-trade-save>
              Save
            </button>
          </div>
          {!tradeOk && <span className={styles.bad}>That doesn&apos;t look like a Steam trade URL.</span>}
        </div>
      </div>

      <h2 className={styles.heading}>Settings</h2>
      <div className={styles.rows}>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <b>Private profile</b>
            <span>Hide your stats and profile details from other players.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={account.privateProfile}
            aria-label="Private profile"
            className={styles.switch}
            onClick={() => saveAccount({ privateProfile: !account.privateProfile })}
            data-private-toggle
          >
            <span className={styles.knob} />
          </button>
        </div>
        <div className={`${styles.row} ${styles.rowStack}`}>
          <div className={styles.rowHead}>
            <div className={styles.rowText}>
              <b>Take a break</b>
              <span>Lock your account for a while. It can&apos;t be lifted early.</span>
            </div>
            <button type="button" className={styles.secondary} aria-expanded={breakOpen} onClick={() => setBreakOpen(!breakOpen)} data-break-toggle>
              {breakOpen ? "Close" : "Set up"}
            </button>
          </div>
          {breakOpen && (
            <div className={styles.breakPanel}>
              <SelfExclusion />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const affiliates = (
    <>
      <h1 className={styles.title}>Affiliates</h1>
      <p className={styles.lead}>Share your link. Every player who signs up through it is yours, and you earn a share of what they wager, paid to your balance.</p>
      <section className={styles.card} aria-label="Your link">
        <div className={styles.rowHead}>
          <b>Your link</b>
        </div>
        <div className={styles.tradeRow}>
          <input className={styles.input} value={referral} readOnly aria-label="Your referral link" data-referral-link />
          <button type="button" className={styles.primary} onClick={copy} data-copy-referral>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Referred players</span>
          <b className={`${styles.tileValue} tabular`}>0</b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Their wagers</span>
          <b className={`${styles.tileValue} tabular`}>0</b>
        </div>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Earned</span>
          <b className={`${styles.tileValue} tabular`}>0</b>
        </div>
      </div>
      <p className={styles.hint}>Nobody has signed up through your link yet. Referral earnings start once the site has accounts.</p>
    </>
  );

  return (
    <div className={styles.wrap} data-account data-tab={tab}>
      <aside className={styles.side} aria-label="Account">
        <h2 className={styles.sideTitle}>Account</h2>
        <nav className={styles.nav}>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={styles.navItem} aria-current={tab === t.id ? "page" : undefined} onClick={() => go(t.id)} data-account-tab={t.id}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <button type="button" className={`${styles.navItem} ${styles.logout}`} onClick={logout} data-logout-page>
          <LogoutIcon />
          Log out
        </button>
      </aside>
      <main className={styles.main}>
        {tab === "profile" && profile}
        {tab === "history" && (
          <div className={styles.record} data-history-panel>
            <BetHistory />
          </div>
        )}
        {tab === "transactions" && (
          <div className={styles.record} data-transactions-panel>
            <Transactions />
          </div>
        )}
        {tab === "affiliates" && affiliates}
        <p className={styles.note} aria-live="polite" data-account-note>
          {note}
        </p>
      </main>
    </div>
  );
}
