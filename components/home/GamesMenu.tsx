"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GAMES } from "@/lib/home";
import { ChevronIcon, GAME_ICONS, GamepadIcon } from "./icons";
import styles from "./SiteHeader.module.css";

/**
 * GAMES in the header: a button that drops down a list of every game, each
 * with its icon on a tile. It closes on a click outside it, Escape, or
 * picking a game.
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
      <ul id="games-menu" className={styles.menu} hidden={!open}>
        {GAMES.map((game) => {
          const Icon = GAME_ICONS[game.slug];
          return (
            <li key={game.slug}>
              <Link href={`/${game.slug}`} className={styles.menuItem} onClick={() => setOpen(false)}>
                <span className={styles.menuIcon}>
                  <Icon />
                </span>
                {game.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
