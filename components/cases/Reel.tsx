"use client";

import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties } from "react";
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
 * time with a glow behind each, blurs them with the strip's speed while
 * it's quick, and once it has landed draws a hexagon round the winner
 * with its name and price.
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

// how far the strip has moved, from its transform
function offsetOf(el: HTMLElement, vertical: boolean): number {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return 0;
  const m = new DOMMatrixReadOnly(t);
  return vertical ? m.m42 : m.m41;
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
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const filterId = "reel-blur-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
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

  // A spin: back to the start without a transition, then one long ride to
  // the winner, landing a little off its middle (where, the seed says).
  // Standing up, the window blurs with the strip's speed as it goes.
  useEffect(() => {
    if (!spinning) return;
    const box = boxRef.current;
    const el = stripRef.current;
    if (!box || !el || !el.children.length) return;
    // the winner's ring comes off for the ride and back once it's landed
    box.removeAttribute("data-landed");
    const first = el.children[0] as HTMLElement;
    const rect = first.getBoundingClientRect();
    const tile = vertical ? rect.height : rect.width;
    const style = getComputedStyle(el);
    const gap = parseFloat((vertical ? style.rowGap : style.columnGap) || "0") || 0;
    const span = vertical ? box.clientHeight : box.clientWidth;
    const jitter = (mulberry(seed + 7)() - 0.5) * tile * (vertical ? 0.18 : 0.7);
    const target = -(WIN_AT * (tile + gap) + tile / 2 - span / 2 + jitter);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = still ? 0 : fast ? FAST_MS : SPIN_MS;
    const move = (px: number) => (vertical ? `translateY(${px}px)` : `translateX(${px}px)`);
    el.style.transition = "none";
    el.style.transform = move(0);
    void el.offsetWidth;
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(0.1, 0.7, 0.12, 1)` : "none";
    el.style.transform = move(Number(target.toFixed(1)));

    // the blur follows the speed, frame by frame
    const win = windowRef.current;
    const blur = blurRef.current;
    let raf = 0;
    if (vertical && win && blur && ms) {
      win.style.filter = `url(#${filterId})`;
      let prevY = 0;
      let prevT = performance.now();
      const loop = (now: number) => {
        const y = offsetOf(el, true);
        const dt = Math.max(1, now - prevT);
        const speed = Math.abs(y - prevY) / dt;
        prevY = y;
        prevT = now;
        const dev = Math.min(18, Math.max(0, speed - 0.35) * 2.4);
        blur.setAttribute("stdDeviation", `0 ${dev.toFixed(1)}`);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    const timer = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      if (win) win.style.filter = "";
      blur?.setAttribute("stdDeviation", "0 0");
      box.setAttribute("data-landed", "");
      done.current?.();
    }, ms + 120);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (win) win.style.filter = "";
    };
  }, [spinning, seed, fast, vertical, filterId]);

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
    >
      {vertical && (
        <svg className={styles.filterDef} aria-hidden>
          <filter id={filterId} x="0" y="-25%" width="100%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={blurRef} stdDeviation="0 0" edgeMode="duplicate" />
          </filter>
        </svg>
      )}
      <div ref={windowRef} className={styles.window}>
        <div ref={stripRef} className={styles.strip}>
          {strip.map((it, i) => (
            <div key={i} className={styles.tile} style={{ "--tier": TIERS[tierOf(it.skin.price, casePrice)].color } as CSSProperties} data-tier={tierOf(it.skin.price, casePrice)} data-win={i === WIN_AT || undefined}>
              <span className={styles.tileArt}>
                {vertical && i === WIN_AT && (
                  <svg className={styles.hex} viewBox="0 0 100 100" aria-hidden>
                    <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" />
                  </svg>
                )}
                <SkinArt skin={it.skin} />
              </span>
              <span className={styles.tileName}>{it.skin.finish}</span>
              <span className={styles.tileWeapon}>{it.skin.weapon}</span>
              <span className={`${styles.tilePrice} tabular`}>
                {vertical && <CoinIcon />}
                {money.format(it.skin.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <span className={styles.marker} aria-hidden />
    </div>
  );
}
