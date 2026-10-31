"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { CoinIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import type { CaseItem } from "@/lib/cases";
import { TIERS, tierOf } from "@/lib/tiers";
import { money } from "@/lib/upgrader";
import styles from "./Reel.module.css";

/*
 * The reel: a strip of skins that races past a marker and slows to a stop
 * with the winner under it. The strip is long (TILES tiles, the winner at
 * WIN_AT), filled from the case's items by their odds in an order the
 * `seed` fixes, so a spin looks the same wherever it's shown. The ride is
 * one CSS transition, settled by a timer; with reduced motion it just
 * lands.
 *
 * Standing up (`vertical`, the battles' way) it shows three items at a
 * time, each on its own soft light, and the ride is short: a steady run
 * of RIDE tiles that pulls up in the last third, every reel landing its
 * winner dead centre. As it
 * settles a hexagon rings the middle; landed, the winner's name comes up
 * under it. `extraMs` lets one reel land a touch after another, as they
 * do.
 *
 * Lying down (the case page) it shows the items' pictures alone, each on a
 * soft light; before its first spin (`idle`) a glowing coin waits in the
 * middle, and `onTick` is called as each item passes the middle, for the
 * reel's ticking sound.
 */

const TILES = 60;
const WIN_AT = 50;
/** Lying down, the tile in the middle before a spin, and where a spin starts. */
const IDLE_AT = 8;
/** The fewest milliseconds between two ticks: a fast reel doesn't buzz. */
const TICK_GAP = 38;
/** Lying down (the cases page): a long ride. */
export const SPIN_MS = 5000;
export const FAST_MS = 1200;
/** Standing up (the battles): a short one. */
export const STAND_MS = 2400;
export const STAND_FAST_MS = 1200;
/** How many tiles a standing reel rides through. */
const RIDE = 18;
/**
 * The run, then the pull-up: a steady pace for the first 60% of the time,
 * then the speed eased off along a cosine to a stop, sampled closely so
 * nothing jerks.
 */
const STAND_EASE = "linear(0, 0.7500 60%, 0.7811 62.5%, 0.8117 65%, 0.8411 67.5%, 0.8688 70%, 0.8943 72.5%, 0.9173 75%, 0.9374 77.5%, 0.9546 80%, 0.9687 82.5%, 0.9798 85%, 0.9880 87.5%, 0.9938 90%, 0.9973 92.5%, 0.9992 95%, 0.9999 97.5%, 1)";

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

