import { CHIME, burst, clipReady, loadClip, note, partial, playClip, soundContext } from "@/components/game/synth";
import { asset } from "@/lib/assets";

/*
 * The case page's sounds: a click as a case is opened, a tick as each item
 * passes the middle of the reel, and once it stops a chime for a drop worth
 * more than it cost or a soft thud for one worth less. The click, tick and
 * chime are Limbo's clips (public/sfx/limbo), decoded once; until one has
 * loaded a sound made on the spot stands in. All of it follows the Sound
 * switch.
 */

export type CaseSound = "open" | "tick" | "win" | "lose";

const CLIPS: Record<Exclude<CaseSound, "lose">, string> = {
  open: "/sfx/limbo/click.mp3",
  tick: "/sfx/limbo/tick.mp3",
  win: "/sfx/limbo/win.mp3",
};
const GAIN: Record<Exclude<CaseSound, "lose">, number> = { open: 0.9, tick: 0.6, win: 1 };

/** Gets the clips decoding, so the first spin isn't the made sound. */
export function warmCaseSfx() {
  (Object.keys(CLIPS) as (keyof typeof CLIPS)[]).forEach((k) => void loadClip(asset(CLIPS[k])));
}

function made(c: AudioContext, sound: CaseSound, t: number) {
  switch (sound) {
    case "open":
      burst(c, 1500, t, 0.08, 1.6);
      partial(c, 2600, t, 0.04, 0.22);
      break;
    case "tick":
      partial(c, 2840, t, 0.04, 0.4);
      burst(c, 3200, t, 0.025, 0.35, 3);
      break;
    case "win":
      CHIME.forEach((f, i) => note(c, f, t + i * 0.06, 0.4, 0.34));
      break;
    case "lose":
      partial(c, 180, t, 0.16, 0.22);
      burst(c, 600, t, 0.06, 0.35, 1);
      break;
  }
}

export function caseSfx(sound: CaseSound) {
  const c = soundContext();
  if (!c) return;
  const t = c.currentTime;
  if (sound === "lose") {
    made(c, sound, t);
    return;
  }
  const url = asset(CLIPS[sound]);
  const clip = clipReady(url);
  if (clip) {
    playClip(c, clip, t, GAIN[sound]);
    return;
  }
  void loadClip(url);
  made(c, sound, t);
}
