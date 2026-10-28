import { SESSIONS } from "@/lib/profile";
import styles from "./Profile.module.css";

/** Two-step sign-in, the password, and where the account's signed in. */
export default function Security() {
  return (
    <>
      <h2 className={styles.title}>Security</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardWords}>
            <p className={styles.cardTitle}>
              Two-factor authentication <span className={styles.off}>Off</span>
            </p>
            <p className={styles.cardText}>Ask for a code from an authenticator app when you sign in or withdraw.</p>
          </div>
          <button type="button" className={styles.primary}>
            Turn on
          </button>
        </div>
        <div className={styles.card}>
          <div className={styles.cardWords}>
            <p className={styles.cardTitle}>Password</p>
            <p className={styles.cardText}>Last changed 4 months ago.</p>
          </div>
          <button type="button" className={styles.secondary}>
            Change
          </button>
        </div>
      </div>

      <div className={styles.sectionHead}>
        <h3 className={styles.subtitle}>Where you&apos;re signed in</h3>
        <button type="button" className={styles.more}>
          Sign out everywhere else
        </button>
      </div>
      <ul className={styles.sessions}>
        {SESSIONS.map((s) => (
          <li key={s.device} className={styles.session}>
            <span className={styles.sessionDevice}>
              {s.device}
              {s.current && <span className={styles.here}>This device</span>}
            </span>
            <span className={styles.sessionPlace}>{s.place}</span>
            <span className={styles.sessionWhen}>{s.when}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
