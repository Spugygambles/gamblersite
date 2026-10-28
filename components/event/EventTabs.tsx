"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./EventTabs.module.css";

const TABS = [
  { id: "calendar", title: ["Harvest", "Calendar"], note: "A gift every day", art: ["/event/tab-calendar.webp", 395, 330] },
  { id: "shop", title: ["Leaf", "Shop"], note: "Thanksgiving cases", art: ["/event/tab-shop.webp", 577, 330] },
  { id: "board", title: ["Hunters'", "Board"], note: "Top 10 win coins", art: ["/event/tab-board.webp", 335, 330] },
] as const;

export type EventTab = (typeof TABS)[number]["id"];

/**
 * The three ways into the hunt, as picture cards, each opening its panel
 * underneath. The shop's open to start. Arrow keys move between the cards.
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
              <span className={styles.title}>
                {t.title[0]}
                <br />
                {t.title[1]}
              </span>
              <span className={styles.note}>{t.note}</span>
            </span>
            <Image className={styles.art} src={t.art[0]} alt="" width={t.art[1]} height={t.art[2]} unoptimized />
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
