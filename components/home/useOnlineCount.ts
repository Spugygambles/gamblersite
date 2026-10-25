import { useSyncExternalStore } from "react";
import { ONLINE_START } from "@/lib/home";

// The players-online count drifts a little every few seconds, pulled back
// toward where it started so it never wanders off. Every place that shows it
// shares the one number. It starts from the same number on the server and
// the client, then moves once mounted.
let count = ONLINE_START;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => {
    count = Math.max(380, Math.min(720, count + Math.round((Math.random() - 0.5) * 9 + (ONLINE_START - count) * 0.04)));
    listeners.forEach((l) => l());
  }, 3800);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useOnlineCount() {
  return useSyncExternalStore(
    subscribe,
    () => count,
    () => ONLINE_START,
  );
}
