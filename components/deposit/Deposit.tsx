import WalletPanel from "@/components/wallet/WalletPanel";
import styles from "./Deposit.module.css";

/** The wallet as a page of its own, for a link straight to it. */
export default function Deposit() {
  return (
    <div className={styles.wrap} data-deposit>
      <h1 className={styles.title}>Wallet</h1>
      <div className={styles.card}>
        <WalletPanel />
      </div>
    </div>
  );
}
