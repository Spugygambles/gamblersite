import { count, PLAYER } from "@/lib/home";
import { HUNTERS, MY_HUNT, PRIZES } from "@/lib/event";
import { avatarOf } from "@/components/home/avatar";
import { CoinIcon } from "@/components/home/icons";
import styles from "./Hunters.module.css";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// First, second and third get their medal's colour.
const MEDALS = ["gold", "silver", "bronze"];

// One hunter's row: their place, who they are, turkeys caught and prize.
function Row({
  rank,
  name,
  level,
  turkeys,
  prize,
  me,
}: {
  rank: number;
  name: string;
  level: number;
  turkeys: number;
  prize?: number;
  me?: boolean;
}) {
  return (
    <tr className={me ? styles.me : undefined}>
      <td>
        <span className={`${styles.rank} ${styles[MEDALS[rank - 1]] ?? ""} tabular`}>{rank}</span>
      </td>
      <td>
        <span className={styles.who}>
          <span className={styles.avatar} style={{ background: avatarOf(name) }} aria-hidden>
            {name[0].toUpperCase()}
          </span>
          <span className={styles.name}>{name}</span>
          <span className={styles.level}>
            <span className="sr-only">Level </span>
            {level}
          </span>
          {me && <span className={styles.you}>You</span>}
        </span>
      </td>
      <td className={`${styles.num} tabular`}>{count.format(turkeys)}</td>
      <td className={styles.num}>
        {prize ? (
          <span className={`${styles.prize} tabular`}>
            <CoinIcon />
            {money.format(prize)}
          </span>
        ) : (
          <span className={styles.none}>–</span>
        )}
      </td>
    </tr>
  );
}

/**
 * The hunters' board: the top ten by turkeys caught, with what each place
 * wins, and the player's own place under them.
 */
export default function Hunters() {
  return (
    <div className={styles.board}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Place</th>
            <th scope="col">Hunter</th>
            <th scope="col" className={styles.num}>
              Turkeys
            </th>
            <th scope="col" className={styles.num}>
              Prize
            </th>
          </tr>
        </thead>
        <tbody>
          {HUNTERS.map((h, i) => (
            <Row key={h.name} rank={i + 1} name={h.name} level={h.level} turkeys={h.turkeys} prize={PRIZES[i]} />
          ))}
          <tr className={styles.gap} aria-hidden>
            <td colSpan={4} />
          </tr>
          <Row rank={MY_HUNT.rank} name={PLAYER.name} level={PLAYER.level} turkeys={MY_HUNT.turkeys} me />
        </tbody>
      </table>
    </div>
  );
}
