import type { ReactNode } from "react";
import { GAMES } from "@/lib/home";
import AppShell from "@/components/home/AppShell";
import ChatPanel from "@/components/home/ChatPanel";
import GameModes from "@/components/home/GameModes";
import LiveBets from "@/components/home/LiveBets";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { GamepadIcon, SlipIcon } from "@/components/home/icons";
import MobileBar from "@/components/home/MobileBar";
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
    <AppShell header={<SiteHeader />} chat={<ChatPanel />} tabBar={<MobileBar />}>
      <div className={styles.content}>
        <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

        {/* The games first, all of them on screen without scrolling. */}
        <section className={styles.section} aria-labelledby="games">
          <SectionHead id="games" title="Games" icon={<GamepadIcon />}>
            <span className={styles.count}>{GAMES.length}</span>
          </SectionHead>
          <GameModes />
        </section>

        <section className={styles.section} aria-labelledby="bets">
          <SectionHead id="bets" title="Recent bets" icon={<SlipIcon />} />
          <LiveBets />
        </section>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
