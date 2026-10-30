/*
 * The site's currency is Robux. Deposits are priced in dollars at a set
 * rate, and every Robux deposit gets a little extra on top. Both are
 * placeholders until deposits are wired to a payment provider.
 */

/** Robux to the dollar. */
export const ROBUX_PER_USD = 500;

/** The share added on top of a Robux deposit. */
export const DEPOSIT_BONUS = 0.05;

export const usdFor = (robux: number) => robux / ROBUX_PER_USD;
export const robuxFor = (usd: number) => usd * ROBUX_PER_USD;

/** What a Robux deposit puts on the balance, the extra included. */
export const creditedFor = (robux: number) => Math.round(robux * (1 + DEPOSIT_BONUS));
