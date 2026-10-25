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
// The title's second word is in gold. artSize is the art's square stage on
// the banner, and artX how far right of the banner's middle it's centred,
// both in px.
const FEATURES = [
  { slug: "cases", title: ["Case", "Opening"], text: "Unbox CS2 skins from $0.49 a case.", cta: "Open cases", artSize: 150, artX: 160 },
  { slug: "case-battles", title: ["Case", "Battles"], text: "Go head to head. The best unbox wins.", cta: "Start a battle", artSize: 190, artX: 142 },
];

const bySlug = (slug: string) => GAMES.find((g) => g.slug === slug)!;

// Small deterministic random numbers, so each card gets its own pattern but
// renders the same on the server and the client.
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

// A faint mosaic of gold tiles behind each card's art.
function mosaic(seed: number) {
  const r = rng(seed);
  const cell = 14;
  const n = 12;
  let rects = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = r();
      if (a < 0.4) continue;
      rects += `<rect x='${x * cell + 1}' y='${y * cell + 1}' width='${cell - 2}' height='${cell - 2}' rx='1.5' fill-opacity='${((a - 0.4) * 0.13).toFixed(3)}'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cell * n}' height='${cell * n}' fill='%23ffc531'>${rects}</svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
}

function vars(game: GameInfo, seed: number) {
  return {
    "--art-size": `${game.art.size}%`,
    "--art-y": `${game.art.y}%`,
    "--mosaic": mosaic(seed),
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
        {FEATURES.map((f, i) => {
          const g = bySlug(f.slug);
          return (
            // data-game-banner lets the art replay when the pointer moves on.
            <Link key={g.slug} href={`/${g.slug}`} className={styles.feature} style={vars(g, 40 + i)} data-game-banner>
              <span className={styles.featureCopy}>
                <span className={styles.featureTitle}>
                  {f.title[0]} <span className={styles.gold}>{f.title[1]}</span>
                </span>
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
        {originals.map((g, i) => (
          <li key={g.slug} className={styles.item}>
            <Link href={`/${g.slug}`} className={styles.tile} style={vars(g, 7 + i * 13)} data-game-banner>
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
