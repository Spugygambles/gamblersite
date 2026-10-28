import { MILESTONES, MY_HUNT } from "@/lib/event";
import { CheckIcon } from "@/components/home/icons";
import RewardIcon from "./RewardIcon";
import styles from "./RewardTrack.module.css";

// How far along the line the player is: past the last milestone they've
// reached, part way to the next.
function progress() {
  const t = MY_HUNT.turkeys;
  const next = MILESTONES.findIndex((m) => m.turkeys > t);
  if (next === -1) return 1;
  if (next === 0) return 0;
  const from = MILESTONES[next - 1].turkeys;
  const step = (t - from) / (MILESTONES[next].turkeys - from);
  return (next - 1 + step) / (MILESTONES.length - 1);
}

/**
 * The rewards for turkeys caught, on a line the player's progress fills:
 * the ones they've reached are ticked off, and the next is picked out.
 */
export default function RewardTrack() {
  const next = MILESTONES.findIndex((m) => m.turkeys > MY_HUNT.turkeys);
  return (
    <div className={styles.track}>
      <div className={styles.inner}>
        <div className={styles.line} aria-hidden>
          <span className={styles.fill} style={{ width: `${progress() * 100}%` }} />
        </div>
        <ol className={styles.steps}>
          {MILESTONES.map((m, i) => {
            const state = next === -1 || i < next ? styles.done : i === next ? styles.next : "";
            return (
              <li key={m.turkeys} className={`${styles.step} ${state}`}>
                <span className={`${styles.node} tabular`}>{state === styles.done ? <CheckIcon aria-label="Reached" /> : m.turkeys}</span>
                <span className={styles.reward}>
                  <RewardIcon kind={m.kind} />
                  {m.reward}
                </span>
                <span className={styles.need}>{i === next ? `${m.turkeys - MY_HUNT.turkeys} more to go` : `${m.turkeys} turkeys`}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
