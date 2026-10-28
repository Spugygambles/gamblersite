import { MAPLE_LEAF } from "./icons";
import styles from "./PromoArt.module.css";

// Art for the promo banners, drawn as a set: cartoon style, flat colour
// with a dark outline round every shape, each boxed tight so it fills the
// space it's given. They all bob a little, and the turkey's tail opens and
// closes.

const LINE = "#170f1c";
const GOLD = "#e3a845";
const GOLD_DARK = "#c48a35";
const RED = "#c2503e";
const ORANGE = "#d9773f";
const CREAM = "#f6e9d6";
const BROWN = "#7d5034";

// The outline, drawn behind each shape's fill.
const ink = { stroke: LINE, strokeWidth: 3.4, paintOrder: "stroke", strokeLinejoin: "round" } as const;

// The Turkey Hunt: a turkey with its tail fanned up behind it.
export function TurkeyArt() {
  const feathers = [RED, ORANGE, GOLD];
  return (
    <svg className={styles.scene} viewBox="14 10 152 150" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <g className={styles.bob}>
        <g transform="translate(90 104) scale(0.8 1)">
          <g className={styles.fan}>
            {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((a, i) => (
              <ellipse key={a} cy="-52" rx="15" ry="41" transform={`rotate(${a})`} fill={feathers[i % 3]} {...ink} />
            ))}
            {[-60, -40, -20, 0, 20, 40, 60].map((a, i) => (
              <ellipse key={a} cy="-38" rx="11" ry="27" transform={`rotate(${a})`} fill={feathers[(i + 1) % 3]} {...ink} />
            ))}
            {[-40, -20, 0, 20, 40].map((a) => (
              <ellipse key={a} cy="-27" rx="7.5" ry="17" transform={`rotate(${a})`} fill={CREAM} {...ink} />
            ))}
          </g>
        </g>
        <path d="M80 144v10m-6 0h12M100 144v10m-6 0h12" stroke={LINE} strokeWidth="7" strokeLinecap="round" />
        <path d="M80 144v10m-6 0h12M100 144v10m-6 0h12" stroke={GOLD} strokeWidth="3.4" strokeLinecap="round" />
        <ellipse cx="90" cy="116" rx="37" ry="34" fill={BROWN} {...ink} />
        <ellipse cx="90" cy="124" rx="23" ry="22" fill="#9b6a46" />
        <ellipse cx="59" cy="116" rx="12" ry="21" transform="rotate(18 59 116)" fill="#5f3d29" {...ink} />
        <ellipse cx="121" cy="116" rx="12" ry="21" transform="rotate(-18 121 116)" fill="#5f3d29" {...ink} />
        <circle cx="90" cy="76" r="18" fill={BROWN} {...ink} />
        <circle cx="83" cy="72" r="5" fill="#fff" />
        <circle cx="97" cy="72" r="5" fill="#fff" />
        <circle cx="84.2" cy="73" r="2.6" fill={LINE} />
        <circle cx="98.2" cy="73" r="2.6" fill={LINE} />
        <path d="M84 80h12l-6 8.5Z" fill={GOLD} {...ink} />
        <path d="M94 84c4 1 6 4.6 5.4 9.2-.5 3.8-5 4-6 .6-.8-2.8-.4-6.8.6-9.8Z" fill={RED} {...ink} />
      </g>
    </svg>
  );
}

// The race: a gold cup with a star.
export function RaceArt() {
  const handles = "M58 40H42c0 22 12 34 30 36M122 40h16c0 22-12 34-30 36";
  return (
    <svg className={styles.scene} viewBox="34 18 112 129" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <g className={styles.bob}>
        <path d={handles} fill="none" stroke={LINE} strokeWidth="12" strokeLinecap="round" />
        <path d={handles} fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
        <path d="M56 22h68v34a34 34 0 0 1-68 0Z" fill={GOLD} {...ink} />
        <path d="M104 22h20v34a34 34 0 0 1-30 33.8c6-9 10-28 10-67.8Z" fill={GOLD_DARK} />
        <rect x="64" y="30" width="8" height="30" rx="4" fill="#f6d58c" />
        <path d="m90 34 4.4 9 9.9 1.4-7.2 7 1.7 9.8L90 56.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4Z" fill="#fff6e3" {...ink} />
        <path d="M82 92h16v18H82Z" fill={GOLD_DARK} {...ink} />
      </g>
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

// The deposit bonus: stacks of gold coins, and one stood up in front with a
// leaf on it.
export function BonusArt() {
  return (
    <svg className={styles.scene} viewBox="28 13 122 118" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <g className={styles.bob}>
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
      </g>
    </svg>
  );
}

// The daily case: a case done up with a bow.
export function CaseArt() {
  const loops = "M75 44C64 28 40 22 39 36c-1 12 22 13 36 8ZM75 44c11-16 35-22 36-8 1 12-22 13-36 8Z";
  return (
    <svg className={styles.scene} viewBox="22 24 106 102" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <g className={styles.bob}>
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
      </g>
    </svg>
  );
}
