import { GAMES } from "@/lib/home";
import type { MyBet } from "@/lib/profile";
import { CoinIcon, GAME_ICONS } from "@/components/home/icons";
import styles from "./Profile.module.css";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const titleOf = (slug: string) => GAMES.find((g) => g.slug === slug)?.title ?? slug;

/**
 * The player's bets as flat bars, like the live bets on the home page:
 * the game, the wager, what it was multiplied by, the payout (green for a
 * win) and when. Each row says whether it won, so the bet history's tabs
 * can show just the wins or the losses.
 */
export default function BetTable({ bets }: { bets: MyBet[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Game</th>
          <th scope="col" className={styles.num}>
            Wager
          </th>
          <th scope="col" className={`${styles.num} ${styles.wide}`}>
            Multiplier
          </th>
          <th scope="col" className={styles.num}>
            Payout
          </th>
          <th scope="col" className={`${styles.num} ${styles.wide}`}>
            When
          </th>
        </tr>
      </thead>
      <tbody>
        {bets.map((b) => {
          const Icon = GAME_ICONS[b.game];
          const won = b.multiplier >= 1;
          return (
            <tr key={b.id} data-won={won}>
              <td>
                <span className={styles.game}>
                  <Icon />
                  {titleOf(b.game)}
                </span>
              </td>
              <td className={styles.num}>
                <span className={`${styles.amount} tabular`}>
                  <CoinIcon />
                  {money.format(b.wager)}
                </span>
              </td>
              <td className={`${styles.num} ${styles.wide}`}>
                <span className={`${styles.chip} ${won ? styles.up : ""} tabular`}>{b.multiplier.toFixed(2)}×</span>
              </td>
              <td className={styles.num}>
                <span className={`${styles.amount} ${won ? styles.win : styles.loss} tabular`}>
                  <CoinIcon />
                  {money.format(b.wager * b.multiplier)}
                </span>
              </td>
              <td className={`${styles.num} ${styles.wide} ${styles.when}`}>{b.when}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
