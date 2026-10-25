import type { ReactNode } from "react";
import BattleArt from "@/components/BattleArt";
import BlackjackArt from "@/components/BlackjackArt";
import CaseArt from "@/components/CaseArt";
import CoinflipArt from "@/components/CoinflipArt";
import CrashArt from "@/components/CrashArt";
import GameTile from "@/components/home/GameTile";
import HeroShowcase, { LevelBar } from "@/components/home/HeroShowcase";
import PromoCarousel from "@/components/home/PromoCarousel";
import SiteHeader from "@/components/home/SiteHeader";
import KenoArt from "@/components/KenoArt";
import LimboArt from "@/components/LimboArt";
import MinesArt from "@/components/MinesArt";
import UpgraderArt from "@/components/UpgraderArt";
import { GAMES } from "@/lib/home";
import styles from "./page.module.css";

const ART: Record<string, ReactNode> = {
  "case-battles": <BattleArt />,
  cases: <CaseArt />,
  upgrader: <UpgraderArt />,
  mines: <MinesArt />,
  keno: <KenoArt />,
  crash: <CrashArt />,
  limbo: <LimboArt />,
  coinflip: <CoinflipArt />,
  blackjack: <BlackjackArt />,
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <PromoCarousel />

        <section className={styles.games} aria-labelledby="our-games">
          <div className={styles.gamesCol}>
            <h1 id="our-games" className={styles.heading}>
              Our Games
            </h1>
            <div className={styles.grid}>
              {GAMES.map((g, i) => (
                <GameTile key={g.slug} game={g} art={ART[g.slug]} index={i} />
              ))}
            </div>
          </div>

          <aside className={styles.heroCol} aria-label="Your level">
            <LevelBar />
            <HeroShowcase />
          </aside>
        </section>
      </main>
    </>
  );
}
