import { settingsStore } from "@/components/mines/stores";

/*
 * Keno's sounds, made on the spot with the Web Audio API in the same
 * voice as the site's clips: a soft tock when the bet goes in, a short
 * high tick as each number comes up, a brighter pluck when one of yours
 * does, and a rising three-note chime (G, C, E) for a win. A losing draw
 * ends in silence. The Sound switch turns it all off.
 */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

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

// master: a little quieter, rounded off above 6 kHz, then squeezed so a run of ticks never gets harsh
function output(c: AudioContext): GainNode {
  if (out) return out;
  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 6000;
  soften.Q.value = 0.5;
  const squeeze = c.createDynamicsCompressor();
  squeeze.threshold.value = -20;
  squeeze.knee.value = 14;
  squeeze.ratio.value = 4;
  squeeze.attack.value = 0.003;
  squeeze.release.value = 0.15;
  out = c.createGain();
  out.gain.value = 0.9;
  out.connect(soften).connect(squeeze).connect(c.destination);
  return out;
}

/** One sine partial: a quick rise, then a natural (exponential) die-away. */
function partial(c: AudioContext, f: number, at: number, length: number, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(f, at);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.004);
  g.gain.setTargetAtTime(0, at + 0.004, length / 6);
  osc.connect(g).connect(output(c));
  osc.start(at);
  osc.stop(at + length + 0.05);
}

/** A note with a touch of its octave: the chime's voice. */
function note(c: AudioContext, f: number, at: number, length: number, gain: number) {
  partial(c, f, at, length, gain);
  partial(c, f * 2, at, length * 0.5, gain * 0.3);
}

/** A short burst of noise through a band-pass: the body of the tock. */
function burst(c: AudioContext, f: number, at: number, length: number, gain: number) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noise;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = f;
  band.Q.value = 1.4;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.setTargetAtTime(0, at + 0.005, length / 5);
  src.connect(band).connect(g).connect(output(c));
  src.start(at);
  src.stop(at + length + 0.02);
}

export type Sound = "bet" | "tick" | "hit" | "win" | "even";

// the chime's notes: G5, C6, E6
const CHIME = [783.99, 1046.5, 1318.5];

/** Plays a sound, if sound is on. */
export function sfx(sound: Sound) {
  if (!settingsStore.get().sound) return;
  const c = context();
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
