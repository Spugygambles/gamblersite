"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BetField, Choices, FairDialog, GameFrame, History, HowTo, Readout, Tools, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CoinIcon } from "@/components/home/icons";
import { wagered } from "@/lib/gems";
import { BET_PLAYERS } from "@/lib/home";
import { takeNonce } from "@/lib/seeds";
import { addToBalance } from "@/lib/wallet";
import { recordOutcome } from "@/lib/stats";
import { SAMPLE_FLIPS, SIDE_IMAGE, SIDE_NAME, SIDES, flipOf, money, other, payoutOf, sampleFlip, type LobbyFlip, type Side } from "@/lib/coinflip";
import styles from "./Coinflip.module.css";

type Phase = "lobby" | "waiting" | "flipping" | "done";
type Match = { id: number; mine: Side; theirs: Side; opponent: string; amount: number; result: Side; won: boolean; nonce: number };
type Past = { id: number; text: string; won: boolean };

// the coin's turn, and the pauses either side of it
const FLIP_MS = 2400;
const FAST_MS = 800;
const JOIN_MS = 1500;
const SHOW_MS = 3600;
const HISTORY = 12;

/**
 * Coinflip, the way CS2 sites do it: a lobby of open flips to join, or
 * your own flip for someone (here, one of the site's sample players) to
 * take the other side of. The coin turns and lands on the face the draw
 * decided; the winner takes the pot less the house's share.
 */
