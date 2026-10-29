import { settingsStore } from "@/components/mines/stores";
import { asset } from "@/lib/assets";

/*
 * The table's sounds, short clips in /public/sfx/blackjack: a card dealt
 * (leaving the shoe and landing), the hole card turning, and the win.
 * They follow the site's Sound setting (the switch in the bottom bar and
 * in Mines' settings). Each play is its own element, so cards dealt in
 * quick succession overlap rather than cut each other off.
 */

const FILES = { deal: "/sfx/blackjack/deal.mp3", flip: "/sfx/blackjack/flip.mp3", win: "/sfx/blackjack/win.mp3" } as const;
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

/** Gets the clips loading, inside a click, so the first deal isn't late. */
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
