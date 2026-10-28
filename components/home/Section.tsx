import type { ReactNode } from "react";
import styles from "./Section.module.css";

/** A page's content column; its sections go inside. */
export function PageContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

/** A section with a head: the title (labelling the section), an icon
    before it if it has one, and whatever goes beside it. `aside` goes to
    the far end of the head. */
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
  icon?: ReactNode;
  extra?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        {icon && (
          <span className={styles.icon} aria-hidden>
            {icon}
          </span>
        )}
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

/** A quiet note beside a section's title, with a green dot: something
    happening right now. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <span className={styles.note}>
      <span className={styles.noteDot} aria-hidden />
      {children}
    </span>
  );
}

/** A LIVE tag, its dot pulsing. */
export function Live() {
  return (
    <span className={styles.live}>
      <span className={styles.liveDot} aria-hidden />
      Live
    </span>
  );
}
