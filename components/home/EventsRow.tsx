"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ChevronIcon, ClockIcon } from "./icons";
import { BonusArt, RaceArt, TurkeyArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { midnight, nextMondayUtc, thanksgivingWeekEnd, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  /** What kind of promotion it is, over the title. */
  kicker: string;
  title: string;
  href: string;
  /** How the time left reads: "Ends in", "Resets in". */
  until: string;
  ends: () => Date;
  /** The muted colour behind the drawing. */
  well: string;
  art: ReactNode;
};

// The Thanksgiving line-up.
const PROMOS: Promo[] = [
  {
    kicker: "Thanksgiving event",
    title: "Turkey Hunt",
    href: "/turkey-hunt",
    until: "Ends in",
    ends: thanksgivingWeekEnd,
    well: "#5e2b27",
    art: <TurkeyArt />,
  },
  {
    kicker: "Thanksgiving bonus",
    title: "5% deposit bonus",
    href: "/deposit",
    until: "Ends in",
    ends: midnight,
    well: "#6f3f26",
    art: <BonusArt />,
  },
  {
    kicker: "Weekly race",
    title: "$30K Harvest Race",
    href: "/race",
    until: "Resets in",
    ends: nextMondayUtc,
    well: "#3b4733",
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  return (
    <Link href={promo.href} className={styles.card}>
      <span className={styles.well} style={{ "--well": promo.well } as CSSProperties} aria-hidden>
        {promo.art}
      </span>
      <span className={styles.body}>
        <span className={styles.kicker}>{promo.kicker}</span>
        <span className={styles.title}>{promo.title}</span>
        <span className={`${styles.timer} tabular`}>
          <ClockIcon />
          <span>{promo.until} </span>
          {left ?? "\u00a0"}
        </span>
      </span>
      <ChevronIcon direction="right" className={styles.go} />
    </Link>
  );
}

// A compact strip over the games: what's on for Thanksgiving, then the
// player's daily case.
export default function EventsRow() {
  return (
    <div className={styles.strip}>
      <div className={styles.row}>
        {PROMOS.map((p) => (
          <PromoCard key={p.href} promo={p} />
        ))}
        <RewardsCard />
      </div>
    </div>
  );
}
