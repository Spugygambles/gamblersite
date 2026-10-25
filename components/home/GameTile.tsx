import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { GameInfo } from "@/lib/home";
import styles from "./GameTile.module.css";

// Small deterministic random numbers, so every tile gets its own torn edge
// and texture but renders the same on the server and the client.
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// A rectangle with roughly torn edges: barely ragged on top and sides, more
// so along the bottom.
function tornEdge(seed: number) {
  const r = rng(seed);
  const pts: string[] = [];
  for (let x = 2; x <= 98; x += 6 + r() * 6) pts.push(`${r1(x)}% ${r1(r() * 1.4)}%`);
  for (let y = 3; y <= 95; y += 5 + r() * 6) pts.push(`${r1(100 - r() * 1.8)}% ${r1(y)}%`);
  for (let x = 98; x >= 2; x -= 5 + r() * 5) pts.push(`${r1(x)}% ${r1(100 - r() * 3.6)}%`);
  for (let y = 95; y >= 3; y -= 5 + r() * 6) pts.push(`${r1(r() * 1.8)}% ${r1(y)}%`);
  return `polygon(${pts.join(", ")})`;
}

// A faint mosaic of squares behind the art, like the pixel grid on the
// site's game boards.
function mosaic(seed: number) {
  const r = rng(seed + 99);
  const cell = 18;
  const n = 8;
  let rects = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = r();
      if (a < 0.45) continue;
      rects += `<rect x='${x * cell + 1}' y='${y * cell + 1}' width='${cell - 2}' height='${cell - 2}' fill-opacity='${((a - 0.45) * 0.16).toFixed(3)}'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cell * n}' height='${cell * n}' fill='white'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// A few sparkles and rings dotted round the art, in different spots per tile.
function decor(seed: number) {
  const r = rng(seed + 7);
  const spots = [
    { x: 74 + r() * 16, y: 12 + r() * 10 },
    { x: 8 + r() * 14, y: 40 + r() * 16 },
    { x: 78 + r() * 12, y: 50 + r() * 14 },
  ];
  return spots.map((s, i) => ({ ...s, kind: i === 1 ? "ring" : "plus", size: i === 0 ? 9 : 6, delay: r() * 3 }));
}

type Props = {
  game: GameInfo;
  art: ReactNode;
  index: number;
};

export default function GameTile({ game, art, index }: Props) {
  const seed = index * 31 + 7;
  const style = {
    "--tint": game.theme.tint,
    "--rim": game.theme.rim,
    "--sub": game.theme.sub,
    "--edge": tornEdge(seed),
    "--mosaic": mosaic(seed),
    "--mosaic-pos": `${Math.round(rng(seed)() * 140)}px 0`,
    "--art-size": `${game.art.size}%`,
    "--art-y": `${game.art.y}%`,
  } as CSSProperties;

  // data-game-banner lets the art replay when the pointer moves onto the tile.
  return (
    <div className={styles.slot}>
      <Link href={`/${game.slug}`} className={styles.tile} style={style} data-game-banner>
        <span className={styles.face} aria-hidden />
        {decor(seed).map((d, i) => (
          <span
            key={i}
            className={d.kind === "ring" ? styles.ring : styles.plus}
            style={{ left: `${r1(d.x)}%`, top: `${r1(d.y)}%`, width: d.size, height: d.size, animationDelay: `${-d.delay.toFixed(2)}s` }}
            aria-hidden
          />
        ))}
        <span className={styles.art} aria-hidden>
          {art}
        </span>
        <span className={styles.title}>{game.title}</span>
        <span className={styles.sub}>{game.subtitle}</span>
      </Link>
    </div>
  );
}
