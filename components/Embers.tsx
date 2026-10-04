import type { CSSProperties } from "react";
import styles from "./Embers.module.css";

export type Ember = {
  x: number;
  y: number;
  size: number;
  rise: number;
  sway: number;
  speed: number;
  phase: number;
};

// Glowing embers drifting upward, in the parent's text color. Positions, sizes,
// rise and sway are percentages of the art's stage; `speed` is how many times
// each rises per --cycle and `phase` is how far into its rise it starts, so
// they don't all appear at once.
export default function Embers({ embers }: { embers: Ember[] }) {
  return (
    <>
      {embers.map((e, i) => (
        <span
          key={i}
          className={styles.ember}
          style={
            {
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${e.size}%`,
              animationDuration: `calc(var(--cycle) / ${e.speed})`,
              animationDelay: `calc(var(--cycle) * ${-e.phase / e.speed})`,
              "--rise": `${e.rise}cqw`,
              "--sway": `${e.sway}cqw`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
