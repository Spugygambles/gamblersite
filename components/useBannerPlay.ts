import { useEffect, useRef, useState } from "react";

/**
 * Drives a banner art's one-shot animation: it plays as the page loads and
 * again each time the mouse moves onto the surrounding GameBanner, ignoring
 * hovers while it is still playing.
 *
 * `playing` starts out true, so the server-rendered markup already carries the
 * playing state and the CSS runs the intro before any script loads. `replays`
 * counts the hover replays. `durationMs` must match the CSS animation length.
 */
export function useBannerPlay(durationMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [replays, setReplays] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (playing) {
      const timer = setTimeout(() => setPlaying(false), durationMs);
      return () => clearTimeout(timer);
    }

    const banner = el.closest("[data-game-banner]") ?? el;
    const replay = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Make sure the browser has seen the last run end, so the animations
      // restart instead of staying on their final frame.
      void el.offsetWidth;
      setReplays((n) => n + 1);
      setPlaying(true);
    };
    banner.addEventListener("mouseenter", replay);
    return () => banner.removeEventListener("mouseenter", replay);
  }, [playing, durationMs]);

  return { ref, playing, replays };
}
