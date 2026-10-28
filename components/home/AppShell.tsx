"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import styles from "./AppShell.module.css";

type ChatState = "auto" | "open" | "closed";

// The same widths as AppShell.module.css.
const WIDE_CHAT = "(min-width: 1440px)";
const OVERLAY_CHAT = "(max-width: 1199px)";
const matches = (query: string) => window.matchMedia(query).matches;

// "auto" leaves it to the screen: chat shows from 1440px.
const chatIsShown = (s: ChatState) => s === "open" || (s === "auto" && matches(WIDE_CHAT));

/**
 * The frame big case sites use: the header across the top, chat down the
 * right, the page beside it, and on phones a bar of tabs along the bottom.
 * A button marked data-shell-toggle works a part: "chat", or "dismiss",
 * which closes chat when it's sliding over the page.
 */
export default function AppShell({
  header,
  chat,
  tabBar,
  children,
}: {
  header: ReactNode;
  chat: ReactNode;
  /** Shown on phones only; it styles that itself. */
  tabBar?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [talk, setTalk] = useState<ChatState>("auto");

  const dismiss = useCallback(() => {
    setTalk((c) => (c === "open" && matches(OVERLAY_CHAT) ? "closed" : c));
  }, []);

  const onClick = (e: MouseEvent) => {
    const which = (e.target as Element).closest("[data-shell-toggle]")?.getAttribute("data-shell-toggle");
    if (which === "chat") setTalk(chatIsShown(talk) ? "closed" : "open");
    else if (which === "dismiss") dismiss();
  };

  // Escape closes chat when it's sliding over the page, and if focus was in
  // it, hands focus back to the button that opened it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || talk !== "open" || !matches(OVERLAY_CHAT)) return;
      const fromChat = document.activeElement?.closest('[data-shell-part="chat"]');
      dismiss();
      if (fromChat) {
        // The button that's showing outside chat: the header's, or the phone
        // bar's.
        const toggles = ref.current?.querySelectorAll<HTMLElement>('[data-shell-toggle="chat"]') ?? [];
        [...toggles].find((t) => !t.closest('[data-shell-part="chat"]') && t.getClientRects().length > 0)?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss, talk]);

  // The chat buttons say whether chat is showing, which can change with the
  // screen's width as well as with a click.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const sync = () =>
      root.querySelectorAll('[data-shell-toggle="chat"]').forEach((b) => b.setAttribute("aria-expanded", String(chatIsShown(talk))));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [talk]);

  return (
    <div ref={ref} className={styles.shell} data-shell data-chat={talk} onClick={onClick}>
      <div className={styles.header}>{header}</div>
      <main className={styles.main}>{children}</main>
      <div className={styles.chat} data-shell-part="chat">
        {chat}
      </div>
      <button type="button" className={styles.backdrop} data-shell-toggle="dismiss" aria-label="Close" tabIndex={-1} />
      {tabBar}
    </div>
  );
}
