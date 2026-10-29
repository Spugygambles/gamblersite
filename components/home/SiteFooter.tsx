import Link from "next/link";
import { DiscordIcon, XIcon, YouTubeIcon } from "./icons";
import Wordmark from "./Wordmark";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  {
    title: "Games",
    links: [
      ["Cases", "/cases"],
      ["Case Battles", "/case-battles"],
      ["Upgrader", "/upgrader"],
      ["Mines", "/mines"],
      ["Crash", "/crash"],
    ],
  },
  {
    title: "Rewards",
    links: [
      ["Rewards", "/rewards"],
      ["$30K Race", "/race"],
      ["Gem Vault", "/gems"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Support", "/support"],
      ["FAQ", "/faq"],
      ["Fairness", "/fairness"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms of service", "/terms"],
      ["Privacy policy", "/privacy"],
      ["Responsible gaming", "/responsible-gaming"],
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

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Wordmark />
          <p className={styles.blurb}>CS2 case opening, case battles and originals, made to be played for fun.</p>
          <ul className={styles.socials} aria-label="Community">
            {SOCIALS.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <a href={href} className={styles.social} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.age}>
            <span className={styles.ageBadge}>18+</span>
            Play responsibly. Only play with what you can afford to lose.
          </p>
          <p className={styles.legal}>
            © {new Date().getFullYear()} CsgoNeo. Not affiliated with or endorsed by Valve Corporation.
          </p>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className={styles.colTitle}>{col.title}</p>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
