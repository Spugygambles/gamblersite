"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { GAMES } from "@/lib/home";
import {
  BombIcon,
  CardsIcon,
  CaseIcon,
  CoinflipIcon,
  DiscordIcon,
  GiftIcon,
  HeadsetIcon,
  HomeIcon,
  KenoIcon,
  LeafIcon,
  RocketIcon,
  ShieldIcon,
  SwordsIcon,
  TargetIcon,
  TrophyIcon,
  UpgradeIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";
import styles from "./Sidebar.module.css";

type Item = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** A seasonal event, picked out in the accent colour. */
  event?: boolean;
};

// Each group sits on a panel of its own: the main games, the originals,
// rewards, and help.
const GROUPS: { name: string; items: Item[] }[] = [
  {
    name: "Games",
    items: [
      { href: "/", label: "Home", icon: HomeIcon },
      { href: "/cases", label: "Cases", icon: CaseIcon },
      { href: "/case-battles", label: "Case Battles", icon: SwordsIcon },
      { href: "/upgrader", label: "Upgrader", icon: UpgradeIcon },
    ],
  },
  {
    name: "Originals",
    items: [
      { href: "/mines", label: "Mines", icon: BombIcon },
      { href: "/keno", label: "Keno", icon: KenoIcon },
      { href: "/crash", label: "Crash", icon: RocketIcon },
      { href: "/limbo", label: "Limbo", icon: TargetIcon },
      { href: "/coinflip", label: "Coinflip", icon: CoinflipIcon },
      { href: "/blackjack", label: "Blackjack", icon: CardsIcon },
    ],
  },
  {
    name: "Rewards",
    items: [
      { href: "/rewards", label: "Rewards", icon: GiftIcon },
      { href: "/race", label: "$30K Race", icon: TrophyIcon },
      { href: "/turkey-hunt", label: "Turkey Hunt", icon: LeafIcon, event: true },
    ],
  },
  {
    name: "Help",
    items: [
      { href: "/fairness", label: "Fairness", icon: ShieldIcon },
      { href: "/support", label: "Live support", icon: HeadsetIcon },
    ],
  },
];

// Where the community is. These point at each site's front page until
// CsgoNeo's own pages are set up: swap in their addresses here.
const SOCIALS = [
  { name: "Discord", href: "https://discord.com", icon: DiscordIcon },
  { name: "X", href: "https://x.com", icon: XIcon },
  { name: "YouTube", href: "https://www.youtube.com", icon: YouTubeIcon },
];

// A game's "Hot" or "New" tag, from the lobby's list.
const tagOf = (href: string) => GAMES.find((g) => `/${g.slug}` === href)?.tag;

/**
 * The menu down the left: compact rows with solid icons, grouped on
 * panels, and the community's links at the foot. It fits whatever width
 * AppShell gives it, and when that's only a rail it shows just the icons.
 */
export default function Sidebar() {
  const path = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Main">
      {GROUPS.map((group) => (
        <ul key={group.name} className={styles.group} aria-label={group.name}>
          {group.items.map(({ href, label, icon: Icon, event }) => {
            const tag = tagOf(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${event ? styles.event : ""}`}
                  aria-current={path === href ? "page" : undefined}
                  title={label}
                >
                  <Icon className={styles.icon} />
                  <span className={styles.label}>{label}</span>
                  {tag && <span className={`${styles.tag} ${tag === "Hot" ? styles.hot : ""}`}>{tag}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
      <ul className={styles.socials} aria-label="Community">
        {SOCIALS.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            <a href={href} className={styles.social} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
