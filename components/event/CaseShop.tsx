import Image from "next/image";
import Link from "next/link";
import { count } from "@/lib/home";
import { CASES, MY_HUNT } from "@/lib/event";
import { EyeIcon, InfoIcon, MapleIcon } from "@/components/home/icons";
import PanelIntro from "./PanelIntro";
import styles from "./CaseShop.module.css";

const GOLDEN = "/event/cases/golden-turkey.webp";

/**
 * The leaf shop: how leaves and Golden Turkeys are found, the player's
 * balance, then ten Thanksgiving cases priced in leaves, cheapest first,
 * and the Golden Turkey case on a wide card of its own at the end. A case
 * the player can't afford says so in place of its Open button.
 */
export default function CaseShop() {
  return (
    <div className={styles.shop}>
      <PanelIntro
        info={[
          {
            icon: <MapleIcon />,
            title: "How to earn leaves",
            text: (
              <>
                Earn <b>1 leaf for every 5.00 coins</b> you wager, adjusted by game, and 5 more for every turkey you catch. Spend them on
                Thanksgiving cases.
              </>
            ),
          },
          {
            icon: <Image src={GOLDEN} alt="" width={480} height={325} unoptimized />,
            title: "How to find Golden Turkeys",
            text: (
              <>
                Any Thanksgiving case can drop a <b>Golden Turkey</b>. Each one opens the Golden Turkey case once, for free.
              </>
            ),
          },
        ]}
        stats={[
          {
            label: "Your leaves",
            value: (
              <>
                <MapleIcon />
                {count.format(MY_HUNT.leaves)}
              </>
            ),
            note: "Season balance",
          },
          {
            label: "Golden Turkeys",
            value: (
              <>
                <Image src={GOLDEN} alt="" width={480} height={325} unoptimized />
                {MY_HUNT.goldenTurkeys}
              </>
            ),
            note: "Ready to open",
          },
        ]}
      />

      <header className={styles.head}>
        <p className={styles.kicker}>Leaf shop</p>
        <h2 className={styles.title}>Thanksgiving cases</h2>
        <p className={styles.priced}>Priced in leaves.</p>
      </header>

      <ul className={styles.grid}>
        {CASES.map((c, i) => {
          const short = c.price > MY_HUNT.leaves;
          return (
            <li key={c.id} className={styles.case}>
              <span className={styles.top}>
                <span className={`${styles.num} tabular`}>{String(i + 1).padStart(2, "0")}</span>
                <Link href={`/cases/${c.id}#odds`} className={styles.tool} aria-label={`${c.name} odds`}>
                  <InfoIcon />
                </Link>
                <Link href={`/cases/${c.id}`} className={styles.tool} aria-label={`What's in ${c.name}`}>
                  <EyeIcon />
                </Link>
              </span>
              <Image className={styles.art} src={`/event/cases/${c.id}.webp`} alt="" width={480} height={325} unoptimized />
              <h3 className={styles.name}>{c.name}</h3>
              <p className={`${styles.price} tabular`}>
                <MapleIcon />
                {count.format(c.price)}
                <span className="sr-only"> leaves</span>
              </p>
              {short ? (
                <span className={styles.short}>Not enough leaves</span>
              ) : (
                <Link href={`/cases/${c.id}`} className={styles.open}>
                  Open
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <article className={styles.golden} aria-labelledby="golden-title">
        <div className={styles.goldenWords}>
          <Image className={styles.goldenIcon} src={GOLDEN} alt="" width={480} height={325} unoptimized />
          <p className={styles.goldenKicker}>Golden</p>
          <h3 id="golden-title" className={styles.goldenTitle}>
            The Golden Turkey
          </h3>
          <p className={styles.goldenText}>One case, the biggest prizes of the season.</p>
        </div>
        <div className={styles.goldenCase}>
          <Image className={styles.goldenArt} src={GOLDEN} alt="" width={480} height={325} unoptimized />
          <p className={styles.goldenName}>Golden Turkey</p>
          <p className={`${styles.price} tabular`}>
            <Image src={GOLDEN} alt="" width={480} height={325} unoptimized />1<span className="sr-only"> Golden Turkey</span>
          </p>
          {MY_HUNT.goldenTurkeys > 0 ? (
            <Link href="/cases/golden-turkey" className={styles.open}>
              Open
            </Link>
          ) : (
            <span className={styles.short}>Not enough Golden Turkeys</span>
          )}
        </div>
      </article>
    </div>
  );
}
