// Owner-approved prices shared by the /tools calculators and the inline
// calculators on the service pages. Change a price here and every estimate,
// label and card that shows it stays in sync.

/** Kitchen remodel optional upgrades (added to the base estimate before the range spread). */
export const KITCHEN_ADD_ONS = [
  { label: "Island Addition", cost: 15000 },
  { label: "Open Floor Plan Conversion", cost: 15000 },
  { label: "New Lighting Design", cost: 5000 },
  { label: "Plumbing Relocation", cost: 4000 },
] as const;

/** Retaining walls: flat rate per lineal foot for walls up to this height. */
export const RETAINING_WALL_BASE_PRICE_PER_LF = 250;
export const RETAINING_WALL_BASE_HEIGHT_FT = 4;

/**
 * Price per lineal foot for a retaining wall of the given height.
 * Up to 4 ft: $250/LF. Above 4 ft the rate grows proportionally with height
 * ($62.50/LF for each foot over 4, i.e. $250 × height ÷ 4):
 * 4 ft → $250, 5 ft → $312.50, 6 ft → $375, 8 ft → $500.
 */
export function retainingWallPricePerLF(heightFt: number): number {
  const extraFeet = Math.max(0, heightFt - RETAINING_WALL_BASE_HEIGHT_FT);
  return (
    RETAINING_WALL_BASE_PRICE_PER_LF +
    extraFeet * (RETAINING_WALL_BASE_PRICE_PER_LF / RETAINING_WALL_BASE_HEIGHT_FT)
  );
}

/** Retaining wall cost = price per LF (for its height) × lineal feet. */
export function retainingWallCost(lengthFt: number, heightFt: number): number {
  return Math.round(retainingWallPricePerLF(heightFt) * lengthFt);
}

/** $250 → "$250", 312.5 → "$312.50", 17.5 → "$17.50". */
export function formatRate(value: number): string {
  return Number.isInteger(value)
    ? `$${value.toLocaleString()}`
    : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
