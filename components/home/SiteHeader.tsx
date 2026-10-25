"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GAMES, PLAYER } from "@/lib/home";
import {
  ChevronIcon,
  CloseIcon,
  CoinIcon,
  GamepadIcon,
  GemIcon,
  GiftIcon,
  MenuIcon,
  PumpkinIcon,
  TrophyIcon,
} from "./icons";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SiteHeader() {
  const [gamesOpen, setGamesOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const gamesRef = useRef<HTMLDivElement>(null);
  const gamesBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const drawerId = useId();

  // The games menu closes on a click anywhere else or on Escape, which also
  // hands focus back to the button that opened it.
  useEffect(() => {
    if (!gamesOpen && !drawerOpen) return;
    const onDown = (e: PointerEvent) => {
      if (gamesOpen && !gamesRef.current?.contains(e.target as Node)) setGamesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (gamesOpen) {
        setGamesOpen(false);
        gamesBtnRef.current?.focus();
      }
      if (drawerOpen) {
        setDrawerOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [gamesOpen, drawerOpen]);

  // Opening the drawer moves focus into it.
  useEffect(() => {
    if (drawerOpen) drawerRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [drawerOpen]);

  // The ring round the avatar shows progress through the current level.
  const ring = 2 * Math.PI * 19;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          ref={menuBtnRef}
          type="button"
          className={styles.menuButton}
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          aria-controls={drawerId}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          {drawerOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Wordmark />

        <nav className={styles.nav} aria-label="Main">
          <div
            className={styles.gamesMenu}
            ref={gamesRef}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setGamesOpen(false);
            }}
          >
            <button
              ref={gamesBtnRef}
              type="button"
              className={styles.navLink}
              aria-expanded={gamesOpen}
              aria-controls={gamesOpen ? menuId : undefined}
              onClick={() => setGamesOpen((o) => !o)}
            >
              <GamepadIcon className={styles.navIcon} />
              Games
              <ChevronIcon className={`${styles.chevron} ${gamesOpen ? styles.chevronUp : ""}`} />
            </button>
            {gamesOpen && (
              <div className={styles.dropdown} id={menuId}>
                {GAMES.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/${g.slug}`}
                    className={styles.dropItem}
                    onClick={() => setGamesOpen(false)}
                  >
                    <span className={styles.dropSwatch} style={{ background: g.theme.rim }} />
                    <span className={styles.dropTitle}>{g.title}</span>
                    <span className={styles.dropSub}>{g.subtitle}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/rewards" className={styles.navLink}>
            <GiftIcon className={styles.navIcon} />
            Rewards
          </Link>

          <Link href="/race" className={`${styles.event} ${styles.race}`}>
            <TrophyIcon className={styles.eventIcon} />
            $30K Race
          </Link>
          <Link href="/pumpkin-hunt" className={`${styles.event} ${styles.halloween}`}>
            <PumpkinIcon className={styles.eventIcon} />
            Pumpkin Hunt
          </Link>
        </nav>

        <div className={styles.wallet}>
          <Link href="/withdraw" className={styles.withdraw}>
            Withdraw
          </Link>
          <div className={styles.balance}>
            <span className="sr-only">Balance:</span>
            <CoinIcon className={styles.coin} />
            <span className="tabular">{money.format(PLAYER.balance)}</span>
          </div>
          <Link href="/deposit" className={styles.deposit}>
            Deposit
          </Link>
          <Link href="/rewards" className={styles.gems} aria-label={`${PLAYER.gems} gems`}>
            <GemIcon className={styles.gem} />
            <span className="tabular">{PLAYER.gems}</span>
          </Link>
          <span className={styles.divider} aria-hidden />
          <span className={styles.level} title={`Level ${PLAYER.level}`}>
            <span className="sr-only">Level </span>
            {PLAYER.level}
          </span>
          <button type="button" className={styles.profile} aria-label="Account">
            <span className={styles.avatar}>
              <svg className={styles.ring} viewBox="0 0 44 44" aria-hidden>
                <circle cx="22" cy="22" r="19" className={styles.ringTrack} />
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  className={styles.ringFill}
                  strokeDasharray={`${(ring * PLAYER.levelProgress) / 100} ${ring}`}
                />
              </svg>
              ?
            </span>
            <ChevronIcon className={styles.chevron} />
          </button>
        </div>
      </div>

      <div
        ref={drawerRef}
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        id={drawerId}
        hidden={!drawerOpen}
      >
        <nav className={styles.drawerNav} aria-label="Mobile">
          <Link href="/rewards" className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
            <GiftIcon className={styles.navIcon} /> Rewards
          </Link>
          <Link href="/race" className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
            <TrophyIcon className={styles.navIcon} /> $30K Race
          </Link>
          <Link href="/pumpkin-hunt" className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
            <PumpkinIcon className={styles.navIcon} /> Pumpkin Hunt
          </Link>
          <Link href="/withdraw" className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
            Withdraw
          </Link>
        </nav>
        <p className={styles.drawerHeading}>Games</p>
        <div className={styles.drawerGames}>
          {GAMES.map((g) => (
            <Link key={g.slug} href={`/${g.slug}`} className={styles.dropItem} onClick={() => setDrawerOpen(false)}>
              <span className={styles.dropSwatch} style={{ background: g.theme.rim }} />
              <span className={styles.dropTitle}>{g.title}</span>
              <span className={styles.dropSub}>{g.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
