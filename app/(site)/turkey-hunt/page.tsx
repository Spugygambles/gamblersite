import type { Metadata } from "next";
import { RULES } from "@/lib/event";
import Board from "@/components/event/Board";
import Calendar from "@/components/event/Calendar";
import CaseShop from "@/components/event/CaseShop";
import EventHero from "@/components/event/EventHero";
import EventTabs from "@/components/event/EventTabs";
import Section, { PageContent } from "@/components/home/Section";
import { ShieldIcon } from "@/components/home/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Turkey Hunt — CsgoNeo",
  description:
    "Thanksgiving on CsgoNeo: claim a gift a day, spend maple leaves on Thanksgiving cases, and catch turkeys in any game to climb the hunters' board.",
};

// The Turkey Hunt: the field at dusk across the top with the event's
// banner and the three ways to win as cards over it, their panels under
// them, and the rules at the end.
export default function TurkeyHunt() {
  return (
    <>
      <EventHero>
        <EventTabs panels={{ calendar: <Calendar />, shop: <CaseShop />, board: <Board /> }} />
      </EventHero>
      <PageContent>
        <Section id="rules" title="Rules" icon={<ShieldIcon />}>
          <ul className={styles.rules}>
            {RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Section>
      </PageContent>
    </>
  );
}
