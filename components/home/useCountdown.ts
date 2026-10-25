import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Time left until `target()` as "2d 04:12:09", ticking every second. It's
 * null until mounted, so the server and the first client render agree.
 * Pass a function that stays the same between renders.
 */
export function useCountdown(target: () => Date) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const end = target().getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400);
      const hms = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
      setLeft(d > 0 ? `${d}d ${hms}` : hms);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);

  return left;
}

/** Local midnight tonight. */
export function midnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d;
}

/** The race resets at midnight UTC going into Monday. */
export function nextMondayUtc() {
  const d = new Date();
  const days = (8 - d.getUTCDay()) % 7 || 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

/** The end of Halloween, local time; next year's once this one's gone. */
export function halloween() {
  const now = new Date();
  const end = new Date(now.getFullYear(), 9, 31, 23, 59, 59);
  return end > now ? end : new Date(now.getFullYear() + 1, 9, 31, 23, 59, 59);
}
