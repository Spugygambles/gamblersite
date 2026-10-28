import { PRIZE_POOL } from "@/lib/event";
import Countdown from "./Countdown";
import { GGSticker, LeafSticker, PieSticker, TurkeySticker } from "./Stickers";
import styles from "./EventHero.module.css";

// The top of the event: the prize pool, what the hunt is and how long's
// left on a plain dark card, and on the right the hunt's stickers slapped
// on over a sniper's crosshair: the turkey in his headset saying GG, a
// maple leaf in the crosshairs, and a slice of pie.
export default function EventHero() {
  return (
    <section className={styles.hero} aria-labelledby="hunt-title">
      <div className={styles.frame}>
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
        <div className={styles.art} aria-hidden>
          <svg className={styles.scope} viewBox="0 0 400 400" fill="none" stroke="currentColor">
            <circle cx="200" cy="200" r="168" strokeWidth="2" />
            <circle cx="200" cy="200" r="118" strokeWidth="1.5" strokeDasharray="3 9" />
            <path d="M200 0V150M200 250V400M0 200H150M250 200H400" strokeWidth="2" />
            <path d="M188 70H212M188 330H212M70 188V212M330 188V212" strokeWidth="2" />
          </svg>
          <TurkeySticker className={styles.turkey} />
          <GGSticker className={styles.gg} />
          <LeafSticker className={styles.leaf} />
          <PieSticker className={styles.pie} />
        </div>
      </div>
    </section>
  );
}
