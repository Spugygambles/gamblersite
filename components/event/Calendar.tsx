"use client";

import Image from "next/image";
import { useState } from "react";
import { count, usd } from "@/lib/home";
import { CALENDAR, CASES, OPENED, TODAY, TODAY_SO_FAR, type CalendarDay } from "@/lib/event";
import { CheckIcon, GiftIcon, LockIcon, MapleIcon, StackIcon, DepositIcon } from "@/components/home/icons";
import PanelIntro from "./PanelIntro";
import styles from "./Calendar.module.css";

type State = "opened" | "today" | "missed" | "locked";

const stateOf = (d: CalendarDay): State => (d.day === TODAY ? "today" : d.day > TODAY ? "locked" : OPENED[d.day] ? "opened" : "missed");

// Picks what's in a box by its odds. Only the look of it: the real draw
// happens on the server.
const draw = (d: CalendarDay) => {
  let roll = Math.random() * 100;
  return d.odds.find((o) => (roll -= o.chance) < 0)?.reward ?? d.odds[0].reward;
};

// A reward that's a case shows the case; leaves and the Golden Turkey
// show their icons.
const caseFor = (reward: string) => CASES.find((c) => reward.startsWith(c.name))?.id ?? (reward === "Golden Turkey" ? "golden-turkey" : null);

function Reward({ reward }: { reward: string }) {
  const id = caseFor(reward);
  return (
    <span className={styles.reward}>
      {id ? (
        <Image className={styles.rewardCase} src={`/event/cases/${id}.webp`} alt="" width={480} height={325} unoptimized />
      ) : (
        <MapleIcon className={styles.rewardIcon} />
      )}
      <span className={styles.rewardText} data-reward>
        {reward}
      </span>
    </span>
  );
}

/** How far today's asks have got, as a bar each. */
function Asks({ day }: { day: CalendarDay }) {
  const asks = [
    { label: "Wager", Icon: StackIcon, need: day.wager, have: TODAY_SO_FAR.wagered },
    { label: "Deposit", Icon: DepositIcon, need: day.deposit, have: TODAY_SO_FAR.deposited },
  ].filter((a) => a.need > 0);
  return (
    <span className={styles.asks}>
      {asks.map(({ label, Icon, need, have }) => {
        const done = have >= need;
        return (
          <span key={label} className={`${styles.ask} ${done ? styles.askDone : ""}`}>
            <span className={styles.askRow}>
              <Icon />
              <span className={styles.askLabel}>{label}</span>
              <span className={`${styles.askNums} tabular`}>
                {usd.format(Math.min(have, need))} / {usd.format(need)}
              </span>
            </span>
            <span className={styles.bar} role="progressbar" aria-label={`${label} ${usd.format(need)}`} aria-valuenow={Math.min(100, Math.round((have / need) * 100))} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.min(100, (have / need) * 100)}%` }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * The harvest calendar: a sealed box for each day of the hunt, two weeks
 * of them, and what it takes to open each one: wager so much that day,
 * and on some days deposit too. Today's box shows how far along the asks
 * are, and opens once they're met; what's inside is a mystery until then.
 * Days gone by show what they held, or stay sealed if they were missed.
 * Opening only shows a reward here until the calendar is wired to the
 * server.
 */
export default function Calendar() {
  const [got, setGot] = useState<string | null>(null);
  const today = CALENDAR[TODAY - 1];
  const ready = TODAY_SO_FAR.wagered >= today.wager && TODAY_SO_FAR.deposited >= today.deposit;
  const opened = Object.keys(OPENED).length + (got ? 1 : 0);

  return (
    <div className={styles.calendar}>
      <PanelIntro
        info={[
          {
            icon: <GiftIcon className={styles.giftIcon} />,
            title: "A mystery box a day",
            text: (
              <>
                Every day of the hunt has a sealed box. Meet the day&apos;s ask, <b>wager or deposit enough that day</b>, and it opens.
                What&apos;s inside is a surprise.
              </>
            ),
          },
          {
            icon: <LockIcon className={styles.lockIcon} />,
            title: "Miss a day, lose the box",
            text: (
              <>
                The asks climb as the hunt goes on, and a day you don&apos;t finish stays sealed. The <b>last box</b> can hold a Golden
                Turkey.
              </>
            ),
          },
        ]}
        stats={[
          { label: "Today", value: `Day ${TODAY}`, note: `of ${CALENDAR.length}` },
          {
            label: "Boxes opened",
            value: <span data-opened-count>{opened}</span>,
            note: `${count.format(CALENDAR.length - TODAY)} still to come`,
          },
        ]}
      />

      <ol className={styles.days}>
        {CALENDAR.map((d) => {
          const state = stateOf(d);
          const isToday = state === "today";
          return (
            <li key={d.day} className={`${styles.day} ${styles[state]} ${isToday && got ? styles.opened : ""}`} data-day-state={isToday && got ? "opened" : state}>
              <span className={styles.dayNum}>
                Day {d.day}
                {isToday && <span className={styles.todayTag}>Today</span>}
              </span>

              <span className={styles.pic}>
                {state === "opened" || (isToday && got) ? (
                  <Reward reward={(isToday ? got : OPENED[d.day]) ?? ""} />
                ) : (
                  <span className={styles.box} aria-hidden>
                    <span className={styles.boxBody} />
                    <span className={styles.boxLid} />
                    <span className={styles.boxBow} />
                    <span className={styles.boxSeal}>?</span>
                  </span>
                )}
              </span>

              {isToday && !got ? (
                <>
                  <Asks day={d} />
                  {/* data-force-open lets the preview and tests open it with the
                      asks unmet; the server decides for real. */}
                  <button
                    type="button"
                    className={styles.open}
                    disabled={!ready}
                    onClick={() => setGot(draw(d))}
                    data-open-box
                    ref={(el) => {
                      if (el) (el as HTMLButtonElement & { forceOpen?: () => void }).forceOpen = () => setGot(draw(d));
                    }}
                  >
                    {ready ? "Open box" : "Not yet"}
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.need}>
                    <span className={`${styles.needItem} tabular`}>
                      <StackIcon />
                      {usd.format(d.wager)}
                    </span>
                    {d.deposit > 0 && (
                      <span className={`${styles.needItem} tabular`}>
                        <DepositIcon />
                        {usd.format(d.deposit)}
                      </span>
                    )}
                  </span>
                  <span className={styles.status} data-status={isToday && got ? "opened" : state}>
                    {state === "opened" || (isToday && got) ? (
                      <>
                        <CheckIcon />
                        Opened
                      </>
                    ) : state === "missed" ? (
                      "Missed"
                    ) : (
                      <>
                        <LockIcon />
                        {d.day === TODAY + 1 ? "Tomorrow" : "Locked"}
                      </>
                    )}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <p className={styles.fine}>
        Asks count what you wager and deposit between midnight and midnight, UTC. Boxes hold leaves, a Thanksgiving case, or on the last
        day a Golden Turkey.
      </p>
    </div>
  );
}
