import { Russo_One } from "next/font/google";
import type { CSSProperties } from "react";
import Embers, { type Ember } from "./Embers";
import styles from "./StreamBanner.module.css";

// The heavy, squared-off face closest to the Rustwild wordmark.
const russo = Russo_One({ weight: "400", subsets: ["latin"] });

// A long, horizontal banner for the stream overlay. It loops forever between
// two scenes, each brought in by a claw swipe across the whole banner: the
// Rustwild logo, then the deposit bonus. All timing lives in
// StreamBanner.module.css.

// A claw mark: a sliver from (x1, y1) to (x2, y2), pointed at both ends and
// `w` thick in the middle.
function lens(x1: number, y1: number, x2: number, y2: number, w: number) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * w;
  const ny = ((x2 - x1) / len) * w;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const f = (n: number) => n.toFixed(2);
  return (
    `M${f(x1)} ${f(y1)}Q${f(mx + nx)} ${f(my + ny)} ${f(x2)} ${f(y2)}` +
    `Q${f(mx - nx)} ${f(my - ny)} ${f(x1)} ${f(y1)}Z`
  );
}

// The three marks of the logo's claw, traced from the logo.
const CLAW = [
  lens(0, 59, 71, 0, 7.5),
  lens(4, 90, 97, 9, 8),
  lens(33, 100, 100, 40, 7.5),
];

// Purple embers drifting up across the banner; see Embers. x and y are % of
// the banner's width and height, rise and sway % of its width.
const EMBERS: Ember[] = [
  { x: 4, y: 112, size: 0.88, rise: 30, sway: 0.8, speed: 1, phase: 0.1 },
  { x: 11, y: 120, size: 0.64, rise: 26, sway: -0.6, speed: 2, phase: 0.55 },
  { x: 18, y: 108, size: 1.12, rise: 32, sway: 0.7, speed: 1, phase: 0.8 },
  { x: 26, y: 116, size: 0.72, rise: 28, sway: -0.8, speed: 2, phase: 0.3 },
  { x: 33, y: 124, size: 0.96, rise: 34, sway: 0.6, speed: 1, phase: 0.45 },
  { x: 41, y: 110, size: 0.64, rise: 27, sway: -0.6, speed: 2, phase: 0.9 },
  { x: 49, y: 118, size: 1.04, rise: 31, sway: 0.8, speed: 1, phase: 0.2 },
  { x: 56, y: 112, size: 0.72, rise: 29, sway: -0.7, speed: 2, phase: 0.65 },
  { x: 63, y: 122, size: 0.88, rise: 33, sway: 0.6, speed: 1, phase: 0.7 },
  { x: 71, y: 109, size: 0.64, rise: 26, sway: -0.8, speed: 2, phase: 0.05 },
  { x: 78, y: 117, size: 1.12, rise: 32, sway: 0.7, speed: 1, phase: 0.35 },
  { x: 86, y: 113, size: 0.72, rise: 28, sway: -0.6, speed: 2, phase: 0.5 },
  { x: 93, y: 121, size: 0.96, rise: 30, sway: 0.8, speed: 1, phase: 0.95 },
  { x: 98, y: 110, size: 0.64, rise: 27, sway: -0.7, speed: 2, phase: 0.75 },
];

