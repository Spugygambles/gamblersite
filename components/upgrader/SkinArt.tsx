"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Kind, Skin } from "@/lib/skins";
import styles from "./Upgrader.module.css";

// A silhouette for each kind of item, drawn in a 100 by 60 box, side on
// and facing right: the body in the rarity's colour, and the grips, stock
// furniture, magazines and scopes a shade darker over it.
const SHAPES: Record<Kind, { body: string; dark: string }> = {
  rifle: {
    body: "M18 20h42v10H18z M60 21h14v8H60z M74 24h24v3H74z M74 21h16v2H74z M86 17h3v7h-3z M28 17h5v3h-5z",
    dark: "M2 24 18 21l1 10-7 3H2z M38 30h14l-2 16-10 1-4-7z M56 30h8l-2 12h-8z M46 30h10v3H46z",
  },
  sniper: {
    body: "M16 22h48v11H16z M64 26h34v3H64z M94 24h4v7h-4z M20 20h8v2h-8z",
    dark: "M2 25 16 22v12l-4 8H2z M28 14h32v6H28z M52 12h8v10h-8z M34 20h4v2h-4z M48 20h4v2h-4z M48 33h8l-4 12h-8z M34 33h10l-1 7H33z M70 29h2l-4 11h-2z",
  },
  pistol: {
    body: "M16 16h74v12H16z M20 28h58v4H20z M20 13h4v3h-4z M82 13h4v3h-4z",
    dark: "M54 32h24l-6 26H50z M40 32h16l-1 8H43z M14 22l3-6 2 6z",
  },
  smg: {
    body: "M14 20h58v14H14z M72 25h18v5H72z M44 16h16v4H44z",
    dark: "M2 24 14 22v12L2 32z M56 34h8l-2 12h-8z M34 34h10v20H34z",
  },
  heavy: {
    body: "M18 22h42v11H18z M60 24h38v4H60z",
    dark: "M2 27 18 23v10l-4 8H2z M62 29h28v5H62z M46 33h8l-4 11h-8z",
  },
  knife: {
    body: "M41 28 70 22l27 5-5 7-30 4-21 2z",
    dark: "M4 29q0-3 3-3h31v15H7q-3 0-3-3z M36 26h5v18h-5z",
  },
  gloves: {
    body: "M30 22q0-8 6-8t6 8v12H30z M43 18q0-8 6-8t6 8v16H43z M56 20q0-8 6-8t6 8v14H56z M69 24q0-7 5-7t5 7v10H69z M24 30q-6-2-6 4l8 10z M26 34h54v14H26z",
    dark: "M26 48h54v2q0 6-6 6H32q-6 0-6-6z M34 34h2v8h-2z M47 34h2v8h-2z M60 34h2v8h-2z",
  },
};

/**
 * A skin's picture: Steam's render of it over a drawn silhouette in the
 * rarity's colour. The silhouette shows while the render loads and stays
 * if it can't be fetched; once the render is in, it goes, so nothing
 * shows through the render's transparent parts.
 */
export default function SkinArt({ skin }: { skin: Skin }) {
  const ref = useRef<HTMLImageElement>(null);
  // a render that finished before React got here never fires onLoad
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.parentElement) img.parentElement.dataset.art = img.naturalWidth > 0 ? "loaded" : "missing";
  }, []);
  return (
    <span className={styles.art} style={{ "--rarity": skin.color } as CSSProperties}>
      <svg className={styles.silhouette} viewBox="0 0 100 60" aria-hidden>
        <path d={SHAPES[skin.kind].body} />
        <path className={styles.silhouetteDark} d={SHAPES[skin.kind].dark} />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={skin.image}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(e) => (e.currentTarget.parentElement!.dataset.art = "loaded")}
        onError={(e) => (e.currentTarget.parentElement!.dataset.art = "missing")}
      />
    </span>
  );
}
