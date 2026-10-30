/*
 * The site's currency is Robux. Deposits are priced in dollars at a set
 * rate, a placeholder until deposits are wired to a payment provider.
 */

/** Robux to the dollar. */
export const ROBUX_PER_USD = 500;

export const usdFor = (robux: number) => robux / ROBUX_PER_USD;
export const robuxFor = (usd: number) => usd * ROBUX_PER_USD;
