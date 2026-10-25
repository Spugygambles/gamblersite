"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ONLINE_START, PLAYER } from "@/lib/home";
import { PumpkinIcon } from "./icons";
import styles from "./HeroShowcase.module.css";

// The players-online count drifts a little every few seconds, pulled back
// toward where it started so it never wanders off. It starts from the same
// number on the server and the client, then moves once mounted.
function useOnlineCount() {
  const [count, setCount] = useState(ONLINE_START);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => Math.max(380, Math.min(720, c + Math.round((Math.random() - 0.5) * 9 + (ONLINE_START - c) * 0.04))));
    }, 3800);
    return () => clearInterval(t);
  }, []);
  return count;
}

function OnlineBadge() {
  const count = useOnlineCount();
  return (
    <div className={styles.online}>
      <span className={`${styles.antenna} ${styles.antennaL}`} aria-hidden />
      <span className={`${styles.antenna} ${styles.antennaR}`} aria-hidden />
      <span className={styles.knob} aria-hidden />
      <div className={styles.screen}>
        <span className={`${styles.count} tabular`}>{count}</span>
        <span className={styles.onlineLabel}>Online</span>
      </div>
    </div>
  );
}

export function LevelBar() {
  return (
    <div className={styles.level}>
      <div className={styles.levelRow}>
        <span className={styles.levelName}>LVL {PLAYER.level}</span>
        <span className={`${styles.levelPct} tabular`}>{PLAYER.levelProgress}%</span>
      </div>
      <div
        className={styles.levelTrack}
        role="progressbar"
        aria-label={`Level ${PLAYER.level} progress`}
        aria-valuenow={PLAYER.levelProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className={styles.levelFill} style={{ width: `${PLAYER.levelProgress}%` }} />
      </div>
    </div>
  );
}

const CASE_LAYERS = ["base", "loot", "launcher"] as const;

export default function HeroShowcase() {
  return (
    <div className={styles.hero}>
      <div className={styles.wall} aria-hidden />
      <PumpkinIcon className={styles.wallPumpkin} aria-hidden />
      <div className={styles.spot} aria-hidden />
      <OnlineBadge />

      <div className={styles.scene} aria-hidden>
        <div className={styles.floorGlow} />
        <div className={styles.shadow} />
        <div className={styles.caseBox}>
          {CASE_LAYERS.map((layer) => (
            <Image
              key={layer}
              className={layer === "base" ? styles.layer : `${styles.layer} ${styles[layer]}`}
              src={`/cases/toxic-case-${layer}.png`}
              alt=""
              width={796}
              height={780}
              unoptimized
              priority={layer === "base"}
              draggable={false}
            />
          ))}
        </div>
        <PumpkinIcon className={styles.groundPumpkin} />
        <span className={`${styles.spore} ${styles.s1}`} />
        <span className={`${styles.spore} ${styles.s2}`} />
        <span className={`${styles.spore} ${styles.s3}`} />
        <span className={`${styles.spore} ${styles.s4}`} />
      </div>
    </div>
  );
}
