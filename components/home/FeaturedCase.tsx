import Image from "next/image";
import Link from "next/link";
import { FEATURED_CASE, usd } from "@/lib/home";
import styles from "./FeaturedCase.module.css";

const LAYERS = ["base", "loot", "launcher"] as const;

// The case of the week, up on a lit pedestal with its loot floating out of
// the lid.
export default function FeaturedCase() {
  const c = FEATURED_CASE;
  const price = usd.format(c.price);

  return (
    <section className={styles.card} aria-labelledby="featured-title">
      <div className={styles.grid} aria-hidden />
      <div className={styles.tape} aria-hidden />

      <div className={styles.stage} aria-hidden>
        <div className={styles.rays} />
        <div className={styles.halo} />
        <div className={styles.pedestal}>
          <span className={styles.disc} />
          <svg className={styles.rings} viewBox="0 0 400 100" preserveAspectRatio="none">
            <ellipse cx="200" cy="50" rx="196" ry="46" className={styles.ringOuter} />
            <ellipse cx="200" cy="50" rx="150" ry="33" className={styles.ringDash} />
          </svg>
        </div>
        <span className={styles.shadow} />
        <div className={styles.caseBox}>
          {LAYERS.map((layer) => (
            <Image
              key={layer}
              className={layer === "base" ? styles.layer : `${styles.layer} ${styles[layer]}`}
              src={`/cases/toxic-case-${layer}.png`}
              alt=""
              width={796}
              height={780}
              unoptimized
              priority
              draggable={false}
            />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={styles.spore} />
        ))}
      </div>

      <div className={styles.copy}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Featured case
        </span>
        <h2 id="featured-title" className={styles.title}>
          <span className={styles.solid}>{c.name}</span>{" "}
          <span className={styles.outline}>Case</span>
        </h2>
        <p className={styles.text}>
          Crack the seal on this week&apos;s featured case. Hazard-grade skins, sealed in and waiting.
        </p>

        <dl className={styles.stats}>
          <div>
            <dt>Items</dt>
            <dd className="tabular">{c.items}</dd>
          </div>
          <div>
            <dt>Top drop</dt>
            <dd className="tabular">{usd.format(c.topDrop)}</dd>
          </div>
          <div>
            <dt>Rarest</dt>
            <dd className={`${styles.gold} tabular`}>{c.rarest}%</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          <Link href={`/cases/${c.slug}`} className={styles.open}>
            Open case
            <span className={`${styles.price} tabular`}>{price}</span>
          </Link>
          <Link href={`/cases/${c.slug}#contents`} className={styles.preview}>
            View contents
          </Link>
        </div>
      </div>
    </section>
  );
}
