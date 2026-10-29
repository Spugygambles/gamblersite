import { settingsStore } from "./stores";

/*
 * The game's sounds, made on the spot with the Web Audio API rather than
 * loaded from files: a thud for the bet, a chime for each gem (a step
 * higher each time), a thump and crackle for a mine, a run of notes for a
 * cash out. The Sound switch in the settings turns them off.
 */

let ctx: AudioContext | null = null;

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

function tone(c: AudioContext, type: OscillatorType, from: number, to: number | null, at: number, length: number, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + length);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(g).connect(c.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function crackle(c: AudioContext, at: number, length: number, gain: number, cutoff: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * length), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff, at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(80, cutoff / 10), at + length);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(at);
  src.stop(at + length);
}

export type Sound = "bet" | "gem" | "mine" | "win" | "tick";

/** Plays a sound, if sound is on. `step` is which gem this is, for the rising chime. */
export function play(sound: Sound, step = 1) {
  if (!settingsStore.get().sound) return;
  const c = context();
  if (!c) return;
  const t = c.currentTime;
  switch (sound) {
    case "bet":
      tone(c, "sine", 300, 170, t, 0.1, 0.3);
      crackle(c, t, 0.04, 0.08, 3000);
      break;
    case "gem": {
      const f = 660 * Math.pow(2, Math.min(step - 1, 16) / 12);
      tone(c, "sine", f, null, t, 0.18, 0.22);
      tone(c, "triangle", f * 2, null, t + 0.015, 0.12, 0.07);
      crackle(c, t, 0.025, 0.05, 7000);
      break;
    }
    case "mine":
      tone(c, "sine", 160, 36, t, 0.5, 0.55);
      crackle(c, t, 0.45, 0.4, 1600);
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, "triangle", f, null, t + i * 0.085, 0.24, 0.2));
      tone(c, "sine", 1046.5, null, t + 0.34, 0.4, 0.12);
      break;
    case "tick":
      tone(c, "sine", 880, null, t, 0.04, 0.08);
      break;
  }
}
