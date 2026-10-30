import { CHIME, burst, note, partial, soundContext } from "@/components/game/synth";

/*
 * Keno's sounds, made on the spot in the same voice as Limbo's: a soft
 * tock when the bet goes in, a short high tick as each number comes up,
 * a brighter pluck when one of yours does, and the rising three-note
 * chime (G, C, E) for a win. A losing draw ends in silence. The Sound
 * switch turns it all off.
 */

export type Sound = "bet" | "tick" | "hit" | "win" | "even";

/** Plays a sound, if sound is on. */
export function sfx(sound: Sound) {
  const c = soundContext();
  if (!c) return;
  const t = c.currentTime;
  switch (sound) {
    case "bet":
      burst(c, 1500, t, 0.07, 1.4);
      partial(c, 2600, t, 0.03, 0.16);
      break;
    case "tick":
      partial(c, 2840, t, 0.04, 0.45);
      partial(c, 1420, t, 0.03, 0.12);
      break;
    case "hit":
      note(c, CHIME[2], t, 0.14, 0.32);
      break;
    case "win":
      CHIME.forEach((f, i) => note(c, f, t + i * 0.06, 0.34, 0.3));
      break;
    case "even":
      note(c, CHIME[1], t, 0.28, 0.26);
      break;
  }
}
