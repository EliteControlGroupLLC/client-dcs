// Keeping cold outbound pitches out of the sales pipeline.
//
// Phone verification stops most of this on its own — a staffing agency will
// not verify a real mobile by SMS to send a pitch. This is the second layer,
// and it splits by how certain the signal is:
//
//   BLOCK (definitively a machine — no lead is created):
//     1. the honeypot field is filled. A human never sees that input, so
//        anything typing into it is a bot.
//     2. the form was submitted impossibly fast. Nobody reads, writes a
//        message and picks an address in under three seconds.
//
//   FLAG (a judgement about content — the lead is created anyway):
//     3. pitch vocabulary, links and outbound-sales phrasing. These are
//        guesses, and a wrongly dropped customer is far worse than a pitch
//        in the pipeline — so the lead goes through with "[Possible spam]"
//        on the name and a line at the top of the notes saying exactly what
//        tripped. The owner reads it and decides.
//
// Server-only. The field names the forms need live in lib/spam-fields.ts so
// the word lists below never reach the browser bundle.

import { COMPANY_INFO } from "@/lib/data/site-data";

/** Floor for how long a human takes to fill a lead form, in ms. Deliberately loose. */
export const MIN_FILL_MS = 3000;

/**
 * Score at which content is marked as a possible pitch.
 *
 * Set at 3 so one pitch word on its own (worth 2) never flags a customer —
 * "I found you through an SEO search" is a real person. It takes a pitch
 * category plus something else: a link, outbound phrasing, a second category.
 */
const FLAG_SCORE = 3;

// A homeowner asking about a construction project does not write these words.
// Note what is NOT here: a bare "hiring" ("we're hiring someone to build our
// ADU"), "quote", "project", "budget" — all normal customer vocabulary.
const PITCH_CATEGORIES: { id: string; label: string; re: RegExp }[] = [
  {
    id: "recruiting",
    label: "recruiting/staffing",
    re: /\b(resum[eé]s?|candidates?|staffing|recruit(?:er|ers|ment|ing)|applicants?|talent\s+pool|job\s+(?:post|board|ad)|are\s+you\s+hiring|your\s+hiring|hiring\s+(?:needs|process)|placement\s+fee)\b/gi,
  },
  {
    id: "seo",
    label: "SEO",
    re: /\b(seo|backlinks?|link\s*building|rank\s+(?:your|higher|on\s+google)|google\s+ranking|search\s+engine\s+ranking|domain\s+authority|guest\s+post)\b/gi,
  },
  {
    id: "webdev",
    label: "web/app development services",
    re: /\b(web\s*(?:site)?\s*(?:design|redesign|development)|app\s+development|we\s+build\s+(?:websites|apps)|offshore\s+(?:team|developers)|wordpress\s+(?:theme|plugin))\b/gi,
  },
  {
    id: "marketing",
    label: "marketing services",
    re: /\b(lead\s+gen(?:eration)?|digital\s+marketing|marketing\s+services|social\s+media\s+management|ppc\s+(?:ads|campaign)|email\s+campaigns?|cold\s+(?:email|outreach)|grow\s+your\s+(?:business|revenue))\b/gi,
  },
];

// How a stranger opens a pitch. Individually weak — a real customer might well
// write "I came across your website".
const COLD_OPEN =
  /(i\s+came\s+across\s+your\s+(?:web)?site|came\s+across\s+your\s+(?:company|business)|quick\s+question\s+about\s+your|hope\s+this\s+(?:email|message)\s+finds\s+you|reaching\s+out\s+(?:to|about)|we\s+specialize\s+in|i\s+help\s+(?:companies|businesses)|book\s+a\s+(?:quick\s+)?call|15\s+minutes\s+of\s+your|worth\s+a\s+quick\s+chat|p\.?\s?s\.?\s)/gi;

// Nobody sending a genuine enquiry writes these. Near-certain bulk mail.
const BULK_MAIL =
  /(unsubscribe|opt[\s-]?out|remove\s+me\s+from\s+your\s+(?:list|database)|if\s+you'?re\s+not\s+the\s+right\s+person|mailing\s+list|this\s+is\s+not\s+spam)/gi;

// http(s) links and bare domains alike ("holmrow.com/intro").
const LINK_RE =
  /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9][a-z0-9-]*\.(?:com|net|org|io|co|ai|biz|info|xyz|online|site|shop|agency|services|dev|app)\b(?:\/\S*)?/gi;

function matches(text: string, re: RegExp): string[] {
  const found = text.match(re) || [];
  const unique: string[] = [];
  for (const m of found) {
    const v = m.trim();
    if (v && !unique.some((u) => u.toLowerCase() === v.toLowerCase())) unique.push(v);
  }
  return unique.slice(0, 4);
}

function quote(values: string[]): string {
  return values.map((v) => `"${v.slice(0, 40)}"`).join(", ");
}

export interface SpamCheckInput {
  /** Value of the honeypot field, if the form sent one. */
  honeypot?: unknown;
  /** Milliseconds between the form rendering and the submit, measured by the client. */
  elapsedMs?: unknown;
  name?: string;
  message?: string;
}

