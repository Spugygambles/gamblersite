"use client";

import Link from "next/link";
import { useState } from "react";
import { BREAKS } from "@/lib/profile";
import styles from "./Profile.module.css";

/** Self-exclusion: pick how long to lock the account for, then confirm. */
export default function TakeABreak() {
  const [length, setLength] = useState<string | null>(null);

  return (
    <>
      <h2 className={styles.title}>Take a break</h2>
      <p className={styles.lead}>
        If you want to step away, lock your account for a while. You won&apos;t be able to deposit or play until the break ends, and it
        can&apos;t be cut short.
      </p>
      <fieldset className={styles.breaks}>
        <legend className="sr-only">How long for</legend>
        {BREAKS.map((b) => (
          <label key={b} className={styles.break}>
            <input type="radio" name="break" value={b} checked={length === b} onChange={() => setLength(b)} data-break />
            {b}
          </label>
        ))}
      </fieldset>
      <button type="button" className={styles.danger} disabled={!length} data-break-lock>
        Lock my account
      </button>
      <p className={styles.hint}>
        Want to talk to someone first? See <Link href="/responsible-gaming">Responsible gaming</Link>.
      </p>
    </>
  );
}
