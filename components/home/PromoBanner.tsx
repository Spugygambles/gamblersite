import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "./EventsRow.module.css";

/**
 * One banner in the promotions strip: a bold title, a line about it, a
 * small button and whatever goes beside it (time left, progress), with the
 * art on an angled panel of the promo's colour, breaking out over the top.
 * The whole banner is the link.
 */
export default function PromoBanner({
  href,
  title,
  line,
  cta,
  panel,
  art,
  children,
}: {
  href: string;
  title: string;
  line: string;
  cta: string;
  /** The panel's colour, muted. */
  panel: string;
  art: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className={styles.banner} style={{ "--panel": panel } as CSSProperties}>
      <span className={styles.bg} aria-hidden>
        <span className={styles.panel} />
      </span>
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        <span className={styles.line}>{line}</span>
        <span className={styles.foot}>
          <span className={styles.button}>{cta}</span>
          {children}
        </span>
      </span>
      <span className={styles.art} aria-hidden>
        {art}
      </span>
    </Link>
  );
}
