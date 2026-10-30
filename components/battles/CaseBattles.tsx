"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Reel from "@/components/cases/Reel";
import { Choices, FairDialog, HowTo, Readout, kit } from "@/components/game/kit";
import { Modal } from "@/components/mines/Dialogs";
import { CloseIcon, CoinIcon, InfoIcon, ShieldIcon, SwordsIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import { avatarOf } from "@/components/home/avatar";
import {
  COIN_CASES,
  LOBBY,
  MAX_ROUNDS,
  MODES,
  battleDrops,
  costOf,
  describeBattle,
  fillSeats,
  KEEP,
  keepBattle,
  keptBattles,
  lobbyBattle,
  potOf,
  seatsOf,
  shareOf,
  teamOf,
  totalsOf,
  winnersOf,
  type LobbyBattle,
  type Mode,
} from "@/lib/battles";
import type { CaseDef, CaseItem } from "@/lib/cases";
import { wagered } from "@/lib/gems";
import { PLAYER } from "@/lib/home";
import { takeNonce } from "@/lib/seeds";
import { recordOutcome } from "@/lib/stats";
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import styles from "./Battles.module.css";

type Phase = "lobby" | "waiting" | "fighting" | "done";
type Battle = {
  id: number;
  mode: Mode;
  cases: CaseDef[];
  /** A name per seat; null while a seat waits for a player. */
  seats: (string | null)[];
  /** Your seat, or -1 when you're watching. */
  you: number;
  drops: CaseItem[][];
  nonce: number;
  cost: number;
  /** Opened from the list to look at, not played through. */
  viewed: boolean;
};
type Result = { winners: number[]; pot: number; share: number; youWon: boolean };

// two seats on one side
const TeamIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <path d="M10 15.5H7.5a3.5 3.5 0 0 1 0-7H10M14 8.5h2.5a3.5 3.5 0 0 1 0 7H14M8.5 12h7" />
  </svg>
);

// the winner's crown
const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden>
    <path d="M2 12.5h12v1.5H2zM2 11 1 4l3.6 2.6L8 2l3.4 4.6L15 4l-1 7z" fill="currentColor" />
  </svg>
);

const FILL_MS = 1500;
const PAUSE_MS = 700;
// how often the sample battles under way move on a round
const TICK_MS = 5000;
const YOU = PLAYER.name;

// the list keeps one finished sample battle; the battles people play are kept up to KEEP
const PREVIOUS_KEPT = 1;
let nextSample = 10000;

// A round passes in the lobby: live battles move on, finished ones join
// the previous battles (newest first), and a new battle starts for each
// that finished.
function tick(list: LobbyBattle[]): LobbyBattle[] {
  const finished: LobbyBattle[] = [];
  const rest: LobbyBattle[] = [];
  for (const b of list) {
    if (b.status !== "live") {
      rest.push(b);
    } else if (b.round + 1 >= b.cases.length) {
      finished.push({ ...b, status: "done", round: b.cases.length });
      rest.push({ ...lobbyBattle(nextSample++, "live"), round: 0 });
    } else {
      rest.push({ ...b, round: b.round + 1 });
    }
  }
  const out = [...finished, ...rest];
  let samples = 0;
  let played = 0;
  return out.filter((b) => b.status !== "done" || (b.you !== null ? played++ < KEEP : samples++ < PREVIOUS_KEPT));
}

// the lobby, with the battles you played before (kept in the browser) in front
const subscribeNothing = () => () => {};
const lobbyStart = () => LOBBY;
let lobbyFirst: LobbyBattle[] | null = null;
const lobbyWithKept = () => (lobbyFirst ??= [...keptBattles(), ...LOBBY]);

/**
 * Case battles. The lobby lists battles with a seat free to join, battles
 * under way to watch, and finished ones to look at, yours among them; the
 * Create battle button opens a window to make one (a mode and up to eight
 * cases). In the arena every seat opens the same case each round, all the
 * reels at once, and the seat (or team) whose drops are worth the most takes
 * the whole pot. Your battles' drops come from the shared provably-fair
 * seeds, one nonce a battle (lib/battles.ts).
 */