export interface SpamVerdict {
  /** Definitively automated. Create no lead; answer neutrally. */
  block: boolean;
  /** Reads like an outbound pitch. Create the lead, but mark it. */
  flag: boolean;
  /** Short rule ids, for the log line only — never shown to the sender. */
  reasons: string[];
  /** Human sentence for the CRM notes. Null when nothing tripped. */
  flagNote: string | null;
}

const CLEAN: SpamVerdict = { block: false, flag: false, reasons: [], flagNote: null };

/**
 * Judge a lead submission.
 *
 * Only the two mechanical signals block. Everything about the content is
 * advisory: it marks the lead and explains itself, and the owner decides.
 */
export function checkSpam(input: SpamCheckInput): SpamVerdict {
  // ── Block: proof of automation ──
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") {
    return { block: true, flag: false, reasons: ["honeypot"], flagNote: null };
  }

  const elapsed = typeof input.elapsedMs === "number" ? input.elapsedMs : Number(input.elapsedMs);
  // A missing or nonsensical value never blocks — the page may have been
  // served from cache, or the clock may be wrong.
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return { block: true, flag: false, reasons: ["too-fast"], flagNote: null };
  }

  // ── Flag: a judgement about what they wrote ──
  const message = typeof input.message === "string" ? input.message : "";
  const name = typeof input.name === "string" ? input.name : "";
  if (!message && !name) return CLEAN;

  const reasons: string[] = [];
  const notes: string[] = [];
  let score = 0;

  if (message) {
    const bulk = matches(message, BULK_MAIL);
    if (bulk.length) {
      reasons.push("bulk-mail");
      notes.push(`bulk-email boilerplate (${quote(bulk)})`);
      score += 3;
    }

    for (const { id, label, re } of PITCH_CATEGORIES) {
      const hits = matches(message, re);
      if (hits.length) {
        reasons.push(`pitch:${id}`);
        notes.push(`${label} wording (${quote(hits)})`);
        score += 2;
      }
    }

    const cold = matches(message, COLD_OPEN);
    if (cold.length) {
      reasons.push("cold-open");
      notes.push(`outbound-sales phrasing (${quote(cold)})`);
      score += 1;
    }

    // One link is normal — customers paste Pinterest boards and plan PDFs.
    // Several is a pitch.
    const links = matches(message, LINK_RE);
    if (links.length >= 2) {
      reasons.push("links:many");
      notes.push(`${links.length} links (${quote(links)})`);
      score += 2;
    } else if (links.length === 1) {
      reasons.push("links:one");
      notes.push(`a link (${quote(links)})`);
      score += 1;
    }
  }

  // A URL in the NAME field is never a customer.
  const nameLinks = name ? matches(name, LINK_RE) : [];
  if (nameLinks.length) {
    reasons.push("link-in-name");
    notes.push(`a link in the name field (${quote(nameLinks)})`);
    // Standalone signal: a customer never puts a URL where their name goes.
    score += 3;
  }

  if (score < FLAG_SCORE || notes.length === 0) return { ...CLEAN, reasons };
  return { block: false, flag: true, reasons, flagNote: notes.join("; ") };
}

/** Prefix the owner sees in his leads list. */
export const SPAM_NAME_PREFIX = "[Possible spam]";

/** Put the prefix on the lead's name without doubling it up. */
export function flagLeadName(firstName: string): string {
  return firstName.startsWith(SPAM_NAME_PREFIX) ? firstName : `${SPAM_NAME_PREFIX} ${firstName}`.slice(0, 80);
}

/**
 * The line that goes at the TOP of the lead notes, above the visitor's own
 * message — which stays intact underneath, because the owner wants to read it
 * and judge for himself.
 */
export function spamFlagNote(verdict: SpamVerdict, phoneVerified: boolean): string {
  return (
    `⚠️ POSSIBLE SPAM — flagged automatically, not deleted. Flagged: ${verdict.flagNote}. ` +
    (phoneVerified
      ? "Phone WAS SMS-verified, so a real person held that number."
      : "Phone was NOT verified.") +
    " The sender's original message is below — judge it yourself."
  );
}

/** One loud log line per blocked bot. Name and email only, never the body. */
export function logBlockedSubmission(
  tag: string,
  verdict: SpamVerdict,
  who: { name?: string; email?: string }
): void {
  console.error(
    `[${tag}] BOT BLOCKED — no lead created. triggered=${verdict.reasons.join(",")} ` +
      `name="${(who.name || "").slice(0, 80)}" email="${(who.email || "").slice(0, 120)}"`
  );
}

/** One line per lead that was let through but marked. */
export function logFlaggedSubmission(
  tag: string,
  verdict: SpamVerdict,
  who: { name?: string; email?: string }
): void {
  console.warn(
    `[${tag}] LEAD FLAGGED AS POSSIBLE SPAM (still created). triggered=${verdict.reasons.join(",")} ` +
      `name="${(who.name || "").slice(0, 80)}" email="${(who.email || "").slice(0, 120)}"`
  );
}

/**
 * What a blocked sender is told. Deliberately says nothing about which rule
 * fired — that would be a tuning guide — but gives a human caught by mistake
 * a way to reach us.
 */
export const BLOCKED_SUBMISSION_MESSAGE =
  `We couldn't submit your message from here. Please call us at ${COMPANY_INFO.phone} and we'll take care of you.`;
