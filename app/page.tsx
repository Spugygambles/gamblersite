import Link from "next/link";
import Script from "next/script";
import type { CSSProperties, ReactNode } from "react";
import BootScreen from "@/components/home/BootScreen";
import DropTicker from "@/components/home/DropTicker";
import EventsRow from "@/components/home/EventsRow";
import GameModes from "@/components/home/GameModes";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { GAMES } from "@/lib/home";
import styles from "./page.module.css";

// Section heads: a small neon mark, the title (which glitches now and then),
// and a count or a link.
function SectionHead({ id, title, glitch, children }: { id: string; title: string; glitch: [string, string]; children?: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.mark} aria-hidden />
      <h2
        id={id}
        className={`${styles.title} glitch`}
        data-text={title}
        style={{ "--glitch-every": glitch[0], "--glitch-delay": glitch[1] } as CSSProperties}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className={styles.screen}>
      {/* Digital rain behind everything; public/neo/effects.js draws it. */}
      <canvas className={styles.rain} data-rain aria-hidden />
      <SiteHeader />
      <DropTicker />
      <main className={styles.main}>
        <h1 className="sr-only">Spugy: CS2 case opening, battles and games</h1>

        {/* The games come first, all of them on screen without scrolling. */}
        <section className={`${styles.section} ${styles.first}`} aria-labelledby="games">
          <SectionHead id="games" title="Games" glitch={["6s", "-1s"]}>
            <span className={styles.count}>{GAMES.length}</span>
          </SectionHead>
          <GameModes />
        </section>

        <section className={styles.section} aria-labelledby="promotions">
          <SectionHead id="promotions" title="Promotions" glitch={["8s", "-3.6s"]}>
            <Link href="/rewards" className={styles.more}>
              View all
            </Link>
          </SectionHead>
          <EventsRow />
        </section>
      </main>
      <SiteFooter />
      <BootScreen />
      <Script src="/neo/effects.js" strategy="afterInteractive" />
    </div>
  );
}
