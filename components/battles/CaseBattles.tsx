"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Reel from "@/components/cases/Reel";
import { Choices, FairDialog, GameFrame, History, HowTo, Readout, Tools, kit } from "@/components/game/kit";
import { CoinIcon, CloseIcon } from "@/components/home/icons";
import SkinArt from "@/components/upgrader/SkinArt";
import {
  COIN_CASES,
  LOBBY,
  MAX_ROUNDS,
  MODES,
  battleDrops,
  costOf,
  describeBattle,
  fillSeats,
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
import { money } from "@/lib/upgrader";
import { addToBalance, subscribeWallet, walletBalance, walletStart } from "@/lib/wallet";
import styles from "./Battles.module.css";

type Phase = "lobby" | "waiting" | "fighting" | "done";
type Battle = {
  mode: Mode;
  cases: CaseDef[];
  /** A name per seat; null while a seat waits for a player. */
  seats: (string | null)[];
  you: number;
  drops: CaseItem[][];
  nonce: number;
  cost: number;
};
type Result = { winners: number[]; pot: number; share: number; youWon: boolean };
type Past = { id: number; text: string; won: boolean };

const HISTORY = 12;
const FILL_MS = 1500;
const PAUSE_MS = 700;
const BACK_MS = 9000;
const YOU = PLAYER.name;

/**
 * Case battles. Make a battle (a mode and up to eight cases) or join one
 * from the lobby; sample players take the other seats. Every seat opens
 * the same case each round, all the reels at once, and the seat (or team)
 * whose drops are worth the most takes the whole pot. The drops come from
 * the shared provably-fair seeds, one nonce a battle (lib/battles.ts).
 */
export default function CaseBattles() {
  const balance = useSyncExternalStore(subscribeWallet, walletBalance, walletStart);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [mode, setMode] = useState<Mode>("1v1");
  const [picked, setPicked] = useState<CaseDef[]>([COIN_CASES[0], COIN_CASES[1]]);
  const [fast, setFast] = useState(false);
  const [lobby, setLobby] = useState<LobbyBattle[]>(LOBBY);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [round, setRound] = useState(0);
  const [landed, setLanded] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const live = useRef<{ phase: Phase; battle: Battle | null }>({ phase: "lobby", battle: null });
  const timers = useRef({ fill: 0, pause: 0, back: 0 });
  const pastId = useRef(0);
  const lobbyId = useRef(LOBBY.length);
  // the last battle's setup, for the fairness check after it's gone
  const lastSetup = useRef<{ mode: Mode; cases: CaseDef[]; names: string[] } | null>(null);

  const inLobby = phase === "lobby";
  const cost = costOf(picked);
  const why = !inLobby ? "" : picked.length === 0 ? "Add a case to fight over" : balance < cost ? "Not enough balance" : "";
  const canCreate = inLobby && picked.length > 0 && balance >= cost;

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.fill);
      clearTimeout(t.pause);
      clearTimeout(t.back);
    };
  }, []);

  // ---- Making and joining ----------------------------------------------------------------

  const setLive = (ph: Phase, b: Battle | null) => {
    live.current = { phase: ph, battle: b };
    setPhase(ph);
    setBattle(b);
  };

  const start = (m: Mode, cases: CaseDef[], seats: (string | null)[], you: number) => {
    const stake = costOf(cases);
    addToBalance(-stake);
    wagered(stake);
    const s = takeNonce();
    const n = seatsOf(m);
    const drops = battleDrops(cases, n, s.serverSeed, s.clientSeed, s.nonce);
    const b: Battle = { mode: m, cases, seats, you, drops, nonce: s.nonce, cost: stake };
    clearTimeout(timers.current.back);
    setRound(0);
    setLanded(0);
    setSpinning(false);
    setResult(null);
    setNote("");
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
    // the battle leaves the lobby; another takes its place
    lobbyId.current += 1;
    const fresh = lobbyBattle(lobbyId.current);
    setLobby((l) => l.map((x) => (x.id === lb.id ? fresh : x)));
    start(lb.mode, lb.cases, seats, seat);
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

  const finish = (b: Battle) => {
    const n = seatsOf(b.mode);
    const totals = totalsOf(b.drops, n);
    const winners = winnersOf(totals, b.mode);
    const pot = potOf(b.drops);
    const share = shareOf(pot, b.mode);
    const youWon = winners.includes(b.you);
    if (youWon) addToBalance(share);
    const r: Result = { winners, pot, share, youWon };
    setResult(r);
    setLive("done", b);
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: youWon ? `+${money.format(share)}` : `−${money.format(b.cost)}`, won: youWon }, ...h].slice(0, HISTORY));
    const who = winners.map((w) => (w === b.you ? "You" : b.seats[w])).join(" and ");
    setNote(youWon ? `${who} won the ${money.format(pot)} pot: ${money.format(share)} to your balance` : `${who} won the ${money.format(pot)} pot`);
    timers.current.back = window.setTimeout(backToLobby, BACK_MS);
  };

  const backToLobby = () => {
    clearTimeout(timers.current.back);
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

  const seats = battle ? seatsOf(battle.mode) : 0;
  const totals = battle ? totalsOf(battle.drops.slice(0, landed), seats) : [];
  const rounds = battle?.cases.length ?? 0;

  return (
    <div className={styles.wrap} data-battles data-phase={phase}>
      <GameFrame
        controls={
          <>
            <Choices label="Mode" options={MODES.map((m) => ({ value: m.id, label: m.label }))} value={battle?.mode ?? mode} onChange={setMode} disabled={!inLobby} attr="data-mode" />

            <div className={kit.field}>
              <span className={kit.fieldHead}>
                <span className={kit.fieldLabel}>Cases</span>
                <span className={`${kit.fieldMax} ${picked.length >= MAX_ROUNDS ? kit.fieldBad : ""}`}>up to {MAX_ROUNDS}</span>
              </span>
              <ul className={styles.picker} aria-label="Add a case">
                {COIN_CASES.map((c) => (
                  <li key={c.slug}>
                    <button type="button" className={styles.pickCase} disabled={!inLobby || picked.length >= MAX_ROUNDS} onClick={() => addCase(c)} data-add-case={c.slug} title={`Add ${c.name}, ${money.format(c.price)}`}>
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
                    <button type="button" className={styles.remove} aria-label={`Remove round ${i + 1}, ${c.name}`} disabled={!inLobby} onClick={() => removeCase(i)} data-remove-case={i}>
                      <CloseIcon />
                    </button>
                  </li>
                ))}
                {picked.length === 0 && <li className={styles.chosenEmpty}>No cases yet</li>}
              </ol>
            </div>

            <div className={kit.readouts}>
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
              {inLobby ? (
                <button type="button" className={kit.primary} disabled={!canCreate} onClick={create} data-create>
                  Create battle
                </button>
              ) : (
                <button type="button" className={kit.secondary} disabled={phase !== "done"} onClick={backToLobby} data-back-controls>
                  {phase === "done" ? "Back to the lobby" : phase === "waiting" ? "Finding players…" : `Round ${round + 1} of ${rounds}`}
                </button>
              )}
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

            <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
          </>
        }
        stage={
          <>
            <History items={history} label="Last battles" />
            {inLobby || !battle ? (
              <div className={styles.lobbyWrap}>
                <div className={styles.lobbyHead}>
                  <h2 className={styles.heading}>Open battles</h2>
                  <span className={styles.lobbyCount}>{lobby.filter((b) => b.players.includes(null)).length} with a seat free</span>
                </div>
                <ul className={styles.lobby} data-lobby>
                  {lobby.map((lb) => {
                    const stake = costOf(lb.cases);
                    const open = lb.players.includes(null);
                    const groups = lb.cases.reduce<{ c: CaseDef; n: number }[]>((g, c) => {
                      const last = g[g.length - 1];
                      if (last && last.c.slug === c.slug) last.n += 1;
                      else g.push({ c, n: 1 });
                      return g;
                    }, []);
                    return (
                      <li key={lb.id} className={styles.row} data-battle={lb.id} data-open={open || undefined}>
                        <span className={styles.modePill}>{lb.mode}</span>
                        <span className={styles.thumbs} aria-label={lb.cases.map((c) => c.name).join(", ")}>
                          {groups.map((g, i) => (
                            <span key={i} className={styles.thumb} title={g.c.name}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={g.c.image} alt="" width={48} height={36} />
                              {g.n > 1 && <b>×{g.n}</b>}
                            </span>
                          ))}
                        </span>
                        <span className={styles.rowMeta}>
                          <span className={styles.rowRounds}>
                            {lb.cases.length} round{lb.cases.length === 1 ? "" : "s"}
                          </span>
                          <span className={`${styles.rowCost} tabular`} data-row-cost={stake.toFixed(2)}>
                            <CoinIcon />
                            {money.format(stake)}
                          </span>
                        </span>
                        <span className={styles.seatChips}>
                          {lb.players.map((p, i) => (
                            <span key={i} className={`${styles.chip} ${p ? "" : styles.chipOpen}`} data-chip={p ?? ""}>
                              {p ?? "Open"}
                            </span>
                          ))}
                        </span>
                        <button type="button" className={styles.join} disabled={!open || balance < stake} onClick={() => join(lb)} data-join>
                          {open ? "Join" : "Full"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className={styles.arena} data-arena>
                <div className={styles.roundBar}>
                  <span className={styles.roundNow} data-round={phase === "waiting" ? 0 : Math.min(round + 1, rounds)}>
                    {phase === "waiting" ? "Finding players" : phase === "done" ? "Battle over" : `Round ${round + 1} of ${rounds}`}
                  </span>
                  <span className={styles.roundCase}>{phase === "waiting" ? `${rounds} round${rounds === 1 ? "" : "s"}` : battle.cases[Math.min(round, rounds - 1)].name}</span>
                  <span className={`${styles.pot} tabular`}>
                    Pot <b data-pot>{money.format(potOf(battle.drops.slice(0, landed)))}</b>
                  </span>
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
                        aria-label={you ? "Your seat" : name ?? "Open seat"}
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
                        <div className={styles.colReel}>
                          {phase === "waiting" ? (
                            <div className={styles.reelWait}>Waiting for the first round</div>
                          ) : (
                            <Reel
                              items={battle.cases[Math.min(round, rounds - 1)].items}
                              winner={battle.drops[Math.min(round, rounds - 1)][seat]}
                              spinning={spinning}
                              fast={fast}
                              seed={battle.nonce * 100 + round * 10 + seat + 1}
                              onDone={seat === 0 ? roundDone : undefined}
                              label={`${name ?? "Seat"}'s reel`}
                            />
                          )}
                        </div>
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
                    <button type="button" className={kit.secondary} onClick={backToLobby} data-back>
                      Back to the lobby
                    </button>
                  </div>
                )}
              </div>
            )}
            <p className={kit.stageNote} aria-live="polite" data-note>
              {note}
            </p>
          </>
        }
      />

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
            "Pick a mode and the cases to fight over, up to eight, or join a battle from the lobby that has a seat free. A seat costs the cases' prices together.",
            "Every seat opens the same case each round, all at once. Each seat's drops stack up under it with their value.",
            "After the last round the seat whose drops are worth the most takes every drop in the battle. In 2v2 the teams are the first two seats and the last two, and the winning pair split the pot. A tie goes to whoever sat down first.",
            "The house's share is in the case prices and nowhere else, and every drop can be checked under Provably fair from the battle's nonce.",
          ]}
          note="Drops are sold to your balance as coins, the site having no inventory yet."
        />
      )}
    </div>
  );
}
