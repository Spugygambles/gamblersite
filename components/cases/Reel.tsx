"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import SkinArt from "@/components/upgrader/SkinArt";
import type { CaseItem } from "@/lib/cases";
import { money } from "@/lib/upgrader";
import styles from "./Reel.module.css";

/*
 * The reel: a strip of skins that races past a marker and slows to a stop
 * with the winner under it. The strip is long (TILES tiles, the winner at
 * WIN_AT), filled from the case's items by their odds in an order the
 * `seed` fixes, so a spin looks the same wherever it's shown. The ride is
 * one CSS transition, settled by a timer; with reduced motion it just
 * lands.
 */

const TILES = 60;
const WIN_AT = 50;
export const SPIN_MS = 5000;
export const FAST_MS = 1200;

// Small, repeatable random numbers for the strip's order.
function mulberry(seed: number) {
  let a = (seed * 2654435761 + 1) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The strip: `TILES` items drawn by their odds, the winner at WIN_AT. */
export function stripFor(items: CaseItem[], winner: CaseItem | null, seed: number): CaseItem[] {
  const rand = mulberry(seed);
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  const draw = () => {
    const r = rand() * total;
    let acc = 0;
    for (const it of items) {
      acc += it.weight;
      if (r < acc) return it;
    }
    return items[items.length - 1];
  };
  const strip = Array.from({ length: TILES }, draw);
  if (winner) strip[WIN_AT] = winner;
  return strip;
}

export default function Reel({
  items,
  winner,
  spinning,
  fast = false,
  onDone,
  seed = 0,
  label = "The reel",
  vertical = false,
}: {
  items: CaseItem[];
  winner: CaseItem | null;
  spinning: boolean;
  fast?: boolean;
  onDone?: () => void;
  seed?: number;
  label?: string;
  /** The strip runs top to bottom, the marker across the middle. */
  vertical?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const strip = stripFor(items, winner, seed);

  // A spin: back to the start without a transition, then one long ride to
  // the winner, landing a little off its middle (where, the seed says).
  useEffect(() => {
    if (!spinning) return;
    const box = boxRef.current;
    const el = stripRef.current;
    if (!box || !el || !el.children.length) return;
    const first = el.children[0] as HTMLElement;
    const rect = first.getBoundingClientRect();
    const tile = vertical ? rect.height : rect.width;
    const style = getComputedStyle(el);
    const gap = parseFloat((vertical ? style.rowGap : style.columnGap) || "0") || 0;
    const span = vertical ? box.clientHeight : box.clientWidth;
    const jitter = (mulberry(seed + 7)() - 0.5) * tile * 0.7;
    const target = -(WIN_AT * (tile + gap) + tile / 2 - span / 2 + jitter);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = still ? 0 : fast ? FAST_MS : SPIN_MS;
    const move = (px: number) => (vertical ? `translateY(${px}px)` : `translateX(${px}px)`);
    el.style.transition = "none";
    el.style.transform = move(0);
    void el.offsetWidth;
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(0.1, 0.7, 0.12, 1)` : "none";
    el.style.transform = move(Number(target.toFixed(1)));
    const timer = window.setTimeout(() => done.current?.(), ms + 120);
    return () => clearTimeout(timer);
  }, [spinning, seed, fast, vertical]);

  return (
    <div ref={boxRef} className={styles.reel} role="img" aria-label={label} data-reel data-vertical={vertical || undefined} data-spinning={spinning || undefined} data-winner={winner?.skin.slug}>
      <div ref={stripRef} className={styles.strip}>
        {strip.map((it, i) => (
          <div key={i} className={styles.tile} style={{ "--rarity": it.skin.color } as CSSProperties} data-win={i === WIN_AT || undefined}>
            <span className={styles.tileArt}>
              <SkinArt skin={it.skin} />
            </span>
            <span className={styles.tileName}>{it.skin.finish}</span>
            <span className={styles.tileWeapon}>{it.skin.weapon}</span>
            <span className={`${styles.tilePrice} tabular`}>{money.format(it.skin.price)}</span>
          </div>
        ))}
      </div>
      <span className={styles.marker} aria-hidden />
    </div>
  );
}
