"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resetSample, useAccount } from "@/lib/account";
import { homeHref } from "@/lib/assets";
import { PLAYER } from "@/lib/home";
import { ChevronIcon, ClockIcon, GemIcon, LogoutIcon, SwapIcon, UserIcon, UsersIcon } from "./icons";
import styles from "./SiteHeader.module.css";

/**
 * The player in the header: the level chip, the avatar and a caret, which
 * open a menu to the account pages, the Gem Vault and logging out. The
 * menu is in the page from the start (hidden), so the preview can work it
 * without React; a click outside or Escape closes it.
 */
export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const { name } = useAccount();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const logout = () => {
    resetSample();
    window.location.assign(homeHref());
  };

  return (
    <div ref={ref} className={styles.account} data-account-menu>
      <button type="button" className={styles.accountButton} aria-haspopup="menu" aria-expanded={open} aria-label={`Your account, level ${PLAYER.level}`} onClick={() => setOpen(!open)} data-account-toggle>
        <span className={styles.levelChip} aria-hidden>
          {PLAYER.level}
        </span>
        <span className={styles.avatar} aria-hidden>
          {name[0] ?? "?"}
        </span>
        <ChevronIcon className={styles.caret} />
      </button>
      <div className={styles.menu} role="menu" hidden={!open} data-account-dropdown>
        <Link href="/account" role="menuitem" className={styles.menuItem} onClick={close}>
          <UserIcon />
          Profile
        </Link>
        <Link href="/account#history" role="menuitem" className={styles.menuItem} onClick={close}>
          <ClockIcon />
          Game history
        </Link>
        <Link href="/account#transactions" role="menuitem" className={styles.menuItem} onClick={close}>
          <SwapIcon />
          Transactions
        </Link>
        <Link href="/account#affiliates" role="menuitem" className={styles.menuItem} onClick={close}>
          <UsersIcon />
          Affiliates
        </Link>
        <Link href="/gems" role="menuitem" className={styles.menuItem} onClick={close}>
          <GemIcon />
          Gem Vault
        </Link>
        <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.logout}`} onClick={logout} data-logout>
          <LogoutIcon />
          Log out
        </button>
      </div>
    </div>
  );
}
