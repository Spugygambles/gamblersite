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
import { GAMES, type GameInfo } from "@/lib/home";
import { ArrowIcon } from "./icons";
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

// The two big ones get a wide card with a pitch; the rest share a row.
// artSize is the art's square stage on the card, and artX how far right of
// the card's middle it's centred, both in px.
const FEATURES: Record<string, { kicker: string; title: string; text: string; cta: string; artSize: number; artX: number }> = {
  cases: {
    kicker: "Unbox",
    title: "Case Opening",
    text: "Unbox CS2 skins from cases at every price, from pocket change to high roller.",
    cta: "Open cases",
    artSize: 168,
    artX: 160,
  },
  "case-battles": {
    kicker: "Player vs player",
    title: "Case Battles",
    text: "Open the same cases head to head. The best total takes everything unboxed.",
    cta: "Join a battle",
    artSize: 200,
    artX: 142,
  },
};

function themeStyle(game: GameInfo) {
  return {
    "--tint": game.theme.tint,
    "--rim": game.theme.rim,
    "--art-size": `${game.art.size}%`,
    "--art-y": `${game.art.y}%`,
  } as CSSProperties;
}

export default function GameModes() {
  const features = GAMES.filter((g) => g.slug in FEATURES).sort((a, b) =>
    a.slug === "cases" ? -1 : b.slug === "cases" ? 1 : 0,
  );
  const originals = GAMES.filter((g) => !(g.slug in FEATURES));

  return (
    <>
      <div className={styles.features}>
        {features.map((g) => {
          const f = FEATURES[g.slug];
          return (
            // data-game-banner lets the art replay when the pointer moves on.
            <Link key={g.slug} href={`/${g.slug}`} className={styles.feature} style={themeStyle(g)} data-game-banner>
              <span className={styles.featureCopy}>
                <span className={styles.kicker}>{f.kicker}</span>
                <span className={styles.featureTitle}>{f.title}</span>
                <span className={styles.featureText}>{f.text}</span>
                <span className={styles.featureCta}>
                  {f.cta}
                  <ArrowIcon className={styles.ctaArrow} />
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
          <li key={g.slug}>
            <Link href={`/${g.slug}`} className={styles.game} style={themeStyle(g)} data-game-banner>
              <span className={styles.gameStage} aria-hidden>
                <span className={styles.gameArt}>{ART[g.slug]}</span>
              </span>
              <span className={styles.gameTitle}>{g.title}</span>
              <span className={styles.gameSub}>{g.subtitle}</span>
              <span className={styles.gameArrow} aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
