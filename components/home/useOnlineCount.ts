import { useEffect, useState } from "react";
import { ONLINE_START } from "@/lib/home";

// The players-online count drifts a little every few seconds, pulled back
// toward where it started so it never wanders off. It starts from the same
// number on the server and the client, then moves once mounted.
export function useOnlineCount() {
  const [count, setCount] = useState(ONLINE_START);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => Math.max(380, Math.min(720, c + Math.round((Math.random() - 0.5) * 9 + (ONLINE_START - c) * 0.04))));
    }, 3800);
    return () => clearInterval(t);
  }, []);
  return count;
}
