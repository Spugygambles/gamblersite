"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CalendarSticker, CaseSticker, TrophySticker } from "./Stickers";
import styles from "./EventTabs.module.css";

const TABS = [
  { id: "calendar", title: "Harvest Calendar", note: "A gift every day", Art: CalendarSticker },
  { id: "shop", title: "Leaf Shop", note: "Thanksgiving cases", Art: CaseSticker },
  { id: "board", title: "Hunters' Board", note: "Top 10 win coins", Art: TrophySticker },
] as const;

export type EventTab = (typeof TABS)[number]["id"];

/**
 * The three ways into the hunt, as cards with a sticker each, each opening
 * its panel underneath. The shop's open to start. Arrow keys move between
 * the cards.
 */
export default function EventTabs({ panels }: { panels: Record<EventTab, ReactNode> }) {
  const [tab, setTab] = useState<EventTab>("shop");
  const list = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = TABS[(TABS.findIndex((t) => t.id === tab) + step + TABS.length) % TABS.length].id;
    setTab(next);
    list.current?.querySelector<HTMLElement>(`[data-event-tab="${next}"]`)?.focus();
  };

  return (
    <div className={styles.wrap}>
      <div ref={list} className={styles.tabs} role="tablist" aria-label="The hunt" onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={`${styles.tab} ${styles[t.id]}`}
            onClick={() => setTab(t.id)}
            data-event-tab={t.id}
          >
            <span className={styles.words}>
              <span className={styles.title}>{t.title}</span>
              <span className={styles.note}>{t.note}</span>
            </span>
            <t.Art className={styles.art} />
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={tab !== t.id}
          data-event-panel={t.id}
        >
          {panels[t.id]}
        </div>
      ))}
    </div>
  );
}
