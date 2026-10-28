import Image from "next/image";
import type { ReactNode } from "react";
import { PRIZE_POOL } from "@/lib/event";
import Countdown from "./Countdown";
import styles from "./EventHero.module.css";

// The top of the event: the harvest field at dusk, full width, with the
// prize pool, what the hunt is and how long's left over its left side, and
// the ways in (the children: the tab cards and their panels) under them.
// The field fades out behind the cards, into the page.
export default function EventHero({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={styles.backdrop} aria-hidden>
        <Image className={styles.scene} src="/event/scene.webp" alt="" width={2600} height={1100} unoptimized priority />
      </div>
      <div className={styles.inner}>
        <section className={styles.copy} aria-labelledby="hunt-title">
          <p className={styles.pool}>
            {PRIZE_POOL}
            <span className="sr-only"> in prizes</span>
          </p>
          <h1 id="hunt-title" className={styles.title}>
            Turkey Hunt
          </h1>
          <p className={styles.text}>
            This Thanksgiving there are three ways to win: the Harvest Calendar, the Leaf Shop and the Hunters&apos; Board.{" "}
            <b>Pick one below to get started.</b>
          </p>
          <div className={styles.ends}>
            <span className={styles.endsLabel}>Ends in</span>
            <Countdown plain />
          </div>
        </section>
        {children}
      </div>
    </div>
  );
}
