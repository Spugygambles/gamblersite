"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BonusArt, PumpkinArt, RaceArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { halloween, midnight, nextMondayUtc, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  /** The title in two parts; the part named by `accent` is in the accent colour. */
  title: [string, string];
  accent: 0 | 1;
  text: string;
  cta: string;
  href: string;
  ends: () => Date;
  art: ReactNode;
};

const PROMOS: Promo[] = [
  {
    title: ["5%", "bonus"],
    accent: 0,
    text: "Get 5% extra on every deposit today.",
    cta: "Deposit",
    href: "/deposit",
    ends: midnight,
    art: <BonusArt />,
  },
  {
    title: ["Pumpkin", "Hunt"],
    accent: 1,
    text: "Find pumpkins in any game for spooky drops.",
    cta: "Start hunting",
    href: "/pumpkin-hunt",
    ends: halloween,
    art: <PumpkinArt />,
  },
  {
    title: ["$30K", "Race"],
    accent: 0,
    text: "Play to climb the board before it resets.",
    cta: "View race",
    href: "/race",
    ends: nextMondayUtc,
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  const [a, b] = promo.title;
  return (
    <Link href={promo.href} className={`${styles.card} ${styles.promo}`}>
      <span className={styles.art} aria-hidden>
        {promo.art}
      </span>
      <span className={`${styles.timer} tabular`}>
        <span className="sr-only">Ends in </span>
        {left ?? "\u00a0"}
      </span>
      <span className={styles.title}>
        <span className={promo.accent === 0 ? styles.accent : undefined}>{a}</span>{" "}
        <span className={promo.accent === 1 ? styles.accent : undefined}>{b}</span>
      </span>
      <span className={styles.text}>{promo.text}</span>
      <span className={styles.button}>{promo.cta}</span>
    </Link>
  );
}

// The player's level and today's free case, then what's on.
export default function EventsRow() {
  return (
    <div className={styles.events}>
      <div className={styles.row}>
        <RewardsCard />
        {PROMOS.map((p) => (
          <PromoCard key={p.href} promo={p} />
        ))}
      </div>
    </div>
  );
}
