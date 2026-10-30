import { MAPLE_LEAF } from "./icons";
import styles from "./PromoArt.module.css";

// Promo art, drawn as a set: cartoon style, flat colour with a dark
// outline round every shape, each boxed tight so it fills the space it's
// given. The prizes: a cup, coins and a case. And chat's rain, its name in
// pixel letters.

const LINE = "#170f1c";
const GOLD = "#e3a845";
const GOLD_DARK = "#c48a35";
const ORANGE = "#d9773f";

// The outline, drawn behind each shape's fill.
const ink = { stroke: LINE, strokeWidth: 3.4, paintOrder: "stroke", strokeLinejoin: "round" } as const;

// A gold cup with a star.
export function TrophyArt() {
  const handles = "M58 40H42c0 22 12 34 30 36M122 40h16c0 22-12 34-30 36";
  return (
    <svg className={styles.scene} viewBox="34 18 112 129" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <path d={handles} fill="none" stroke={LINE} strokeWidth="12" strokeLinecap="round" />
      <path d={handles} fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
      <path d="M56 22h68v34a34 34 0 0 1-68 0Z" fill={GOLD} {...ink} />
      <path d="M104 22h20v34a34 34 0 0 1-30 33.8c6-9 10-28 10-67.8Z" fill={GOLD_DARK} />
      <rect x="64" y="30" width="8" height="30" rx="4" fill="#f6d58c" />
      <path d="m90 34 4.4 9 9.9 1.4-7.2 7 1.7 9.8L90 56.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4Z" fill="#fff6e3" {...ink} />
      <path d="M82 92h16v18H82Z" fill={GOLD_DARK} {...ink} />
      <path d="M64 110h52a6 6 0 0 1 6 6v14H58v-14a6 6 0 0 1 6-6Z" fill="#6b4630" {...ink} />
      <path d="M72 118h36v6H72Z" fill={GOLD} />
      <path d="M48 130h84a5 5 0 0 1 5 5v8H43v-8a5 5 0 0 1 5-5Z" fill="#4e3324" {...ink} />
    </svg>
  );
}

// One stack of coins, `n` high, centred on `x` with its bottom at `y`.
function Stack({ x, y, n }: { x: number; y: number; n: number }) {
  const rx = 22;
  const ry = 7.5;
  const top = y - n * 7.5;
  const ridges = Array.from({ length: n - 1 }, (_, i) => `M${x - rx} ${y - (i + 1) * 7.5}a${rx} ${ry} 0 0 0 ${2 * rx} 0`);
  return (
    <>
      <path d={`M${x - rx} ${top}V${y}a${rx} ${ry} 0 0 0 ${2 * rx} 0V${top}Z`} fill={GOLD_DARK} {...ink} />
      <path d={ridges.join("")} fill="none" stroke={LINE} strokeWidth="2" />
      <ellipse cx={x} cy={top} rx={rx} ry={ry} fill={GOLD} {...ink} />
      <ellipse cx={x} cy={top} rx={rx - 6} ry={ry - 2.4} fill="none" stroke={GOLD_DARK} strokeWidth="2.4" />
    </>
  );
}

// Stacks of gold coins, and one stood up in front with a leaf on it.
export function CoinsArt() {
  return (
    <svg className={styles.scene} viewBox="28 13 122 118" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <Stack x={92} y={92} n={9} />
      <Stack x={54} y={102} n={4} />
      <Stack x={76} y={120} n={2} />
      <g transform="rotate(12 118 98)">
        <ellipse cx="123" cy="98" rx="19" ry="24" fill={GOLD_DARK} {...ink} />
        <ellipse cx="118" cy="98" rx="19" ry="24" fill={GOLD} {...ink} />
        <ellipse cx="118" cy="98" rx="13" ry="17.5" fill="none" stroke={GOLD_DARK} strokeWidth="2.4" />
        <path d={MAPLE_LEAF} transform="translate(108.5 88.5) scale(0.19)" fill={GOLD_DARK} />
        <path d="M105.5 86.5a15 19 0 0 1 7-7" fill="none" stroke="#f6d58c" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// A case done up with a bow.
export function GiftCaseArt() {
  const loops = "M75 44C64 28 40 22 39 36c-1 12 22 13 36 8ZM75 44c11-16 35-22 36-8 1 12-22 13-36 8Z";
  return (
    <svg className={styles.scene} viewBox="22 24 106 102" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <rect x="30" y="62" width="90" height="60" rx="8" fill="#46557a" {...ink} />
      <path d="M30 110h90v4a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" fill="#3a4766" />
      <rect x="26" y="47" width="98" height="24" rx="7" fill="#5d6c92" {...ink} />
      <rect x="33" y="52" width="26" height="5" rx="2.5" fill="#7d8cb4" />
      <rect x="38" y="66" width="12" height="13" rx="2.5" fill={GOLD} {...ink} />
      <rect x="100" y="66" width="12" height="13" rx="2.5" fill={GOLD} {...ink} />
      <path d="M67 47h16v75H67Z" fill={ORANGE} {...ink} />
      <path d={loops} fill={ORANGE} {...ink} />
      <path d="M72 42c-7-8-20-12-24-7M78 42c7-8 20-12 24-7" fill="none" stroke="#b55f2c" strokeWidth="3" strokeLinecap="round" />
      <rect x="69" y="38" width="12" height="12" rx="4" fill="#b55f2c" {...ink} />
    </svg>
  );
}

// Chat's rain: RAIN in chunky pixel letters, lighter along the top, with a
// dark copy dropped behind them down and to the right for depth.
const PIXELS: Record<string, string[]> = {
  R: ["11111.", "11..11", "11..11", "11111.", "11.11.", "11..11", "11..11"],
  A: [".1111.", "11..11", "11..11", "111111", "11..11", "11..11", "11..11"],
  I: ["1111", ".11.", ".11.", ".11.", ".11.", ".11.", "1111"],
  N: ["11..11", "111.11", "111111", "11.111", "11..11", "11..11", "11..11"],
};

// A word's pixels as path data: a square per pixel in rows `from` to `to`
// of each letter, each row's neighbours merged, moved `dx` and `dy` along.
function pixelPath(word: string, from: number, to: number, dx = 0, dy = 0) {
  let d = "";
  let x = dx;
  for (const letter of word) {
    const rows = PIXELS[letter];
    for (let y = from; y < to; y++) {
      for (const m of rows[y].matchAll(/1+/g)) d += `M${x + m.index} ${y + dy}h${m[0].length}v1h-${m[0].length}Z`;
    }
    x += rows[0].length + 2;
  }
  return d;
}

const RAIN_SHADOW = pixelPath("RAIN", 0, 7, 1, 1);
const RAIN_TOP = pixelPath("RAIN", 0, 3);
const RAIN_BOTTOM = pixelPath("RAIN", 3, 7);

export function RainWord({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 29 8" shapeRendering="crispEdges" aria-hidden>
      <path d={RAIN_SHADOW} fill="#4f1f09" />
      <path d={RAIN_BOTTOM} fill={ORANGE} />
      <path d={RAIN_TOP} fill="#f2a66b" />
    </svg>
  );
}
