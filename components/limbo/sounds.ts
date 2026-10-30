import { CHIME, burst, note, partial, soundContext } from "@/components/game/synth";

/*
 * Limbo's sounds, made on the spot: a tock when Bet is pressed, a sharp
 * tick for each step of the climbing number, a rising three-note chime
 * (G, C, E) the moment the number passes the target, and a short low
 * thud when it stops short. They follow the Sound switch in the bar.
 */

export type Sound = "bet" | "tick" | "win" | "lose";

export function sfx(sound: Sound) {
  const c = soundContext();
  if (!c) return;
  const t = c.currentTime;
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
      partial(c, 180, t, 0.16, 0.3);
      burst(c, 600, t, 0.06, 0.5, 1);
      break;
  }
}
