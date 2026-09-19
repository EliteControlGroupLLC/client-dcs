// ADU Fit Rules — single source of truth for which ADU types actually fit.
//
// Every ADU-type verdict on the report (recommendation cards, enhanced
// feasibility, best recommendation, banner, financial model) is derived from
// these rules so they can never disagree. Rules are driven by REAL data:
//   • County Assessor (SANDAG parcels): living area, garage stalls,
//     garage-converted flag
//   • SANDAG Building Outlines + parcel polygon: footprint, open yard,
//     candidate zones after setbacks & separation (parcel-raster-analysis)
//
// When the geometry is NOT real (rectangle / estimated fallback) we never
// assert a detached size — detached is capped at "Possible" with a
// manual-review note.

import type { FeasibilityLevel, SiteFacts } from "./types";

export type { SiteFacts };
import type { JurisdictionProfile } from "./jurisdictions/types";
import { ADU_MIN_DIMENSION_FT, ADU_MIN_SMALL_SQFT, ADU_MIN_STANDARD_SQFT } from "./parcel-raster-analysis";

// ─── Documented constants ───

/** Typical interior area of one garage stall (a 2-car garage ≈ 400 sq ft). */
export const GARAGE_SQFT_PER_STALL = 200;
/** (living + attached garage) ÷ footprint at or above this ⇒ 2 stories. */
export const TWO_STORY_RATIO = 1.4;
/** … at or above this ⇒ 3 stories. */
export const THREE_STORY_RATIO = 2.4;
/** Smallest attached addition worth proposing (sq ft). */
export const ATTACHED_MIN_SQFT = 200;

export type AduTypeName = "Detached ADU" | "Attached ADU" | "Garage Conversion" | "Second-Story ADU" | "JADU";

export interface AduTypeVerdict {
  type: AduTypeName;
  level: FeasibilityLevel;
  minSqFt: number;
  maxSqFt: number;
  /** Display string, e.g. "400 – 780 sq ft" or "N/A". */
  sizeLabel: string;
  /** Plain-English reason / description shown to the owner. */
  description: string;
  /** Short constraint notes. */
  constraints: string[];
}

/**
 * Estimate stories from assessor living area and the real footprint.
 * If the garage sits inside the main outline its area is added back, since
 * the outline includes it but living area does not.
 */
export function estimateStories(
  livingAreaSqFt: number | null,
  mainFootprintSqFt: number | null,
  garageStalls: number | null,
  garageAttached: boolean | null
): { stories: number | null; ratio: number | null } {
  if (!livingAreaSqFt || !mainFootprintSqFt || mainFootprintSqFt < 200) return { stories: null, ratio: null };
  const garageInFootprint = garageAttached !== false && garageStalls ? garageStalls * GARAGE_SQFT_PER_STALL : 0;
  const ratio = (livingAreaSqFt + garageInFootprint) / mainFootprintSqFt;
  const stories = ratio >= THREE_STORY_RATIO ? 3 : ratio >= TWO_STORY_RATIO ? 2 : 1;
  return { stories, ratio: Math.round(ratio * 100) / 100 };
}

const fmt = (n: number) => Math.round(n).toLocaleString();
const range = (lo: number, hi: number) => (hi <= lo ? `${fmt(hi)} sq ft` : `${fmt(lo)} – ${fmt(hi)} sq ft`);

