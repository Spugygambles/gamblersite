import Link from "next/link";
import { PLAYER } from "@/lib/home";
import GamesMenu from "./GamesMenu";
import GemCount from "./GemCount";
import { ChatIcon, CoinIcon, GemIcon, GiftIcon } from "./icons";
import WalletBalance from "./WalletBalance";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

// The bar across the top. On the left: the name, the games menu and
// rewards. On the right: withdraw, the wallet, the player's gems (which
// open the Gem Vault), the player, which opens their account
// (ProfileModal), and the chat button, which AppShell works and keeps the
// aria-expanded of up to date.
export default function SiteHeader() {
  // The ring round the avatar shows progress through the current level.
  const ring = 2 * Math.PI * 17;

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
        <button
          type="button"
          className={styles.profile}
          aria-label={`Your account, level ${PLAYER.level}`}
          aria-haspopup="dialog"
          aria-controls="profile-dialog"
          data-profile-open
        >
          <span className={styles.avatar}>
            <svg className={styles.ring} viewBox="0 0 40 40" aria-hidden>
              <circle cx="20" cy="20" r="17" className={styles.ringTrack} />
              <circle
                cx="20"
                cy="20"
                r="17"
                className={styles.ringFill}
                strokeDasharray={`${(ring * PLAYER.levelProgress) / 100} ${ring}`}
              />
            </svg>
            {PLAYER.name[0]}
          </span>
          <span className={styles.level}>{PLAYER.level}</span>
        </button>
        <button type="button" className={`${styles.iconButton} ${styles.chat}`} data-shell-toggle="chat" aria-label="Chat">
          <ChatIcon />
        </button>
      </div>
    </header>
  );
}
