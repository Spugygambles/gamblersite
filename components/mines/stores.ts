import { useSyncExternalStore } from "react";
import { randomHex } from "@/lib/sha256";

export type Seeds = {
  serverSeed: string;
  clientSeed: string;
  /** Counts the games played under these seeds. */
  nonce: number;
  /** The seeds before the last rotation, revealed so those games can be checked. */
  previous: { serverSeed: string; clientSeed: string; nonces: number } | null;
};

export type Settings = { animations: boolean; hotkeys: boolean };

/**
 * A value shared by whoever reads it, kept outside React: the server (and
 * so the first paint) sees `onServer`, the browser makes its own on first
 * read, and `set` tells every subscriber. It outlives the component, so
 * the seeds and settings hold while the player moves about the site.
 */
function createStore<T>(onServer: T, onClient: () => T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  return {
    get: (): T => (value ??= onClient()),
    server: () => onServer,
    set(next: T) {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

// The seeds are random, so the browser draws them; until then (and on the
// server) there are none. Once the game is wired to the server, the server
// seed stays there and only its hash comes down.
const NO_SEEDS: Seeds = { serverSeed: "", clientSeed: "", nonce: 0, previous: null };
export const seedStore = createStore<Seeds>(NO_SEEDS, () => ({ serverSeed: randomHex(32), clientSeed: randomHex(8), nonce: 0, previous: null }));
export const useSeeds = () => useSyncExternalStore(seedStore.subscribe, seedStore.get, seedStore.server);

const SETTINGS_KEY = "mines.settings";
const DEFAULT_SETTINGS: Settings = { animations: true, hotkeys: false };
export const settingsStore = createStore<Settings>(DEFAULT_SETTINGS, () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
});
export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.get, settingsStore.server);
export function saveSettings(next: Settings) {
  settingsStore.set(next);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {}
}
