import CaseShelf from "@/components/home/CaseShelf";
import DropTicker from "@/components/home/DropTicker";
import FeaturedCase from "@/components/home/FeaturedCase";
import GameModes from "@/components/home/GameModes";
import PromoRotator from "@/components/home/PromoRotator";
import RewardsCard from "@/components/home/RewardsCard";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { CASES, GAMES } from "@/lib/home";
import styles from "./page.module.css";

function SectionHead({ index, id, title, meta }: { index: string; id: string; title: string; meta: string }) {
  return (
    <div className={styles.head}>
      <span className={styles.index} aria-hidden>
        {index}
      </span>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      <span className={styles.rule} aria-hidden />
      <span className={styles.meta}>{meta}</span>
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

        <div className={styles.hero}>
          <FeaturedCase />
          <div className={styles.side}>
            <RewardsCard />
            <PromoRotator />
          </div>
        </div>

        <section className={styles.section} aria-labelledby="modes">
          <SectionHead index="01" id="modes" title="Game modes" meta={`${GAMES.length} games`} />
          <GameModes />
        </section>

        <section className={styles.section} aria-labelledby="cases">
          <SectionHead index="02" id="cases" title="Popular cases" meta={`${CASES.length} cases`} />
          <CaseShelf />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
