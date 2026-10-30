import Link from "next/link";
import GamesMenu from "./GamesMenu";
import AccountMenu from "./AccountMenu";
import GemCount from "./GemCount";
import { ChatIcon, CoinIcon, GemIcon, GiftIcon } from "./icons";
import WalletBalance from "./WalletBalance";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

// The bar across the top. On the left: the name, the games menu and
// rewards. On the right: withdraw, the wallet, the player's gems (which
// open the Gem Vault), the player's menu (AccountMenu), and the chat
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
        <Link href="/withdraw" className={styles.withdraw}>
          Withdraw
        </Link>
        <div className={styles.wallet}>
          <span className={styles.balance}>
            <span className="sr-only">Balance:</span>
            <CoinIcon className={styles.coin} />
            <WalletBalance />
          </span>
          <Link href="/deposit" className={styles.deposit}>
            Deposit
          </Link>
        </div>
        <Link href="/gems" className={styles.gems} title="Your gems: every 10.00 wagered earns one" data-gems-link>
          <span className="sr-only">Gems:</span>
          <GemIcon className={styles.gem} />
          <GemCount />
        </Link>
        <AccountMenu />
        <button type="button" className={`${styles.iconButton} ${styles.chat}`} data-shell-toggle="chat" aria-label="Chat">
          <ChatIcon />
        </button>
      </div>
    </header>
  );
}
