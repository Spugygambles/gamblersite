"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Kind, Skin } from "@/lib/skins";
import styles from "./Upgrader.module.css";

// A flat silhouette for each kind of item, drawn in a 100 by 60 box.
const SHAPES: Record<Kind, string> = {
  rifle: "M2 25 16 22 16 31 13 33 2 35Z M16 21h56v9H16z M72 24h26v4H72z M84 19h3v5h-3z M24 18h4v3h-4z M38 30h12l-4 16-12-2z M56 30h8l-3 12h-8z",
  sniper: "M2 27 14 25v9l-4 7H2z M14 24h48v9H14z M62 27h36v3H62z M30 16h26v5H30z M34 21h4v3h-4z M48 21h4v3h-4z M46 33h8l-4 11h-8z M33 33h10l-2 8H31z",
  pistol: "M18 18h70v11H18z M22 29h58v4H22z M54 33h24l-8 23H48z M38 33h16v5l-10 4h-4z",
  smg: "M2 23 14 21v14L2 33z M14 20h56v16H14z M70 25h18v6H70z M34 36h10v16H34z M52 36h10l-3 14h-10z M48 16h12v4H48z",
  heavy: "M2 27 16 23v10l-4 7H2z M16 22h42v10H16z M58 24h40v5H58z M60 29h28v4H60z M44 32h8l-3 10h-8z",
  knife: "M4 30q0-5 6-5h30v14H10q-6 0-6-5z M40 25 64 20l32 5-8 6-26 4H40z",
  gloves: "M30 22q0-8 6-8t6 8v12H30z M43 18q0-8 6-8t6 8v16H43z M56 20q0-8 6-8t6 8v14H56z M69 24q0-7 5-7t5 7v10H69z M24 30q-6-2-6 4l8 10z M26 34h54v14q0 6-6 6H32q-6 0-6-6z",
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
        <path d={SHAPES[skin.kind]} />
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
