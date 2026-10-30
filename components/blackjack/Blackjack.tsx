"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BetField, FairDialog, History, HowTo, ModeTabs, kit } from "@/components/game/kit";
import { useBet } from "@/components/game/useBet";
import { CoinIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import { saveSettings, useSettings } from "@/components/mines/stores";
import {
  canDouble,
  canSplit,
  deal,
  describe,
  double as doubleHand,
  handValue,
  hit as hitHand,
  insuranceCost,
  insurancePayout,
  insure,
  label,
  perfectPair,
  results,
  shoeFor,
  shoeStart,
  sidePayout,
  split as splitHand,
  stand as standHand,
  SUIT_GLYPH,
  type Card,
  type Game,
  type Result,
} from "@/lib/blackjack";
import { wagered } from "@/lib/gems";
import { recordOutcome } from "@/lib/stats";
import { takeNonce } from "@/lib/seeds";
import { addToBalance } from "@/lib/wallet";
import { sfx, warmSfx } from "./sfx";
import styles from "./Blackjack.module.css";

type Phase = "idle" | "dealing" | "insurance" | "playing" | "dealer" | "done";
type Tab = "standard" | "side";
type Past = { id: number; text: string; won: boolean | null };
type Outcome = { results: { result: Result; payout: number }[]; net: number; insured: number };
type SideResult = { name: string; payout: number };
type State = "win" | "lose" | "push";

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const robux = (n: number) => Math.round(n);
// between the cards of the deal, and between the dealer's cards turning
const DEAL_MS = 250;
const REVEAL_MS = 420;
const HISTORY = 12;
const PAIRS = [
  ["Perfect pair", "same suit", "25 to 1"],
  ["Coloured pair", "same colour", "12 to 1"],
  ["Mixed pair", "any pair", "6 to 1"],
];

const BANNER: Record<Result, string> = { blackjack: "Blackjack", win: "You win", push: "Push", lose: "Dealer wins", bust: "Bust" };
const STATE: Record<Result, State> = { blackjack: "win", win: "win", push: "push", lose: "lose", bust: "lose" };

// The action buttons' icons: a card taken, a hand held up, two ways, two cards.
const ICON = {
  hit: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2.2" />
      <path d="M12 8v7M9 12l3 3 3-3" />
    </svg>
  ),
  stand: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 11.5V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7.5c0 3.6-2.6 6.5-6.2 6.5-2.4 0-4.2-1-5.4-3L5.6 15a1.6 1.6 0 0 1 2.5-2L8 13.5" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 21v-9M12 12 6.5 6.5M6.5 6.5H4M6.5 6.5V4M12 12l5.5-5.5M17.5 6.5H20M17.5 6.5V4" />
    </svg>
  ),
  double: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="8" y="3" width="12" height="16" rx="2.2" />
      <path d="M5 7v12a2 2 0 0 0 2 2h9" />
    </svg>
  ),
};

const SPEAKER = (
  <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

/** A card, face up or down, dealt in after `delay` cards' worth of time. */
function PlayingCard({ card, hidden, delay, flip }: { card: Card; hidden?: boolean; delay: number; flip?: boolean }) {
  const red = card.suit === "H" || card.suit === "D";
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
      {hidden ? (
        <span className={styles.backMark} aria-hidden />
      ) : (
        <>
          <span className={styles.rank}>{card.rank}</span>
          <span className={styles.suit}>{SUIT_GLYPH[card.suit]}</span>
        </>
      )}
    </span>
  );
}

/** A hand's total in a pill, soft ones as "7 / 17", coloured by the outcome. */
function Pill({ cards, hidden, state }: { cards: Card[]; hidden?: boolean; state?: State }) {
  const v = handValue(hidden ? cards.slice(0, 1) : cards);
  const bust = v.total > 21;
  const bj = !hidden && cards.length === 2 && v.total === 21;
  return (
    <span className={`${styles.pill} tabular`} data-total={v.total} data-bust={bust || undefined} data-bj={bj || undefined} data-state={state ?? (bust ? "lose" : undefined)}>
      {bust ? `${v.total} bust` : v.soft && v.total !== 21 ? `${v.total - 10} / ${v.total}` : v.total}
    </span>
  );
}

/**
 * Blackjack against the dealer. A six-deck shoe is shuffled from the
 * shared seeds for every hand and played from the top. Bet takes the
 * stake (and the Perfect Pairs side bet, if any); the dealer showing an
 * ace offers insurance; hit, stand, double or split; then the dealer
 * turns the hole card and draws to 17. See lib/blackjack.ts for the rules.
 */
