import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CASES, usd, type CaseInfo } from "@/lib/home";
import { ArrowIcon } from "./icons";
import styles from "./CaseShelf.module.css";

function CasePicture({ c }: { c: CaseInfo }) {
  if (c.image === "toxic") {
    return (
      <span className={styles.layers}>
        {(["base", "loot", "launcher"] as const).map((layer) => (
          <Image key={layer} src={`/cases/toxic-case-${layer}.png`} alt="" width={796} height={780} unoptimized draggable={false} />
        ))}
      </span>
    );
  }
  return <Image className={styles.picture} src={c.image.src} alt="" width={c.image.width} height={c.image.height} unoptimized draggable={false} />;
}

// The cases on offer, each on its own lit plinth, then a way into the rest.
export default function CaseShelf() {
  return (
    <ul className={styles.shelf}>
      {CASES.map((c) => (
        <li key={c.slug}>
          <Link href={`/cases/${c.slug}`} className={styles.card} style={{ "--glow": c.glow } as CSSProperties}>
            <span className={styles.stage} aria-hidden>
              <span className={styles.light} />
              <span className={styles.plinth} />
              <span className={styles.case}>
                <CasePicture c={c} />
              </span>
            </span>
            <span className={styles.foot}>
              <span className={styles.name}>
                {c.name}
                <span className={styles.label}>Case</span>
              </span>
              <span className={`${styles.price} tabular`}>
                <span className={styles.open}>Open</span>
                {usd.format(c.price)}
              </span>
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/cases" className={`${styles.card} ${styles.browse}`}>
          <span className={styles.fan} aria-hidden>
            {CASES.map((c) => (
              <span key={c.slug} className={styles.fanCase}>
                <CasePicture c={c} />
              </span>
            ))}
          </span>
          <span className={styles.browseTitle}>Browse all cases</span>
          <span className={styles.browseText}>Every case on Spugy, from pocket change to high roller.</span>
          <span className={styles.browseArrow} aria-hidden>
            <ArrowIcon />
          </span>
        </Link>
      </li>
    </ul>
  );
}
