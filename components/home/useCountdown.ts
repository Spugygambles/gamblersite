import { useEffect, useState } from "react";

/**
 * Time left until `target()`, as "6d 2h", "2h 13m" or "13m". It updates every
 * half minute, and is null until mounted so the server and the first client
 * render agree. Pass a function that stays the same between renders; once
 * the time is up it's called again for the next one.
 */
export function useCountdown(target: () => Date) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    let end = target().getTime();
    const tick = () => {
      // Once it's up, count down to the next one.
      if (end <= Date.now()) end = target().getTime();
      setLeft(formatLeft(end - Date.now()));
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [target]);

  return left;
}

export function formatLeft(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
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

/** Chat's rain falls every quarter hour. */
export function nextRain() {
  const d = new Date();
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15 + 15, 0, 0);
  return d;
}
