"use client";

// A field no human ever sees, hears or tabs into. Anything that fills it is a
// bot, and the server drops the submission without creating a lead.
//
// Hidden off-screen rather than with `display:none` — some bots skip fields
// that are display-hidden, which is exactly the ones we want to catch. It is
// also aria-hidden and untabbable, so a screen reader or keyboard user never
// lands on it.

import { HONEYPOT_FIELD } from "@/lib/spam-fields";

export interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Suffix for the element id, so two forms on one page stay unique. */
  idSuffix?: string;
}

export function HoneypotField({ value, onChange, idSuffix = "" }: HoneypotFieldProps) {
  const id = `${HONEYPOT_FIELD}${idSuffix}`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label htmlFor={id}>Company website (leave this blank)</label>
      <input
        id={id}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
