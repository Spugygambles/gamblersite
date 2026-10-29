"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BetField, FairDialog, GameFrame, History, HowTo, Readout, Tools, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CoinIcon } from "@/components/home/icons";
import {
  canDouble,
  canSplit,
  cardsLeft,
  deal,
  describe,
  double as doubleHand,
  handValue,
  hit as hitHand,
  label,
  results,
  shoeFor,
  shoeStart,
  split as splitHand,
  stand as standHand,
  SUIT_GLYPH,
  type Card,
  type Game,
  type Result,
} from "@/lib/blackjack";
import { wagered } from "@/lib/gems";
import { takeNonce } from "@/lib/seeds";
import { addToBalance } from "@/lib/wallet";
import styles from "./Blackjack.module.css";

type Phase = "idle" | "dealing" | "playing" | "dealer" | "done";
type Past = { id: number; text: string; won: boolean | null };
type Outcome = { results: { result: Result; payout: number }[]; net: number };

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// between the cards of the deal, and between the dealer's cards turning
const DEAL_MS = 250;
const REVEAL_MS = 420;
const HISTORY = 12;

const BANNER: Record<Result, string> = { blackjack: "Blackjack!", win: "You win", push: "Push", lose: "Dealer wins", bust: "Bust" };

/** A card, face up or down, dealt in after `delay` cards' worth of time. */
function PlayingCard({ card, hidden, delay, flip }: { card: Card; hidden?: boolean; delay: number; flip?: boolean }) {
  const red = card.suit === "H" || card.suit === "D";
  const glyph = SUIT_GLYPH[card.suit];
  return (
    <span
      className={`${styles.card} ${flip ? styles.flip : ""}`}
      style={{ "--d": delay } as CSSProperties}
      role="img"
      aria-label={hidden ? "A card face down" : describe(card)}
      data-card={hidden ? undefined : label(card)}
      data-hidden={hidden || undefined}
      data-red={red || undefined}
      data-back={hidden || undefined}
    >
      {!hidden && (
        <>
          <span className={styles.corner}>
            {card.rank}
            <small>{glyph}</small>
          </span>
          <span className={styles.pip}>{glyph}</span>
          <span className={`${styles.corner} ${styles.cornerBottom}`}>
            {card.rank}
            <small>{glyph}</small>
          </span>
        </>
      )}
    </span>
  );
}

/** A hand's total, soft ones as "7 / 17". */
function Total({ cards, hidden }: { cards: Card[]; hidden?: boolean }) {
  const v = handValue(hidden ? cards.slice(0, 1) : cards);
  const bust = v.total > 21;
  const bj = !hidden && cards.length === 2 && v.total === 21;
  return (
    <span className={`${styles.total} tabular`} data-total={v.total} data-bust={bust || undefined} data-bj={bj || undefined}>
      {bust ? `${v.total} bust` : v.soft && v.total !== 21 ? `${v.total - 10} / ${v.total}` : v.total}
    </span>
  );
}

/**
 * Blackjack against the dealer. A six-deck shoe is shuffled from the
 * shared seeds for every hand and played from the top. Deal takes the
 * bet; hit, stand, double or split; then the dealer turns the hole card
 * and draws to 17. See lib/blackjack.ts for the rules.
 */
