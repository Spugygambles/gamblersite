/*
 * Robux, the site's currency, comes in whole units: every price, bet and
 * balance shows as a whole number with its thousands marked, and the maths
 * rounds to the Robux.
 */

export const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** To the whole Robux. */
export const robux = (n: number) => Math.round(n);