export default function CaseBattles() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const lobbyInitial = useSyncExternalStore(subscribeNothing, lobbyWithKept, lobbyStart);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<Mode>("1v1");
  const [picked, setPicked] = useState<CaseDef[]>([COIN_CASES[0], COIN_CASES[1]]);
  const [fast, setFast] = useState(false);
  const [lobbyEdits, setLobbyEdits] = useState<LobbyBattle[] | null>(null);
  const lobby = lobbyEdits ?? lobbyInitial;
  const [battle, setBattle] = useState<Battle | null>(null);
  const [round, setRound] = useState(0);
  const [landed, setLanded] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const live = useRef<{ phase: Phase; battle: Battle | null }>({ phase: "lobby", battle: null });
  const timers = useRef({ fill: 0, pause: 0 });
  const nextId = useRef(100);
  // the last battle you played, for the fairness check after it's gone
  const lastSetup = useRef<{ mode: Mode; cases: CaseDef[]; names: string[] } | null>(null);

  const inLobby = phase === "lobby";
  const cost = costOf(picked);
  const why = picked.length === 0 ? "Add a case to fight over" : balance < cost ? "Not enough balance" : "";
  const canCreate = inLobby && picked.length > 0 && balance >= cost;

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.fill);
      clearTimeout(t.pause);
    };
  }, []);

  // The sample battles under way move on a round now and then; one that
  // ends goes to the previous battles and a fresh one starts in its place.
  useEffect(() => {
    const id = window.setInterval(() => setLobbyEdits((l) => tick(l ?? lobbyWithKept())), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const setLive = (ph: Phase, b: Battle | null) => {
    live.current = { phase: ph, battle: b };
    setPhase(ph);
    setBattle(b);
  };

  // ---- Making, joining, watching ---------------------------------------------------------

  const start = (m: Mode, cases: CaseDef[], seats: (string | null)[], you: number) => {
    const stake = costOf(cases);
    addToBalance(-stake);
    wagered(stake);
    const s = takeNonce();
    const n = seatsOf(m);
    const drops = battleDrops(cases, n, s.serverSeed, s.clientSeed, s.nonce);
    const b: Battle = { id: ++nextId.current, mode: m, cases, seats, you, drops, nonce: s.nonce, cost: stake, viewed: false };
    setRound(0);
    setLanded(0);
    setSpinning(false);
    setResult(null);
    setNote("");
    setCreating(false);
    setLive("waiting", b);
    // the other seats fill with sample players, then the first round runs
    timers.current.fill = window.setTimeout(() => {
      const full = { ...b, seats: fillSeats(b.seats, s.nonce) };
      lastSetup.current = { mode: full.mode, cases: full.cases, names: full.seats.map((p, i) => (i === full.you ? "you" : (p ?? "?"))) };
      setLive("fighting", full);
      setSpinning(true);
    }, FILL_MS);
  };

  const create = () => {
    if (!canCreate || live.current.phase !== "lobby") return;
    const seats: (string | null)[] = Array.from({ length: seatsOf(mode) }, (_, i) => (i === 0 ? YOU : null));
    start(mode, picked, seats, 0);
  };

  const join = (lb: LobbyBattle) => {
    if (live.current.phase !== "lobby") return;
    const seat = lb.players.indexOf(null);
    const stake = costOf(lb.cases);
    if (seat < 0) return;
    if (balance < stake) {
      setNote(`That battle costs ${money.format(stake)} a seat`);
      return;
    }
    const seats = lb.players.map((p, i) => (i === seat ? YOU : p));
    // the battle leaves the lobby; another with a seat free takes its place
    const fresh = lobbyBattle(++nextId.current, "open");
    setLobbyEdits(lobby.map((x) => (x.id === lb.id ? fresh : x)));
    start(lb.mode, lb.cases, seats, seat);
  };

  // a battle under way or finished, opened to look at: no seat, no stake
  const look = (lb: LobbyBattle) => {
    if (live.current.phase !== "lobby" || lb.status === "open") return;
    const b: Battle = { id: lb.id, mode: lb.mode, cases: lb.cases, seats: lb.players, you: lb.you ?? -1, drops: lb.drops, nonce: 0, cost: 0, viewed: true };
    setResult(null);
    setNote("");
    setSpinning(false);
    if (lb.status === "done") {
      setRound(lb.cases.length - 1);
      setLanded(lb.cases.length);
      setLive("done", b);
      setResult(resultOf(b));
    } else {
      setRound(lb.round);
      setLanded(lb.round);
      setLive("fighting", b);
      setSpinning(true);
    }
  };

  // ---- The rounds ---------------------------------------------------------------------------

  // a round's reels have stopped (seat 0's reel says so): its drops land
  const roundDone = () => {
    const b = live.current.battle;
    if (live.current.phase !== "fighting" || !b) return;
    setSpinning(false);
    const next = round + 1;
    setLanded(next);
    if (next < b.cases.length) {
      timers.current.pause = window.setTimeout(() => {
        if (live.current.phase !== "fighting") return;
        setRound(next);
        setSpinning(true);
      }, PAUSE_MS);
    } else {
      finish(b);
    }
  };

  const resultOf = (b: Battle): Result => {
    const totals = totalsOf(b.drops, seatsOf(b.mode));
    const winners = winnersOf(totals, b.mode);
    const pot = potOf(b.drops);
    return { winners, pot, share: shareOf(pot, b.mode), youWon: b.you >= 0 && winners.includes(b.you) };
  };

  const finish = (b: Battle) => {
    const r = resultOf(b);
    const played = !b.viewed && b.you >= 0;
    if (played) {
      if (r.youWon) addToBalance(r.share);
      recordOutcome(r.youWon ? Math.round((r.share - b.cost) * 100) / 100 : -b.cost);
    }
    setResult(r);
    setLive("done", b);
    const who = r.winners.map((w) => (w === b.you ? "You" : b.seats[w])).join(" and ");
    setNote(played && r.youWon ? `${who} won the ${money.format(r.pot)} pot: ${money.format(r.share)} to your balance` : `${who} won the ${money.format(r.pot)} pot`);
    // the battle goes into the list as finished: yours is kept for next time
    const done: LobbyBattle = { id: b.id, mode: b.mode, cases: b.cases, players: b.seats, status: "done", round: b.cases.length, drops: b.drops, you: played ? b.you : null };
    if (played) keepBattle(done);
    setLobbyEdits((l) => {
      const list = l ?? lobbyWithKept();
      return list.some((x) => x.id === b.id) ? list.map((x) => (x.id === b.id ? done : x)) : [done, ...list];
    });
  };

  const backToLobby = () => {
    clearTimeout(timers.current.pause);
    clearTimeout(timers.current.fill);
    setLive("lobby", null);
    setResult(null);
    setSpinning(false);
    setNote("");
  };

  // ---- The picker ---------------------------------------------------------------------------

  const addCase = (c: CaseDef) => inLobby && picked.length < MAX_ROUNDS && setPicked([...picked, c]);
  const removeCase = (i: number) => inLobby && setPicked(picked.filter((_, k) => k !== i));

  // ---- The fairness check -----------------------------------------------------------------------

  const verify = (server: string, client: string, nonce: number) => {
    const setup = lastSetup.current ?? {
      mode,
      cases: picked.length ? picked : [COIN_CASES[0]],
      names: Array.from({ length: seatsOf(mode) }, (_, i) => (i === 0 ? "you" : `seat ${i + 1}`)),
    };
    return describeBattle(setup.cases, setup.mode, setup.names, server, client, nonce);
  };

  // ---- The list -----------------------------------------------------------------------------------

  const current = lobby.filter((b) => b.status !== "done");
  const previous = lobby.filter((b) => b.status === "done");

  const row = (lb: LobbyBattle) => {
    const stake = costOf(lb.cases);
    const n = seatsOf(lb.mode);
    const open = lb.status === "open";
    const done = lb.status === "done";
    const live = lb.status === "live";
    const pot = potOf(lb.drops.slice(0, lb.round));
    const winners = done ? winnersOf(totalsOf(lb.drops, n), lb.mode) : [];
    // the case strip keeps the round being played second from the left
    const shift = live ? Math.max(0, lb.round - 1) : 0;
    return (
      <li key={lb.id} className={styles.row} data-battle={lb.id} data-status={lb.status} data-open={open || undefined}>
        <div className={styles.who}>
          <span className={styles.modeLine}>
            <b>{lb.mode} Battle</b>
            {live && <span className={styles.liveTag}>Live</span>}
          </span>
          <span className={styles.seats}>
            {lb.players.map((p, seat) => {
              const you = lb.you === seat;
              const won = winners.includes(seat);
              const teamed = lb.mode === "2v2" && seat % 2 === 1;
              return (
                <Fragment key={seat}>
                  {seat > 0 && (teamed ? <TeamIcon className={styles.sep} /> : <SwordsIcon className={styles.sep} />)}
                  <span
                    className={`${styles.seatChip} ${p ? "" : styles.seatOpen} ${you ? styles.seatYou : ""} ${won ? styles.seatWon : ""}`}
                    style={p && !you ? { background: avatarOf(p) } : undefined}
                    title={p ? (you ? `${p} (you)` : p) : "Open seat"}
                    data-chip={p ?? ""}
                  >
                    {p ? p[0].toUpperCase() : "+"}
                    {won && <CrownIcon className={styles.crown} />}
                  </span>
                </Fragment>
              );
            })}
          </span>
        </div>

        <div className={styles.strip}>
          <div className={styles.reelWrap}>
            <span className={styles.reel} style={{ "--shift": shift } as CSSProperties} aria-label={lb.cases.map((c) => c.name).join(", ")}>
              {lb.cases.map((c, i) => (
                <span key={i} className={styles.thumb} title={c.name} data-played={i < lb.round || undefined} data-now={(!done && i === lb.round) || undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" width={72} height={54} />
                </span>
              ))}
            </span>
          </div>
          <span className={`${styles.roundsPill} tabular`} data-progress={`${lb.round}/${lb.cases.length}`}>
            <b>{lb.round}</b>/{lb.cases.length} Rounds
          </span>
        </div>

        <div className={styles.cost}>
          <span className={`${styles.costValue} tabular`} data-row-cost={stake.toFixed(2)}>
            <CoinIcon />
            {money.format(stake)}
          </span>
          <span className={styles.costLabel}>Battle cost</span>
        </div>

        <div className={styles.go}>
          <span className={`${styles.unboxed} tabular`}>
            Unboxed <b>{money.format(pot)}</b>
          </span>
          {open ? (
            <button type="button" className={kit.primary} disabled={!inLobby || balance < stake} onClick={() => join(lb)} data-join>
              Join battle
            </button>
          ) : (
            <button type="button" className={done ? `${kit.secondary} ${styles.ghost}` : kit.primary} disabled={!inLobby} onClick={() => look(lb)} data-view>
              View battle
            </button>
          )}
        </div>
      </li>
    );
  };

  const list = (
    <div className={styles.page} data-lobby-page>
      <div className={styles.pageHead}>
        <div className={styles.titleBlock}>
          <span className={styles.titleBadge} aria-hidden>
            <SwordsIcon />
          </span>
          <div>
            <h1 className={styles.pageTitle}>Case Battles</h1>
            <p className={styles.subtitle}>Everyone opens the same cases, round by round. The biggest haul takes the lot.</p>
          </div>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.textButton} onClick={() => setDialog("how")} data-how-to>
            <InfoIcon />
            How it works
          </button>
          <button type="button" className={styles.textButton} onClick={() => setDialog("fair")} data-fairness>
            <ShieldIcon />
            Provably fair
          </button>
          <button type="button" className={kit.primary} onClick={() => setCreating(true)} data-create-open>
            Create battle
          </button>
        </div>
      </div>

      {/* one list: the battles under way or with a seat free first and in full colour, the finished ones after them, greyed */}
      <ul className={styles.list} aria-label="Battles" data-lobby>
        {[...current, ...previous].map(row)}
        <li className={styles.makeRow}>
          <span className={styles.makeText}>
            <b>Make your own</b>
            <span>Pick the cases and the mode, and it waits here for players. Battles you play stay in the list afterwards, the last {KEEP} of them.</span>
          </span>
          <button type="button" className={kit.secondary} disabled={!inLobby} onClick={() => setCreating(true)} data-create-open-bottom>
            Create battle
          </button>
        </li>
      </ul>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </div>
  );

  // ---- The arena ------------------------------------------------------------------------------------

  const seats = battle ? seatsOf(battle.mode) : 0;
  const totals = battle ? totalsOf(battle.drops.slice(0, landed), seats) : [];
  const rounds = battle?.cases.length ?? 0;

  const arena = battle && (
    <div className={styles.arenaPage}>
      <div className={styles.arenaBar}>
        <button type="button" className={kit.secondary} onClick={backToLobby} data-back>
          Back to battles
        </button>
        <span className={styles.roundNow} data-round={phase === "waiting" ? 0 : Math.min(round + 1, rounds)}>
          {phase === "waiting" ? "Finding players" : phase === "done" ? "Battle over" : `Round ${round + 1} of ${rounds}`}
        </span>
        <span className={styles.roundCase}>{phase === "waiting" ? `${rounds} round${rounds === 1 ? "" : "s"}` : battle.cases[Math.min(round, rounds - 1)].name}</span>
        <span className={`${styles.pot} tabular`}>
          Pot <b data-pot>{money.format(potOf(battle.drops.slice(0, landed)))}</b>
        </span>
        <button type="button" className={kit.iconButton} aria-pressed={fast} aria-label="Fast reels" title="Fast reels" onClick={() => setFast(!fast)} data-fast>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
          </svg>
        </button>
      </div>

      <div className={styles.columns} style={{ "--seats": seats } as CSSProperties}>
        {battle.seats.map((name, seat) => {
          const you = seat === battle.you;
          const won = result?.winners.includes(seat) ?? false;
          const team = battle.mode === "2v2" ? teamOf(battle.mode, seat) : null;
          return (
            <section
              key={seat}
              className={styles.column}
              aria-label={you ? "Your seat" : (name ?? "Open seat")}
              data-seat={seat}
              data-you={you || undefined}
              data-winner={won || undefined}
              data-team={team ?? undefined}
            >
              <header className={styles.colHead}>
                <span className={styles.avatar} aria-hidden>
                  {(name ?? "?")[0]}
                </span>
                <span className={styles.colName} data-name={name ?? ""}>
                  {name ?? "Waiting…"}
                  {you && <small>you</small>}
                  {team !== null && <i>team {team === 0 ? "A" : "B"}</i>}
                </span>
                <span className={`${styles.colTotal} tabular`} data-total={totals[seat]?.toFixed(2) ?? "0.00"}>
                  {money.format(totals[seat] ?? 0)}
                </span>
              </header>
              {!(battle.viewed && phase === "done") && (
                <div className={styles.colReel}>
                  {phase === "waiting" ? (
                    <div className={styles.reelWait}>Waiting for the first round</div>
                  ) : (
                    <Reel
                      items={battle.cases[Math.min(round, rounds - 1)].items}
                      winner={battle.drops[Math.min(round, rounds - 1)][seat]}
                      spinning={spinning}
                      fast={fast}
                      seed={battle.id * 100 + round * 10 + seat + 1}
                      onDone={seat === 0 ? roundDone : undefined}
                      label={`${name ?? "Seat"}'s reel`}
                    />
                  )}
                </div>
              )}
              <ol className={styles.drops} aria-label="Drops">
                {battle.drops.slice(0, landed).map((r, i) => (
                  <li key={i} className={styles.drop} style={{ "--rarity": r[seat].skin.color } as CSSProperties} data-drop={r[seat].skin.slug}>
                    <span className={styles.dropArt}>
                      <SkinArt skin={r[seat].skin} />
                    </span>
                    <span className={styles.dropName}>
                      {r[seat].skin.finish}
                      <small>{r[seat].skin.weapon}</small>
                    </span>
                    <span className={`${styles.dropPrice} tabular`}>{money.format(r[seat].skin.price)}</span>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      {result && (
        <div className={`${styles.banner} ${result.youWon ? styles.bannerWon : styles.bannerLost}`} role="status" data-result={result.youWon ? "won" : "lost"}>
          <span className={styles.bannerWho}>
            {result.winners.map((w) => (w === battle.you ? "You" : battle.seats[w])).join(" & ")} {result.winners.length > 1 ? "take" : result.youWon ? "take" : "takes"} the pot
          </span>
          <span className={`${styles.bannerPot} tabular`}>
            <CoinIcon />
            {money.format(result.pot)}
            {battle.mode === "2v2" && <small>{money.format(result.share)} each</small>}
          </span>
        </div>
      )}
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </div>
  );

  return (
    <div className={styles.wrap} data-battles data-phase={phase}>
      {inLobby || !battle ? list : arena}

      {creating && (
        <Modal title="Create a battle" onClose={() => setCreating(false)} wide>
          <div className={styles.createForm} data-create-form>
            <Choices label="Mode" options={MODES.map((m) => ({ value: m.id, label: m.label }))} value={mode} onChange={setMode} attr="data-mode" />
            <div className={kit.field}>
              <span className={kit.fieldHead}>
                <span className={kit.fieldLabel}>Cases</span>
                <span className={`${kit.fieldMax} ${picked.length >= MAX_ROUNDS ? kit.fieldBad : ""}`}>up to {MAX_ROUNDS}</span>
              </span>
              <ul className={styles.picker} aria-label="Add a case">
                {COIN_CASES.map((c) => (
                  <li key={c.slug}>
                    <button type="button" className={styles.pickCase} disabled={picked.length >= MAX_ROUNDS} onClick={() => addCase(c)} data-add-case={c.slug} title={`Add ${c.name}, ${money.format(c.price)}`}>
                      <span className={styles.pickArt}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image} alt="" width={64} height={48} />
                      </span>
                      <span className={styles.pickName}>{c.name}</span>
                      <span className={`${styles.pickPrice} tabular`}>{money.format(c.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <ol className={styles.chosen} aria-label="Rounds" data-chosen>
                {picked.map((c, i) => (
                  <li key={`${c.slug}-${i}`} className={styles.chosenCase} title={`Round ${i + 1}: ${c.name}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.name} width={44} height={33} />
                    <button type="button" className={styles.remove} aria-label={`Remove round ${i + 1}, ${c.name}`} onClick={() => removeCase(i)} data-remove-case={i}>
                      <CloseIcon />
                    </button>
                  </li>
                ))}
                {picked.length === 0 && <li className={styles.chosenEmpty}>No cases yet</li>}
              </ol>
            </div>
            <div className={styles.createReadouts}>
              <Readout label="Rounds" value={<span data-rounds>{picked.length}</span>} />
              <Readout
                label="Cost a seat"
                value={
                  <>
                    <CoinIcon />
                    <span data-cost>{money.format(cost)}</span>
                  </>
                }
              />
            </div>
            <div className={kit.go}>
              <button type="button" className={kit.primary} disabled={!canCreate} onClick={create} data-create>
                Create battle
              </button>
              <button type="button" className={kit.iconButton} aria-pressed={fast} aria-label="Fast reels" title="Fast reels" onClick={() => setFast(!fast)} data-fast>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
                </svg>
              </button>
            </div>
            {why && (
              <p className={kit.why} data-why>
                {why}
              </p>
            )}
          </div>
        </Modal>
      )}

      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={!inLobby}
          intro="A battle's draws decide every seat's drop in every round, one draw per seat per round, in order."
          verify={verify}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How case battles work"
          onClose={() => setDialog(null)}
          steps={[
            "Create a battle with a mode and the cases to fight over, up to eight, or join one from the list that has a seat free. A seat costs the cases' prices together. Battles under way can be watched, finished ones looked at.",
            "Every seat opens the same case each round, all at once. Each seat's drops stack up under it with their value.",
            "After the last round the seat whose drops are worth the most takes every drop in the battle. In 2v2 the teams are the first two seats and the last two, and the winning pair split the pot. A tie goes to whoever sat down first.",
            "The house's share is in the case prices and nowhere else, and every drop in a battle you played can be checked under Provably fair from the battle's nonce.",
          ]}
          note="Drops are sold to your balance as coins, the site having no inventory yet."
        />
      )}
    </div>
  );
}
