"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowIcon } from "./icons";
import { BonusArt, PumpkinArt, RaceArt } from "./PromoArt";
import styles from "./SideCards.module.css";

type Promo = {
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The card's light, from the top right. */
  glow: string;
  art: ReactNode;
};

const PROMOS: Promo[] = [
  {
    kicker: "Bonus",
    title: "10% on deposits",
    text: "Top up today and get 10% extra on top.",
    cta: "Deposit now",
    href: "/deposit",
    glow: "#e0711f",
    art: <BonusArt />,
  },
  {
    kicker: "Event",
    title: "Pumpkin Hunt",
    text: "Find pumpkins in any game for spooky drops.",
    cta: "Start hunting",
    href: "/pumpkin-hunt",
    glow: "#ff6a1a",
    art: <PumpkinArt />,
  },
  {
    kicker: "Race",
    title: "$30K Race",
    text: "Play to climb the board before it resets.",
    cta: "View race",
    href: "/race",
    glow: "#e9ab2c",
    art: <RaceArt />,
  },
];

// The promos take turns. A bar for each fills up while its promo shows and
// moves on to the next when full, so pausing the bar pauses the rotation.
// It holds still while pointed at or focused, and for reduced motion (the
// bar's animation is turned off in the CSS, so it never ends).
export default function PromoRotator() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const paused = hovered || focusWithin;
  const count = PROMOS.length;

  return (
    <section
      className={`${styles.card} ${styles.promo}`}
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
    >
      {PROMOS.map((p, i) => (
        <div
          key={p.title}
          className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
          style={{ "--glow": p.glow } as CSSProperties}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
          inert={i !== index}
        >
          <div className={styles.art} aria-hidden>
            {p.art}
          </div>
          <p className={styles.kicker}>{p.kicker}</p>
          <h2 className={styles.promoTitle}>{p.title}</h2>
          <p className={styles.promoText}>{p.text}</p>
          <Link href={p.href} className={styles.promoCta}>
            {p.cta}
            <ArrowIcon className={styles.ctaArrow} />
          </Link>
        </div>
      ))}

      <div className={styles.bars}>
        {PROMOS.map((p, i) => (
          <button
            key={p.title}
            type="button"
            className={styles.bar}
            aria-label={`Show ${p.title}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          >
            <span
              key={i === index ? `on-${index}` : "off"}
              className={styles.barFill}
              data-state={i < index ? "done" : i === index ? "active" : "todo"}
              style={{ animationPlayState: paused ? "paused" : "running" }}
              onAnimationEnd={() => setIndex((index + 1) % count)}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
