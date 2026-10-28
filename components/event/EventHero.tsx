import Image from "next/image";
import { PRIZE_POOL } from "@/lib/event";
import Countdown from "./Countdown";
import styles from "./EventHero.module.css";

// The top of the event: the prize pool, what the hunt is, how long's left,
// and the turkey in his pilgrim's hat, out on the farm at dusk.
export default function EventHero() {
  return (
    <section className={styles.hero} aria-labelledby="hunt-title">
      <div className={styles.frame}>
        <Image
          className={styles.scene}
          src="/event/scene.webp"
          alt=""
          width={2000}
          height={680}
          // Served as-is: already sized for sharp high-DPI screens.
          unoptimized
          loading="eager"
        />
        <div className={styles.copy}>
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
            <Countdown />
          </div>
        </div>
        <Image className={styles.turkey} src="/event/turkey.webp" alt="" width={950} height={720} unoptimized loading="eager" />
      </div>
    </section>
  );
}
