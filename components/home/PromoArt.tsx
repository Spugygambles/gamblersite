import Image from "next/image";
import { useId } from "react";
import { CoinIcon, PumpkinIcon } from "./icons";
import styles from "./PromoCarousel.module.css";

// The Mines gem: faceted green, light from the top left.
function Gem({ size, label, className }: { size: number; label?: string; className?: string }) {
  const id = useId();
  return (
    <svg className={className} width={size} height={size * 0.9} viewBox="0 0 100 90" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="4,30 32,8 38,30" fill="#6df07a" />
      <polygon points="32,8 68,8 62,30 38,30" fill="#39c847" />
      <polygon points="68,8 96,30 62,30" fill="#8cf796" />
      <polygon points="4,30 38,30 50,88" fill="#1f9a2a" />
      <polygon points="38,30 62,30 50,88" fill="#33c23d" />
      <polygon points="62,30 96,30 50,88" fill="#27ad31" />
      <polygon points="4,30 32,8 68,8 96,30 50,88" fill={`url(#${id}-sheen)`} />
      <polygon points="12,28 29,13 33,15 18,29" fill="#fff" opacity="0.6" />
      {label && (
        <text x="50" y="47" textAnchor="middle" fontFamily="var(--font-rubik)" fontWeight="800" fontSize={label.length === 1 ? 34 : 22} fill="#0f4a17">
          {label}
        </text>
      )}
    </svg>
  );
}

function Bolt({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden>
      <path d="M2 30 26 14l-2 9L58 4 30 26l2-8Z" fill="#ff4fd8" />
      <path d="M8 28 26 16l-1.4 6.4L50 8 30 24l1.4-5.6Z" fill="#ffc2f2" opacity="0.7" />
    </svg>
  );
}

export function MinesArt() {
  return (
    <div className={styles.artMines}>
      <Bolt className={styles.bolt} />
      <span className={`${styles.pixel} ${styles.p1}`} />
      <span className={`${styles.pixel} ${styles.p2}`} />
      <span className={`${styles.pixel} ${styles.p3}`} />
      <Gem size={46} label="8" className={styles.gemSmall} />
      <Gem size={92} label="24" className={styles.gemBig} />
    </div>
  );
}

export function BonusArt() {
  return (
    <div className={styles.artBonus}>
      {[0, 1, 2, 3, 4].map((i) => (
        <CoinIcon key={i} className={styles.stackCoin} style={{ bottom: 6 + i * 9, left: 22 + (i % 2) * 3 }} />
      ))}
      <CoinIcon className={styles.flipCoin} />
      <span className={styles.bonusTag}>+10%</span>
    </div>
  );
}

export function BattleArt() {
  return (
    <div className={styles.artBattle}>
      <Image src="/battles/new-year-case.png" alt="" width={576} height={582} className={styles.battleLeft} unoptimized />
      <span className={styles.vs}>VS</span>
      <Image src="/battles/music-box-case.png" alt="" width={1088} height={844} className={styles.battleRight} unoptimized />
    </div>
  );
}

// $10 goes in, the pointer spins and lands in the 10% win zone: $100.
export function UpgradeArt() {
  const id = useId();
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className={styles.artUpgrade}>
      <span className={styles.upChip}>
        <CoinIcon className={styles.upCoin} />
        $10
      </span>
      <svg className={styles.upArrow} viewBox="0 0 24 24" aria-hidden>
        <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className={styles.dialWrap}>
        <svg viewBox="0 0 100 100" className={styles.dial} aria-hidden>
          <defs>
            <radialGradient id={`${id}-face`} cx="0.5" cy="0.4" r="0.6">
              <stop offset="0" stopColor="#2c1858" />
              <stop offset="1" stopColor="#0d0820" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill={`url(#${id}-face)`} stroke="#f2f0fa" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#b77dff"
            strokeWidth="9"
            strokeDasharray={`${c * 0.1} ${c}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <svg viewBox="0 0 100 100" className={styles.dialPointer} aria-hidden>
          <path d="M50 15 44.5 3h11Z" fill="#fff" />
        </svg>
        <span className={styles.dialValue}>$100</span>
      </div>
    </div>
  );
}

export function PumpkinArt() {
  return (
    <div className={styles.artPumpkin}>
      <PumpkinIcon className={styles.pumpkinBig} />
      <PumpkinIcon className={styles.pumpkinSmall} />
      <svg className={styles.bat} viewBox="0 0 40 18" aria-hidden>
        <path d="M20 6c1-3 2-4 2-4l1 3c3-3 8-3 10-1-2 0-3 2-3 4-2-1-4 0-5 2-2-1-3-1-5 0-2-2-3-2-5-2-1-2-3-4-5-4-2-2 7-2 10 1l1-3s1 1 2 4Z" fill="#1b0f24" />
      </svg>
    </div>
  );
}
