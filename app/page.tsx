import type { ReactNode } from "react";
import CaseShelf from "@/components/home/CaseShelf";
import DropTicker from "@/components/home/DropTicker";
import EventsRow from "@/components/home/EventsRow";
import GameModes from "@/components/home/GameModes";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import Spotlight from "@/components/home/Spotlight";
import { CASES, GAMES } from "@/lib/home";
import styles from "./page.module.css";

function SectionHead({ index, id, title, children }: { index: string; id: string; title: string; children: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.index} aria-hidden>
        {index}
      </span>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      <span className={styles.rule} aria-hidden />
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <DropTicker />
      <main className={styles.main}>
        <h1 className="sr-only">Spugy: CS2 case opening, battles and games</h1>

        {/* The games come first, all of them on screen without scrolling. */}
        <section className={`${styles.section} ${styles.first}`} aria-labelledby="modes">
          <SectionHead index="01" id="modes" title="Game modes">
            <span className={styles.meta}>{GAMES.length} games</span>
          </SectionHead>
          <GameModes />
        </section>

        <section className={styles.section} aria-labelledby="rewards">
          <SectionHead index="02" id="rewards" title="Rewards & events">
            <span className={styles.meta}>Updated live</span>
          </SectionHead>
          <EventsRow />
        </section>

        <section className={styles.section} aria-labelledby="cases">
          <SectionHead index="03" id="cases" title="Popular cases">
            <span className={styles.meta}>{CASES.length} cases</span>
          </SectionHead>
          <CaseShelf />
        </section>
      </main>
      <SiteFooter />
      <Spotlight />
    </>
  );
}
