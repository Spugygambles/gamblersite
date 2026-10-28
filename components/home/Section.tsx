import type { ReactNode } from "react";
import styles from "./Section.module.css";

/** A page's content column; its sections go inside. */
export function PageContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

/** A section with a head: an icon, the title (labelling the section), and
    whatever goes beside it. `aside` goes to the far end of the head. */
export default function Section({
  id,
  title,
  icon,
  extra,
  aside,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  extra?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        {extra}
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** A small count beside a section's title. */
export function Count({ children }: { children: ReactNode }) {
  return <span className={styles.count}>{children}</span>;
}