export default function Blackjack() {
  const bet = useBet("5000");
  const settings = useSettings();
  const [tab, setTab] = useState<Tab>("standard");
  const [sideText, setSideText] = useState("0");
  const [phase, setPhase] = useState<Phase>("idle");
  const [game, setGame] = useState<Game | null>(null);
  const [handNo, setHandNo] = useState(0);
  const [dealerShown, setDealerShown] = useState(1);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [side, setSide] = useState<SideResult | null>(null);
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
  const busy = phase !== "idle" && phase !== "done";
  const sideBet = (() => {
    const n = Number(sideText);
    return Number.isFinite(n) && n > 0 ? robux(n) : 0;
  })();
  const stake = robux(bet.bet + sideBet);
  const short = stake > bet.balance;
  const canDeal = !busy && bet.ok && !short;

  const commit = (g: Game) => {
    live.current = g;
    setGame(g);
  };

  // ---- The hand's end: the hole card turns, each draw follows, then it pays ------------------

  const settle = (g: Game) => {
    const rs = results(g);
    const insured = insurancePayout(g);
    const payout = robux(rs.reduce((s, r) => s + r.payout, 0) + insured);
    const staked = robux(g.hands.reduce((s, h) => s + h.bet, 0) + g.insurance);
    if (payout > 0) addToBalance(payout);
    const net = robux(payout - staked);
    recordOutcome(net);
    setOutcome({ results: rs, net, insured });
    setPhase("done");
    const won = net > 0 ? true : net < 0 ? false : null;
    if (won) sfx("win");
    const id = ++pastId.current;
    setHistory((h) => [{ id, text: won === null ? "Push" : `${net > 0 ? "+" : "−"}${money.format(Math.abs(net))}`, won }, ...h].slice(0, HISTORY));
    const words =
      rs.length === 1
        ? won === null
          ? "A push: your bet comes back."
          : won
            ? `${BANNER[rs[0].result]}: ${money.format(payout)} to your balance.`
            : `${BANNER[rs[0].result]}.`
        : `${rs.map((r) => BANNER[r.result]).join(" and ")}: ${net >= 0 ? "+" : "−"}${money.format(Math.abs(net))}.`;
    setNote(insured > 0 ? `${words} Insurance paid ${money.format(insured)}.` : g.insurance > 0 ? `${words} Insurance lost.` : words);
  };

  const runDealer = (g: Game) => {
    setPhase("dealer");
    later(() => {
      setDealerShown(2);
      sfx("flip");
    }, 350);
    const extra = g.dealer.length - 2;
    for (let i = 0; i < extra; i++) {
      later(() => {
        setDealerShown(3 + i);
        sfx("deal");
      }, 350 + REVEAL_MS * (i + 1));
    }
    later(() => settle(g), 350 + REVEAL_MS * extra + 450);
  };

  // ---- The deal, insurance, and the player's turn -------------------------------------------

  const onDeal = () => {
    if (!canDeal) return;
    warmSfx();
    const s = takeNonce();
    const shoe = shoeFor(s.serverSeed, s.clientSeed, s.nonce);
    addToBalance(-stake);
    wagered(stake);
    const g = deal(shoe, bet.bet);
    commit(g);
    setHandNo((n) => n + 1);
    setOutcome(null);
    setNote("");
    setDealerShown(1);
    setPhase("dealing");
    for (let j = 0; j < 4; j++) later(() => sfx("deal"), DEAL_MS * j);
    // the side bet settles on the first two cards, as the deal lands
    if (sideBet > 0) {
      const pair = perfectPair(g.hands[0].cards);
      const payout = sidePayout(sideBet, g.hands[0].cards);
      setSide(null);
      later(() => {
        setSide(pair ? { name: pair.name, payout } : { name: "No pair", payout: 0 });
        if (payout > 0) addToBalance(payout);
        recordOutcome(robux(payout - sideBet));
      }, DEAL_MS * 3);
    } else {
      setSide(null);
    }
    later(() => (g.phase === "done" ? runDealer(g) : setPhase(g.phase === "insurance" ? "insurance" : "playing")), DEAL_MS * 4 + 150);
  };

  const onInsure = (take: boolean) => {
    const g = live.current;
    if (phase !== "insurance" || !g) return;
    const cost = insuranceCost(g);
    if (take) {
      if (bet.balance < cost) {
        setNote("Not enough balance for insurance.");
        return;
      }
      addToBalance(-cost);
      wagered(cost);
    }
    const next = insure(g, take);
    commit(next);
    if (next.phase === "done") runDealer(next);
    else setPhase("playing");
  };

  const after = (g: Game) => {
    commit(g);
    if (g.phase === "done") runDealer(g);
  };

  const onHit = () => {
    if (!playing || !live.current) return;
    sfx("deal");
    after(hitHand(live.current));
  };
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
    sfx("deal");
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
    sfx("deal");
    later(() => sfx("deal"), DEAL_MS);
    after(splitHand(g));
  };

  const mayDouble = playing && !!game && canDouble(game) && bet.balance >= game.hands[game.active].bet;
  const maySplit = playing && !!game && canSplit(game) && bet.balance >= game.hands[0].bet;
  const holeHidden = dealerShown < 2;
  const dealerCards = game ? game.dealer.slice(0, Math.max(2, dealerShown)) : [];
  const onTable = !!game && phase !== "idle";
  const handState = (i: number): State | undefined => (outcome ? STATE[outcome.results[i].result] : undefined);
  // the dealer's pill: red when they bust, green when they take the hand
  const dealerState: State | undefined = outcome
    ? handValue(dealerCards).total > 21
      ? "lose"
      : outcome.results.every((r) => STATE[r.result] === "lose")
        ? "win"
        : undefined
    : undefined;

  // ---- The table -----------------------------------------------------------------------

  const insurancePrompt = phase === "insurance" && game && (
    <div className={styles.offer} role="group" aria-label="Insurance" data-insurance>
      <span className={styles.offerTitle}>Insurance?</span>
      <span className={styles.offerText}>The dealer shows an ace. It costs {money.format(insuranceCost(game))} and pays 2 to 1 if they have blackjack.</span>
      <span className={styles.offerButtons}>
        <button type="button" className={kit.secondary} disabled={bet.balance < insuranceCost(game)} onClick={() => onInsure(true)} data-insure-yes>
          Take it
        </button>
        <button type="button" className={kit.primary} onClick={() => onInsure(false)} data-insure-no>
          No thanks
        </button>
      </span>
    </div>
  );

  const stage = (
    <>
      <div className={styles.topRow}>
        <div className={styles.historyWrap}>
          <History items={history} label="Last hands" />
        </div>
      </div>

      <div className={styles.table} data-table>
        <section className={styles.seat} aria-label="Dealer">
          {onTable && <Pill cards={dealerCards} hidden={holeHidden} state={dealerState} />}
          <div className={styles.cards} data-dealer-hand data-row="dealer">
            {onTable &&
              dealerCards.map((c, j) => <PlayingCard key={`${handNo}-d${j}`} card={c} hidden={j === 1 && holeHidden} delay={j < 2 ? j * 2 + 1 : 0} flip={j === 1 && !holeHidden} />)}
          </div>
        </section>

        <div className={styles.middle}>
          {insurancePrompt || (
            <div className={styles.ribbons} data-ribbons>
              <span className={styles.ribbon}>Blackjack pays 3 to 2</span>
              <span className={styles.ribbon}>Insurance pays 2 to 1</span>
            </div>
          )}
        </div>

        <section className={styles.seat} aria-label="Your hands">
          <div className={styles.hands}>
            {onTable ? (
              game!.hands.map((h, i) => (
                <div
                  key={`${handNo}-h${i}`}
                  className={styles.hand}
                  data-player-hand
                  data-hand={i}
                  data-active={playing && game!.active === i ? "" : undefined}
                  data-won={handState(i) === "win" ? "" : undefined}
                >
                  <div className={styles.cards} data-row="player">
                    {h.cards.map((c, j) => (
                      <PlayingCard key={`${handNo}-${i}-${j}`} card={c} delay={!h.split && i === 0 && j < 2 ? j * 2 : 0} />
                    ))}
                  </div>
                  <div className={styles.under}>
                    <Pill cards={h.cards} state={handState(i)} />
                    <span className={`${styles.stake} tabular`}>
                      <CoinIcon />
                      {money.format(h.bet)}
                    </span>
                    {outcome && (
                      <span
                        className={`${styles.result} tabular`}
                        role="status"
                        data-state={STATE[outcome.results[i].result]}
                        {...(i === 0 ? { "data-outcome": "", "data-result": outcome.results.length === 1 ? outcome.results[0].result : outcome.net > 0 ? "win" : outcome.net < 0 ? "lose" : "push" } : {})}
                      >
                        {BANNER[outcome.results[i].result]}
                        {outcome.results.length === 1 && outcome.net !== 0 ? ` ${outcome.net > 0 ? "+" : "−"}${money.format(Math.abs(outcome.net))}` : ""}
                      </span>
                    )}
                    {i === 0 && side && (
                      <span className={`${styles.sideResult} tabular`} data-side-result={side.payout > 0 ? "win" : "lose"}>
                        {side.name}
                        {side.payout > 0 ? ` +${money.format(side.payout)}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.hand}>
                <div className={styles.cards} data-row="player" />
              </div>
            )}
          </div>
        </section>
      </div>
      <p className={kit.stageNote} aria-live="polite" data-note>
        {note}
      </p>
    </>
  );

  // ---- The controls ----------------------------------------------------------------------

  const action = (key: keyof typeof ICON, text: string, on: () => void, enabled: boolean, attr: string) => (
    <button type="button" className={styles.action} disabled={!enabled} onClick={on} data-action={key} {...{ [attr]: "" }}>
      <span>{text}</span>
      <span className={styles.actionIcon} data-icon={key}>
        {ICON[key]}
      </span>
    </button>
  );

  const controls = (
    <>
      <ModeTabs
        modes={[
          ["standard", "Standard"],
          ["side", "Side bet"],
        ]}
        mode={tab}
        onChange={setTab}
        disabled={busy}
      />
      <BetField bet={bet} disabled={busy} max={false} />
      {tab === "side" && (
        <>
          <label className={kit.field}>
            <span className={kit.fieldHead}>
              <span className={kit.fieldLabel}>Perfect pairs</span>
              <span className={kit.fieldMax}>on your first two cards</span>
            </span>
            <span className={kit.betRow}>
              <CoinIcon className={kit.betCoin} />
              <input
                className={kit.betInput}
                inputMode="decimal"
                value={sideText}
                disabled={busy}
                onChange={(e) => setSideText(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setSideText(String(sideBet))}
                aria-label="Perfect pairs side bet"
                data-side-bet
              />
              <button type="button" className={kit.betStep} disabled={busy} onClick={() => setSideText(String(robux(sideBet / 2)))}>
                ½
              </button>
              <button type="button" className={kit.betStep} disabled={busy} onClick={() => setSideText(String(robux(Math.max(50, sideBet * 2))))}>
                2×
              </button>
            </span>
          </label>
          <ul className={styles.pairs} aria-label="Perfect pairs pays">
            {PAIRS.map(([name, how, pays]) => (
              <li key={name}>
                <span>
                  {name} <small>{how}</small>
                </span>
                <b className="tabular">{pays}</b>
              </li>
            ))}
          </ul>
        </>
      )}
      {short && !busy && (
        <p className={kit.fieldHint} data-short>
          Not enough balance for the bet and the side bet
        </p>
      )}

      <div className={styles.actions}>
        {action("hit", "Hit", onHit, playing, "data-hit")}
        {action("stand", "Stand", onStand, playing, "data-stand")}
        {action("split", "Split", onSplit, maySplit, "data-split")}
        {action("double", "Double", onDouble, mayDouble, "data-double")}
      </div>

      <button type="button" className={kit.primary} disabled={!canDeal} onClick={onDeal} data-deal>
        {phase === "dealing" ? "Dealing…" : phase === "dealer" ? "Dealer's turn…" : busy ? "Hand in play" : "Bet"}
      </button>
    </>
  );

  return (
    <>
      <div className={kit.wrap} data-blackjack data-phase={phase}>
        <div className={`${kit.game} ${styles.frame}`}>
          <aside className={kit.controls} aria-label="Bet" data-controls>
            {controls}
          </aside>
          <div className={`${kit.stage} ${styles.stage}`} data-stage>
            {stage}
          </div>
          <div className={styles.bar}>
            <span className={styles.barGroup}>
              <button type="button" className={styles.barButton} onClick={() => setDialog("how")} data-how-to>
                <InfoIcon />
                How to play
              </button>
              <button
                type="button"
                className={styles.barButton}
                aria-pressed={settings.sound}
                aria-label={settings.sound ? "Sound on" : "Sound off"}
                title={settings.sound ? "Sound on" : "Sound off"}
                onClick={() => saveSettings({ ...settings, sound: !settings.sound })}
                data-sound-toggle
              >
                {SPEAKER}
                {settings.sound ? "Sound" : "Muted"}
              </button>
            </span>
            <span className={styles.barRules}>Dealer stands on 17 · 6 decks · one split</span>
            <button type="button" className={styles.barButton} onClick={() => setDialog("fair")} data-fairness>
              <ShieldIcon />
              Provably fair
            </button>
          </div>
        </div>
      </div>
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
            "Set your bet (and, under Side bet, a Perfect Pairs stake on your first two cards) and press Bet. You and the dealer get two cards each; the dealer's second stays face down.",
            "Get closer to 21 than the dealer without going over. Hit for another card, stand to stop, double your bet for exactly one more card, or split a pair into two hands.",
            "If the dealer shows an ace you can take insurance for half your bet; it pays 2 to 1 when the dealer has blackjack, and is lost otherwise.",
            "The dealer then turns the hole card and draws to 17, standing on every 17. Blackjack pays 3 to 2, a win pays even money, a tie is a push and your bet comes back.",
          ]}
          note="Here the house's edge comes from the rules of the game, as at any table, not from a cut of the payout. A fresh six-deck shoe is shuffled from the seeds for every hand."
        />
      )}
    </>
  );
}
