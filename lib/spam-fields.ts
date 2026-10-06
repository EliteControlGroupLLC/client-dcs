// The two spam-trap fields every lead form sends, split out from
// lib/spam-filter.ts so the forms can import them without pulling the
// heuristics (and the word lists that tune them) into the browser bundle.
// Client-safe: constants only.

/** Hidden input a human never sees and never fills. */
export const HONEYPOT_FIELD = "company_website";

/** Body key carrying how long the visitor spent on the form, in ms. */
export const ELAPSED_FIELD = "elapsedMs";
