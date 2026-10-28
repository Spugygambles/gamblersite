import type { Metadata } from "next";
import { SITE, TERMS } from "@/lib/terms";
import { PageContent } from "@/components/home/Section";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Terms of service — ${SITE.name}`,
  description: `The terms you agree to by playing on ${SITE.name}: who can play, how coins and skins work, playing fair, and how disputes are handled.`,
};

// The terms of service: a list of its sections to jump to, then each
// section under its heading.
export default function Terms() {
  return (
    <PageContent>
      <article className={styles.terms}>
        <header className={styles.head}>
          <h1 className={styles.title}>Terms of service</h1>
          <p className={styles.updated}>Last updated {SITE.updated}</p>
          <p className={styles.lead}>
            Please read these before you play. They&apos;re the rules of {SITE.name}, and by using the Site you&apos;re agreeing to them.
          </p>
        </header>

        <nav className={styles.contents} aria-label="Sections">
          <ol>
            {TERMS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.body}>
          {TERMS.map((s, i) => (
            <section key={s.id} id={s.id} className={styles.section}>
              <h2 className={styles.heading}>
                <span className={styles.number}>{i + 1}.</span> {s.title}
              </h2>
              {s.blocks.map((block, j) =>
                typeof block === "string" ? (
                  <p key={j}>{block}</p>
                ) : (
                  <ul key={j}>
                    {block.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>
      </article>
    </PageContent>
  );
}
