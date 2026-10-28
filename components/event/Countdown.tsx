"use client";

import { Fragment, useEffect, useState } from "react";
import { huntEnds } from "@/lib/event";
import styles from "./Countdown.module.css";

const UNITS = [
  ["d", "Days"],
  ["h", "Hrs"],
  ["m", "Mins"],
  ["s", "Secs"],
] as const;

// The time left in the hunt, ticking every second: each digit in its own
// box, in pairs. Dashes until mounted, so the server and the first client
// render agree.
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
        <Fragment key={unit}>
          {i > 0 && (
            <span className={styles.colon} aria-hidden>
              :
            </span>
          )}
          <span className={styles.unit}>
            <span className={styles.digits} data-unit={unit}>
              {[...(left ? String(left[i]).padStart(2, "0") : "--")].map((digit, j) => (
                <span key={j} className={`${styles.digit} tabular`}>
                  {digit}
                </span>
              ))}
            </span>
            <span className={styles.label}>{label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