/** A reel's lag behind the others, 0 to 300 ms, from its seed. */
export const staggerOf = (seed: number) => ((seed * 2654435761) >>> 0) % 301;

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
  casePrice = 0,
  extraMs = 0,
  idle = false,
  onTick,
}: {
  items: CaseItem[];
  winner: CaseItem | null;
  spinning: boolean;
  fast?: boolean;
  onDone?: () => void;
  seed?: number;
  label?: string;
  /** The strip runs top to bottom, three items showing. */
  vertical?: boolean;
  /** What the case costs: an item's tier (its glow) is its worth against this. */
  casePrice?: number;
  /** Added to the ride, so this reel lands after the others. */
  extraMs?: number;
  /** Not spun yet: lying down, a coin waits in the middle. */
  idle?: boolean;
  /** Each item passing the middle while it spins. */
  onTick?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  const tick = useRef(onTick);
  useEffect(() => {
    done.current = onDone;
    tick.current = onTick;
  });
  const strip = stripFor(items, winner, seed);

  // standing up, a tile is a third of the box
  useLayoutEffect(() => {
    if (!vertical) return;
    const box = boxRef.current;
    if (!box) return;
    const measure = () => box.style.setProperty("--vtile", `${Math.max(56, Math.round(box.clientHeight / 3))}px`);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [vertical]);

  // Lying down and not yet spun, the strip sits with the coin in the middle.
  useLayoutEffect(() => {
    if (vertical || spinning || winner) return;
    const box = boxRef.current;
    const el = stripRef.current;
    if (!box || !el || !el.children.length) return;
    const place = () => {
      const tile = (el.children[0] as HTMLElement).getBoundingClientRect().width;
      const style = getComputedStyle(el);
      const gap = parseFloat(style.columnGap || "0") || 0;
      const pad = parseFloat(style.paddingLeft || "0") || 0;
      el.style.transition = "none";
      el.style.transform = `translateX(${(-(pad + IDLE_AT * (tile + gap) + tile / 2 - box.clientWidth / 2)).toFixed(1)}px)`;
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => ro.disconnect();
  }, [vertical, spinning, winner]);

  // A spin: to the start without a transition, then one ride to the winner.
  // Standing up the ring comes on as it settles.
  useEffect(() => {
    if (!spinning) return;
    const box = boxRef.current;
    const el = stripRef.current;
    if (!box || !el || !el.children.length) return;
    box.removeAttribute("data-landed");
    box.removeAttribute("data-settling");
    const first = el.children[0] as HTMLElement;
    const rect = first.getBoundingClientRect();
    const tile = vertical ? rect.height : rect.width;
    const style = getComputedStyle(el);
    const gap = parseFloat((vertical ? style.rowGap : style.columnGap) || "0") || 0;
    const span = vertical ? box.clientHeight : box.clientWidth;
    // every reel lands its winner dead centre, so reels side by side or stacked stop alike
    const pad = vertical ? 0 : parseFloat(style.paddingLeft || "0") || 0;
    const at = (index: number) => -(pad + index * (tile + gap) + tile / 2 - span / 2);
    const target = at(WIN_AT);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = still ? 0 : (vertical ? (fast ? STAND_FAST_MS : STAND_MS) : fast ? FAST_MS : SPIN_MS) + extraMs;
    const move = (px: number) => (vertical ? `translateY(${px}px)` : `translateX(${px}px)`);
    el.style.transition = "none";
    el.style.transform = move(Number(at(vertical ? WIN_AT - RIDE : IDLE_AT).toFixed(1)));
    void el.offsetWidth;
    el.style.transition = ms ? `transform ${ms}ms ${vertical ? STAND_EASE : "cubic-bezier(0.1, 0.7, 0.12, 1)"}` : "none";
    el.style.transform = move(Number(target.toFixed(1)));

    // the tick: each time another item reaches the middle
    let raf = 0;
    let passed = -1;
    let lastTick = 0;
    const listen = (now: number) => {
      try {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        const moved = -(vertical ? m.m42 : m.m41);
        const index = Math.floor((moved + span / 2 - pad) / (tile + gap));
        if (index !== passed) {
          if (passed !== -1 && now - lastTick >= TICK_GAP) {
            tick.current?.();
            lastTick = now;
          }
          passed = index;
        }
      } catch {}
      raf = requestAnimationFrame(listen);
    };
    if (ms && typeof requestAnimationFrame === "function") raf = requestAnimationFrame(listen);

    const settle = window.setTimeout(() => box.setAttribute("data-settling", ""), ms * 0.7);
    const timer = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      box.setAttribute("data-landed", "");
      done.current?.();
    }, ms + 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      clearTimeout(timer);
    };
  }, [spinning, seed, fast, vertical, extraMs]);

  return (
    <div
      ref={boxRef}
      className={styles.reel}
      role="img"
      aria-label={label}
      data-reel
      data-vertical={vertical || undefined}
      data-spinning={spinning || undefined}
      data-landed={!spinning && winner ? "" : undefined}
      data-winner={winner?.skin.slug}
      data-idle={idle && !spinning && !winner ? "" : undefined}
    >
      <div className={styles.window}>
        <div ref={stripRef} className={styles.strip}>
          {strip.map((it, i) => (
            <div key={i} className={styles.tile} style={{ "--tier": TIERS[tierOf(it.skin.price, casePrice)].color } as CSSProperties} data-tier={tierOf(it.skin.price, casePrice)} data-win={i === WIN_AT || undefined}>
              <span className={styles.tileArt}>
                {vertical && i === WIN_AT && (
                  <svg className={styles.hex} viewBox="0 0 100 100" aria-hidden>
                    <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" />
                  </svg>
                )}
                {!vertical && idle && !spinning && !winner && i === IDLE_AT ? (
                  <span className={styles.coin} data-coin>
                    <CoinIcon />
                  </span>
                ) : (
                  <SkinArt skin={it.skin} />
                )}
              </span>
              <span className={styles.tileName} data-name>
                {it.skin.finish}
              </span>
              {it.skin.weapon && <span className={styles.tileWeapon}>{it.skin.weapon}</span>}
              <span className={`${styles.tilePrice} tabular`}>{money.format(it.skin.price)}</span>
            </div>
          ))}
        </div>
      </div>
      <span className={styles.marker} aria-hidden />
    </div>
  );
}
