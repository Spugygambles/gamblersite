import Link from "next/link";
import type { ReactNode } from "react";
import DropTicker from "@/components/home/DropTicker";
import EventsRow from "@/components/home/EventsRow";
import GameModes from "@/components/home/GameModes";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import styles from "./page.module.css";

function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.head}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
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
        <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

        {/* The games come first, all of them on screen without scrolling. */}
        <section className={`${styles.section} ${styles.first}`} aria-labelledby="games">
          <SectionHead id="games" title="Games" />
          <GameModes />
        </section>

        <section className={styles.section} aria-labelledby="promotions">
          <SectionHead id="promotions" title="Promotions">
            <Link href="/rewards" className={styles.more}>
              View all
            </Link>
          </SectionHead>
          <EventsRow />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
