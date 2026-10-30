import { CHIME, burst, clipReady, loadClip, note, partial, playClip, soundContext } from "@/components/game/synth";
import { asset } from "@/lib/assets";

/*
 * Limbo's sounds. The press of Bet, the tick of each step of the climbing
 * number and the chime when it passes the target are the clips from the
 * video (public/sfx/limbo), decoded once and played through the site's
 * sound master; until a clip has loaded (or where it can't), a sound made
 * on the spot stands in, tuned to the same pitches. A number that stops
 * short gets a short low thud. All of it follows the Sound switch.
 */

export type Sound = "bet" | "tick" | "win" | "lose";

const CLIPS: Record<Exclude<Sound, "lose">, string> = {
  bet: "/sfx/limbo/click.mp3",
  tick: "/sfx/limbo/tick.mp3",
  win: "/sfx/limbo/win.mp3",
};
const GAIN: Record<Exclude<Sound, "lose">, number> = { bet: 0.9, tick: 0.85, win: 1 };

/** Gets the clips decoding, so the first press isn't the made sound. */
export function warmSfx() {
  (Object.keys(CLIPS) as (keyof typeof CLIPS)[]).forEach((k) => void loadClip(asset(CLIPS[k])));
}

// the stand-ins, in the clips' voices
function made(c: AudioContext, sound: Sound, t: number) {
  switch (sound) {
    case "bet":
      burst(c, 1500, t, 0.08, 1.6);
      partial(c, 2600, t, 0.04, 0.22);
      break;
    case "tick":
      partial(c, 2840, t, 0.05, 0.55);
      partial(c, 1420, t, 0.035, 0.14);
      burst(c, 3200, t, 0.03, 0.5, 3);
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

export function sfx(sound: Sound) {
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