export function evaluateAduTypeFit(facts: SiteFacts, profile: JurisdictionProfile): Record<AduTypeName, AduTypeVerdict> {
  const rules = profile.sizeRules;
  const { sideRearFt, separationFt } = facts.setbacksUsed;
  const setbackPhrase = `${sideRearFt} ft from side/rear lot lines and ${separationFt} ft from the home`;

  // ── Detached ADU ──
  let detached: AduTypeVerdict;
  const zone = facts.detachedZone;
  if (facts.geometryVerified) {
    if (zone && zone.areaSqFt >= ADU_MIN_STANDARD_SQFT) {
      const max = Math.min(zone.areaSqFt, rules.detachedAduMaxSqft);
      detached = {
        type: "Detached ADU",
        level: "Likely",
        minSqFt: ADU_MIN_STANDARD_SQFT,
        maxSqFt: max,
        sizeLabel: range(ADU_MIN_STANDARD_SQFT, max),
        description: `A ${zone.widthFt} × ${zone.depthFt} ft ${zone.position === "rear" ? "rear-yard" : zone.position.replace("-", " ") + " yard"} area fits a detached unit after required setbacks (${setbackPhrase}), measured on the County parcel map and building outlines.`,
        constraints: [],
      };
    } else if (zone && zone.areaSqFt >= ADU_MIN_SMALL_SQFT) {
      detached = {
        type: "Detached ADU",
        level: "Possible",
        minSqFt: ADU_MIN_SMALL_SQFT,
        maxSqFt: zone.areaSqFt,
        sizeLabel: range(ADU_MIN_SMALL_SQFT, zone.areaSqFt),
        description: `Only a compact detached unit fits: the largest open area after required setbacks (${setbackPhrase}) is about ${zone.widthFt} × ${zone.depthFt} ft.`,
        constraints: ["Compact footprint — below the smallest standard DCS detached plan (400 sq ft)"],
      };
    } else {
      const y = facts.measuredYards;
      const yardNote = y ? ` The rear yard measures about ${y.rearFt} ft deep and the side yards about ${y.leftFt} ft and ${y.rightFt} ft.` : "";
      detached = {
        type: "Detached ADU",
        level: "Not Recommended",
        minSqFt: 0,
        maxSqFt: 0,
        sizeLabel: "N/A",
        description: `Rear/side yard too small after required setbacks (${setbackPhrase}); no ${ADU_MIN_DIMENSION_FT} × ${ADU_MIN_DIMENSION_FT} ft area remains for a detached unit.${yardNote}`,
        constraints: ["Rear/side yard too small after required setbacks"],
      };
    }
  } else {
    const yard = facts.openYardSqFt ?? 0;
    detached = {
      type: "Detached ADU",
      level: yard > 1200 ? "Possible" : "Limited",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "Site review needed",
      description:
        "We could not verify the real parcel and building outlines for this address, so detached ADU size can't be confirmed. A site review is required to measure the rear/side yards after setbacks.",
      constraints: ["Unverified geometry — manual site review required"],
    };
  }

  // ── Garage Conversion ──
  let garage: AduTypeVerdict;
  const stalls = facts.garageStalls;
  if (stalls != null && facts.garageConverted) {
    garage = {
      type: "Garage Conversion",
      level: "Not Recommended",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "N/A",
      description: "County Assessor records show the garage has already been converted to living space.",
      constraints: ["Garage already converted (Assessor)"],
    };
  } else if (stalls != null && stalls >= 1) {
    const size = Math.min(rules.detachedAduMaxSqft, stalls * GARAGE_SQFT_PER_STALL);
    const confirmed = facts.parcelMatch !== "nearest";
    garage = {
      type: "Garage Conversion",
      level: confirmed ? "Likely" : "Possible",
      minSqFt: size,
      maxSqFt: size,
      sizeLabel: `${fmt(size)} sq ft`,
      description: `County Assessor records ${confirmed ? "show" : "for the nearest parcel show"} a ${stalls}-car garage${facts.garageAttached === false ? ` (detached${facts.garageSqFtEstimate ? `, ~${fmt(facts.garageSqFtEstimate)} sq ft outline` : ""})` : ""}. Converting it (about ${fmt(size)} sq ft) is typically the fastest, most affordable ADU path, with no replacement parking required under state law.${confirmed ? "" : " Confirm the garage on site."}`,
      constraints: confirmed
        ? ["No replacement parking required per state law"]
        : ["No replacement parking required per state law", "Parcel match unconfirmed — verify garage on site"],
    };
  } else if (stalls === 0) {
    garage = {
      type: "Garage Conversion",
      level: "Not Recommended",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "N/A",
      description: "County Assessor records show no garage on this property.",
      constraints: ["No garage on Assessor record"],
    };
  } else {
    garage = {
      type: "Garage Conversion",
      level: "Possible",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "Site review needed",
      description: "Garage details are not on record for this address. If the home has a garage, converting it is typically the most affordable ADU path.",
      constraints: ["Garage not confirmed — site review required"],
    };
  }

  // ── Attached ADU ──
  let attached: AduTypeVerdict;
  const livingCap = facts.livingAreaSqFt ? Math.round(facts.livingAreaSqFt * 0.5) : rules.attachedAduMaxSqft;
  const attachedCap = Math.max(ATTACHED_MIN_SQFT, Math.min(rules.attachedAduMaxSqft, Math.max(livingCap, 800)));
  if (facts.geometryVerified) {
    const fit = facts.attachedFit;
    if (fit && fit.areaSqFt >= ATTACHED_MIN_SQFT) {
      const max = Math.min(fit.areaSqFt, attachedCap);
      const tight = detached.level === "Not Recommended";
      attached = {
        type: "Attached ADU",
        level: "Possible",
        minSqFt: ATTACHED_MIN_SQFT,
        maxSqFt: max,
        sizeLabel: range(ATTACHED_MIN_SQFT, max),
        description:
          fit.areaSqFt > max
            ? `There's clear yard next to the home for an attached addition up to ${fmt(max)} sq ft while keeping ${sideRearFt} ft from the lot lines. Requires design review of the shared wall and roof tie-in.`
            : `An addition of about ${fit.widthFt} × ${fit.depthFt} ft could attach to the home while keeping ${sideRearFt} ft from the lot lines${tight ? ", but it would use most of the remaining yard" : ""}. Requires design review of the shared wall and roof tie-in.`,
        constraints: ["Design/structural review of the attachment required"],
      };
    } else {
      attached = {
        type: "Attached ADU",
        level: "Not Recommended",
        minSqFt: 0,
        maxSqFt: 0,
        sizeLabel: "N/A",
        description: `No room to add on: after keeping ${sideRearFt} ft from the side/rear lot lines there isn't a ${ATTACHED_MIN_SQFT} sq ft area next to the home.`,
        constraints: ["Insufficient yard next to the home after setbacks"],
      };
    }
  } else {
    attached = {
      type: "Attached ADU",
      level: "Possible",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "Site review needed",
      description: "An attached ADU extends from the existing home. Available space next to the home must be confirmed with a site review.",
      constraints: ["Unverified geometry — manual site review required"],
    };
  }

  // ── Second-Story ADU (above the existing home / garage) ──
  let secondStory: AduTypeVerdict;
  if (facts.stories != null && facts.stories >= 2) {
    secondStory = {
      type: "Second-Story ADU",
      level: "Not Recommended",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "N/A",
      description: `Home is already ${facts.stories === 2 ? "two" : facts.stories} stories (assessor living area vs. building footprint), so adding an ADU on top isn't practical.`,
      constraints: ["Home is already two stories"],
    };
  } else if (facts.stories === 1 && profile.height.twoStoryAllowed) {
    // An ADU above the home is legally an attached ADU: same size cap, and it
    // can't be bigger than the footprint it sits on.
    const max = Math.max(ADU_MIN_STANDARD_SQFT, Math.min(attachedCap, facts.mainFootprintSqFt ?? attachedCap));
    secondStory = {
      type: "Second-Story ADU",
      level: "Possible",
      minSqFt: ADU_MIN_STANDARD_SQFT,
      maxSqFt: max,
      sizeLabel: range(ADU_MIN_STANDARD_SQFT, max),
      description: "Suggestion: the home is one story, so an ADU could be built above it (or above the garage) without using yard space. Requires structural/engineering review of the existing foundation and framing.",
      constraints: ["Requires structural/engineering review"],
    };
  } else {
    secondStory = {
      type: "Second-Story ADU",
      level: "Limited",
      minSqFt: 0,
      maxSqFt: 0,
      sizeLabel: "Site review needed",
      description: "We couldn't confirm the number of stories. An ADU above the home or garage requires structural/engineering review.",
      constraints: ["Story count unverified", "Requires structural/engineering review"],
    };
  }

  // ── JADU (within the existing home, ≤ 500 sq ft) ──
  const living = facts.livingAreaSqFt ?? 0;
  const jaduMax = living > 0 ? Math.min(rules.jaduMaxSqft, Math.max(150, Math.round(living * 0.4))) : rules.jaduMaxSqft;
  const jadu: AduTypeVerdict = {
    type: "JADU",
    level: living >= 800 || living === 0 ? "Possible" : "Limited",
    minSqFt: 150,
    maxSqFt: jaduMax,
    sizeLabel: range(150, jaduMax),
    description: `A junior unit carved out of the existing home (max ${rules.jaduMaxSqft} sq ft) — no yard space needed.`,
    constraints: ["Must be within the existing home or attached garage", "Owner occupancy may be required for JADU"],
  };

  return {
    "Detached ADU": detached,
    "Attached ADU": attached,
    "Garage Conversion": garage,
    "Second-Story ADU": secondStory,
    JADU: jadu,
  };
}

