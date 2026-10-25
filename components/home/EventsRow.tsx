"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BonusArt, PumpkinArt, RaceArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { halloween, midnight, nextMondayUtc, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The art's colour, for a faint light behind it. */
  to: string;
  ends: () => Date;
  art: ReactNode;
};

const PROMOS: Promo[] = [
  {
    title: "5% on deposits",
    text: "Top up today and get 5% extra on top.",
    cta: "Deposit",
    href: "/deposit",
    to: "#c95d17",
    ends: midnight,
    art: <BonusArt />,
  },
  {
    title: "Pumpkin Hunt",
    text: "Find pumpkins in any game for spooky drops.",
    cta: "Start hunting",
    href: "/pumpkin-hunt",
    to: "#6b2a8f",
    ends: halloween,
    art: <PumpkinArt />,
  },
  {
    title: "$30K Race",
    text: "Play to climb the board before it resets.",
    cta: "View race",
    href: "/race",
    to: "#a3740f",
    ends: nextMondayUtc,
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  return (
    <Link href={promo.href} className={`${styles.card} ${styles.promo}`} style={{ "--hue": promo.to } as CSSProperties}>
      <span className={styles.art} aria-hidden>
        {promo.art}
      </span>
      <span className={`${styles.timer} tabular`}>
        <span className="sr-only">Ends in </span>
        {left ?? "--:--:--"}
      </span>
      <span className={styles.title}>{promo.title}</span>
      <span className={styles.text}>{promo.text}</span>
      <span className={styles.button}>{promo.cta}</span>
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
