import { useSyncExternalStore } from "react";
import { createStore } from "./store";

/*
 * What the wallet's coins are worth in dollars: CoinGecko's public price
 * call, made when the wallet opens and every half hour after, and kept in
 * the browser so a page that comes back within the half hour doesn't ask
 * again. Until a price has come (or where the call can't be made), the
 * coins' own placeholder rates stand in.
 */

export const PRICES_EVERY_MS = 30 * 60 * 1000;
const KEY = "csgoneo.prices";
// the wallet's coin ids, by CoinGecko's names for them
const GECKO: Record<string, string> = { eth: "ethereum", ltc: "litecoin", sol: "solana", usdt: "tether", usdc: "usd-coin" };
const URL = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(GECKO).join(",")}&vs_currencies=usd`;

export type Prices = { usd: Record<string, number>; at: number | null };
const START: Prices = { usd: {}, at: null };

function load(): Prices {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "");
    if (s && typeof s.at === "number" && s.usd && typeof s.usd === "object") return { usd: s.usd, at: s.at };
  } catch {}
  return START;
}

const store = createStore<Prices>(START, load);
export const usePrices = () => useSyncExternalStore(store.subscribe, store.get, store.server);

/** A coin's dollar price: the live one once it has come, else the fallback given. */
export const priceOf = (prices: Prices, id: string, fallback: number) => prices.usd[id] ?? fallback;

async function fetchPrices() {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const usd: Record<string, number> = {};
    for (const [id, name] of Object.entries(GECKO)) {
      const v = data?.[name]?.usd;
      if (typeof v === "number" && v > 0) usd[id] = v;
    }
    if (!Object.keys(usd).length) return;
    const next = { usd, at: Date.now() };
    store.set(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  } catch {
    // no price this time: the last ones (or the placeholders) stand
  }
}

let started = false;

/** Gets the prices coming: now, if the last are older than half an hour, and every half hour after. */
export function startPrices() {
  if (started || typeof window === "undefined") return;
  started = true;
  const tick = () => {
    const at = store.get().at;
    const due = at === null ? 0 : at + PRICES_EVERY_MS - Date.now();
    if (due > 0) {
      setTimeout(tick, due);
      return;
    }
    void fetchPrices().finally(() => setTimeout(tick, PRICES_EVERY_MS));
  };
  tick();
}