const LEVEL_RANK: Record<FeasibilityLevel, number> = { Likely: 4, Possible: 3, Limited: 2, "Not Recommended": 1 };
/** When feasibility ties, prefer the larger/most valuable product. */
const TYPE_RANK: Record<string, number> = {
  "Detached ADU": 4,
  "Garage Conversion": 3,
  "Attached ADU": 2,
  "Second-Story ADU": 1,
};

/**
 * Best recommendation among the four headline types. JADU (inside the
 * existing home) is only chosen when none of the others is at least
 * "Possible" — e.g. a two-story home with no garage and no usable yard.
 */
export function pickBestAduType(verdicts: Record<AduTypeName, AduTypeVerdict>): AduTypeName {
  const candidates: AduTypeName[] = ["Detached ADU", "Garage Conversion", "Attached ADU", "Second-Story ADU"];
  const best = [...candidates].sort((a, b) => {
    const d = LEVEL_RANK[verdicts[b].level] - LEVEL_RANK[verdicts[a].level];
    if (d !== 0) return d;
    // Same level: an option whose size is backed by real data beats one
    // that still needs a site review to size.
    const known = Number(verdicts[b].maxSqFt > 0) - Number(verdicts[a].maxSqFt > 0);
    return known !== 0 ? known : (TYPE_RANK[b] ?? 0) - (TYPE_RANK[a] ?? 0);
  })[0];
  if (LEVEL_RANK[verdicts[best].level] < LEVEL_RANK.Possible && LEVEL_RANK[verdicts.JADU.level] >= LEVEL_RANK.Possible) {
    return "JADU";
  }
  return best;
}
