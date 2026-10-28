import styles from "./PromoArt.module.css";

// Seasonal art: the Turkey Hunt's turkey, cartoon style, flat colour with a
// dark outline round every shape and boxed tight so it fills the space it's
// given; it bobs a little and its tail opens and closes. And chat's rain,
// its name in pixel letters.

const LINE = "#170f1c";
const GOLD = "#e3a845";
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
