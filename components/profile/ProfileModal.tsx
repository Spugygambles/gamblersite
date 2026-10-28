"use client";

import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type SVGProps } from "react";
import { CloseIcon, LogoutIcon, ShieldIcon, SlipIcon, SwapIcon, UserIcon, UserXIcon } from "@/components/home/icons";
import BetHistory from "./BetHistory";
import Overview from "./Overview";
import Security from "./Security";
import SelfExclusion from "./SelfExclusion";
import Transactions from "./Transactions";
import styles from "./ProfileModal.module.css";

type Section = { id: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const SECTIONS: Section[] = [
  { id: "profile", label: "Profile", Icon: UserIcon },
  { id: "bets", label: "Bet history", Icon: SlipIcon },
  { id: "transactions", label: "Transactions", Icon: SwapIcon },
  { id: "security", label: "Security", Icon: ShieldIcon },
  { id: "exclusion", label: "Self exclusion", Icon: UserXIcon },
];

/**
 * The player's account, in a window over the page: a menu of its sections
 * down the left (along the top on phones) and the open one beside it. Any
 * button marked data-profile-open opens it, on the profile; the close
 * button, Escape or a click outside closes it, and focus goes back to
 * whatever opened it.
 */
export default function ProfileModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState("profile");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest<HTMLElement>("[data-profile-open]");
      if (!button || !dialog.current || dialog.current.open) return;
      opener.current = button;
      setOpen("profile");
      dialog.current.showModal();
      // Start on the menu's first item, not on whichever box scrolls.
      dialog.current.querySelector<HTMLElement>('[data-profile-tab="profile"]')?.focus();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = () => dialog.current?.close();

  // Up and down (or left and right, on phones) move through the menu.
  const onMenuKey = (e: KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = SECTIONS[(SECTIONS.findIndex((s) => s.id === open) + step + SECTIONS.length) % SECTIONS.length].id;
    setOpen(next);
    dialog.current?.querySelector<HTMLElement>(`[data-profile-tab="${next}"]`)?.focus();
  };

  return (
    <dialog
      ref={dialog}
      id="profile-dialog"
      className={styles.dialog}
      aria-label="Your account"
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === dialog.current && close()}
      onClose={() => opener.current?.focus()}
      data-profile-dialog
    >
      <nav className={styles.side} aria-label="Account">
        <div className={styles.menu} role="tablist" aria-orientation="vertical" onKeyDown={onMenuKey}>
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`profile-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={open === id}
              aria-controls={`profile-panel-${id}`}
              tabIndex={open === id ? 0 : -1}
              className={styles.tab}
              onClick={() => setOpen(id)}
              data-profile-tab={id}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.logout}>
          <LogoutIcon />
          Log out
        </button>
      </nav>

      <div className={styles.content}>
        <button type="button" className={styles.close} aria-label="Close" onClick={close} data-profile-close>
          <CloseIcon />
        </button>
        {SECTIONS.map(({ id }) => (
          <section
            key={id}
            id={`profile-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${id}`}
            hidden={open !== id}
            data-profile-panel={id}
          >
            {id === "profile" && <Overview onAllBets={() => setOpen("bets")} />}
            {id === "bets" && <BetHistory />}
            {id === "transactions" && <Transactions />}
            {id === "security" && <Security />}
            {id === "exclusion" && <SelfExclusion />}
          </section>
        ))}
      </div>
    </dialog>
  );
}
