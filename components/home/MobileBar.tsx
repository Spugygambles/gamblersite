"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatBubbleIcon, GamepadIcon, GiftIcon, HomeIcon } from "./icons";
import styles from "./MobileBar.module.css";

/**
 * The bar along the bottom on phones, like the big sites' apps: home, the
 * games, rewards and chat. AppShell works the chat button and keeps its
 * aria-expanded up to date.
 */
export default function MobileBar() {
  const path = usePathname();

  return (
    <nav className={styles.bar} aria-label="Quick links">
      <Link href="/" className={styles.item} aria-current={path === "/" ? "page" : undefined}>
        <HomeIcon />
        Home
      </Link>
      <Link href="/#games" className={styles.item}>
        <GamepadIcon />
        Games
      </Link>
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
