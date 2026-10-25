import Link from "next/link";
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
      ["Pumpkin Hunt", "/pumpkin-hunt"],
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

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Wordmark />
          <p className={styles.blurb}>CS2 case opening, case battles and originals, made to be played for fun.</p>
          <p className={styles.age}>
            <span className={styles.ageBadge}>18+</span>
            Play responsibly. Only play with what you can afford to lose.
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

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} CsgoNeo. All rights reserved.</p>
        <p>Not affiliated with or endorsed by Valve Corporation.</p>
      </div>
    </footer>
  );
}
