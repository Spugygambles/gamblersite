import Image from "next/image";
import styles from "./CoinflipArt.module.css";

// Stacked discs between the two faces that give the coin a visible rim mid-flip.
const EDGE_LAYERS = 12;

// Positions and sizes are percentages of the coin. `start` is when each glint
// fires, as a fraction of one throw (half the cycle): two fire as the coin
// lands, one at the top of the toss, and the rest while it idles.
const SPARKLES = [
  { x: -8, y: 12, size: 11, start: 0.05 },
  { x: 112, y: 64, size: 12, start: 0.32 },
  { x: 50, y: -18, size: 7, start: 0.56 },
  { x: 104, y: 6, size: 9, start: 0.74 },
  { x: -14, y: 74, size: 8, start: 0.78 },
];

export default function CoinflipArt() {
  return (
    <div className={styles.stage}>
      <div className={styles.rays} />
      <div className={`${styles.glow} ${styles.glowHeads}`} />
      <div className={`${styles.glow} ${styles.glowTails}`} />
      <div className={styles.shadow} />
      <div className={`${styles.ring} ${styles.ringHeads}`} />
      <div className={`${styles.ring} ${styles.ringTails}`} />

      <div className={styles.toss}>
        <div className={styles.coin}>
          <div className={`${styles.face} ${styles.heads}`}>
            <Image
              className={styles.faceImg}
              src="/coinflip/heads.png"
              alt=""
              width={464}
              height={464}
              sizes="(max-width: 640px) 25vw, 160px"
              loading="eager"
              draggable={false}
            />
          </div>
          {/* A tilted face shows the far half of the rim, so each half is
              colored to match the face on the opposite side. */}
          {Array.from({ length: EDGE_LAYERS }, (_, i) => (
            <div
              key={i}
              className={`${styles.edge} ${i < EDGE_LAYERS / 2 ? styles.edgeTails : styles.edgeHeads}`}
              style={{
                transform: `translateZ(calc(var(--depth) * ${0.5 - (i + 0.5) / EDGE_LAYERS}))`,
              }}
            />
          ))}
          <div className={`${styles.face} ${styles.tails}`}>
            <Image
              className={styles.faceImg}
              src="/coinflip/tails.png"
              alt=""
              width={464}
              height={464}
              sizes="(max-width: 640px) 25vw, 160px"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}%`,
            animationDelay: `calc(var(--cycle) * ${s.start / 2})`,
          }}
        />
      ))}
    </div>
  );
}
