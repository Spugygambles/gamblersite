import type { ReactNode } from "react";
import { GAMES } from "@/lib/home";
import AppShell from "@/components/home/AppShell";
import ChatPanel from "@/components/home/ChatPanel";
import DropTicker from "@/components/home/DropTicker";
import EventsRow from "@/components/home/EventsRow";
import GameModes from "@/components/home/GameModes";
import Sidebar from "@/components/home/Sidebar";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { GamepadIcon } from "@/components/home/icons";
import styles from "./page.module.css";

function SectionHead({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <AppShell header={<SiteHeader />} sidebar={<Sidebar />} chat={<ChatPanel />}>
      <DropTicker />
      <div className={styles.content}>
        <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

        {/* A slim strip of what's on, then the games, all of them still on
            screen without scrolling. */}
        <section className={styles.promos} aria-labelledby="promotions">
          <h2 id="promotions" className="sr-only">
            Thanksgiving promotions
          </h2>
          <EventsRow />
        </section>

        <section className={styles.section} aria-labelledby="games">
          <SectionHead id="games" title="Games" icon={<GamepadIcon />}>
            <span className={styles.count}>{GAMES.length}</span>
          </SectionHead>
          <GameModes />
        </section>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
