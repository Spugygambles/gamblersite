import Link from "next/link";
import { PLAYER } from "@/lib/home";
import GamesMenu from "./GamesMenu";
import { ChatIcon, CoinIcon, GemIcon, GiftIcon, MenuIcon } from "./icons";
import { TurkeyArt } from "./PromoArt";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The bar across the top. On the left: the menu button, the name, the
// games menu, rewards, and the Thanksgiving event. On the right: withdraw,
// the wallet, the player and the chat button. AppShell works the menu and
// chat buttons and keeps their aria-expanded up to date.
export default function SiteHeader() {
  // The ring round the avatar shows progress through the current level.
  const ring = 2 * Math.PI * 17;

  return (
    <header className={styles.header}>
      <div className={styles.start}>
        <button type="button" className={styles.iconButton} data-shell-toggle="sidebar" aria-label="Menu">
          <MenuIcon />
        </button>
        <Wordmark />
        <nav className={styles.nav} aria-label="Main">
          <GamesMenu />
          <Link href="/rewards" className={styles.navItem}>
            <GiftIcon />
            Rewards
          </Link>
          <Link href="/turkey-hunt" className={styles.event}>
            <span className={styles.eventArt} aria-hidden>
              <TurkeyArt />
            </span>
            Turkey Hunt
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
            <span className="tabular">{money.format(PLAYER.balance)}</span>
          </span>
          <Link href="/deposit" className={styles.deposit}>
            Deposit
          </Link>
        </div>
        <Link href="/rewards" className={styles.gems} aria-label={`${PLAYER.gems} gems`}>
          <GemIcon className={styles.gem} />
          <span className="tabular">{PLAYER.gems}</span>
        </Link>
        <button type="button" className={styles.profile} aria-label={`Account, level ${PLAYER.level}`}>
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
