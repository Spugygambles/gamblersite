import { settingsStore } from "@/components/mines/stores";

/*
 * The site's sound-making kit: a few voices built on the Web Audio API,
 * made on the spot rather than loaded from files, so they play the same
 * everywhere the page runs. Every game's sounds go through one master
 * (a touch of low-pass and a compressor, so a run of quick notes never
 * gets harsh) and follow the Sound switch.
 */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

/** The audio context, started on first use; null when sound is off or there's no audio. */
export function soundContext(): AudioContext | null {
  if (typeof window === "undefined" || !settingsStore.get().sound) return null;
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

// master: rounded off above 6 kHz, then squeezed
function output(c: AudioContext): GainNode {
  if (out) return out;
  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 6000;
  soften.Q.value = 0.5;
  const squeeze = c.createDynamicsCompressor();
  squeeze.threshold.value = -18;
  squeeze.knee.value = 12;
  squeeze.ratio.value = 4;
  squeeze.attack.value = 0.003;
  squeeze.release.value = 0.15;
  out = c.createGain();
  out.gain.value = 1;
  out.connect(soften).connect(squeeze).connect(c.destination);
  return out;
}

/** One sine partial: a quick rise, then a natural (exponential) die-away. */
export function partial(c: AudioContext, f: number, at: number, length: number, gain: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, at);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.004);
  g.gain.setTargetAtTime(0, at + 0.004, length / 6);
  osc.connect(g).connect(output(c));
  osc.start(at);
  osc.stop(at + length + 0.05);
}

/** A note with a touch of its octave: the chime's voice. */
export function note(c: AudioContext, f: number, at: number, length: number, gain: number) {
  partial(c, f, at, length, gain);
  partial(c, f * 2, at, length * 0.5, gain * 0.3);
}

/** A short burst of noise through a band-pass: the body of a tock or a click. */
export function burst(c: AudioContext, f: number, at: number, length: number, gain: number, q = 1.4) {
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
  band.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.setTargetAtTime(0, at + 0.005, length / 5);
  src.connect(band).connect(g).connect(output(c));
  src.start(at);
  src.stop(at + length + 0.02);
}

/** The chime the site's wins share: G5, C6, E6. */
export const CHIME = [783.99, 1046.5, 1318.5];

// ---- Clips: short recordings decoded once, played through the same master ----

const clips = new Map<string, AudioBuffer | null>();
const loading = new Map<string, Promise<AudioBuffer | null>>();

/** Fetches and decodes a clip, once; null if it can't be had (then the caller falls back to a made sound). */
export function loadClip(url: string): Promise<AudioBuffer | null> {
  const have = clips.get(url);
  if (have !== undefined) return Promise.resolve(have);
  const pending = loading.get(url);
  if (pending) return pending;
  const job = (async () => {
    try {
      // no fetching off a file: the preview on disk plays the made sounds
      if (typeof window === "undefined" || window.location.protocol === "file:") return null;
      const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx ??= new Ctor();
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      clips.set(url, buf);
      return buf;
    } catch {
      clips.set(url, null);
      return null;
    } finally {
      loading.delete(url);
    }
  })();
  loading.set(url, job);
  return job;
}

/** The clip, if it's decoded already. */
export const clipReady = (url: string) => clips.get(url) ?? null;

/** Plays a decoded clip at `gain`. */
export function playClip(c: AudioContext, buffer: AudioBuffer, at: number, gain: number) {
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g).connect(output(c));
  src.start(at);
}
