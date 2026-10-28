"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatBubbleIcon, GamepadIcon, GiftIcon, HomeIcon } from "./icons";
import styles from "./MobileBar.module.css";

/**
 * The bar along the bottom on phones, like the big sites' apps: home, the
 * games menu, rewards and chat. AppShell works the two buttons and keeps
 * their aria-expanded up to date.
 */
export default function MobileBar() {
  const path = usePathname();

  return (
    <nav className={styles.bar} aria-label="Quick links">
      <Link href="/" className={styles.item} aria-current={path === "/" ? "page" : undefined}>
        <HomeIcon />
        Home
      </Link>
      <button type="button" className={styles.item} data-shell-toggle="sidebar">
        <GamepadIcon />
        Games
      </button>
      <Link href="/rewards" className={styles.item} aria-current={path === "/rewards" ? "page" : undefined}>
        <GiftIcon />
        Rewards
      </Link>
      <button type="button" className={styles.item} data-shell-toggle="chat">
        <ChatBubbleIcon />
        Chat
      </button>
    </nav>
  );
}
