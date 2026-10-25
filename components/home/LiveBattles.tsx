"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState, type CSSProperties } from "react";
import { caseBySlug, roundCount, SAMPLE_BATTLES, seatCost, usd, type Battle } from "@/lib/home";
import { BoltIcon, EyeIcon, PlusIcon } from "./icons";
import styles from "./LiveBattles.module.css";

const VARIANT = {
  classic: { label: "Classic", color: "#9a64ff" },
  crazy: { label: "Crazy", color: "#ff4fd8" },
  terminal: { label: "Terminal", color: "#f2b13a" },
};

// Avatar colours, picked from the name so a player always gets the same one.
const AVATAR = [
  ["#7b4dff", "#3b1b9e"],
  ["#ff6a3d", "#a3260f"],
  ["#2bd4a4", "#0d6b55"],
  ["#3d9bff", "#173f9e"],
  ["#ff4f8b", "#8e1446"],
  ["#f2b13a", "#8a5a0a"],
];

function avatarColors(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}

function Seat({ name }: { name: string | null }) {
  if (!name) {
    return (
      <span className={`${styles.seat} ${styles.open}`} title="Open seat">
        <PlusIcon />
      </span>
    );
  }
  const [a, b] = avatarColors(name);
  return (
    <span className={styles.seat} style={{ background: `linear-gradient(150deg, ${a}, ${b})` }} title={name}>
      {name.slice(0, 2)}
    </span>
  );
}

// Seats in their teams: 2v2 is two teams of two, everything else is every
// player for themselves.
function Seats({ battle }: { battle: Battle }) {
  const teams = battle.mode === "2v2" ? [battle.players.slice(0, 2), battle.players.slice(2)] : battle.players.map((p) => [p]);
  return (
    <div className={styles.seats}>
      {teams.map((team, t) => (
        <Fragment key={t}>
          {t > 0 && <BoltIcon className={styles.vs} />}
          <span className={styles.team}>
            {team.map((p, i) => (
              <Seat key={i} name={p} />
            ))}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function BattleRow({ battle, step }: { battle: Battle; step: number }) {
  const variant = VARIANT[battle.variant];
  const rounds = roundCount(battle);
  const live = battle.round != null;
  // A battle under way moves on a round every step, round and round.
  const round = live ? ((battle.round! - 1 + step) % rounds) + 1 : 0;
  const cost = seatCost(battle);
  const seats = battle.players.length;
  const filled = battle.players.filter(Boolean).length;
  const strip = battle.cases.flatMap((c) => Array.from({ length: c.count }, () => c.slug));

  return (
    <li className={`${styles.row} ${live ? styles.live : ""}`} style={{ "--accent": variant.color } as CSSProperties} data-spotlight>
      <div className={styles.mode}>
        <span className={styles.modeName}>{battle.mode}</span>
        <span className={styles.variant}>{variant.label}</span>
      </div>

      <div className={styles.cases}>
        <ol className={styles.strip} aria-label={`${rounds} cases`}>
          {strip.map((slug, i) => {
            const c = caseBySlug(slug);
            const state = !live ? "" : i + 1 < round ? styles.opened : i + 1 === round ? styles.opening : "";
            return (
              <li key={i} className={`${styles.caseThumb} ${state}`} style={{ "--glow": c.glow } as CSSProperties}>
                <Image src={c.thumb} alt={`${c.name} case`} width={160} height={160} unoptimized />
              </li>
            );
          })}
        </ol>
        <span className={styles.rounds}>
          {rounds} {rounds === 1 ? "case" : "cases"}
        </span>
      </div>

      <Seats battle={battle} />

      <div className={styles.status}>
        {live ? (
          <span className={styles.liveTag}>
            <span className={styles.liveDot} aria-hidden />
            Round {round}/{rounds}
          </span>
        ) : (
          <span className={styles.waiting}>
            Waiting · {filled}/{seats}
          </span>
        )}
        <span className={`${styles.total} tabular`}>{usd.format(cost * seats)}</span>
        {live && (
          <span className={styles.progress} aria-hidden>
            <span style={{ width: `${(round / rounds) * 100}%` }} />
          </span>
        )}
      </div>

      <div className={styles.action}>
        {live ? (
          <Link href={`/case-battles/${battle.id}`} className={styles.watch}>
            <EyeIcon />
            Watch
          </Link>
        ) : (
          <Link href={`/case-battles/${battle.id}`} className={styles.join}>
            Join
            <span className="tabular">{usd.format(cost)}</span>
          </Link>
        )}
      </div>
    </li>
  );
}

// Battles in the lobby, the way battle sites list them: the mode, the cases
// to be opened, who's in, and what's in the pot.
export default function LiveBattles() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((n) => n + 1), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <ul className={styles.list}>
      {SAMPLE_BATTLES.map((b) => (
        <BattleRow key={b.id} battle={b} step={step} />
      ))}
    </ul>
  );
}
