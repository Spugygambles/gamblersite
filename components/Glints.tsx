import styles from "./Glints.module.css";

export type Glint = {
  x: number;
  y: number;
  size: number;
  start: number;
};

// Four-point glints that twinkle in turn. Positions and sizes are percentages
// of the art's stage; `start` staggers when each fires, as a fraction of its
// twinkle (half of --cycle).
export default function Glints({ glints }: { glints: Glint[] }) {
  return (
    <>
      {glints.map((g, i) => (
        <span
          key={i}
          className={styles.glint}
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: `${g.size}%`,
            animationDelay: `calc(var(--cycle) * ${g.start / 2})`,
          }}
        />
      ))}
    </>
  );
}
