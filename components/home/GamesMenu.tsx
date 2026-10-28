"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { count, GAMES } from "@/lib/home";
import { ChevronIcon, GAME_ICONS, GamepadIcon } from "./icons";
import styles from "./SiteHeader.module.css";

// The menu's two columns, by slug: the case games, then the originals.
const COLUMNS = [
  { name: "Cases", slugs: ["cases", "case-battles", "upgrader"] },
  { name: "Originals", slugs: ["mines", "keno", "crash", "limbo", "coinflip", "blackjack"] },
];

// What a game is called here, where it differs from its title.
const NAMES: Record<string, string> = { "case-battles": "Case Battles" };

/**
 * GAMES in the header: a button that drops down every game, with how many
 * are playing each. It closes on a click outside it, Escape, or picking a
 * game.
 */
export default function GamesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      ref.current?.querySelector("button")?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={styles.games}>
      <button
        type="button"
        className={styles.navItem}
        aria-expanded={open}
        aria-controls="games-menu"
        onClick={() => setOpen(!open)}
        data-games-toggle
      >
        <GamepadIcon />
        Games
        <ChevronIcon direction="down" className={styles.caret} />
      </button>
      <div id="games-menu" className={styles.menu} hidden={!open}>
        {COLUMNS.map((column) => (
          <div key={column.name}>
            <p className={styles.menuHead}>{column.name}</p>
            <ul className={styles.menuList}>
              {column.slugs.map((slug) => {
                const game = GAMES.find((g) => g.slug === slug)!;
                const Icon = GAME_ICONS[slug];
                return (
                  <li key={slug}>
                    <Link href={`/${slug}`} className={styles.menuItem} onClick={() => setOpen(false)}>
                      <Icon />
                      {NAMES[slug] ?? game.title}
                      <span className={`${styles.playing} tabular`}>
                        {count.format(game.playing)}
                        <span className="sr-only"> playing</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
