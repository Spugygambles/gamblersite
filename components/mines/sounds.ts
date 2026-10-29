import { settingsStore } from "./stores";

/*
 * The game's sounds, made on the spot with the Web Audio API rather than
 * loaded from files, and kept soft: a low tock for the bet, a bell-like
 * pluck for each gem that climbs a pentatonic scale (so a sweep plays a
 * run), a short chime for a cash out. A mine makes no sound. Everything
 * goes through a gentle low-pass and a compressor so a quick sweep never
 * gets loud or harsh. The Sound switch in the settings turns it all off.
 */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!ctx) ctx = new Ctor();
  } catch {
    return null;
  }
  // browsers keep audio off until the page is clicked; every sound here follows a click
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// master: a little quieter, rounded off above 4.5 kHz, then squeezed
function output(c: AudioContext): GainNode {
  if (out) return out;
  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 4500;
  soften.Q.value = 0.5;
  const squeeze = c.createDynamicsCompressor();
  squeeze.threshold.value = -20;
  squeeze.knee.value = 14;
  squeeze.ratio.value = 4;
  squeeze.attack.value = 0.003;
  squeeze.release.value = 0.15;
  out = c.createGain();
  out.gain.value = 0.55;
  out.connect(soften).connect(squeeze).connect(c.destination);
  return out;
}

/** One sine partial: a quick rise, then a natural (exponential) die-away. */
function partial(c: AudioContext, f: number, to: number | null, at: number, length: number, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(f, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + length);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.004);
  g.gain.setTargetAtTime(0, at + 0.004, length / 6);
  osc.connect(g).connect(output(c));
  osc.start(at);
  osc.stop(at + length + 0.05);
}

/** A soft bell: the note, a touch of its octave gone sooner, a hint of the twelfth. */
function pluck(c: AudioContext, f: number, at: number, length: number, gain: number) {
  partial(c, f, null, at, length, gain);
  partial(c, f * 2, null, at, length * 0.4, gain * 0.22);
  partial(c, f * 3, null, at, length * 0.22, gain * 0.06);
}

// gems climb a pentatonic scale from C5, an octave every five gems
const SCALE = [0, 2, 4, 7, 9];
const gemNote = (step: number) => {
  const i = Math.min(Math.max(step, 1), 15) - 1;
  return 523.25 * Math.pow(2, (12 * Math.floor(i / 5) + SCALE[i % 5]) / 12);
};

export type Sound = "bet" | "gem" | "win" | "tick";

/** Plays a sound, if sound is on. `step` is which gem this is, for the rising run. */
export function play(sound: Sound, step = 1) {
  if (!settingsStore.get().sound) return;
  const c = context();
  if (!c) return;
  const t = c.currentTime;
  switch (sound) {
    case "bet":
      partial(c, 190, 130, t, 0.11, 0.22);
      break;
    case "gem":
      pluck(c, gemNote(step), t, 0.3, 0.16);
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => pluck(c, f, t + i * 0.075, 0.55, 0.14));
      break;
    case "tick":
      pluck(c, 880, t, 0.14, 0.1);
      break;
  }
}
