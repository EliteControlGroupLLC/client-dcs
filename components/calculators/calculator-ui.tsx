// Shared control styles for every calculator / tool (standalone /tools pages,
// the inline calculators on service pages, /adu-calculator) so option buttons,
// selects and the dark result panels look identical everywhere.
//
// All-dark site: a calculator sits in a charcoal (bg-secondary) section as two
// clearly different panels —
//   • INPUT panel  (inputPanelClass): lighter emerald-charcoal card
//     (secondary-light) holding the controls. Unselected options are darker
//     charcoal wells inside it, the same treatment as the dark form fields.
//   • RESULT panel (resultCardClass): deep charcoal with an emerald glow and a
//     gold border — the "answer" reads as the featured card.

import type { LucideIcon } from "lucide-react";
import { fieldClass } from "@/components/ui/form";

/** Card that wraps a calculator's controls (the input column). */
export const inputPanelClass =
  "bg-secondary-light border border-white/10 rounded-2xl shadow-lg shadow-black/20 p-5 md:p-6";

/** Control label on the dark input panel. */
export const controlLabelClass = "block text-sm font-semibold text-white mb-3";

/** Selectable option (size / finish / type…). `layout` sets width, padding and alignment. */
export function optionClass(selected: boolean, layout = "w-full text-left px-4 py-3") {
  return `${layout} min-h-11 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
    selected
      ? "border-accent bg-primary text-white font-medium ring-2 ring-accent/40 shadow-lg shadow-black/25"
      : "border-white/15 bg-secondary text-white/80 hover:border-accent/50 hover:text-white"
  }`;
}

/** Native <select> on the dark input panel — the shared dark form-field look. */
export const selectClass = fieldClass({ tone: "dark" }, "h-12 px-4 text-base font-medium");

/** Native range slider: gold thumb + filled track, visible on the dark panel. */
export const rangeClass = "w-full h-11 -my-3.5 accent-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

/** Native checkbox inside an option row. */
export const checkboxClass = "w-4 h-4 shrink-0 accent-accent [color-scheme:dark]";

/** Dark result panel (Card) — deep charcoal, emerald glow, gold border. */
export const resultCardClass =
  "bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.45),transparent_65%)] text-white border-2 border-accent/60 ring-1 ring-accent/20 shadow-xl shadow-black/30 min-w-0";

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

/** Section background for a calculator band (alternate the wash with neighbours). */
export const calcSectionClass = "bg-secondary border-t border-white/10";
