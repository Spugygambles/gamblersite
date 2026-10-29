/**
 * A value shared by whoever reads it, kept outside React: the server (and
 * so the first paint) sees `onServer`, the browser makes its own on first
 * read, and `set` tells every subscriber. It outlives any component, so
 * what's kept here holds while the player moves about the site. Read it
 * in a component with useSyncExternalStore(subscribe, get, server).
 */
export function createStore<T>(onServer: T, onClient: () => T) {
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
