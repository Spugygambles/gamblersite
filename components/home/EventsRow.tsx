"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ClockIcon } from "./icons";
import { BonusArt, RaceArt, TurkeyArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { midnight, nextMondayUtc, thanksgivingWeekEnd, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  /** What kind of promotion it is, over the title. */
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The tile's flat colour. */
  tile: string;
  ends: () => Date;
  art: ReactNode;
};

// The Thanksgiving line-up, each on its own autumn colour.
const PROMOS: Promo[] = [
  {
    kicker: "Thanksgiving bonus",
    title: "5% on every deposit",
    text: "Top up today and get 5% extra on top.",
    cta: "Deposit",
    href: "/deposit",
    tile: "#b84f1a",
    ends: midnight,
    art: <BonusArt />,
  },
  {
    kicker: "Thanksgiving event",
    title: "Turkey Hunt",
    text: "Find turkeys hidden in any game for festive drops.",
    cta: "Start hunting",
    href: "/turkey-hunt",
    tile: "#8e2b25",
    ends: thanksgivingWeekEnd,
    art: <TurkeyArt />,
  },
  {
    kicker: "Weekly race",
    title: "$30K Harvest Race",
    text: "Every bet climbs the board. It resets on Monday.",
    cta: "View race",
    href: "/race",
    tile: "#3d5a2e",
    ends: nextMondayUtc,
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  return (
    <Link href={promo.href} className={`${styles.card} ${styles.promo}`} style={{ "--tile": promo.tile } as CSSProperties}>
      <span className={styles.top}>
        <span className={styles.kicker}>{promo.kicker}</span>
        <span className={`${styles.timer} tabular`}>
          <ClockIcon />
          <span className="sr-only">Ends in </span>
          {left ?? "\u00a0"}
        </span>
      </span>
      <span className={styles.title}>{promo.title}</span>
      <span className={styles.text}>{promo.text}</span>
      <span className={styles.button}>{promo.cta}</span>
      <span className={styles.art} aria-hidden>
        {promo.art}
      </span>
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
