import type { Metadata } from "next";
import { count } from "@/lib/home";
import { MY_HUNT, PRIZES, RULES } from "@/lib/event";
import EventHero from "@/components/event/EventHero";
import Hunters from "@/components/event/Hunters";
import LeafShop from "@/components/event/LeafShop";
import RewardTrack from "@/components/event/RewardTrack";
import Section, { PageContent } from "@/components/home/Section";
import { CoinIcon, GiftIcon, LeafIcon, MapleIcon, ShieldIcon, TrophyIcon } from "@/components/home/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Turkey Hunt — CsgoNeo",
  description:
    "Thanksgiving on CsgoNeo: catch turkeys in any game for maple leaves, spend them in the leaf shop, and race for the top of the hunters' board.",
};

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The Turkey Hunt: the event's banner, then how the player's doing, the
// shop, the leaderboard and the rules.
export default function TurkeyHunt() {
  return (
    <PageContent>
      <EventHero />

      <Section
        id="progress"
        title="Your hunt"
        icon={<LeafIcon />}
        aside={
          <span className={styles.stats}>
            <span className={styles.stat}>
              Caught <b className="tabular">{MY_HUNT.turkeys}</b>
            </span>
            <span className={styles.stat}>
              Place <b className="tabular">#{MY_HUNT.rank}</b> of {count.format(MY_HUNT.hunters)}
            </span>
          </span>
        }
      >
        <RewardTrack />
      </Section>

      <Section
        id="shop"
        title="Leaf shop"
        icon={<GiftIcon />}
        aside={
          <span className={styles.stat}>
            You have
            <MapleIcon className={styles.statIcon} />
            <b className="tabular">{MY_HUNT.leaves}</b>
            <span className="sr-only"> leaves</span>
          </span>
        }
      >
        <LeafShop />
      </Section>

      <Section
        id="hunters"
        title="Top hunters"
        icon={<TrophyIcon />}
        aside={
          <span className={styles.stat}>
            <CoinIcon className={styles.statIcon} />
            <b className="tabular">{money.format(PRIZES.reduce((a, b) => a + b, 0))}</b> in prizes
          </span>
        }
      >
        <Hunters />
      </Section>

      <Section id="rules" title="Rules" icon={<ShieldIcon />}>
        <ul className={styles.rules}>
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Section>
    </PageContent>
  );
}
