/**
 * Rent Resolution — ONE number, one rule, one explanation.
 *
 * The report used to print two different rents for the same unit: a low figure
 * in the Financial Snapshot (a rent AVM that was handed the ADU's square
 * footage, so a 1,200 sq ft backyard home got priced like a small apartment)
 * and a higher figure in the floor-plan section (TruthCore's own rent table).
 * This module resolves them into a single figure that drives everything.
 *
 * THE RULE, in the order it is applied:
 *
 *   1. Verified comps lead. Rental comparables are matched on CONFIGURATION —
 *      bedrooms, bathrooms, property type — never on square footage, and drawn
 *      from about a mile around the subject address.
 *   2. A new-construction premium is added on top of the comp median. The comps
 *      are existing housing stock; a TruthCore unit is brand new with solar and
 *      modern systems, and that rents for more. The premium is the owner's
 *      stated assumption (NEW_CONSTRUCTION_RENT_PREMIUM in lib/data/site-data),
 *      not a measured market fact, and the report says so.
 *   3. TruthCore's own rent table is the FLOOR, never the ceiling. If comps plus
 *      the premium land below what TruthCore's own units of that configuration
 *      rent for, the table's figure is used instead.
 *   4. If there are not enough verified comps of the same configuration nearby,
 *      the report says so plainly and uses TruthCore's own figure.
 *
 * Nothing here invents a rent. Every number traces to either real comparable
 * rentals or the owner's own rent table, and `explanation` says which.
 */

import { applyNewConstructionPremium, NEW_CONSTRUCTION_RENT_PREMIUM } from "../data/site-data";
import {
  MARKET_RENT_MIN_COMPS,
  MARKET_RENT_RADIUS_MILES,
  type MarketRentComparable,
  type MarketRentOutcome,
} from "./rentcast-service";

/** Where the headline rent came from. */
export type ResolvedRentBasis =
  /** Verified nearby comps of the same configuration, plus the new-construction premium. */
  | "verified-comps"
  /** Comps came in under what TruthCore's own units rent for; the owner's floor was used. */
  | "truthcore-floor"
  /** Not enough verified comps nearby; the owner's own rent table was used. */
  | "truthcore-table";

export interface ResolvedRent {
  /** The one number. Drives the financial snapshot, ROI, payback, PDF and floor-plan section. */
  monthlyRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  basis: ResolvedRentBasis;
  /** Verified comps behind the figure (empty when none qualified). */
  comparables: MarketRentComparable[];
  comparableCount: number;
  /** Radius the comps came from, in miles. Null when there are none. */
  radiusMiles: number | null;
  /** True when one mile did not hold enough matching rentals and we went wider. */
  widened: boolean;
  /** Median asking rent of the qualifying comps, BEFORE the premium. Null when none. */
  compMedianRent: number | null;
  /** Comp median with the new-construction premium applied. Null when no comps. */
  compAdjustedRent: number | null;
  /** The owner's own configuration-matched range — the floor. */
  truthcoreRangeLow: number;
  truthcoreRangeHigh: number;
  /** Plain-English, client-facing. Says where the number came from. Not jargon. */
  explanation: string;
  /** Short label for pills and table headers. */
  label: string;
}

