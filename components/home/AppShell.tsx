"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import styles from "./AppShell.module.css";

type SidebarState = "auto" | "collapsed" | "expanded" | "open";
type ChatState = "auto" | "open" | "closed";

// The same widths as AppShell.module.css.
const WIDE_CHAT = "(min-width: 1440px)";
const OVERLAY_CHAT = "(max-width: 1199px)";
const RAIL_MENU = "(min-width: 768px) and (max-width: 1279px)";
const DRAWER_MENU = "(max-width: 767px)";
const matches = (query: string) => window.matchMedia(query).matches;

// "auto" leaves it to the screen: chat shows from 1440px, the menu is a rail
// of icons from 768px to 1279px, and below 768px it's a drawer.
const menuIsRail = (s: SidebarState) => s === "collapsed" || (s === "auto" && matches(RAIL_MENU));
const chatIsShown = (s: ChatState) => s === "open" || (s === "auto" && matches(WIDE_CHAT));

/**
 * The frame big case sites use: the header across the top, the menu down
 * the left, chat down the right, and the page between them. A button marked
 * data-shell-toggle works a part: "sidebar", "chat", or "dismiss", which
 * closes whatever is sliding over the page.
 */
export default function AppShell({
  header,
  sidebar,
  chat,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  chat: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<SidebarState>("auto");
  const [talk, setTalk] = useState<ChatState>("auto");

  const dismiss = useCallback(() => {
    setMenu((m) => (m === "open" ? "auto" : m));
    setTalk((c) => (c === "open" && matches(OVERLAY_CHAT) ? "closed" : c));
  }, []);

  const onClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const which = target.closest("[data-shell-toggle]")?.getAttribute("data-shell-toggle");
    if (which === "sidebar") {
      if (matches(DRAWER_MENU)) setMenu((m) => (m === "open" ? "auto" : "open"));
      else setMenu((m) => (menuIsRail(m) ? "expanded" : "collapsed"));
    } else if (which === "chat") {
      setTalk((c) => (chatIsShown(c) ? "closed" : "open"));
    } else if (which === "dismiss" || target.closest('[data-shell-part="sidebar"] a')) {
      // Picking somewhere to go closes the drawer too.
      dismiss();
    }
  };

  // Escape closes anything sliding over the page, and if focus was in it,
  // hands focus back to the button that opened it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const closing = [menu === "open" && matches(DRAWER_MENU) && "sidebar", talk === "open" && matches(OVERLAY_CHAT) && "chat"];
      const from = document.activeElement?.closest("[data-shell-part]")?.getAttribute("data-shell-part");
      dismiss();
      if (from && closing.includes(from)) ref.current?.querySelector<HTMLElement>(`[data-shell-toggle="${from}"]`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss, menu, talk]);

  // The drawer takes focus as it opens.
  useEffect(() => {
    if (menu === "open") ref.current?.querySelector<HTMLElement>('[data-shell-part="sidebar"] a')?.focus();
  }, [menu]);

  // The toggles say whether their part is showing, which can change with
  // the screen's width as well as with a click.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const sync = () => {
      const menuShown = matches(DRAWER_MENU) ? menu === "open" : !menuIsRail(menu);
      root.querySelectorAll('[data-shell-toggle="sidebar"]').forEach((b) => b.setAttribute("aria-expanded", String(menuShown)));
      root.querySelectorAll('[data-shell-toggle="chat"]').forEach((b) => b.setAttribute("aria-expanded", String(chatIsShown(talk))));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [menu, talk]);

  return (
    <div ref={ref} className={styles.shell} data-shell data-sidebar={menu} data-chat={talk} onClick={onClick}>
      <div className={styles.header}>{header}</div>
      <div className={styles.sidebar} data-shell-part="sidebar">
        {sidebar}
      </div>
      <main className={styles.main}>{children}</main>
      <div className={styles.chat} data-shell-part="chat">
        {chat}
      </div>
      <button type="button" className={styles.backdrop} data-shell-toggle="dismiss" aria-label="Close" tabIndex={-1} />
    </div>
  );
}