export default function Coinflip() {
  const bet = useBet("10.00");
  const [side, setSide] = useState<Side>("heads");
  const [fast, setFast] = useState(false);
  const [lobby, setLobby] = useState<LobbyFlip[]>(SAMPLE_FLIPS);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [match, setMatch] = useState<Match | null>(null);
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState<Past[]>([]);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const timers = useRef<number[]>([]);
  const samples = useRef(SAMPLE_FLIPS.length);
  const pastId = useRef(0);
  const matchId = useRef(0);

  const busy = phase !== "lobby";
  const flipMs = fast ? FAST_MS : FLIP_MS;

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  // ---- A flip, from the draw to the result ------------------------------------------------

  // Turns the coin on from where it is: a few full turns, then the face up.
  const spinTo = (result: Side) => {
    const face = result === "heads" ? 0 : 180;
    const turns = fast ? 2 : 5;
    setTurn((t) => t + ((((face - t) % 360) + 360) % 360) + turns * 360);
  };

  const settle = (m: Match) => {
    if (m.won) addToBalance(payoutOf(m.amount));
    recordOutcome(m.won ? Math.round((payoutOf(m.amount) - m.amount) * 100) / 100 : -m.amount);
    setPhase("done");
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: `${SIDE_NAME[m.result][0]} ${m.won ? "+" : "−"}${money.format(m.won ? payoutOf(m.amount) - m.amount : m.amount)}`, won: m.won }, ...h].slice(0, HISTORY));
    setNote(m.won ? `${SIDE_NAME[m.result]}: you take ${money.format(payoutOf(m.amount))}` : `${SIDE_NAME[m.result]}: ${m.opponent} takes the pot`);
    later(backToLobby, SHOW_MS);
  };

  const fly = (m: Match) => {
    setPhase("flipping");
    spinTo(m.result);
    later(() => settle(m), flipMs + 150);
  };

  const backToLobby = () => {
    setPhase("lobby");
    setMatch(null);
  };

  // Your own flip: the stake goes up, a player takes the other side, the coin turns.
  const create = () => {
    if (busy || !bet.ok) return;
    const s = takeNonce();
    const result = flipOf(s.serverSeed, s.clientSeed, s.nonce);
    const opponent = BET_PLAYERS[(s.nonce * 7 + 3) % BET_PLAYERS.length];
    addToBalance(-bet.bet);
    wagered(bet.bet);
    const m: Match = { id: ++matchId.current, mine: side, theirs: other(side), opponent, amount: bet.bet, result, won: result === side, nonce: s.nonce };
    setMatch(m);
    setPhase("waiting");
    setNote("");
    later(() => fly(m), JOIN_MS);
  };

  // Someone's flip: you take the other side at their amount.
  const join = (f: LobbyFlip) => {
    if (busy) return;
    if (f.amount > bet.balance) {
      setNote(`You need ${money.format(f.amount)} to join ${f.player}`);
      return;
    }
    const s = takeNonce();
    const result = flipOf(s.serverSeed, s.clientSeed, s.nonce);
    addToBalance(-f.amount);
    wagered(f.amount);
    const mine = other(f.side);
    const m: Match = { id: ++matchId.current, mine, theirs: f.side, opponent: f.player, amount: f.amount, result, won: result === mine, nonce: s.nonce };
    // the flip leaves the lobby and another sample takes its place
    setLobby((l) => [...l.filter((x) => x.id !== f.id), sampleFlip(samples.current++)]);
    setMatch(m);
    setNote("");
    fly(m);
  };

  const verify = (server: string, client: string, nonce: number) => `Landed ${SIDE_NAME[flipOf(server, client, nonce)].toLowerCase()}`;

  // ---- The controls --------------------------------------------------------------------

  const controls = (
    <>
      <Choices
        label="Your side"
        options={SIDES.map((s) => ({
          value: s,
          label: (
            <span className={styles.sideChoice}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.sideCoin} src={SIDE_IMAGE[s]} alt="" width={18} height={18} />
              {SIDE_NAME[s]}
            </span>
          ),
        }))}
        value={side}
        onChange={setSide}
        disabled={busy}
        attr="data-side"
      />
      <BetField bet={bet} disabled={busy} />
      <div className={kit.readouts}>
        <Readout label="You'd win" value={<><CoinIcon />{money.format(payoutOf(bet.bet))}</>} attr="data-payout" />
      </div>
      <div className={kit.go}>
        <button type="button" className={kit.primary} disabled={busy || !bet.ok} onClick={create} data-create>
          {phase === "waiting" ? "Waiting for a player…" : phase === "flipping" ? "Flipping…" : "Create flip"}
        </button>
        <button type="button" className={kit.iconButton} aria-pressed={fast} aria-label="Fast flip" title="Fast flip" onClick={() => setFast(!fast)} data-fast>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
          </svg>
        </button>
      </div>
      <p className={kit.autoHint}>Or join a flip in the lobby: you take the other side at their amount.</p>
      <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
    </>
  );

  // ---- The stage ------------------------------------------------------------------------

  const lobbyView = (
    <div className={styles.lobby} data-lobby>
      <div className={styles.lobbyHead}>
        <h2 className={styles.lobbyTitle}>Open flips</h2>
        <span className={styles.lobbyCount}>{lobby.length + (phase === "waiting" ? 1 : 0)} waiting</span>
      </div>
      <ul className={styles.flips}>
        {phase === "waiting" && match && (
          <li className={styles.flip} data-flip="mine" data-mine>
            <span className={`${styles.avatar}`} data-you>
              Y
            </span>
            <span className={styles.who}>
              <span className={styles.name}>You</span>
              <span className={styles.waiting}>Waiting for a player…</span>
            </span>
            <span className={styles.called}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIDE_IMAGE[match.mine]} alt="" width={20} height={20} />
              {SIDE_NAME[match.mine]}
            </span>
            <span className={`${styles.amount} tabular`}>
              <CoinIcon />
              {money.format(match.amount)}
            </span>
            <span />
          </li>
        )}
        {lobby.map((f) => (
          <li key={f.id} className={styles.flip} data-flip={f.id}>
            <span className={styles.avatar}>{f.player[0]}</span>
            <span className={styles.who}>
              <span className={styles.name}>{f.player}</span>
              <span className={styles.waiting}>Waiting for a player…</span>
            </span>
            <span className={styles.called}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIDE_IMAGE[f.side]} alt="" width={20} height={20} />
              {SIDE_NAME[f.side]}
            </span>
            <span className={`${styles.amount} tabular`}>
              <CoinIcon />
              {money.format(f.amount)}
            </span>
            <button type="button" className={styles.join} disabled={busy} onClick={() => join(f)} data-join title={`Take ${SIDE_NAME[other(f.side)]} for ${money.format(f.amount)}`}>
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const arena = match && (
    <div className={styles.arena} data-arena>
      <div className={styles.player} data-winner={phase === "done" && match.won ? "" : undefined} data-loser={phase === "done" && !match.won ? "" : undefined}>
        <span className={`${styles.avatar} ${styles.playerAvatar}`} data-you>
          Y
        </span>
        <span className={styles.playerName}>You</span>
        <span className={styles.playerSide}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SIDE_IMAGE[match.mine]} alt="" width={18} height={18} />
          {SIDE_NAME[match.mine]}
        </span>
        <span className={`${styles.pot} tabular`}>
          <CoinIcon />
          {money.format(match.amount)}
        </span>
      </div>
      <div className={styles.coinBox}>
        <div className={styles.hop} style={{ "--flip-ms": `${flipMs}ms` } as CSSProperties} data-flying={phase === "flipping" ? "" : undefined}>
          <div className={styles.coin} style={{ "--turn": `${turn}deg`, "--flip-ms": `${flipMs}ms` } as CSSProperties} data-coin data-landed={phase === "done" ? match.result : undefined}>
            <span className={styles.face}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIDE_IMAGE.heads} alt="" width={200} height={200} />
            </span>
            <span className={`${styles.face} ${styles.faceBack}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIDE_IMAGE.tails} alt="" width={200} height={200} />
            </span>
          </div>
        </div>
      </div>
      <div className={styles.player} data-winner={phase === "done" && !match.won ? "" : undefined} data-loser={phase === "done" && match.won ? "" : undefined}>
        <span className={`${styles.avatar} ${styles.playerAvatar}`}>{match.opponent[0]}</span>
        <span className={styles.playerName}>{match.opponent}</span>
        <span className={styles.playerSide}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SIDE_IMAGE[match.theirs]} alt="" width={18} height={18} />
          {SIDE_NAME[match.theirs]}
        </span>
        <span className={`${styles.pot} tabular`}>
          <CoinIcon />
          {money.format(match.amount)}
        </span>
      </div>
    </div>
  );

  const stage = (
    <>
      <History items={history} label="Last flips" />
      {phase === "flipping" || phase === "done" ? arena : lobbyView}
      <div className={styles.arenaFoot}>
        {phase === "done" && match && (
          <div className={styles.result} data-result={match.won ? "won" : "lost"} data-lost={match.won ? undefined : ""}>
            <span className={styles.resultBig}>{match.won ? "You won" : `${match.opponent} won`}</span>
            <span className={`${styles.resultSub} tabular`}>{SIDE_NAME[match.result]} · {match.won ? `+${money.format(payoutOf(match.amount))}` : `−${money.format(match.amount)}`}</span>
            <button type="button" className={styles.again} onClick={backToLobby} data-again>
              Back to the lobby
            </button>
          </div>
        )}
        <p className={kit.stageNote} aria-live="polite" data-note>
          {note}
        </p>
      </div>
    </>
  );

  return (
    <>
      <GameFrame controls={controls} stage={stage} attrs={{ "data-coinflip": "", "data-phase": phase }} />
      {dialog === "fair" && (
        <FairDialog onClose={() => setDialog(null)} busy={busy} intro="One draw decides the face the coin lands on: under a half is gold, a half or over is silver." verify={verify} />
      )}
      {dialog === "how" && (
        <HowTo
          title="How Coinflip works"
          steps={[
            "Pick gold or silver and your stake, then create a flip. A player takes the other side at the same stake.",
            "Or join an open flip from the lobby: you get whichever side its maker didn't, at their stake.",
            "The coin turns and lands on one face. Whoever called it takes the pot.",
          ]}
          note="The house keeps 10% of the pot, so a win pays 1.8× your stake."
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