// The digits each reel of the "10%" spins through before it lands.
const REEL_TENS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1];
const REEL_ONES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export default function StreamBanner() {
  return (
    <div className={`${styles.banner} ${russo.className}`} role="img" aria-label="Rustwild: 10% deposit bonus and more rewards">
      <div className={styles.backdrop}>
        <div className={styles.aurora} />
        <div className={styles.hatch} />
        <div className={styles.ambient}>
          <Embers embers={EMBERS} />
        </div>
      </div>

      <div className={styles.logoScene}>
        <div className={styles.logo}>
          <svg className={styles.claw} viewBox="-8 -8 116 124" aria-hidden>
            {CLAW.map((d, i) => (
              <path key={i} d={d} className={styles.clawMark} style={{ "--k": i } as CSSProperties} />
            ))}
          </svg>
          <span className={styles.rust}>RUST</span>
          <span className={styles.wild}>WILD</span>
        </div>
      </div>

      <div className={styles.promoScene}>
        <div className={styles.percent}>
          <span className={styles.reel}>
            <span className={styles.reelStrip} data-reel="tens">
              {REEL_TENS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </span>
          </span>
          <span className={styles.reel}>
            <span className={styles.reelStrip} data-reel="ones">
              {REEL_ONES.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </span>
          </span>
          <span className={styles.sign}>%</span>
          <span className={styles.ring} />
        </div>

        <div className={styles.copy}>
          <span className={styles.line}>
            <span className={styles.headline}>DEPOSIT BONUS</span>
          </span>
          <span className={styles.line}>
            <span className={styles.subline}>+ MORE REWARDS</span>
          </span>
        </div>

        <div className={styles.rewards}>
          <Crown />
          <Gift />
          <Gem />
        </div>
      </div>

      {/* The claw swipe that carries the banner from one scene to the next. */}
      <svg className={styles.swipe} viewBox="0 0 1000 187.5" preserveAspectRatio="none" aria-hidden>
        {[-1, 0, 1].map((k) => (
          <g key={k} transform={`translate(${500 + k * 78} ${94 + k * 8}) rotate(-38)`}>
            <path className={styles.slashGlow} d={lens(-240, 0, 240, 0, 34)} style={{ "--k": k + 1 } as CSSProperties} />
            <path className={styles.slash} d={lens(-240, 0, 240, 0, 17)} style={{ "--k": k + 1 } as CSSProperties} />
            <path className={styles.slashCore} d={lens(-210, 0, 210, 0, 5)} style={{ "--k": k + 1 } as CSSProperties} />
          </g>
        ))}
      </svg>
      <div className={styles.flash} />
    </div>
  );
}

function Crown() {
  return (
    <svg className={`${styles.reward} ${styles.crown}`} viewBox="0 0 100 100" aria-hidden>
      <path d="M12 74 6 30l25 20L50 18l19 32 25-20-6 44Z" fill="#7838f0" />
      <path d="M12 74 6 30l25 20L50 18l19 32 25-20-6 44Z" fill="url(#rw-sheen)" />
      <rect x="12" y="74" width="76" height="12" rx="3" fill="#5b24c4" />
      <circle cx="50" cy="56" r="7" fill="#efe4ff" />
      <circle cx="6" cy="30" r="5" fill="#b892ff" />
      <circle cx="50" cy="18" r="5" fill="#b892ff" />
      <circle cx="94" cy="30" r="5" fill="#b892ff" />
    </svg>
  );
}

function Gift() {
  return (
    <svg className={`${styles.reward} ${styles.gift}`} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="rw-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M50 30C40 10 22 12 26 24c3 8 16 7 24 6Z" fill="#b892ff" />
      <path d="M50 30C60 10 78 12 74 24c-3 8-16 7-24 6Z" fill="#9c6bff" />
      <rect x="14" y="44" width="72" height="48" rx="5" fill="#6a2fe0" />
      <rect x="8" y="30" width="84" height="18" rx="4" fill="#8a4dff" />
      <rect x="8" y="30" width="84" height="18" rx="4" fill="url(#rw-sheen)" />
      <rect x="43" y="30" width="14" height="62" fill="#efe4ff" />
      <rect x="14" y="48" width="72" height="5" fill="#000" opacity="0.2" />
    </svg>
  );
}

function Gem() {
  return (
    <svg className={`${styles.reward} ${styles.gem}`} viewBox="0 0 100 90" aria-hidden>
      <polygon points="4,30 32,8 38,30" fill="#a57bff" />
      <polygon points="32,8 68,8 62,30 38,30" fill="#7838f0" />
      <polygon points="68,8 96,30 62,30" fill="#c2a3ff" />
      <polygon points="32,8 68,8 64,13 36,13" fill="#e2d2ff" />
      <polygon points="4,30 38,30 50,88" fill="#5520c0" />
      <polygon points="38,30 62,30 50,88" fill="#7a3df2" />
      <polygon points="62,30 96,30 50,88" fill="#6a2fe0" />
      <polygon points="12,28 29,13 33,15 18,29" fill="#fff" opacity="0.5" />
    </svg>
  );
}
