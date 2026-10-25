import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import BattleArt from "@/components/BattleArt";
import BlackjackArt from "@/components/BlackjackArt";
import CaseArt from "@/components/CaseArt";
import CoinflipArt from "@/components/CoinflipArt";
import CrashArt from "@/components/CrashArt";
import KenoArt from "@/components/KenoArt";
import LimboArt from "@/components/LimboArt";
import MinesArt from "@/components/MinesArt";
import UpgraderArt from "@/components/UpgraderArt";
import { count, GAMES, type GameInfo } from "@/lib/home";
import styles from "./GameModes.module.css";

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

// Cases and battles get a wide banner each; the originals share a row.
// artSize is the art's square stage on the banner, and artX how far right of
// the banner's middle it's centred, both in px.
const FEATURES = [
  { slug: "cases", title: "Case Opening", text: "Unbox CS2 skins from just $0.49 a case.", cta: "Open cases", artSize: 150, artX: 160 },
  {
    slug: "case-battles",
    title: "Case Battles",
    text: "Go head to head. The best unbox wins.",
    cta: "Start a battle",
    artSize: 190,
    artX: 142,
  },
];

const bySlug = (slug: string) => GAMES.find((g) => g.slug === slug)!;

function vars(game: GameInfo) {
  return {
    "--art-size": `${game.art.size}%`,
    "--art-y": `${game.art.y}%`,
  } as CSSProperties;
}

function Playing({ n }: { n: number }) {
  return (
    <span className={styles.playing}>
      <span className={styles.dot} aria-hidden />
      {count.format(n)} playing
    </span>
  );
}

export default function GameModes() {
  const originals = GAMES.filter((g) => !FEATURES.some((f) => f.slug === g.slug));

  return (
    <>
      <div className={styles.features}>
        {FEATURES.map((f) => {
          const g = bySlug(f.slug);
          return (
            // data-game-banner lets the art replay when the pointer moves on.
            <Link key={g.slug} href={`/${g.slug}`} className={styles.feature} style={vars(g)} data-game-banner>
              <span className={styles.featureCopy}>
                <span className={styles.featureTitle}>{f.title}</span>
                <span className={styles.featureText}>{f.text}</span>
                <span className={styles.featureFoot}>
                  <span className={styles.button}>{f.cta}</span>
                  <Playing n={g.playing} />
                </span>
              </span>
              <span className={styles.featureArt} style={{ width: f.artSize, left: `calc(50% + ${f.artX}px)` }} aria-hidden>
                {ART[g.slug]}
              </span>
            </Link>
          );
        })}
      </div>

      <ul className={styles.originals}>
        {originals.map((g) => (
          <li key={g.slug} className={styles.item}>
            <Link href={`/${g.slug}`} className={styles.tile} style={vars(g)} data-game-banner>
              <span className={styles.tileArt} aria-hidden>
                {ART[g.slug]}
              </span>
              {g.tag && <span className={`${styles.tag} ${g.tag === "Hot" ? styles.hot : ""}`}>{g.tag}</span>}
              <span className={styles.tileTitle}>{g.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
