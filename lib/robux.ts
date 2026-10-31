/*
 * The site's currency is Robux, sold at a set rate: $4.50 buys 1,000. Every
 * price on the site is kept in dollars and shown in Robux at this rate, so
 * changing it here reprices the whole site. Deposits are a placeholder until
 * they're wired to a payment provider.
 */

/** What 1,000 Robux cost, in dollars. */
export const USD_PER_1000_ROBUX = 4.5;

/** Robux to the dollar: 222 and two ninths. */
export const ROBUX_PER_USD = 1000 / USD_PER_1000_ROBUX;

/** The least a deposit or a withdrawal can be, in dollars. */
export const MIN_DEPOSIT_USD = 1;
export const MIN_WITHDRAW_USD = 10;

export const usdFor = (robux: number) => (robux * USD_PER_1000_ROBUX) / 1000;
export const robuxFor = (usd: number) => (usd * 1000) / USD_PER_1000_ROBUX;

/** A price in dollars as whole Robux at the site's rate. */
export const robuxAt = (usd: number) => Math.round(robuxFor(usd));
