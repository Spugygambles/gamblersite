import { useSyncExternalStore } from "react";
import { randomHex, sha256, toHex, utf8 } from "./sha256";
import { createStore } from "./store";

/**
 * The provably-fair seeds, shared by every game: one server seed (its
 * hash shown before play), the player's client seed, and a nonce that
 * counts the games played under them. Rotating reveals the old server
 * seed so those games can be checked. The seeds are random, so the
 * browser draws them; until then (and on the server) there are none. Once
 * the games are wired to the server, the server seed stays there and only
 * its hash comes down.
 */
export type Seeds = {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  /** The seeds before the last rotation, revealed so those games can be checked. */
  previous: { serverSeed: string; clientSeed: string; nonces: number } | null;
};

/** The hash of a server seed, shown before a game so the seed can be checked against it after. */
export const seedHash = (serverSeed: string) => toHex(sha256(utf8(serverSeed)));

const NO_SEEDS: Seeds = { serverSeed: "", clientSeed: "", nonce: 0, previous: null };
export const seedStore = createStore<Seeds>(NO_SEEDS, () => ({ serverSeed: randomHex(32), clientSeed: randomHex(8), nonce: 0, previous: null }));
export const useSeeds = () => useSyncExternalStore(seedStore.subscribe, seedStore.get, seedStore.server);

/** Takes the nonce for a game and moves it on; the seeds the game is drawn from. */
export function takeNonce(): Seeds {
  const s = seedStore.get();
  seedStore.set({ ...s, nonce: s.nonce + 1 });
  return s;
}

/** A new server seed, this client seed, the nonce back to 0; the old seeds kept for checking. */
export function rotateSeeds(clientSeed: string) {
  const s = seedStore.get();
  seedStore.set({
    serverSeed: randomHex(32),
    clientSeed: clientSeed || s.clientSeed,
    nonce: 0,
    previous: { serverSeed: s.serverSeed, clientSeed: s.clientSeed, nonces: s.nonce },
  });
}
