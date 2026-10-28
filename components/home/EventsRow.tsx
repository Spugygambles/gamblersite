"use client";

import type { ReactNode } from "react";
import { ClockIcon } from "./icons";
import PromoBanner from "./PromoBanner";
import { BonusArt, RaceArt, TurkeyArt } from "./PromoArt";
import RewardsCard from "./RewardsCard";
import { midnight, nextMondayUtc, thanksgivingWeekEnd, useCountdown } from "./useCountdown";
import styles from "./EventsRow.module.css";

type Promo = {
  title: string;
  /** One short line about it. */
  line: string;
  /** What the button says. */
  cta: string;
  href: string;
  /** How the time left reads aloud: "Ends in", "Resets in". */
  until: string;
  ends: () => Date;
  /** The muted colour of the panel behind the art. */
  panel: string;
  art: ReactNode;
};

// The Thanksgiving line-up.
const PROMOS: Promo[] = [
  {
    title: "Turkey Hunt",
    line: "Find turkeys in any game",
    cta: "Join hunt",
    href: "/turkey-hunt",
    until: "Ends in",
    ends: thanksgivingWeekEnd,
    panel: "#4f2430",
    art: <TurkeyArt />,
  },
  {
    title: "+5% Bonus",
    line: "On every deposit today",
    cta: "Deposit",
    href: "/deposit",
    until: "Ends in",
    ends: midnight,
    panel: "#26443a",
    art: <BonusArt />,
  },
  {
    title: "$30K Race",
    line: "Climb the weekly board",
    cta: "View race",
    href: "/race",
    until: "Resets in",
    ends: nextMondayUtc,
    panel: "#33295a",
    art: <RaceArt />,
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  const left = useCountdown(promo.ends);
  return (
    <PromoBanner href={promo.href} title={promo.title} line={promo.line} cta={promo.cta} panel={promo.panel} art={promo.art}>
      <span className={`${styles.timer} tabular`}>
        <ClockIcon />
        <span className="sr-only">{promo.until} </span>
        {left ?? "\u00a0"}
      </span>
    </PromoBanner>
  );
}

// The strip over the games: what's on for Thanksgiving, then the player's
// daily case.
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
