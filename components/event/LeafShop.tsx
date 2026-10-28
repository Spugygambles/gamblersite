"use client";

import { useState, type CSSProperties } from "react";
import { MY_HUNT, SHOP } from "@/lib/event";
import { CheckIcon, MapleIcon } from "@/components/home/icons";
import { CoinsArt, GiftCaseArt, TrophyArt, TurkeyArt } from "@/components/home/PromoArt";
import styles from "./LeafShop.module.css";

const ART = { coins: <CoinsArt />, cup: <TrophyArt />, case: <GiftCaseArt />, badge: <TurkeyArt />, leaves: null };

/**
 * What leaves buy, each on a card with its picture on a panel of its
 * colour. A button says how many more leaves something needs, or buys it.
 * Buying only marks it bought here until the shop is wired to the server.
 */
export default function LeafShop() {
  const [bought, setBought] = useState<string[]>([]);
  return (
    <div className={styles.wrap}>
      <ul className={styles.shop}>
        {SHOP.map((item) => {
          const short = item.price - MY_HUNT.leaves;
          const got = bought.includes(item.name);
          return (
            <li key={item.name} className={styles.item}>
              <span className={styles.panel} style={{ "--panel": item.panel } as CSSProperties} aria-hidden>
                <span className={styles.art}>{ART[item.kind]}</span>
              </span>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.about}>{item.about}</span>
              <span className={styles.foot}>
                <span className={`${styles.price} tabular`}>
                  <MapleIcon />
                  {item.price}
                  <span className="sr-only"> leaves</span>
                </span>
                <button
                  type="button"
                  className={`${styles.buy} ${got ? styles.got : ""}`}
                  disabled={short > 0 || got}
                  onClick={() => setBought([...bought, item.name])}
                  data-buy
                >
                  {got ? (
                    <>
                      <CheckIcon />
                      Bought
                    </>
                  ) : short > 0 ? (
                    `${short} more`
                  ) : (
                    "Buy"
                  )}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
