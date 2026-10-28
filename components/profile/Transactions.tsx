import { usd } from "@/lib/home";
import { PROFILE, TRANSACTIONS } from "@/lib/profile";
import { DepositIcon, WithdrawIcon } from "@/components/home/icons";
import styles from "./Profile.module.css";

const STATUS = { Completed: styles.done, Pending: styles.pending, Failed: styles.failed };

/** Money in and out: the totals, then each deposit and withdrawal with how
    it was paid and where it's got to. */
export default function Transactions() {
  return (
    <>
      <h2 className={styles.title}>Transactions</h2>
      <ul className={styles.totals}>
        <li>
          <DepositIcon />
          Deposited <b className="tabular">{usd.format(PROFILE.deposited)}</b>
        </li>
        <li>
          <WithdrawIcon />
          Withdrawn <b className="tabular">{usd.format(PROFILE.withdrawn)}</b>
        </li>
      </ul>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col" className={styles.wide}>
              Method
            </th>
            <th scope="col" className={styles.num}>
              Amount
            </th>
            <th scope="col">Status</th>
            <th scope="col" className={`${styles.num} ${styles.wide}`}>
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((t, i) => (
            <tr key={i}>
              <td>
                <span className={styles.game}>
                  {t.kind === "deposit" ? <DepositIcon /> : <WithdrawIcon />}
                  {t.kind === "deposit" ? "Deposit" : "Withdrawal"}
                </span>
              </td>
              <td className={styles.wide}>{t.method}</td>
              <td className={`${styles.num} tabular`}>
                {t.kind === "deposit" ? "+" : "−"}
                {usd.format(t.amount)}
              </td>
              <td>
                <span className={`${styles.status} ${STATUS[t.status]}`}>{t.status}</span>
              </td>
              <td className={`${styles.num} ${styles.wide} ${styles.when}`}>{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
