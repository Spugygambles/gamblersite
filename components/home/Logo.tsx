import Link from "next/link";
import { useId } from "react";
import { CLAW_MARKS } from "@/lib/claw";
import styles from "./Logo.module.css";

export default function Logo() {
  const id = useId();
  return (
    <Link href="/" className={styles.logo} aria-label="Rustwild home">
      <svg className={styles.claw} viewBox="-6 -6 112 116" aria-hidden>
        <defs>
          <linearGradient id={`${id}-claw`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a678ff" />
            <stop offset="1" stopColor="#6a2fe0" />
          </linearGradient>
        </defs>
        {CLAW_MARKS.map((d) => (
          <path key={d} d={d} fill={`url(#${id}-claw)`} />
        ))}
      </svg>
      <span className={styles.word} aria-hidden>
        RUST<span className={styles.wild}>WILD</span>
      </span>
    </Link>
  );
}
