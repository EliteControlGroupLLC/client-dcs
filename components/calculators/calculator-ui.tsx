// Shared control styles for every calculator / tool (standalone /tools pages,
// the inline calculators on service pages, /adu-calculator) so option buttons,
// selects and the dark result panels look identical everywhere.

import type { LucideIcon } from "lucide-react";

/** Selectable option (size / finish / type…). `layout` sets width, padding and alignment. */
export function optionClass(selected: boolean, layout = "w-full text-left px-4 py-3") {
  return `${layout} min-h-11 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
    selected
      ? "border-primary bg-primary/5 text-secondary font-medium"
      : "border-border bg-white text-muted-foreground hover:border-primary/40"
  }`;
}

/** Native <select>. */
export const selectClass =
  "w-full h-12 px-4 rounded-lg border border-border bg-white text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

/** Dark result panel (Card) — charcoal surface with a soft emerald glow. */
export const resultCardClass =
  "bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white border-secondary shadow-lg shadow-black/20 min-w-0";

/** Stat tile / callout inside a result panel — solid, never translucent glass. */
export const resultTileClass = "bg-secondary-light border border-white/10 rounded-xl";

/** Solid emerald icon disc at the top of a result panel. */
export function ResultIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="w-14 h-14 rounded-full bg-primary border-2 border-accent/60 flex items-center justify-center mx-auto mb-4">
      <Icon className="h-7 w-7 text-white" aria-hidden="true" />
    </div>
  );
}
