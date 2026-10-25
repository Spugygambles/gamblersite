"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { GAMES } from "@/lib/home";
import {
  BombIcon,
  BoxIcon,
  CardsIcon,
  CupIcon,
  FlipIcon,
  GhostIcon,
  GiftLineIcon,
  GridIcon,
  HeadsetIcon,
  HomeIcon,
  RocketIcon,
  ShieldIcon,
  SwordsIcon,
  TargetIcon,
  UpgradeIcon,
} from "./icons";
import styles from "./Sidebar.module.css";

type Item = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Games",
    items: [
      { href: "/", label: "Home", icon: HomeIcon },
      { href: "/cases", label: "Cases", icon: BoxIcon },
      { href: "/case-battles", label: "Case Battles", icon: SwordsIcon },
      { href: "/upgrader", label: "Upgrader", icon: UpgradeIcon },
      { href: "/mines", label: "Mines", icon: BombIcon },
      { href: "/keno", label: "Keno", icon: GridIcon },
      { href: "/crash", label: "Crash", icon: RocketIcon },
      { href: "/limbo", label: "Limbo", icon: TargetIcon },
      { href: "/coinflip", label: "Coinflip", icon: FlipIcon },
      { href: "/blackjack", label: "Blackjack", icon: CardsIcon },
    ],
  },
  {
    title: "Rewards",
    items: [
      { href: "/rewards", label: "Rewards", icon: GiftLineIcon },
      { href: "/race", label: "$30K Race", icon: CupIcon },
      { href: "/pumpkin-hunt", label: "Pumpkin Hunt", icon: GhostIcon },
    ],
  },
  {
    title: "Help",
    items: [
      { href: "/fairness", label: "Fairness", icon: ShieldIcon },
      { href: "/support", label: "Support", icon: HeadsetIcon },
    ],
  },
];

// A game's "Hot" or "New" tag, from the lobby's list.
const tagOf = (href: string) => GAMES.find((g) => `/${g.slug}` === href)?.tag;

/**
 * The menu down the left: every game, then rewards and help. It fits
 * whatever width AppShell gives it, and when that's only a rail it shows
 * just the icons.
 */
export default function Sidebar() {
  const path = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Main">
      {GROUPS.map((group) => (
        <div key={group.title} className={styles.group}>
          <p className={styles.groupTitle}>{group.title}</p>
          <ul className={styles.list}>
            {group.items.map(({ href, label, icon: Icon }) => {
              const tag = tagOf(href);
              return (
                <li key={href}>
                  <Link href={href} className={styles.link} aria-current={path === href ? "page" : undefined} title={label}>
                    <Icon className={styles.icon} />
                    <span className={styles.label}>{label}</span>
                    {tag && <span className={`${styles.tag} ${tag === "Hot" ? styles.hot : ""}`}>{tag}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
