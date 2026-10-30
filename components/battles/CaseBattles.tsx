"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Reel from "@/components/cases/Reel";
import { FairDialog, HowTo, kit } from "@/components/game/kit";
import { Modal } from "@/components/mines/Dialogs";
import { ChevronIcon, CloseIcon, CoinIcon, InfoIcon, ShieldIcon, SwordsIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import { avatarOf } from "@/components/home/avatar";
import {
  COIN_CASES,
  GAMEMODES,
  LOBBY,
  MAX_BORROW,
  MAX_ROUNDS,
  MODES,
  NO_OPTIONS,
  battleDrops,
  costOf,
  deciderOf,
  describeBattle,
  fillSeats,
  gamemodeName,
  isTeamMode,
  KEEP,
  keptShare,
  keepBattle,
  keptBattles,
  lobbyBattle,
  makeCostOf,
  marginOf,
  potOf,
  resultLine,
  SAMPLES_DONE,
  seatsOf,
  settle,
  shareOf,
  teamOf,
  teamsOf,
  totalsOf,
  type Gamemode,
  type LobbyBattle,
  type Mode,
  type Options,
} from "@/lib/battles";
import type { CaseDef, CaseItem } from "@/lib/cases";
import { wagered } from "@/lib/gems";
import { PLAYER } from "@/lib/home";
import { seedHash, takeNonce } from "@/lib/seeds";
import { recordOutcome } from "@/lib/stats";
import { TIERS, tierOf } from "@/lib/tiers";
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import {
  ArrowLeftIcon,
  BoltIcon,
  BorrowIcon,
  CrownIcon,
  FundIcon,
  GAMEMODE_COLORS,
  GAMEMODE_ICONS,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SeatIcon,
  SparklesIcon,
  StarIcon,
  TeamIcon,
  TilesIcon,
  UndoIcon,
} from "./glyphs";
import styles from "./Battles.module.css";

type Phase = "lobby" | "create" | "waiting" | "fighting" | "done";
type Battle = {
  id: number;
  mode: Mode;
  gamemode: Gamemode;
  options: Options;
  cases: CaseDef[];
  /** A name per seat; null while a seat waits for a player. */
  seats: (string | null)[];
  /** Your seat, or -1 when you're watching. */
  you: number;
  drops: CaseItem[][];
  decider: number;
  nonce: number;
  /** The hash of the server seed the battle was drawn with, to show while it starts. */
  hash: string;
  /** What your seat cost you. */
  cost: number;
  /** Opened from the list to look at, not played through. */
  viewed: boolean;
};
type Result = { winners: number[]; pot: number; share: number; youWon: boolean };

const FILL_MS = 1500;
const PAUSE_MS = 700;
// how often the sample battles under way move on a round
const TICK_MS = 5000;
const YOU = PLAYER.name;

// the list keeps the finished sample battles it started with; the battles people play are kept up to KEEP
const PREVIOUS_KEPT = SAMPLES_DONE;
let nextSample = 10000;
let toastCount = 0;

// the extras, in the order they're offered
const OPTIONS: { key: keyof Options; label: string; icon: (p: { className?: string }) => React.JSX.Element; hint: string }[] = [
  { key: "borrow", label: "Borrow", icon: BorrowIcon, hint: "Borrow up to 90% of the seat's cost; a win pays you the share you put in." },
  { key: "fund", label: "Fund Money", icon: FundIcon, hint: "You pay for every seat; the others join for free." },
  { key: "private", label: "Private Battle", icon: LockIcon, hint: "Only people with the link can join." },
  { key: "fast", label: "Fast", icon: BoltIcon, hint: "Quick reels." },
  { key: "gold", label: "Gold Spin", icon: StarIcon, hint: "Golden reels for the whole battle." },
];

// ready-made battles, by case index into COIN_CASES
const PRESETS: { name: string; mode: Mode; gamemode: Gamemode; cases: number[]; options?: Partial<Options> }[] = [
  { name: "Quick 1v1", mode: "1v1", gamemode: "standard", cases: [0, 0] },
  { name: "Crazy three-way", mode: "1v1v1", gamemode: "crazy", cases: [1, 2, 1] },
  { name: "Team jackpot", mode: "2v2", gamemode: "jackpot", cases: [0, 1, 2, 0] },
  { name: "Terminal four-way", mode: "1v1v1v1", gamemode: "terminal", cases: [2, 2, 0, 1, 1, 0] },
  { name: "Group gold run", mode: "2v2", gamemode: "group", cases: [1, 1, 1, 1], options: { gold: true } },
  { name: "Three teams, crazy", mode: "2v2v2", gamemode: "crazy", cases: [0, 2, 1, 0] },
  { name: "3v3 showdown", mode: "3v3", gamemode: "standard", cases: [2, 2, 1] },
  { name: "Five-way coinflip", mode: "1v1v1v1v1", gamemode: "coinflip", cases: [0, 1] },
];

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

const battleName = (mode: Mode, gamemode: Gamemode) => `${mode} ${gamemode === "standard" ? "" : `${gamemodeName(gamemode)} `}Battle`;


/**
 * Case battles. The lobby lists battles with a seat free to join, battles
 * under way to watch, and finished ones to look at, yours among them. The
 * Create battle page sets a battle up: the battle type, the extras, up to
 * eight cases and a gamemode. In the arena every seat opens the same case
 * each round, all the reels at once, and the gamemode says who takes the
 * pot. Your battles' drops come from the shared provably-fair seeds, one
 * nonce a battle (lib/battles.ts).
 */
export default function CaseBattles() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);
  const lobbyInitial = useSyncExternalStore(subscribeNothing, lobbyWithKept, lobbyStart);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [mode, setMode] = useState<Mode>("1v1");
  const [gamemode, setGamemode] = useState<Gamemode>("standard");
  const [options, setOptions] = useState<Options>(NO_OPTIONS);
  const [picked, setPicked] = useState<CaseDef[]>([COIN_CASES[0], COIN_CASES[1]]);
  const [menu, setMenu] = useState<"type" | "presets" | null>(null);
  const [picking, setPicking] = useState(false);
  const [borrowing, setBorrowing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; title: string; text: string } | null>(null);
  const toastTimer = useRef(0);
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
  const lastSetup = useRef<{ mode: Mode; gamemode: Gamemode; cases: CaseDef[]; names: string[] } | null>(null);

  const inLobby = phase === "lobby";
  const making = phase === "create";
  const borrowPct = Math.round(options.borrow * 100);
  const makeCost = makeCostOf(picked, mode, options);
  const why = picked.length === 0 ? "Add a case to fight over" : balance < makeCost ? "Not enough balance" : "";
  const canCreate = making && picked.length > 0 && balance >= makeCost;
  const fast = options.fast;

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.fill);
      clearTimeout(t.pause);
      clearTimeout(toastTimer.current);
    };
  }, []);

  const complain = (title: string, text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: ++toastCount, title, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // The sample battles under way move on a round now and then; one that
  // ends goes to the previous battles and a fresh one starts in its place.
  useEffect(() => {
    const id = window.setInterval(() => setLobbyEdits((l) => tick(l ?? lobbyWithKept())), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // a click anywhere else closes an open menu
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-menu]")) setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  // the same battle again: played through once more as a look, or made anew (at once, or edited first)
  const replay = (b: Battle) => {
    clearTimeout(timers.current.pause);
    const again = { ...b, viewed: true };
    setResult(null);
    setNote("");
    setRound(0);
    setLanded(0);
    setLive("fighting", again);
    setSpinning(true);
  };
  const recreate = (b: Battle, edit: boolean) => {
    setMode(b.mode);
    setGamemode(b.gamemode);
    setPicked(b.cases);
    setOptions({ ...b.options, fast });
    setResult(null);
    setNote("");
    if (edit) {
      setLive("create", null);
      return;
    }
    const stake = makeCostOf(b.cases, b.mode, { ...b.options, fast });
    if (balance < stake) {
      setLive("create", null);
      setNote("Not enough balance to recreate it");
      return;
    }
    const seats: (string | null)[] = Array.from({ length: seatsOf(b.mode) }, (_, i) => (i === 0 ? YOU : null));
    start(b.mode, b.gamemode, { ...b.options, fast }, b.cases, seats, 0, stake);
  };

  const share = (b: Battle) => {
    const link = `${window.location.origin}${window.location.pathname}#battle-${b.id}`;
    const say = (ok: boolean) => setNote(ok ? "Link copied" : link);
    try {
      navigator.clipboard.writeText(link).then(() => say(true), () => say(false));
    } catch {
      say(false);
    }
  };

  const setLive = (ph: Phase, b: Battle | null) => {
    live.current = { phase: ph, battle: b };
    setPhase(ph);
    setBattle(b);
  };

  // ---- Making, joining, watching ---------------------------------------------------------

  const start = (m: Mode, g: Gamemode, o: Options, cases: CaseDef[], seats: (string | null)[], you: number, stake: number) => {
    addToBalance(-stake);
    wagered(stake);
    const s = takeNonce();
    const n = seatsOf(m);
    const drops = battleDrops(cases, n, s.serverSeed, s.clientSeed, s.nonce);
    const decider = deciderOf(cases.length, n, s.serverSeed, s.clientSeed, s.nonce);
    const b: Battle = { id: ++nextId.current, mode: m, gamemode: g, options: o, cases, seats, you, drops, decider, nonce: s.nonce, hash: seedHash(s.serverSeed), cost: stake, viewed: false };
    setRound(0);
    setLanded(0);
    setSpinning(false);
    setResult(null);
    setNote("");
    setMenu(null);
    setPicking(false);
    setLive("waiting", b);
    // the other seats fill with sample players, then the first round runs
    timers.current.fill = window.setTimeout(() => {
      const full = { ...b, seats: fillSeats(b.seats, s.nonce) };
      lastSetup.current = { mode: full.mode, gamemode: full.gamemode, cases: full.cases, names: full.seats.map((p, i) => (i === full.you ? "you" : (p ?? "?"))) };
      setLive("fighting", full);
      setSpinning(true);
    }, FILL_MS);
  };

  const create = () => {
    if (!canCreate || live.current.phase !== "create") return;
    const seats: (string | null)[] = Array.from({ length: seatsOf(mode) }, (_, i) => (i === 0 ? YOU : null));
    start(mode, gamemode, options, picked, seats, 0, makeCost);
  };

  const join = (lb: LobbyBattle) => {
    if (live.current.phase !== "lobby") return;
    const seat = lb.players.indexOf(null);
    const stake = lb.options.fund ? 0 : costOf(lb.cases);
    if (seat < 0) return;
    if (balance < stake) {
      setNote(`That battle costs ${money.format(stake)} a seat`);
      return;
    }
    const seats = lb.players.map((p, i) => (i === seat ? YOU : p));
    // the battle leaves the lobby; another with a seat free takes its place
    const fresh = lobbyBattle(++nextId.current, "open");
    setLobbyEdits(lobby.map((x) => (x.id === lb.id ? fresh : x)));
    start(lb.mode, lb.gamemode, { ...lb.options, fast, borrow: 0 }, lb.cases, seats, seat, stake);
  };

  // a battle under way or finished, opened to look at: no seat, no stake
  const look = (lb: LobbyBattle) => {
    if (live.current.phase !== "lobby" || lb.status === "open") return;
    const b: Battle = {
      id: lb.id,
      mode: lb.mode,
      gamemode: lb.gamemode,
      options: { ...lb.options, fast },
      cases: lb.cases,
      seats: lb.players,
      you: lb.you ?? -1,
      drops: lb.drops,
      decider: lb.decider,
      nonce: 0,
      hash: "",
      cost: 0,
      viewed: true,
    };
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

  // a link with #battle-<id> opens that battle from the list (the ref is set before the link is read)
  const lookRef = useRef(look);
  useEffect(() => {
    lookRef.current = look;
  });
  useEffect(() => {
    const m = window.location.hash.match(/^#battle-(\d+)$/);
    if (!m) return;
    const lb = lobbyWithKept().find((x) => x.id === Number(m[1]));
    if (lb && lb.status !== "open") lookRef.current(lb);
  }, []);

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

  // a winner's share of the pot; yours less the lender's cut when you borrowed
  const resultOf = (b: Battle): Result => {
    const { winners } = settle(b.drops, b.mode, b.gamemode, b.decider);
    const pot = potOf(b.drops);
    const youWon = b.you >= 0 && winners.includes(b.you);
    const share = shareOf(pot, winners.length);
    return { winners, pot, share: youWon && !b.viewed ? Math.round(share * keptShare(b.options.borrow) * 100) / 100 : share, youWon };
  };

  const whoWon = (b: Battle, winners: number[]) => winners.map((w) => (w === b.you ? "You" : b.seats[w])).join(" & ");
  // "you win", "rook wins", "you & rook win"
  const plural = (b: Battle, winners: number[]) => winners.length > 1 || winners.includes(b.you);

  const finish = (b: Battle) => {
    const r = resultOf(b);
    const played = !b.viewed && b.you >= 0;
    if (played) {
      if (r.youWon) addToBalance(r.share);
      recordOutcome(r.youWon ? Math.round((r.share - b.cost) * 100) / 100 : -b.cost);
    }
    setResult(r);
    setLive("done", b);
    const line = resultLine(b.gamemode, whoWon(b, r.winners), plural(b, r.winners));
    const borrowed = b.options.borrow > 0 ? ` (${Math.round(b.options.borrow * 100)}% borrowed, so ${Math.round(keptShare(b.options.borrow) * 100)}% of your share)` : "";
    setNote(played && r.youWon ? `${line}: ${money.format(r.share)} of the ${money.format(r.pot)} pot to your balance${borrowed}` : `${line}: the pot was ${money.format(r.pot)}`);
    // the battle goes into the list as finished: yours is kept for next time
    const done: LobbyBattle = {
      id: b.id,
      mode: b.mode,
      gamemode: b.gamemode,
      options: b.options,
      cases: b.cases,
      players: b.seats,
      status: "done",
      round: b.cases.length,
      drops: b.drops,
      decider: b.decider,
      you: played ? b.you : null,
    };
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
    setMenu(null);
    setPicking(false);
  };

  // ---- Setting a battle up ------------------------------------------------------------------

  const addCase = (c: CaseDef) => making && picked.length < MAX_ROUNDS && setPicked([...picked, c]);
  const removeCase = (i: number) => making && setPicked(picked.filter((_, k) => k !== i));
  const removeLast = (c: CaseDef) => {
    const i = picked.map((p) => p.slug).lastIndexOf(c.slug);
    if (i >= 0) removeCase(i);
  };
  const toggleOption = (key: keyof Options) => {
    if (key === "borrow") {
      if (options.fund) {
        complain("Something went wrong!", "You cannot borrow if you fund the battle");
        return;
      }
      setBorrowing(options.borrow);
      return;
    }
    if (key === "fund" && !options.fund && options.borrow > 0) {
      complain("Something went wrong!", "You cannot fund the battle if you have borrowed money");
      return;
    }
    setOptions({ ...options, [key]: !options[key] });
  };
  const keepBorrow = () => {
    if (borrowing !== null) setOptions({ ...options, borrow: Math.min(MAX_BORROW, Math.max(0, borrowing)) });
    setBorrowing(null);
  };
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setMode(p.mode);
    setGamemode(p.gamemode);
    setPicked(p.cases.map((i) => COIN_CASES[i % COIN_CASES.length]));
    setOptions({ ...NO_OPTIONS, fast, ...p.options });
    setMenu(null);
  };
  const randomize = () => {
    const r = (n: number) => Math.floor(Math.random() * n);
    setMode(MODES[r(MODES.length)].id);
    setGamemode(Math.random() < 0.4 ? "standard" : GAMEMODES[r(GAMEMODES.length)].id);
    setPicked(Array.from({ length: 2 + r(5) }, () => COIN_CASES[r(COIN_CASES.length)]));
    setOptions({ ...NO_OPTIONS, fast, gold: Math.random() < 0.3, private: Math.random() < 0.2 });
    setMenu(null);
  };

  // ---- The fairness check -----------------------------------------------------------------------

  const verify = (server: string, client: string, nonce: number) => {
    const setup = lastSetup.current ?? {
      mode,
      gamemode,
      cases: picked.length ? picked : [COIN_CASES[0]],
      names: Array.from({ length: seatsOf(mode) }, (_, i) => (i === 0 ? "you" : `seat ${i + 1}`)),
    };
    return describeBattle(setup.cases, setup.mode, setup.gamemode, setup.names, server, client, nonce);
  };

  // ---- The list -----------------------------------------------------------------------------------

  const current = lobby.filter((b) => b.status !== "done");
  const previous = lobby.filter((b) => b.status === "done");

  const row = (lb: LobbyBattle) => {
    const stake = costOf(lb.cases);
    const open = lb.status === "open";
    const done = lb.status === "done";
    const isLive = lb.status === "live";
    const pot = potOf(lb.drops.slice(0, lb.round));
    const winners = done ? settle(lb.drops, lb.mode, lb.gamemode, lb.decider).winners : [];
    const teams = teamsOf(lb.mode);
    const stacked = isTeamMode(lb.mode);
    // the case strip keeps the round being played second from the left
    const shift = isLive ? Math.max(0, lb.round - 1) : 0;
    const chip = (seat: number) => {
      const p = lb.players[seat];
      const you = lb.you === seat;
      const won = winners.includes(seat);
      return (
        <span
          key={seat}
          className={`${styles.seatChip} ${p ? "" : styles.seatOpen} ${you ? styles.seatYou : ""} ${won ? styles.seatWon : ""}`}
          style={p && !you ? { background: avatarOf(p) } : undefined}
          title={p ? (you ? `${p} (you)` : p) : "Open seat"}
          data-chip={p ?? ""}
        >
          {p ? p[0].toUpperCase() : "+"}
          {won && <CrownIcon className={styles.crown} />}
        </span>
      );
    };
    return (
      <li key={lb.id} className={styles.row} data-battle={lb.id} data-status={lb.status} data-open={open || undefined} data-gamemode={lb.gamemode} data-funded={lb.options.fund || undefined}>
        <div className={styles.who}>
          <span className={styles.modeLine}>
            <b>{battleName(lb.mode, lb.gamemode)}</b>
            {lb.options.private && <LockIcon className={styles.modeGlyph} data-glyph="private" />}
            {lb.options.gold && <StarIcon className={`${styles.modeGlyph} ${styles.gold}`} data-glyph="gold" />}
            {isLive && <span className={styles.liveTag}>Live</span>}
          </span>
          {/* swords between the sides, a link between partners; 2v2 stacks a team a line */}
          <span className={styles.seats} data-stack={stacked || undefined}>
            {teams.map((team, ti) => (
              <Fragment key={ti}>
                {ti > 0 && <SwordsIcon className={stacked ? styles.sepTeams : styles.sep} />}
                <span className={styles.side}>
                  {team.map((seat, si) => (
                    <Fragment key={seat}>
                      {si > 0 && <TeamIcon className={styles.sep} />}
                      {chip(seat)}
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
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
          <span className={styles.costLabel}>{lb.options.fund ? "Funded battle" : "Battle cost"}</span>
        </div>

        <div className={styles.go}>
          <span className={`${styles.unboxed} tabular`}>
            Unboxed <b>{money.format(pot)}</b>
          </span>
          {open ? (
            <button type="button" className={kit.primary} disabled={!inLobby || (!lb.options.fund && balance < stake)} onClick={() => join(lb)} data-join>
              {lb.options.fund ? "Join free" : "Join battle"}
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
          <button type="button" className={kit.primary} onClick={() => setLive("create", null)} data-create-open>
            Create battle
          </button>
        </div>
      </div>

      {/* one list: the battles under way or with a seat free first and in full colour, the finished ones after them, in the dark */}
      <ul className={styles.list} aria-label="Battles" data-lobby>
        {[...current, ...previous].map(row)}
        <li className={styles.makeRow}>
          <span className={styles.makeText}>
            <b>Make your own</b>
            <span>Pick the cases, the battle type and a gamemode, and it waits here for players. Battles you play stay in the list afterwards, the last {KEEP} of them.</span>
          </span>
          <button type="button" className={kit.secondary} disabled={!inLobby} onClick={() => setLive("create", null)} data-create-open-bottom>
            Create battle
          </button>
        </li>
      </ul>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </div>
  );

  // ---- The create page -------------------------------------------------------------------------

  const modeDef = MODES.find((m) => m.id === mode)!;
  const slots = Math.min(MAX_ROUNDS, Math.max(4, Math.ceil((picked.length + 1) / 4) * 4));
  const countOf = (c: CaseDef) => picked.filter((p) => p.slug === c.slug).length;

  const createPage = (
    <div className={styles.createPage} data-create-page>
      <div className={styles.createHead}>
        <button type="button" className={styles.backRound} aria-label="Back to battles" onClick={backToLobby} data-create-back>
          <ArrowLeftIcon />
        </button>
        <h1 className={styles.createTitle}>Create Battle</h1>
        <div className={styles.createActions}>
          <div className={styles.menuWrap} data-menu>
            <button type="button" className={styles.greyButton} aria-haspopup="menu" aria-expanded={menu === "presets"} onClick={() => setMenu(menu === "presets" ? null : "presets")} data-presets>
              <TilesIcon />
              Presets
            </button>
            {menu === "presets" && (
              <ul className={styles.dropMenu} role="menu" aria-label="Presets">
                {PRESETS.map((p) => (
                  <li key={p.name} role="none">
                    <button type="button" role="menuitem" className={styles.dropItem} onClick={() => applyPreset(p)} data-preset={p.name}>
                      <b>{p.name}</b>
                      <small>
                        {battleName(p.mode, p.gamemode)}, {p.cases.length} case{p.cases.length === 1 ? "" : "s"}
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className={styles.greyButton} onClick={randomize} data-randomize>
            <SparklesIcon />
            Randomize settings
          </button>
          <span className={styles.createGoWrap}>
            <button type="button" className={`${kit.primary} ${styles.createGo}`} disabled={!canCreate} onClick={create} data-create title={why || undefined}>
              Create battle for
              <CoinIcon />
              <span data-cost>{money.format(makeCost)}</span>
            </button>
            {options.borrow > 0 && (
              <span className={styles.borrowingNote} data-borrowing={borrowPct}>
                Borrowing {borrowPct}%
              </span>
            )}
          </span>
        </div>
      </div>

      <div className={styles.createRow}>
        <div className={styles.createBlock}>
          <h3 className={styles.createLabel}>Battle Type</h3>
          <div className={styles.menuWrap} data-menu>
            <button type="button" className={styles.typeSelect} aria-haspopup="listbox" aria-expanded={menu === "type"} onClick={() => setMenu(menu === "type" ? null : "type")} data-type-toggle>
              <span className={styles.typeKind}>{modeDef.kind}</span>
              <b>{modeDef.label}</b>
              <span className={styles.typeSeats} aria-label={`${modeDef.seats} seats`}>
                {Array.from({ length: modeDef.seats }, (_, i) => (
                  <SeatIcon key={i} />
                ))}
              </span>
              <ChevronIcon className={styles.typeCaret} />
            </button>
            {menu === "type" && (
              <ul className={styles.dropMenu} role="listbox" aria-label="Battle type">
                {MODES.map((m) => (
                  <li key={m.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={m.id === mode}
                      className={styles.dropItem}
                      onClick={() => {
                        setMode(m.id);
                        setMenu(null);
                      }}
                      data-mode={m.id}
                    >
                      <span className={styles.typeKind}>{m.kind}</span>
                      <b>{m.label}</b>
                      <span className={styles.typeSeats}>
                        {Array.from({ length: m.seats }, (_, i) => (
                          <SeatIcon key={i} />
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={`${styles.createBlock} ${styles.optionsBlock}`}>
          <h3 className={styles.createLabel}>Additional options</h3>
          <div className={styles.chips} role="group" aria-label="Additional options">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={`${styles.chip} ${o.key === "gold" ? styles.chipGold : ""}`}
                aria-pressed={o.key === "borrow" ? options.borrow > 0 : options[o.key]}
                title={o.hint}
                onClick={() => toggleOption(o.key)}
                data-option={o.key}
                {...(o.key === "fast" ? { "data-fast": "" } : {})}
                {...(o.key === "borrow" ? { "data-borrow": borrowPct } : {})}
              >
                <o.icon className={styles.chipIcon} />
                {o.key === "borrow" && options.borrow > 0 ? `${borrowPct}%` : o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 className={styles.createLabel}>
        Add Cases (<span data-rounds>{picked.length}</span>)
      </h3>
      <ul className={styles.slots} aria-label="Cases, a round each" data-slots>
        {Array.from({ length: slots }, (_, i) => {
          const c = picked[i];
          return (
            <li key={i}>
              {c ? (
                <div className={styles.slotCase} title={`Round ${i + 1}: ${c.name}, ${money.format(c.price)}`} data-slot-case={c.slug}>
                  <span className={styles.slotRound}>Round {i + 1}</span>
                  <button type="button" className={styles.slotRemove} aria-label={`Remove round ${i + 1}, ${c.name}`} onClick={() => removeCase(i)} data-remove-case={i}>
                    <CloseIcon />
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" width={120} height={90} />
                  <span className={styles.slotName}>{c.name}</span>
                  <span className={`${styles.slotPrice} tabular`}>
                    <CoinIcon />
                    {money.format(c.price)}
                  </span>
                </div>
              ) : (
                <button type="button" className={styles.slotAdd} disabled={picked.length >= MAX_ROUNDS} onClick={() => setPicking(true)} data-add-slot>
                  <span className={styles.slotPlus} aria-hidden>
                    +
                  </span>
                  Add Case
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <h3 className={styles.createLabel}>Gamemode</h3>
      <div className={styles.gamemodes} role="group" aria-label="Gamemode">
        {GAMEMODES.map((g) => {
          const Icon = GAMEMODE_ICONS[g.id];
          const on = gamemode === g.id;
          return (
            <button
              key={g.id}
              type="button"
              className={styles.gamemode}
              aria-pressed={on}
              onClick={() => setGamemode(on ? "standard" : g.id)}
              style={{ "--gm": GAMEMODE_COLORS[g.id] } as CSSProperties}
              data-gamemode={g.id}
            >
              <span className={styles.gamemodeName}>
                <Icon className={styles.gamemodeIcon} />
                {g.name}
              </span>
              <span className={styles.gamemodeBlurb}>{g.blurb}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.createNote}>
        {gamemode === "standard" ? "No gamemode picked: the biggest haul wins." : `${gamemodeName(gamemode)} is on. Pick it again for a standard battle.`}
        {why && (
          <>
            {" "}
            <span data-why>{why}</span>
          </>
        )}
      </p>
    </div>
  );

  // ---- The arena ------------------------------------------------------------------------------------

  const seats = battle ? seatsOf(battle.mode) : 0;
  const totals = battle ? totalsOf(battle.drops.slice(0, landed), seats) : [];
  const rounds = battle?.cases.length ?? 0;
  const cur = Math.min(round, Math.max(0, rounds - 1));
  const potNow = battle ? potOf(battle.drops.slice(0, landed)) : 0;
  const Gm = battle && battle.gamemode !== "standard" ? GAMEMODE_ICONS[battle.gamemode] : null;
  const gmColor = battle && battle.gamemode !== "standard" ? GAMEMODE_COLORS[battle.gamemode] : undefined;
  const over = phase === "done";
  // how it was won: by how much, or by what draw
  const margin = battle && result ? marginOf(battle.drops, battle.mode, battle.gamemode, result.winners) : null;
  const wonHow = battle?.gamemode === "coinflip" ? "Won on the coinflip" : battle?.gamemode === "jackpot" ? "Won on the jackpot draw" : "Shared by everyone";

  const arena = battle && (
    <div className={styles.arenaPage} data-gold={battle.options.gold || undefined}>
      {/* the way back, and the tools */}
      <div className={styles.arenaTop}>
        <button type="button" className={styles.topButton} onClick={backToLobby} data-back>
          <ChevronIcon direction="left" />
          Back to battles
        </button>
        <span className={styles.topTools}>
          <button type="button" className={styles.topButton} aria-pressed={fast} aria-label="Fast reels" title="Fast reels" onClick={() => setOptions({ ...options, fast: !fast })} data-fast>
            <BoltIcon />
          </button>
          <button type="button" className={styles.topButton} onClick={() => share(battle)} data-share>
            <TeamIcon />
            Share
          </button>
          <button type="button" className={styles.topButton} onClick={() => setDialog("fair")} data-fairness>
            <ShieldIcon />
            Provably fair
          </button>
        </span>
      </div>

      {/* the bar: the cost and the pot, the cases with the one being opened lit, the mode */}
      <div className={styles.infoBar}>
        <div className={styles.infoFigures}>
          <span className={styles.infoFigure}>
            <b className="tabular">
              <CoinIcon />
              {money.format(costOf(battle.cases))}
            </b>
            <small>Battle cost</small>
          </span>
          <span className={styles.infoFigure}>
            <b className="tabular" data-pot={potNow.toFixed(2)}>
              <CoinIcon />
              {money.format(potNow)}
            </b>
            <small>Pot</small>
          </span>
        </div>
        {/* three cases at a time: the one being opened on the right, the ones done slid off to its left and fading, the rest waiting out of sight */}
        <div className={styles.caseStrip} data-case-now={battle.cases[cur].slug} data-round={phase === "waiting" ? 0 : cur + 1}>
          <span className={styles.stripReel} aria-label={`Round ${cur + 1} of ${rounds}`}>
            {battle.cases.map((c, r) => {
              const at = Math.max(-3, Math.min(1, r - cur));
              return (
                <span key={r} className={styles.stripCase} style={{ "--at": at } as CSSProperties} title={`Round ${r + 1}: ${c.name}, ${money.format(c.price)}`} data-at={at} data-played={r < landed || undefined} data-now={(r === cur && !over) || undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" width={56} height={56} />
                </span>
              );
            })}
          </span>
          <span className={styles.stripNow}>
            <b title={battle.cases[cur].name}>{battle.cases[cur].name}</b>
            <span className={`${styles.stripPrice} tabular`}>{money.format(battle.cases[cur].price)}</span>
          </span>
        </div>
        <div className={styles.infoMode} data-info-mode={battle.mode}>
          <b>{battle.mode}</b>
          <span className={styles.gmTag} style={gmColor ? { color: gmColor } : undefined} data-arena-mode={battle.gamemode}>
            {Gm && <Gm />}
            {battle.gamemode === "standard" ? "Standard" : gamemodeName(battle.gamemode)}
          </span>
        </div>
      </div>

      {/* the band: the reels while the rounds run, one a seat; the result screen once it's over */}
      <div className={styles.band} style={{ "--seats": seats } as CSSProperties} data-band={phase}>
        {!over &&
          battle.seats.map((name, seat) => (
            <div key={seat} className={styles.reelCol} data-band-seat={seat}>
              <Reel
                items={battle.cases[cur].items}
                winner={phase === "waiting" ? null : battle.drops[cur][seat]}
                spinning={spinning}
                fast={fast}
                seed={battle.id * 100 + round * 10 + seat + 1}
                onDone={seat === 0 ? roundDone : undefined}
                label={`${name ?? "Seat"}'s reel`}
                vertical
                casePrice={battle.cases[cur].price}
              />
            </div>
          ))}
        {!over && (
          <>
            <span className={styles.edgeMark} data-side="left" aria-hidden />
            <span className={styles.edgeMark} data-side="right" aria-hidden />
            {teamsOf(battle.mode)
              .slice(0, -1)
              .map((team, k, all) => {
                const before = all.slice(0, k + 1).reduce((n, t) => n + t.length, 0);
                return (
                  <span key={k} className={styles.bandSwords} style={{ left: `${(before / seats) * 100}%` }} aria-hidden data-swords>
                    <SwordsIcon />
                  </span>
                );
              })}
          </>
        )}
        {phase === "waiting" && (
          <div className={styles.awaiting} data-awaiting>
            <ShieldIcon />
            <b>Awaiting the draw</b>
            <span className={styles.awaitingNonce}>#{battle.nonce}</span>
            <span className={styles.awaitingHash}>({battle.hash.slice(0, 44)}…)</span>
          </div>
        )}
        {over && result && (
          <div className={styles.overScreen} data-over>
            <h2 className={styles.overTitle}>
              Battle
              <span>Over</span>
            </h2>
            {/* the winning seats: everyone on the side that took it */}
            <ul className={styles.winners} aria-label="Winners" data-winners>
              {result.winners.map((seat) => {
                const name = battle.seats[seat] ?? "?";
                const you = seat === battle.you;
                // you borrowed for this one: the lender takes that share of the win
                const borrowed = you && !battle.viewed && battle.options.borrow > 0;
                return (
                  <li key={seat} className={styles.winner} data-winner-seat={seat} data-you={you || undefined}>
                    <span className={styles.winAvatar} style={!you ? { background: avatarOf(name) } : undefined} aria-hidden>
                      {name[0].toUpperCase()}
                    </span>
                    <b className={styles.winName}>
                      {name}
                      {you && <small>you</small>}
                    </b>
                    {borrowed && (
                      <small className={styles.winNote} data-borrow-note>
                        Borrowed {Math.round(battle.options.borrow * 100)}% · keeps <b className="tabular">{money.format(result.share)}</b>
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className={styles.overLine} role="status" data-result={result.youWon ? "won" : "lost"}>
              <span>
                Pot <b className="tabular">{money.format(result.pot)}</b>
              </span>
              <i aria-hidden>•</i>
              <span>
                {margin === null ? (
                  wonHow
                ) : margin === 0 ? (
                  "Won on a tie"
                ) : (
                  <>
                    Won by <b className="tabular">{money.format(margin)}</b>
                  </>
                )}
              </span>
            </p>
            <div className={styles.bandActions}>
              <button type="button" className={`${styles.overButton} ${styles.createNew}`} onClick={() => recreate(battle, true)} data-create-new>
                <PlusIcon />
                Create New
              </button>
              <button
                type="button"
                className={`${styles.overButton} ${styles.recreate}`}
                title={`Recreate for ${money.format(makeCostOf(battle.cases, battle.mode, { ...battle.options, fast }))}`}
                onClick={() => recreate(battle, false)}
                data-recreate
              >
                <RefreshIcon />
                Recreate
              </button>
              <button type="button" className={`${styles.overButton} ${styles.ghostButton}`} onClick={() => replay(battle)} data-replay>
                <UndoIcon />
                Replay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* under the band, a column a seat: who and their total, then a card a round, the case until it's opened, then what came out */}
      <div className={styles.dropsRow} style={{ "--seats": seats } as CSSProperties}>
        {battle.seats.map((name, seat) => {
          const you = seat === battle.you;
          const won = result?.winners.includes(seat) ?? false;
          const team = isTeamMode(battle.mode) ? teamOf(battle.mode, seat) : null;
          return (
            <section
              key={seat}
              className={styles.dropsCol}
              aria-label={you ? "Your seat" : (name ?? "Open seat")}
              data-seat={seat}
              data-you={you || undefined}
              data-winner={won || undefined}
              data-lost={(!!result && !won) || undefined}
              data-team={team ?? undefined}
            >
              <header className={styles.dropsHead}>
                <span className={styles.miniAvatar} style={name && !you ? { background: avatarOf(name) } : undefined} aria-hidden>
                  {(name ?? "?")[0].toUpperCase()}
                </span>
                <b className={styles.dropsName} data-name={name ?? ""}>
                  {name ?? "Waiting…"}
                  {you && <small>you</small>}
                </b>
                <span className={`${styles.headTotal} tabular`} data-total={totals[seat]?.toFixed(2) ?? "0.00"}>
                  <CoinIcon />
                  {money.format(totals[seat] ?? 0)}
                </span>
              </header>
              <ol className={styles.dropList} aria-label="Rounds">
                {battle.cases.map((c, r) => {
                  const drop = r < landed ? battle.drops[r][seat] : null;
                  const tier = drop ? tierOf(drop.skin.price, c.price) : "grey";
                  return drop ? (
                    <li key={r} className={styles.dropCard} style={{ "--tier": TIERS[tier].color } as CSSProperties} data-drop={drop.skin.slug} data-tier={tier} title={`${drop.skin.name}: ${TIERS[tier].name}`}>
                      <span className={styles.dropCircle}>
                        <SkinArt skin={drop.skin} />
                      </span>
                      <b>{drop.skin.name}</b>
                      <span className={`${styles.dropPrice} tabular`}>
                        <CoinIcon />
                        {money.format(drop.skin.price)}
                      </span>
                    </li>
                  ) : (
                    <li key={r} className={`${styles.dropCard} ${styles.dropPending}`} data-pending data-now={(phase === "fighting" && r === cur) || undefined} title={`Round ${r + 1}: ${c.name}`}>
                      <span className={styles.pendingArt}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image} alt="" width={72} height={54} />
                      </span>
                      <b>Round {r + 1}</b>
                      <span className={`${styles.dropPrice} tabular`}>
                        <CoinIcon />
                        0.00
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      <p className={`${kit.stageNote} ${styles.arenaNote}`} aria-live="polite" data-note>
        {note}
      </p>
    </div>
  );

  return (
    <div className={styles.wrap} data-battles data-phase={phase}>
      {making ? createPage : inLobby || !battle ? list : arena}

      {borrowing !== null && (
        <Modal title="Borrow Funds" onClose={() => setBorrowing(null)}>
          <div className={styles.borrowBox} data-borrow-window>
            <p className={styles.borrowLine}>
              On win you will receive <b>{Math.round(keptShare(borrowing) * 100)}%</b> of your share.
            </p>
            <p className={styles.borrowSub}>Gems follow your stake: you earn them on the part you put in.</p>
            <div className={styles.borrowSlider}>
              <span className={styles.borrowHead}>
                <span>
                  Borrow Amount: <b data-borrow-amount>{Math.round(borrowing * 100)}%</b>
                </span>
                <b>{Math.round(MAX_BORROW * 100)}%</b>
              </span>
              <input
                type="range"
                min={0}
                max={Math.round(MAX_BORROW * 100)}
                step={5}
                value={Math.round(borrowing * 100)}
                aria-label="Borrow amount, percent"
                style={{ "--pct": `${(borrowing / MAX_BORROW) * 100}%` } as CSSProperties}
                onChange={(e) => setBorrowing(Number(e.target.value) / 100)}
                data-borrow-range
              />
            </div>
            <button type="button" className={`${kit.primary} ${styles.borrowGo}`} onClick={keepBorrow} data-borrow-continue>
              Continue
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div key={toast.id} className={styles.toast} role="alert" data-toast>
          <b>{toast.title}</b>
          <span>{toast.text}</span>
        </div>
      )}

      {picking && (
        <Modal title="Add cases" onClose={() => setPicking(false)} wide>
          <ul className={styles.picker} aria-label="Cases" data-picker>
            {COIN_CASES.map((c) => {
              const n = countOf(c);
              return (
                <li key={c.slug} className={styles.pickCase} data-pick={c.slug}>
                  <span className={styles.pickArt}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" width={96} height={72} />
                  </span>
                  <span className={styles.pickName}>{c.name}</span>
                  <span className={`${styles.pickPrice} tabular`}>
                    <CoinIcon />
                    {money.format(c.price)}
                  </span>
                  <span className={styles.pickCount}>
                    <button type="button" className={styles.pickStep} aria-label={`One ${c.name} fewer`} disabled={n === 0} onClick={() => removeLast(c)} data-less-case={c.slug}>
                      −
                    </button>
                    <b className="tabular" data-count={n}>
                      {n}
                    </b>
                    <button type="button" className={styles.pickStep} aria-label={`One ${c.name} more`} disabled={picked.length >= MAX_ROUNDS} onClick={() => addCase(c)} data-add-case={c.slug}>
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className={styles.pickerFoot}>
            <span className={styles.pickerSum}>
              {picked.length} of {MAX_ROUNDS} rounds, <b className="tabular">{money.format(costOf(picked))}</b> a seat
            </span>
            <button type="button" className={kit.primary} onClick={() => setPicking(false)} data-picker-done>
              Done
            </button>
          </div>
        </Modal>
      )}

      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={!inLobby}
          intro="A battle's draws decide every seat's drop in every round, one draw per seat per round, in order; one draw more settles a coinflip or jackpot."
          verify={verify}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How case battles work"
          onClose={() => setDialog(null)}
          steps={[
            "Create a battle: a battle type (solo from 1v1 up to 1v1v1v1v1, or teams of 2v2, 2v2v2 and 3v3), the cases to fight over, up to eight, and a gamemode if you want one. Or join a battle from the list that has a seat free. A seat costs the cases' prices together, unless the maker funded every seat. Borrow up to 90% of your seat and you put in the rest; a win then pays you the share you put in, the lender keeping the borrowed share.",
            "Every seat opens the same case each round, all at once. Each seat's drops stack up under it with their value.",
            "As a rule the seat whose drops are worth the most takes every drop in the battle, a winning team splitting it between them, and a tie going to whoever sat down first. Crazy hands it to the lowest haul, Terminal counts the last case only, Group splits it between everyone, and Coinflip and Jackpot settle it with one more draw (even odds, or odds by haul).",
            "The house's share is in the case prices and nowhere else, and every drop in a battle you played can be checked under Provably fair from the battle's nonce.",
          ]}
          note="Drops are sold to your balance as Robux, the site having no inventory yet."
        />
      )}
    </div>
  );
}
