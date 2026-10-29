import { shuffle } from "./fair";

/*
 * Blackjack: a six-deck shoe shuffled from the seeds for each hand, the
 * hand played from the top of it in order. Standard rules: the dealer
 * draws to 17 and stands on every 17, blackjack pays 3 to 2, a win pays
 * even money, a push gives the bet back, the dealer's blackjack beats
 * everything but the player's (a push). Double on the first two cards,
 * one split of a pair (split aces take one card each). The functions
 * here never change the game they're given; each hands back a new one.
 */

export type Suit = "S" | "H" | "D" | "C";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type Card = { rank: Rank; suit: Suit };

export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS: Suit[] = ["S", "H", "D", "C"];
export const SUIT_GLYPH: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
export const SUIT_NAME: Record<Suit, string> = { S: "spades", H: "hearts", D: "diamonds", C: "clubs" };
export const DECKS = 6;

const ONE_DECK: Card[] = SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
export const FRESH_SHOE: Card[] = Array.from({ length: DECKS }, () => ONE_DECK).flat();

/** The shoe for a hand: six decks shuffled from the seeds. */
export const shoeFor = (serverSeed: string, clientSeed: string, nonce: number): Card[] => shuffle(FRESH_SHOE, serverSeed, clientSeed, nonce);

export const label = (c: Card) => `${c.rank}${SUIT_GLYPH[c.suit]}`;
export const describe = (c: Card) => `${c.rank === "A" ? "ace" : c.rank === "J" ? "jack" : c.rank === "Q" ? "queen" : c.rank === "K" ? "king" : c.rank} of ${SUIT_NAME[c.suit]}`;

export const cardValue = (c: Card) => (c.rank === "A" ? 11 : c.rank === "J" || c.rank === "Q" || c.rank === "K" ? 10 : Number(c.rank));

/** The best total, and whether an ace still counts as 11 in it (a soft hand). */
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c);
    if (c.rank === "A") aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return { total, soft: aces > 0 };
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards).total === 21;
export const isBust = (cards: Card[]) => handValue(cards).total > 21;

export type Hand = { cards: Card[]; bet: number; doubled: boolean; done: boolean; split: boolean };
export type Phase = "playing" | "done";
export type Game = { shoe: Card[]; next: number; dealer: Card[]; hands: Hand[]; active: number; phase: Phase };

const clone = (g: Game): Game => ({ ...g, dealer: [...g.dealer], hands: g.hands.map((h) => ({ ...h, cards: [...h.cards] })) });
const draw = (g: Game): Card => g.shoe[g.next++];

/** Two cards each, the dealer's second face down. A natural on either side ends the hand at once. */
export function deal(shoe: Card[], bet: number): Game {
  const g: Game = { shoe, next: 0, dealer: [], hands: [{ cards: [], bet, doubled: false, done: false, split: false }], active: 0, phase: "playing" };
  g.hands[0].cards.push(draw(g));
  g.dealer.push(draw(g));
  g.hands[0].cards.push(draw(g));
  g.dealer.push(draw(g));
  if (isBlackjack(g.hands[0].cards) || isBlackjack(g.dealer)) {
    g.hands[0].done = true;
    g.phase = "done";
  }
  return g;
}

export const canHit = (g: Game) => g.phase === "playing" && !g.hands[g.active].done;
export const canDouble = (g: Game) => g.phase === "playing" && g.hands[g.active].cards.length === 2 && !g.hands[g.active].done;
export const canSplit = (g: Game) => {
  const h = g.hands[g.active];
  return g.phase === "playing" && g.hands.length === 1 && h.cards.length === 2 && cardValue(h.cards[0]) === cardValue(h.cards[1]);
};

// The active hand's over: the next hand that isn't, or the dealer's turn.
function advance(g: Game): Game {
  const next = g.hands.findIndex((h, i) => i > g.active && !h.done);
  if (next >= 0) {
    g.active = next;
    return g;
  }
  g.phase = "done";
  // the dealer draws only when a hand is still standing
  const standing = g.hands.some((h) => !isBust(h.cards));
  if (standing) {
    while (handValue(g.dealer).total < 17) g.dealer.push(draw(g));
  }
  return g;
}

export function hit(g0: Game): Game {
  const g = clone(g0);
  if (!canHit(g)) return g;
  const h = g.hands[g.active];
  h.cards.push(draw(g));
  if (handValue(h.cards).total >= 21) {
    h.done = true;
    return advance(g);
  }
  return g;
}

export function stand(g0: Game): Game {
  const g = clone(g0);
  if (g.phase !== "playing") return g;
  g.hands[g.active].done = true;
  return advance(g);
}

export function double(g0: Game): Game {
  const g = clone(g0);
  if (!canDouble(g)) return g;
  const h = g.hands[g.active];
  h.bet = Math.round(h.bet * 200) / 100;
  h.doubled = true;
  h.cards.push(draw(g));
  h.done = true;
  return advance(g);
}

export function split(g0: Game): Game {
  const g = clone(g0);
  if (!canSplit(g)) return g;
  const [a, b] = g.hands[0].cards;
  const bet = g.hands[0].bet;
  const first: Hand = { cards: [a, draw(g)], bet, doubled: false, done: false, split: true };
  const second: Hand = { cards: [b, draw(g)], bet, doubled: false, done: false, split: true };
  // split aces take one card each
  if (a.rank === "A") first.done = second.done = true;
  // a hand that lands on 21 is played out
  if (handValue(first.cards).total === 21) first.done = true;
  if (handValue(second.cards).total === 21) second.done = true;
  g.hands = [first, second];
  g.active = 0;
  if (first.done) {
    g.active = -1;
    return advance(g);
  }
  return g;
}

export type Result = "blackjack" | "win" | "push" | "lose" | "bust";

/** Each hand's result and what it pays back, bet included. */
export function results(g: Game): { result: Result; payout: number }[] {
  const d = handValue(g.dealer).total;
  const dealerBJ = isBlackjack(g.dealer);
  return g.hands.map((h) => {
    const p = handValue(h.cards).total;
    const natural = !h.split && isBlackjack(h.cards);
    const pay = (mult: number) => Math.round(h.bet * mult * 100) / 100;
    if (p > 21) return { result: "bust", payout: 0 };
    if (natural && dealerBJ) return { result: "push", payout: pay(1) };
    if (natural) return { result: "blackjack", payout: pay(2.5) };
    if (dealerBJ) return { result: "lose", payout: 0 };
    if (d > 21 || p > d) return { result: "win", payout: pay(2) };
    if (p === d) return { result: "push", payout: pay(1) };
    return { result: "lose", payout: 0 };
  });
}

export const cardsLeft = (g: Game) => g.shoe.length - g.next;

/** For the fairness check: how the shoe for a nonce starts. */
export const shoeStart = (serverSeed: string, clientSeed: string, nonce: number, count = 8) =>
  shoeFor(serverSeed, clientSeed, nonce).slice(0, count).map(label).join(" ");
