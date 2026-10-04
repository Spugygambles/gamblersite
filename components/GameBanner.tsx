import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./GameBanner.module.css";

type GameBannerProps = {
  title: string;
  art: ReactNode;
  href?: string;
};

export default function GameBanner({ title, art, href }: GameBannerProps) {
  const content = (
    <>
      <div className={styles.art} aria-hidden="true">
        {art}
      </div>
      <span className={styles.title}>{title}</span>
    </>
  );

  return href ? (
    <Link href={href} className={styles.banner}>
      {content}
    </Link>
  ) : (
    <div className={styles.banner}>{content}</div>
  );
}
