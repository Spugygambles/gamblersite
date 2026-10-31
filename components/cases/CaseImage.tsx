import type { CSSProperties } from "react";
import styles from "./CaseImage.module.css";

// a case's own hue, from its slug, so the stand-ins differ
function hueOf(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

/**
 * A case's picture: its image where it has one, else a drawn case in a
 * colour of its own, until the picture comes (public/cases/<slug>.png).
 */
export default function CaseImage({ slug, image, width, height, className }: { slug: string; image: string | null; width: number; height: number; className?: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" width={width} height={height} className={className} loading="lazy" decoding="async" />;
  }
  return (
    <svg className={`${styles.drawn} ${className ?? ""}`} viewBox="0 0 160 120" width={width} height={height} style={{ "--hue": hueOf(slug) } as CSSProperties} aria-hidden data-case-drawn>
      <ellipse className={styles.glow} cx="80" cy="74" rx="66" ry="34" />
      <polygon className={styles.side} points="104,46 134,32 134,92 104,106" />
      <rect className={styles.front} x="30" y="46" width="74" height="60" rx="3" />
      <polygon className={styles.lid} points="26,46 58,28 138,28 108,46" />
      <rect className={styles.band} x="30" y="46" width="74" height="9" />
      <polygon className={styles.shine} points="62,31 76,31 50,44 36,44" />
      <circle className={styles.emblem} cx="67" cy="79" r="12" />
      <circle className={styles.ring} cx="67" cy="79" r="7" />
    </svg>
  );
}