export default function Blackjack() {
  const bet = useBet("10.00");
  const [phase, setPhase] = useState<Phase>("idle");
  const [game, setGame] = useState<Game | null>(null);
  const [handNo, setHandNo] = useState(0);
  const [dealerShown, setDealerShown] = useState(1);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const [dialog, setDialog] = useState<"fair" | "how" | null>(null);
  const [note, setNote] = useState("");
  const live = useRef<Game | null>(null);
  const timers = useRef<number[]>([]);
  const pastId = useRef(0);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const playing = phase === "playing";
  const busy = phase === "dealing" || phase === "dealer" || playing;
  const inPlay = game && busy ? game.hands.reduce((s, h) => s + h.bet, 0) : 0;

  const commit = (g: Game) => {
    live.current = g;
    setGame(g);
  };

  // ---- The hand's end: the hole card turns, each draw follows, then it pays ------------------

  const settle = (g: Game) => {
    const rs = results(g);
    const payout = rs.reduce((s, r) => s + r.payout, 0);
    const staked = g.hands.reduce((s, h) => s + h.bet, 0);
    if (payout > 0) addToBalance(payout);
    const net = Math.round((payout - staked) * 100) / 100;
    setOutcome({ results: rs, net });
    setPhase("done");
    const won = net > 0 ? true : net < 0 ? false : null;
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: won === null ? "Push" : `${net > 0 ? "+" : "−"}${money.format(Math.abs(net))}`, won }, ...h].slice(0, HISTORY));
    setNote(
      rs.length === 1
        ? won === null
          ? "A push: your bet comes back."
          : won
            ? `${BANNER[rs[0].result]}: ${money.format(payout)} to your balance.`
            : `${BANNER[rs[0].result]}.`
        : `${rs.map((r) => BANNER[r.result]).join(" and ")}: ${net >= 0 ? "+" : "−"}${money.format(Math.abs(net))}.`,
    );
  };

  const runDealer = (g: Game) => {
    setPhase("dealer");
    later(() => setDealerShown(2), 350);
    const extra = g.dealer.length - 2;
    for (let i = 0; i < extra; i++) later(() => setDealerShown(3 + i), 350 + REVEAL_MS * (i + 1));
    later(() => settle(g), 350 + REVEAL_MS * extra + 450);
  };

  // ---- The player's turn ---------------------------------------------------------------

  const onDeal = () => {
    if (!bet.ok || busy) return;
    const s = takeNonce();
    const shoe = shoeFor(s.serverSeed, s.clientSeed, s.nonce);
    addToBalance(-bet.bet);
    wagered(bet.bet);
    const g = deal(shoe, bet.bet);
    commit(g);
    setHandNo((n) => n + 1);
    setOutcome(null);
    setNote("");
    setDealerShown(1);
    setPhase("dealing");
    later(() => (g.phase === "done" ? runDealer(g) : setPhase("playing")), DEAL_MS * 4 + 150);
  };

  const after = (g: Game) => {
    commit(g);
    if (g.phase === "done") runDealer(g);
  };

  const onHit = () => playing && live.current && after(hitHand(live.current));
  const onStand = () => playing && live.current && after(standHand(live.current));

  const onDouble = () => {
    const g = live.current;
    if (!playing || !g || !canDouble(g)) return;
    const h = g.hands[g.active];
    if (bet.balance < h.bet) {
      setNote("Not enough balance to double.");
      return;
    }
    addToBalance(-h.bet);
    wagered(h.bet);
    after(doubleHand(g));
  };

  const onSplit = () => {
    const g = live.current;
    if (!playing || !g || !canSplit(g)) return;
    const h = g.hands[0];
    if (bet.balance < h.bet) {
      setNote("Not enough balance to split.");
      return;
    }
    addToBalance(-h.bet);
    wagered(h.bet);
    after(splitHand(g));
  };

  const mayDouble = playing && !!game && canDouble(game) && bet.balance >= game.hands[game.active].bet;
  const maySplit = playing && !!game && canSplit(game) && bet.balance >= game.hands[0].bet;
  const holeHidden = dealerShown < 2;
  const dealerCards = game ? game.dealer.slice(0, Math.max(2, dealerShown)) : [];

  // ---- The table -----------------------------------------------------------------------

  const banner = outcome && (
    <div className={styles.banner} role="status" data-outcome data-result={outcome.results.length === 1 ? outcome.results[0].result : outcome.net > 0 ? "win" : outcome.net < 0 ? "lose" : "push"}>
      <span className={styles.bannerText}>{outcome.results.length === 1 ? BANNER[outcome.results[0].result] : outcome.net > 0 ? "You win" : outcome.net < 0 ? "Dealer wins" : "Push"}</span>
      <span className={`${styles.bannerPay} tabular`}>
        {outcome.net === 0 ? "Bet returned" : `${outcome.net > 0 ? "+" : "−"}${money.format(Math.abs(outcome.net))}`}
      </span>
    </div>
  );

  const stage = (
    <>
      <History items={history} label="Last hands" />
      <div className={styles.table} data-table>
        <section className={styles.seat} aria-label="Dealer">
          <div className={styles.seatHead}>
            <span>Dealer</span>
            {game && phase !== "idle" && <Total cards={dealerCards} hidden={holeHidden} />}
          </div>
          <div className={styles.cards} data-dealer-hand>
            {dealerCards.map((c, j) => (
              <PlayingCard key={`${handNo}-d${j}`} card={c} hidden={j === 1 && holeHidden} delay={j < 2 ? j * 2 + 1 : 0} flip={j === 1 && !holeHidden && phase !== "idle"} />
            ))}
            {phase === "idle" && <span className={styles.empty}>Place a bet and deal</span>}
          </div>
        </section>

        <div className={styles.middle}>{banner}</div>

        <section className={styles.seat} aria-label="Your hands">
          <div className={styles.hands}>
            {(game && phase !== "idle" ? game.hands : []).map((h, i) => (
              <div key={`${handNo}-h${i}`} className={styles.hand} data-player-hand data-hand={i} data-active={playing && game!.active === i ? "" : undefined}>
                <div className={styles.cards}>
                  {h.cards.map((c, j) => (
                    <PlayingCard key={`${handNo}-${i}-${j}`} card={c} delay={!h.split && i === 0 && j < 2 ? j * 2 : 0} />
                  ))}
                </div>
                <div className={styles.seatHead}>
                  <span>{game!.hands.length > 1 ? `Hand ${i + 1}` : "You"}</span>
                  <Total cards={h.cards} />
                  <span className={`${styles.stake} tabular`}>
                    <CoinIcon />
                    {money.format(h.bet)}
                  </span>
                  {outcome && game!.hands.length > 1 && <span className={styles.handResult}>{BANNER[outcome.results[i].result]}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </>
  );

  const controls = (
    <>
      <BetField bet={bet} disabled={busy} />
      <div className={kit.readouts}>
        <Readout label="In play" value={<><CoinIcon />{money.format(inPlay)}</>} attr="data-in-play" />
        <Readout label="Cards left in the shoe" value={game ? cardsLeft(game) : 312} attr="data-shoe-left" />
      </div>
      {playing ? (
        <div className={styles.actions}>
          <button type="button" className={kit.primary} onClick={onHit} data-hit>
            Hit
          </button>
          <button type="button" className={kit.secondary} onClick={onStand} data-stand>
            Stand
          </button>
          <button type="button" className={kit.secondary} disabled={!mayDouble} onClick={onDouble} data-double>
            Double
          </button>
          <button type="button" className={kit.secondary} disabled={!maySplit} onClick={onSplit} data-split>
            Split
          </button>
        </div>
      ) : (
        <button type="button" className={kit.primary} disabled={!bet.ok || busy} onClick={onDeal} data-deal>
          {phase === "dealing" ? "Dealing…" : phase === "dealer" ? "Dealer's turn…" : "Deal"}
        </button>
      )}
      <Tools onFair={() => setDialog("fair")} onHow={() => setDialog("how")} />
    </>
  );

  return (
    <>
      <GameFrame controls={controls} stage={stage} attrs={{ "data-blackjack": "", "data-phase": phase }} />
      {dialog === "fair" && (
        <FairDialog
          onClose={() => setDialog(null)}
          busy={busy}
          intro="Each hand's six-deck shoe is shuffled from the draws, and the hand is dealt from its top."
          verify={(server, client, nonce) => `Shoe starts ${shoeStart(server, client, nonce)}`}
        />
      )}
      {dialog === "how" && (
        <HowTo
          title="How to play Blackjack"
          onClose={() => setDialog(null)}
          steps={[
            "Place a bet and deal. You and the dealer get two cards each; the dealer's second stays face down.",
            "Get closer to 21 than the dealer without going over. Hit for another card, stand to stop, double your bet for exactly one more card, or split a pair into two hands.",
            "The dealer then turns the hole card and draws to 17, standing on every 17.",
            "Blackjack (an ace and a ten on the first two cards) pays 3 to 2, a win pays even money, a tie is a push and your bet comes back.",
          ]}
          note="Here the house's edge comes from the rules of the game, as at any table, not from a cut of the payout. A fresh six-deck shoe is shuffled from the seeds for every hand."
        />
      )}
    </>
  );
}
