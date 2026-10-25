"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { PLAYER } from "@/lib/home";
import { ChevronIcon } from "./icons";
import { BattleArt, BonusArt, MinesArt, PumpkinArt, UpgradeArt } from "./PromoArt";
import styles from "./PromoCarousel.module.css";

type Slide = {
  title: string;
  text: string;
  cta: string;
  href: string;
  /** Background: dark at the left, the slide's colour toward the right. */
  from: string;
  to: string;
  art: ReactNode;
};

const SLIDES: Slide[] = [
  {
    title: "The board is hiding gems",
    text: "Pick your tiles, dodge the bomb and cash out whenever you like",
    cta: "Play today",
    href: "/mines",
    from: "#1f1030",
    to: "#8b1d9e",
    art: <MinesArt />,
  },
  {
    title: "10% deposit bonus",
    text: "Top up now and get 10% extra on top, plus more rewards",
    cta: "Deposit now",
    href: "/deposit",
    from: "#24120f",
    to: "#c4561e",
    art: <BonusArt />,
  },
  {
    title: "Battle for the biggest drop",
    text: "Open cases head to head with other players. Best unbox takes all",
    cta: "Join a battle",
    href: "/case-battles",
    from: "#200c18",
    to: "#9c1f4a",
    art: <BattleArt />,
  },
  {
    title: "Turn $10 into $100",
    text: "Upgrade your skins with a 10% shot at a 10x win",
    cta: "Upgrade now",
    href: "/upgrader",
    from: "#110f2c",
    to: "#4a33c8",
    art: <UpgradeArt />,
  },
  {
    title: "The Pumpkin Hunt is live",
    text: "Find pumpkins in every game to win spooky drops until Halloween",
    cta: "Start hunting",
    href: "/pumpkin-hunt",
    from: "#1d0f1a",
    to: "#b4471b",
    art: <PumpkinArt />,
  },
];

const AUTOPLAY_MS = 6500;

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const paused = hovered || focusWithin;
  const count = SLIDES.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Advances on its own unless the visitor is pointing at it, has focus in
  // it, or prefers reduced motion.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, go]);

  return (
    <section
      className={styles.wrap}
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
    >
      <div className={styles.topRow}>
        <p className={styles.welcome}>
          Welcome back, <strong>{PLAYER.name}</strong>
        </p>
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} aria-label="Previous promotion" onClick={() => go(index - 1)}>
            <ChevronIcon direction="left" />
          </button>
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-label={`Show promotion ${i + 1}: ${s.title}`}
              aria-current={i === index}
              onClick={() => go(i)}
            />
          ))}
          <button type="button" className={styles.arrow} aria-label="Next promotion" onClick={() => go(index + 1)}>
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        {SLIDES.map((s, i) => (
          <div
            key={s.title}
            className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
            style={{ "--from": s.from, "--to": s.to } as CSSProperties}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            <div className={styles.copy}>
              <h2 className={styles.title}>{s.title}</h2>
              <p className={styles.text}>{s.text}</p>
            </div>
            <div className={styles.art} aria-hidden>
              {s.art}
            </div>
            <Link href={s.href} className={styles.cta}>
              {s.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
