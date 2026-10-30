import { settingsStore } from "@/components/mines/stores";
import { asset } from "@/lib/assets";

/*
 * Limbo's sounds, short clips in /public/sfx/limbo: the press of Bet, a
 * tick for each step of the climbing number, and the chime when it passes
 * the target. They follow the site's Sound setting.
 */

const FILES = { click: "/sfx/limbo/click.mp3", tick: "/sfx/limbo/tick.mp3", win: "/sfx/limbo/win.mp3" } as const;
export type Sfx = keyof typeof FILES;

const loaded: Partial<Record<Sfx, HTMLAudioElement>> = {};

export function sfx(name: Sfx, volume = 0.7) {
  if (typeof window === "undefined" || !settingsStore.get().sound) return;
  try {
    let a = loaded[name];
    if (!a) {
      a = new Audio(asset(FILES[name]));
      a.preload = "auto";
      loaded[name] = a;
    }
    const play = a.cloneNode(true) as HTMLAudioElement;
    play.volume = volume;
    play.play().catch(() => {});
  } catch {}
}

/** Gets the clips loading, inside a click, so the first tick isn't late. */
export function warmSfx() {
  if (typeof window === "undefined") return;
  (Object.keys(FILES) as Sfx[]).forEach((name) => {
    if (!loaded[name]) {
      try {
        const a = new Audio(asset(FILES[name]));
        a.preload = "auto";
        loaded[name] = a;
      } catch {}
    }
  });
}
