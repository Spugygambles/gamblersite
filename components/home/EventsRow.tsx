"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowIcon, ClockIcon } from "./icons";
import { BonusArt, PumpkinArt, RaceArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { halloween, midnight, nextMondayUtc, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The card's light, from the bottom right. */
  glow: string;
  ends: () => Date;
  art: ReactNode;
};

const PROMOS: Promo[] = [
  {
    kicker: "Bonus",
    title: "5% on deposits",
    text: "Top up today and get 5% extra on top.",
    cta: "Deposit now",
    href: "/deposit",
    glow: "#e0711f",
    ends: midnight,
    art: <BonusArt />,
  },
  {
    kicker: "Event",
    title: "Pumpkin Hunt",
    text: "Find pumpkins in any game for spooky drops.",
    cta: "Start hunting",
    href: "/pumpkin-hunt",
    glow: "#ff6a1a",
    ends: halloween,
    art: <PumpkinArt />,
  },
  {
    kicker: "Race",
    title: "$30K Race",
    text: "Play to climb the board before it resets.",
    cta: "View race",
    href: "/race",
    glow: "#e9ab2c",
    ends: nextMondayUtc,
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  return (
    <Link
      href={promo.href}
      className={`${styles.card} ${styles.promo}`}
      style={{ "--glow": promo.glow } as CSSProperties}
      data-spotlight
    >
      <span className={styles.art} aria-hidden>
        {promo.art}
      </span>
      <span className={styles.promoTop}>
        <span className={styles.kicker}>{promo.kicker}</span>
        <span className={`${styles.timer} tabular`}>
          <ClockIcon />
          <span className="sr-only">Ends in </span>
          {left ?? "--:--:--"}
        </span>
      </span>
      <span className={styles.promoTitle}>{promo.title}</span>
      <span className={styles.promoText}>{promo.text}</span>
      <span className={styles.promoCta}>
        {promo.cta}
        <ArrowIcon className={styles.ctaArrow} />
      </span>
    </Link>
  );
}

// The player's level and today's free case, then what's on.
export default function EventsRow() {
  return (
    <div className={styles.row}>
      <RewardsCard />
      {PROMOS.map((p) => (
        <PromoCard key={p.title} promo={p} />
      ))}
    </div>
  );
}
