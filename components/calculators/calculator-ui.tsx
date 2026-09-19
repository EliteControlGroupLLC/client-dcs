// Shared control styles for every calculator / tool (standalone /tools pages,
// the inline calculators on service pages, /adu-calculator) so option buttons
// and selects look identical everywhere.

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
