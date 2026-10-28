"use client";

import { useEffect, useState } from "react";
import { huntEnds } from "@/lib/event";
import styles from "./Countdown.module.css";

const UNITS = [
  ["d", "Days"],
  ["h", "Hours"],
  ["m", "Mins"],
  ["s", "Secs"],
] as const;

// The time left in the hunt, ticking every second. Dashes until mounted,
// so the server and the first client render agree.
export default function Countdown() {
  const [left, setLeft] = useState<number[] | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.floor((huntEnds().getTime() - Date.now()) / 1000));
      setLeft([Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.countdown} role="timer" aria-label="Time left in the hunt" data-countdown>
      {UNITS.map(([unit, label], i) => (
        <span key={unit} className={styles.unit}>
          <span className={`${styles.value} tabular`} data-unit={unit}>
            {left ? String(left[i]).padStart(2, "0") : "--"}
          </span>
          <span className={styles.label}>{label}</span>
        </span>
      ))}
    </div>
  );
}
