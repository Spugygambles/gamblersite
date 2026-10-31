import Link from "next/link";
import GamesMenu from "./GamesMenu";
import AccountMenu from "./AccountMenu";
import { ChatIcon, CoinIcon, GiftIcon } from "./icons";
import WalletBalance from "./WalletBalance";
import WalletButton from "@/components/wallet/WalletButton";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

// The bar across the top. On the left: the name, the games menu and
// rewards. On the right: the wallet (the balance, and the button that opens
// the wallet window), the player's menu (AccountMenu), and the chat
// button, which AppShell works and keeps the aria-expanded of up to date.
export default function SiteHeader() {

  return (
    <header className={styles.header}>
      <div className={styles.start}>
        <Wordmark />
        <nav className={styles.nav} aria-label="Main">
          <GamesMenu />
          <Link href="/rewards" className={styles.navItem}>
            <GiftIcon />
            Rewards
          </Link>
        </nav>
      </div>

      <div className={styles.end}>
        <div className={styles.wallet}>
          <span className={styles.balance}>
            <span className="sr-only">Balance:</span>
            <CoinIcon className={styles.coin} />
            <WalletBalance />
          </span>
          <WalletButton className={styles.deposit} />
        </div>
        <AccountMenu />
        <button type="button" className={`${styles.iconButton} ${styles.chat}`} data-shell-toggle="chat" aria-label="Chat">
          <ChatIcon />
        </button>
      </div>
    </header>
  );
}
