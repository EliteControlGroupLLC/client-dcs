"use client";

// "Why it costs more" explainers for the pricing calculators. Each calculator
// passes a ladder of options (Standard → Mid-Range → Premium…), a list of the
// areas every option is described by, and one spec per area. The result card
// shows why the selected option is priced the way it is; the comparison table
// below the calculator shows the whole ladder so a homeowner can see exactly
// what changes — including what's behind the walls — at every step.

import { ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TierOption {
  label: string;
  /** Spec per area, in the same order as the ladder's `areas`. */
  specs: string[];
  /** Why this option is priced the way it is (vs. the one before it). */
  why: string;
}

export interface TierLadder {
  /** Row labels, e.g. "Behind the walls", "Waterproofing". */
  areas: string[];
  options: TierOption[];
}

/** Gold callout in the result card: why the selected option costs what it does. */
export function TierWhy({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l-2 border-accent bg-secondary-light rounded-r-xl px-4 py-3 text-left mb-6">
      <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-white/85 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/** Trust strip, e.g. the GAF certification / 50-year warranty on the roof calculator. */
export function TrustCallout({
  title,
  text,
  icon: Icon = ShieldCheck,
}: {
  title: string;
  text: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-accent/60 ring-1 ring-accent/30 bg-secondary-light p-5 shadow-lg shadow-black/20 mb-8">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-white/80">{text}</span>
      </span>
    </div>
  );
}

/**
 * Full ladder: areas down the side, options across the top, the selected
 * option highlighted. Clicking a column header selects that option.
 */
export function TierComparison({
  title,
  intro,
  ladder,
  selected,
  onSelect,
}: {
  title: string;
  intro: string;
  ladder: TierLadder;
  selected: number;
  onSelect?: (index: number) => void;
}) {
  const cols = ladder.options.length;
  return (
    <div className="mt-12">
      <div className="text-center mb-8 max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 text-balance">{title}</h3>
        <p className="text-white/80">{intro}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-secondary-light shadow-lg shadow-black/20">
        <table className="w-full table-fixed text-sm" style={{ minWidth: `${Math.max(640, 150 + cols * 140)}px` }}>
          <thead>
            <tr className="border-b border-white/10">
              <th scope="col" className="w-[150px] p-4 text-left align-bottom">
                <span className="sr-only">Area</span>
              </th>
              {ladder.options.map((o, i) => {
                const active = i === selected;
                return (
                  <th key={o.label} scope="col" className={`p-3 align-bottom ${active ? "bg-primary/40" : ""}`}>
                    {onSelect ? (
                      <button
                        type="button"
                        onClick={() => onSelect(i)}
                        aria-pressed={active}
                        className={`w-full min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                          active
                            ? "border-accent bg-primary text-white"
                            : "border-white/15 bg-secondary text-white/85 hover:border-accent/50 hover:text-white"
                        }`}
                      >
                        {o.label}
                      </button>
                    ) : (
                      <span className="block text-left font-semibold text-white">{o.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ladder.areas.map((area, r) => (
              <tr key={area} className="border-b border-white/10 last:border-b-0 even:bg-white/[0.03]">
                <th scope="row" className="p-4 text-left align-top text-xs font-semibold uppercase tracking-wider text-accent-light">
                  {area}
                </th>
                {ladder.options.map((o, i) => (
                  <td
                    key={o.label}
                    className={`p-4 align-top leading-snug ${i === selected ? "bg-primary/25 text-white" : "text-white/80"}`}
                  >
                    {o.specs[r]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-white/10">
              <th scope="row" className="p-4 text-left align-top text-xs font-semibold uppercase tracking-wider text-accent">
                Why the price
              </th>
              {ladder.options.map((o, i) => (
                <td
                  key={o.label}
                  className={`p-4 align-top leading-snug ${i === selected ? "bg-primary/25 text-white" : "text-white/80"}`}
                >
                  {o.why}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="md:hidden mt-3 text-center text-xs text-white/65">Swipe the table sideways to compare every level.</p>
    </div>
  );
}
