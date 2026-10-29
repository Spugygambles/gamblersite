import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/store";

export { seedStore, useSeeds, type Seeds } from "@/lib/seeds";

export type Settings = { sound: boolean; animations: boolean; hotkeys: boolean };

const SETTINGS_KEY = "mines.settings";
const DEFAULT_SETTINGS: Settings = { sound: true, animations: true, hotkeys: false };
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
