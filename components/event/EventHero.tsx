import Link from "next/link";
import { LeafArt, TurkeyArt } from "@/components/home/PromoArt";
import Countdown from "./Countdown";
import styles from "./EventHero.module.css";

// The top of the event: what it is, how long's left, where to start, and
// the turkey himself, on an angled panel, poking out over the top.
export default function EventHero() {
  return (
    <section className={styles.hero} aria-labelledby="hunt-title">
      <div className={styles.frame}>
        <span className={styles.bg} aria-hidden>
          <span className={styles.panel} />
        </span>
        <div className={styles.copy}>
          <p className={styles.kicker}>Thanksgiving event</p>
          <h1 id="hunt-title" className={styles.title}>
            Turkey Hunt
          </h1>
          <p className={styles.text}>
            Turkeys are loose in every game. Catch one when it pops up for 5 leaves, climb the hunters&apos; board, and spend your leaves in
            the shop before the hunt ends.
          </p>
          <div className={styles.ends}>
            <span className={styles.endsLabel}>Ends in</span>
            <Countdown />
          </div>
          <div className={styles.actions}>
            <Link href="/#games" className={styles.primary}>
              Start hunting
            </Link>
            <a href="#shop" className={styles.secondary}>
              Leaf shop
            </a>
          </div>
        </div>
        <div className={styles.art} aria-hidden>
          <span className={styles.leafBig}>
            <LeafArt />
          </span>
          <span className={styles.leafSmall}>
            <LeafArt />
          </span>
          <span className={styles.turkey}>
            <TurkeyArt />
          </span>
        </div>
      </div>
    </section>
  );
}
