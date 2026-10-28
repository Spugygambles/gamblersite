"use client";

import Link from "next/link";
import { useState } from "react";
import { EXCLUSIONS } from "@/lib/profile";
import styles from "./Profile.module.css";

/** Self exclusion: pick how long for, say you understand, then confirm. */
export default function SelfExclusion() {
  const [period, setPeriod] = useState("");
  const [sure, setSure] = useState(false);

  return (
    <>
      <h2 className={styles.title}>Self exclusion</h2>
      <p className={styles.lead}>
        Need time away? Self exclusion locks your account for as long as you choose. Until it ends you can&apos;t deposit, play or
        withdraw skins, and it can&apos;t be lifted early, even by support.
      </p>
      <div className={`${styles.field} ${styles.narrow}`}>
        <label htmlFor="exclusion-period" className={styles.fieldLabel}>
          Exclude me for
        </label>
        <select id="exclusion-period" className={styles.select} value={period} onChange={(e) => setPeriod(e.target.value)} data-exclusion-period>
          <option value="" disabled>
            Choose how long
          </option>
          {EXCLUSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} data-exclusion-sure />
        I understand this can&apos;t be undone before it ends.
      </label>
      <button type="button" className={styles.danger} disabled={!period || !sure} data-exclusion-lock>
        Self exclude
      </button>
      <p className={styles.hint}>
        Want to talk to someone first? See <Link href="/responsible-gaming">Responsible gaming</Link>.
      </p>
    </>
  );
}
