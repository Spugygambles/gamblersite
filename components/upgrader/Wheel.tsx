import type { CSSProperties, ReactNode } from "react";
import styles from "./Upgrader.module.css";

const R = 46;

/**
 * The wheel: a dark ring with the win zones on it in orange, a fixed
 * pointer at the top and a hub for whatever the game wants to say. The
 * zones are one dashed circle: `zones` dashes, each `chance / zones` of
 * the way round, so they sit evenly. The ring turns to `rotation` degrees
 * over `spinMs`; the game sets both when it spins.
 */
export default function Wheel({ chance, zones, rotation, spinMs, children }: { chance: number; zones: number; rotation: number; spinMs: number; children: ReactNode }) {
  const each = chance / zones;
  return (
    <div className={styles.wheel} style={{ "--rot": `${rotation}deg`, "--spin-ms": `${spinMs}ms` } as CSSProperties} data-wheel data-rotation={Math.round(rotation)}>
      <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden>
        <circle className={styles.track} cx="50" cy="50" r={R} />
        <g className={styles.turning}>
          {chance > 0 && (
            <circle className={styles.zone} cx="50" cy="50" r={R} pathLength={1} strokeDasharray={`${each} ${Math.max(0, 1 / zones - each)}`} transform="rotate(-90 50 50)" data-zone />
          )}
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} className={i % 6 === 0 ? styles.tickBig : styles.tick} x1="50" y1="7.6" x2="50" y2={i % 6 === 0 ? 11 : 9.4} transform={`rotate(${i * 15} 50 50)`} />
          ))}
        </g>
      </svg>
      <div className={styles.pointer} aria-hidden />
      <div className={styles.hub}>{children}</div>
    </div>
  );
}
