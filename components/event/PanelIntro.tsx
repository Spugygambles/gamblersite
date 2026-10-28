import type { ReactNode } from "react";
import styles from "./PanelIntro.module.css";

type Info = { icon: ReactNode; title: string; text: ReactNode };
type Stat = { label: string; value: ReactNode; note: string };

/**
 * The top of each of the hunt's panels: two cards on how it works, then
 * two of the player's numbers, all in a row.
 */
export default function PanelIntro({ info, stats }: { info: Info[]; stats: Stat[] }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        {info.map((card) => (
          <article key={card.title} className={styles.info}>
            <span className={styles.icon}>{card.icon}</span>
            <h3 className={styles.title}>{card.title}</h3>
            <p className={styles.text}>{card.text}</p>
          </article>
        ))}
        {stats.map((stat) => (
          <p key={stat.label} className={styles.stat}>
            <span className={styles.label}>{stat.label}</span>
            <span className={`${styles.value} tabular`}>{stat.value}</span>
            <span className={styles.note}>{stat.note}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
