"use client";

import Image from "next/image";
import { useState } from "react";
import { count } from "@/lib/home";
import { CALENDAR, TODAY } from "@/lib/event";
import { CheckIcon, GiftIcon, LockIcon, MapleIcon } from "@/components/home/icons";
import PanelIntro from "./PanelIntro";
import styles from "./Calendar.module.css";

// Bigger gifts come as a bigger pile of leaves: one, two or three.
const pile = (leaves: number) => (leaves >= 35 ? 3 : leaves >= 20 ? 2 : 1);

/**
 * The harvest calendar: a gift for each day of the hunt, two weeks of
 * them. Days gone by are claimed, today's waits for its Claim button, and
 * the rest are locked. Claiming only marks the day here until the
 * calendar is wired to the server.
 */
export default function Calendar() {
  const [claimedToday, setClaimedToday] = useState(false);
  const claimed = CALENDAR.filter((d) => d.day < TODAY || (d.day === TODAY && claimedToday));
  const leaves = claimed.reduce((sum, d) => sum + (d.leaves ?? 0), 0);

  return (
    <div className={styles.calendar}>
      <PanelIntro
        info={[
          {
            icon: <GiftIcon className={styles.giftIcon} />,
            title: "How the calendar works",
            text: (
              <>
                A new gift opens <b>every day</b> of the hunt. Claim it before the next one opens: a day you miss stays locked.
              </>
            ),
          },
          {
            icon: <Image src="/event/cases/maple-grove.webp" alt="" width={480} height={325} unoptimized />,
            title: "Cases on days 7 and 14",
            text: (
              <>
                Day 7 is a <b>Maple Grove</b> case, and the last day is the <b>Golden Turkey</b> case.
              </>
            ),
          },
        ]}
        stats={[
          { label: "Today", value: `Day ${TODAY}`, note: `of ${CALENDAR.length}` },
          {
            label: "Claimed",
            value: <span data-claimed-count>{claimed.length}</span>,
            note: `${count.format(leaves)} leaves so far`,
          },
        ]}
      />

      <ol className={styles.days}>
        {CALENDAR.map((d) => {
          const state = d.day < TODAY || (d.day === TODAY && claimedToday) ? "claimed" : d.day === TODAY ? "today" : "locked";
          return (
            <li key={d.day} className={`${styles.day} ${styles[state]}`} data-day-state={state}>
              <span className={styles.dayNum}>Day {d.day}</span>
              <span className={styles.pic}>
                {d.caseId ? (
                  <Image className={styles.case} src={`/event/cases/${d.caseId}.webp`} alt="" width={480} height={325} unoptimized />
                ) : (
                  <span className={styles.leaves} data-pile={pile(d.leaves ?? 0)}>
                    {Array.from({ length: pile(d.leaves ?? 0) }, (_, i) => (
                      <MapleIcon key={i} className={styles.leaf} />
                    ))}
                  </span>
                )}
              </span>
              <span className={styles.gift}>{d.gift}</span>
              {state === "today" ? (
                <button type="button" className={styles.claim} onClick={() => setClaimedToday(true)} data-claim>
                  Claim
                </button>
              ) : (
                <span className={styles.status} data-status={state}>
                  {state === "claimed" ? <CheckIcon /> : <LockIcon />}
                  {state === "claimed" ? "Claimed" : d.day === TODAY + 1 ? "Tomorrow" : "Locked"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
