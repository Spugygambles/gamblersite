import { MAPLE_LEAF } from "./icons";
import styles from "./PromoArt.module.css";

// Flat autumn scenes for the promo tiles, drawn in a 180 x 160 box that sits
// in the tile's bottom right corner. Matte: solid shapes, no gradients or
// glows. Leaves sway, and the turkey and the trophy bob a little.

const GOLD = "#f2b544";
const GOLD_DARK = "#d99a34";
const GOLD_SIDE = "#c98b2b";
const ORANGE = "#ef7d2d";
const RED = "#d9442f";
const CREAM = "#fff1df";
const BROWN = "#8a5232";
const BROWN_LIGHT = "#a96a3e";
const BROWN_DARK = "#6e3f25";

/** A maple leaf with its veins, centred on (x, y), turned and scaled. */
function Leaf({ x, y, size = 1, turn = 0, fill, delay = 0 }: { x: number; y: number; size?: number; turn?: number; fill: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${size}) translate(-50 -54)`}>
      <g className={styles.sway} style={{ animationDelay: `${delay}s` }}>
        <path d={MAPLE_LEAF} fill={fill} stroke={fill} strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M50 88V30M50 60 70 44M50 60 30 44M50 70 66 66M50 70 34 66"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </g>
  );
}

/** A flat coin lying down, its left edge at x and its bottom at y. */
function Coin({ x, y }: { x: number; y: number }) {
  const t = 9;
  return (
    <>
      <path d={`M${x} ${y - t}V${y}A32 12 0 0 0 ${x + 64} ${y}V${y - t}A32 12 0 0 1 ${x} ${y - t}Z`} fill={GOLD_SIDE} />
      <ellipse cx={x + 32} cy={y - t} rx="32" ry="12" fill={GOLD} />
      <ellipse cx={x + 32} cy={y - t} rx="23" ry="8" fill="none" stroke={GOLD_DARK} strokeWidth="2.4" />
    </>
  );
}

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg className={styles.scene} viewBox="0 0 180 160" aria-hidden>
      {children}
    </svg>
  );
}

// The deposit bonus: two stacks of coins under falling leaves.
export function BonusArt() {
  return (
    <Scene>
      <Leaf x={124} y={56} size={0.95} turn={22} fill={RED} />
      <Leaf x={70} y={50} size={0.8} turn={-28} fill={GOLD} delay={-1.2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Coin key={`a${i}`} x={30 + (i % 2) * 3} y={150 - i * 10} />
      ))}
      {[0, 1, 2].map((i) => (
        <Coin key={`b${i}`} x={94 + (i % 2) * 2} y={150 - i * 10} />
      ))}
      <Leaf x={152} y={128} size={0.34} turn={40} fill={CREAM} delay={-0.6} />
    </Scene>
  );
}

// The Turkey Hunt: a turkey with its tail fanned out.
export function TurkeyArt() {
  const outer = [RED, ORANGE, GOLD];
  return (
    <Scene>
      <g className={styles.bob}>
        <g transform="translate(90 102)">
          <g className={styles.fan}>
            {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((a, i) => (
              <ellipse key={a} cy="-52" rx="14" ry="40" transform={`rotate(${a})`} fill={outer[i % 3]} />
            ))}
            {[-60, -40, -20, 0, 20, 40, 60].map((a, i) => (
              <ellipse key={a} cy="-38" rx="10" ry="27" transform={`rotate(${a})`} fill={outer[(i + 1) % 3]} />
            ))}
            {[-40, -20, 0, 20, 40].map((a) => (
              <ellipse key={a} cy="-27" rx="7" ry="17" transform={`rotate(${a})`} fill={CREAM} />
            ))}
          </g>
        </g>
        <ellipse cx="90" cy="114" rx="36" ry="33" fill={BROWN} />
        <ellipse cx="90" cy="121" rx="23" ry="22" fill={BROWN_LIGHT} />
        <ellipse cx="60" cy="114" rx="11" ry="20" transform="rotate(18 60 114)" fill={BROWN_DARK} />
        <ellipse cx="120" cy="114" rx="11" ry="20" transform="rotate(-18 120 114)" fill={BROWN_DARK} />
        <circle cx="90" cy="76" r="17" fill={BROWN} />
        <circle cx="83.5" cy="72" r="4.6" fill="#fff" />
        <circle cx="96.5" cy="72" r="4.6" fill="#fff" />
        <circle cx="84.5" cy="73" r="2.3" fill="#2b1a0f" />
        <circle cx="97.5" cy="73" r="2.3" fill="#2b1a0f" />
        <path d="M84.5 79h11l-5.5 8Z" fill={GOLD} stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
        <path d="M93 83c4 1 5.5 4.5 5 9-.4 3.6-4.6 3.8-5.6.6-.8-2.6-.4-6.6.6-9.6Z" fill={RED} />
      </g>
      <path d="M80 146v8m-5 0h10M100 146v8m-5 0h10" stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />
    </Scene>
  );
}

// The race: a trophy on the top step of a podium.
export function RaceArt() {
  const step = { fontFamily: "var(--font-ui), sans-serif", fontWeight: 900 } as const;
  return (
    <Scene>
      <Leaf x={28} y={40} size={0.42} turn={-30} fill={ORANGE} />
      <Leaf x={152} y={58} size={0.5} turn={25} fill={RED} delay={-1.4} />
      <Leaf x={140} y={18} size={0.3} turn={60} fill={GOLD} delay={-0.7} />
      <rect x="8" y="112" width="54" height="50" rx="3" fill="#e9d6bb" />
      <rect x="118" y="122" width="54" height="40" rx="3" fill="#dcc6a6" />
      <rect x="60" y="94" width="60" height="68" rx="3" fill={CREAM} />
      <text x="90" y="134" textAnchor="middle" fontSize="26" fill="#3d5a2e" style={step}>
        1
      </text>
      <text x="35" y="144" textAnchor="middle" fontSize="20" fill="#3d5a2e" opacity="0.75" style={step}>
        2
      </text>
      <text x="145" y="150" textAnchor="middle" fontSize="18" fill="#3d5a2e" opacity="0.75" style={step}>
        3
      </text>
      <g className={styles.bob}>
        <path d="M72 34h-7a8 8 0 0 0 0 16h7M108 34h7a8 8 0 0 1 0 16h-7" stroke={GOLD_DARK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M70 26h40v16a20 20 0 0 1-40 0Z" fill={GOLD} />
        <path d="M98 26h12v16a20 20 0 0 1-17 19.8c3.5-6 5-17 5-35.8Z" fill={GOLD_DARK} />
        <rect x="76" y="30" width="5" height="16" rx="2.5" fill="#ffd98a" />
        <rect x="86" y="61" width="8" height="12" fill={GOLD_DARK} />
        <rect x="76" y="72" width="28" height="10" rx="2" fill={BROWN_DARK} />
        <path d="m90 33 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" fill={CREAM} />
      </g>
      <rect x="72" y="82" width="36" height="12" rx="2" fill="#5a331e" />
    </Scene>
  );
}