function midpointToNearest50(low: number, high: number): number {
  return Math.round((low + high) / 2 / 50) * 50;
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function layoutLabel(bedrooms: number, bathrooms: number): string {
  return bedrooms === 0 ? "studio" : `${bedrooms}-bed / ${bathrooms}-bath`;
}

function premiumSentence(): string {
  return `That includes a ${Math.round(NEW_CONSTRUCTION_RENT_PREMIUM * 100)}% allowance for the fact that what we build is brand new — solar, modern systems, current finishes, all under warranty — which rents for more than the older back houses and apartments most comparables are drawn from. That allowance is our assumption, not a market measurement.`;
}

/**
 * Resolve the single rent figure for the modeled unit.
 *
 * `truthcoreRange` is the owner's configuration-matched rent-table range for
 * this unit (see findRentAssumption / getRentEstimate in lib/data/site-data).
 * It is the floor, and the fallback.
 *
 * Pure — no network, no clock. Exported for offline verification.
 */
export function resolveRent(args: {
  market: MarketRentOutcome;
  truthcoreRange: { low: number; high: number };
  bedrooms: number;
  bathrooms: number;
}): ResolvedRent {
  const { market, truthcoreRange, bedrooms, bathrooms } = args;
  const layout = layoutLabel(bedrooms, bathrooms);
  const tableMonthly = midpointToNearest50(truthcoreRange.low, truthcoreRange.high);
  const tableBase = {
    truthcoreRangeLow: truthcoreRange.low,
    truthcoreRangeHigh: truthcoreRange.high,
  };

  if (market.status === "ok") {
    const m = market.result;
    const adjustedMedian = applyNewConstructionPremium(m.monthlyRent);
    const adjustedLow = applyNewConstructionPremium(m.rentRangeLow);
    const adjustedHigh = applyNewConstructionPremium(m.rentRangeHigh);
    const radiusLabel = `${m.radiusMiles} mile${m.radiusMiles === 1 ? "" : "s"}`;
    const widenedNote = m.widened
      ? ` We had to look out to ${radiusLabel} to find them — fewer than ${MARKET_RENT_MIN_COMPS} ${layout} rentals were listed within ${MARKET_RENT_RADIUS_MILES} mile.`
      : "";

    if (adjustedMedian >= truthcoreRange.low) {
      // Comps lead. The owner's low is still a floor on the bottom of the range.
      const low = Math.max(adjustedLow, truthcoreRange.low);
      const high = Math.max(adjustedHigh, low);
      return {
        monthlyRent: adjustedMedian,
        rentRangeLow: low,
        rentRangeHigh: high,
        basis: "verified-comps",
        comparables: m.comparables,
        comparableCount: m.comparableCount,
        radiusMiles: m.radiusMiles,
        widened: m.widened,
        compMedianRent: m.monthlyRent,
        compAdjustedRent: adjustedMedian,
        ...tableBase,
        explanation: `${money(adjustedMedian)}/month, based on ${m.comparableCount} verified ${layout} rentals within ${radiusLabel} of this address. Those rentals are asking a median of ${money(m.monthlyRent)}/month.${widenedNote} ${premiumSentence()} We also never quote below what our own ${layout} ADUs rent for, so the bottom of the range holds at ${money(low)}.`,
        label: `Verified rentals within ${radiusLabel}`,
      };
    }

    // Comps + premium came in under the owner's own floor for this configuration.
    return {
      monthlyRent: tableMonthly,
      rentRangeLow: truthcoreRange.low,
      rentRangeHigh: truthcoreRange.high,
      basis: "truthcore-floor",
      comparables: m.comparables,
      comparableCount: m.comparableCount,
      radiusMiles: m.radiusMiles,
      widened: m.widened,
      compMedianRent: m.monthlyRent,
      compAdjustedRent: adjustedMedian,
      ...tableBase,
      explanation: `${money(truthcoreRange.low)} – ${money(truthcoreRange.high)}/month. The ${m.comparableCount} verified ${layout} rentals we found within ${radiusLabel} of this address are asking a median of ${money(m.monthlyRent)}/month — ${money(adjustedMedian)} once we allow for new construction — which is below what our own ${layout} ADUs actually rent for.${widenedNote} We do not quote below our own numbers, so this figure is TruthCore's, and the nearby rentals are shown alongside it so you can see both.`,
      label: "TruthCore's own rents (nearby rentals came in lower)",
    };
  }

  if (market.status === "insufficient") {
    return {
      monthlyRent: tableMonthly,
      rentRangeLow: truthcoreRange.low,
      rentRangeHigh: truthcoreRange.high,
      basis: "truthcore-table",
      comparables: [],
      comparableCount: 0,
      radiusMiles: null,
      widened: false,
      compMedianRent: null,
      compAdjustedRent: null,
      ...tableBase,
      explanation: `${money(truthcoreRange.low)} – ${money(truthcoreRange.high)}/month, from what our own ${layout} ADUs rent for in San Diego County. We looked for comparable ${layout} rentals near this address and found only ${market.qualifyingCount} within ${market.radiusMiles} miles — not enough to call it a market read, and we will not stretch the search until it says what we want. Our team will pull live rental comps for your block during the site review.`,
      label: "TruthCore's own rents (not enough nearby rentals to verify)",
    };
  }

  return {
    monthlyRent: tableMonthly,
    rentRangeLow: truthcoreRange.low,
    rentRangeHigh: truthcoreRange.high,
    basis: "truthcore-table",
    comparables: [],
    comparableCount: 0,
    radiusMiles: null,
    widened: false,
    compMedianRent: null,
    compAdjustedRent: null,
    ...tableBase,
    explanation: `${money(truthcoreRange.low)} – ${money(truthcoreRange.high)}/month, from what our own ${layout} ADUs rent for in San Diego County. Live rental comparables were not available when this report ran, so nothing here is presented as a market quote for this address. Our team will pull live comps during the site review.`,
    label: "TruthCore's own rents (live comps unavailable)",
  };
}
