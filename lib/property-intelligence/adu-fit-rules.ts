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

import type { FeasibilityLevel, SiteFacts, SiteZone } from "./types";

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
export const ATTACHED_MIN_SQFT = 250;
/** An attached addition needs at least this usable depth/width (ft) to hold a real room + hall. */
export const ATTACHED_MIN_USABLE_DEPTH_FT = 14;
/** A detached option must beat the simpler one by this much (sq ft) to be worth demolition / a second story. */
export const MATERIAL_GAIN_SQFT = 150;
/** A second story must add at least this much (sq ft) over the one-story size to become the primary. */
export const TWO_STORY_MIN_GAIN_SQFT = 60;
/** Smallest footprint worth stacking two stories on (an interior stair takes ~40 sq ft per floor). */
export const TWO_STORY_MIN_FOOTPRINT_SQFT = 300;
/** Measured grade (lot average or ADU area) at/above which the foundation must be engineered. */
export const STEEP_SLOPE_PERCENT = 15;
/** Measured grade at/above which a detached ADU needs engineering review before it can be sized. */
export const VERY_STEEP_SLOPE_PERCENT = 25;

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
  /** Stories of the proposed unit when it matters (detached: one- vs two-story). */
  stories?: 1 | 2;
  /** Short qualifier shown next to the size, e.g. "one-story" or "two-story, ~600 sq ft footprint". */
  sizeNote?: string;
  /** Detached only: the proposal replaces existing accessory structure(s) (e.g. a detached garage). */
  replacesAccessory?: boolean;
  /** One plain-English sentence on how the size was reached (for the banner). */
  headline?: string;
  /** Extra site cost (USD) on top of the base build price, e.g. a steep-lot foundation. */
  siteCostUsd?: number;
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

interface DetachedOption {
  key: "one-story" | "one-story, replace accessory" | "two-story" | "two-story, replace accessory";
  zone: SiteZone;
  stories: 1 | 2;
  replaces: boolean;
  sizeSqFt: number;
}

/** "~470 sq ft detached garage" / "detached garage and ~120 sq ft shed". */
function describeRemoved(facts: SiteFacts): string {
  const items = facts.detachedOptions?.replaceable ?? [];
  if (items.length === 0) return "accessory structure";
  return items
    .map((r) => `~${fmt(r.areaSqFt)} sq ft ${r.kind}`)
    .join(" and ");
}

/**
 * How a real ADU estimator sizes a detached unit: start with the simplest
 * build (one story, keep everything), and only move to demolishing a
 * replaceable accessory structure (detached garage/shed) or going two
 * stories when that yields a bigger unit:
 *   • stories — one-story stays primary if it reaches the jurisdiction max
 *     (or a second story adds < TWO_STORY_MIN_GAIN_SQFT); otherwise two-story
 *     size = min(max, footprint × 2);
 *   • demolition — replace the accessory structure only when that beats the
 *     keep-everything answer by ≥ MATERIAL_GAIN_SQFT.
 */
function chooseDetachedOption(
  facts: SiteFacts,
  profile: JurisdictionProfile
): { chosen: DetachedOption; alternatives: string[] } | null {
  const cap = profile.sizeRules.detachedAduMaxSqft;
  const opts = facts.detachedOptions;
  const oneAsIs = opts?.oneStory.asIs ?? facts.detachedZone;
  const twoAllowed = profile.height.twoStoryAllowed && opts?.twoStory != null;
  const candidates: DetachedOption[] = [];
  const add = (key: DetachedOption["key"], zone: SiteZone | null | undefined, stories: 1 | 2, replaces: boolean) => {
    if (!zone || zone.areaSqFt < ADU_MIN_SMALL_SQFT) return;
    if (stories === 2 && zone.areaSqFt < TWO_STORY_MIN_FOOTPRINT_SQFT) return;
    candidates.push({ key, zone, stories, replaces, sizeSqFt: Math.min(cap, zone.areaSqFt * stories) });
  };
  add("one-story", oneAsIs, 1, false);
  add("one-story, replace accessory", opts?.oneStory.replaceAccessory, 1, true);
  if (twoAllowed) {
    add("two-story", opts?.twoStory?.asIs, 2, false);
    add("two-story, replace accessory", opts?.twoStory?.replaceAccessory, 2, true);
  }
  if (candidates.length === 0) return null;
  // Stories: one-story stays primary when it already reaches the max (or a
  // second story adds little); otherwise the two-story size is the answer.
  const bestOf = (replaces: boolean): DetachedOption | null => {
    const one = candidates.find((c) => c.stories === 1 && c.replaces === replaces) ?? null;
    const two = candidates.find((c) => c.stories === 2 && c.replaces === replaces) ?? null;
    if (!one) return two;
    if (!two || one.sizeSqFt >= cap) return one;
    return two.sizeSqFt >= one.sizeSqFt + TWO_STORY_MIN_GAIN_SQFT ? two : one;
  };
  // Demolition: replace the accessory structure only for a materially bigger unit.
  const keep = bestOf(false);
  const replace = bestOf(true);
  const chosen =
    keep && (!replace || replace.sizeSqFt < keep.sizeSqFt + MATERIAL_GAIN_SQFT) ? keep : (replace ?? candidates[0]);

  // Honest alternatives the owner can weigh (keeping the structure, one story).
  const alternatives: string[] = [];
  if (chosen.replaces) {
    const keep1 = candidates.find((c) => c.key === "one-story");
    const keep2 = candidates.find((c) => c.key === "two-story");
    if (keep1 || keep2) {
      const z = (keep1 ?? keep2)!.zone;
      const parts = [
        keep1 ? `~${fmt(keep1.sizeSqFt)} sq ft one-story` : null,
        keep2 ? `~${fmt(keep2.sizeSqFt)} sq ft two-story` : null,
      ].filter(Boolean);
      alternatives.push(`Keeping the ${facts.detachedOptions?.replaceable.length === 1 ? facts.detachedOptions.replaceable[0].kind : "existing structures"}, the largest open area is ${z.widthFt} × ${z.depthFt} ft (${parts.join(" or ")}).`);
    } else {
      alternatives.push(`Keeping the ${facts.detachedOptions?.replaceable.length === 1 ? facts.detachedOptions.replaceable[0].kind : "existing structures"}, no detached footprint fits after setbacks.`);
    }
  }
  if (chosen.stories === 2) {
    const one = candidates.filter((c) => c.stories === 1 && c.replaces === chosen.replaces)[0];
    if (one) alternatives.push(`A one-story unit would top out at about ${fmt(one.sizeSqFt)} sq ft.`);
  }
  return { chosen, alternatives };
}

/**
 * Fold the MEASURED terrain (USGS 3DEP samples on the parcel) into the
 * detached verdict: ≥ 15% (lot average or ADU area) adds an engineered-
 * foundation constraint and its cost; ≥ 25% in the ADU area (or a ≥ 25% lot
 * whose ADU area is also steep) downgrades to "Limited" pending engineering.
 */
function applyTerrain(v: AduTypeVerdict, facts: SiteFacts): AduTypeVerdict {
  const t = facts.terrain;
  if (!t || v.maxSqFt <= 0 || v.level === "Not Recommended") return v;
  const lot = t.lotSlopePercent;
  const zone = t.aduAreaSlopePercent;
  if (Math.max(lot, zone ?? 0) < STEEP_SLOPE_PERCENT) return v;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const where =
    zone != null ? `${r1(lot)}% average across the lot, ${r1(zone)}% in the likely ADU area` : `${r1(lot)}% average across the lot`;
  const cost = t.foundationCostUsd > 0 ? t.foundationCostUsd : 0;
  const design = zone ?? lot;
  const verySteep = design >= VERY_STEEP_SLOPE_PERCENT || (lot >= VERY_STEEP_SLOPE_PERCENT && design >= STEEP_SLOPE_PERCENT);
  const out: AduTypeVerdict = {
    ...v,
    constraints: [
      `Steep lot (${where}, USGS 3DEP) — engineered foundation${cost ? `, est. +$${fmt(cost)}` : ""}`,
      ...v.constraints,
    ],
    siteCostUsd: cost || undefined,
  };
  if (verySteep && (v.level === "Likely" || v.level === "Possible")) {
    out.level = "Limited";
    out.sizeLabel = `${v.sizeLabel} — engineering review required`;
    out.description = `Very steep lot — engineering review required: the measured grade is ${where}. ${v.description} On a slope like this a detached unit typically needs drilled piers/caissons, retaining walls and a geotechnical report, so buildable size and cost must be confirmed by a civil/structural engineer.`;
    out.headline = undefined;
  } else {
    out.description = `${v.description} The lot is steep (${where}), so expect an engineered foundation${cost ? ` (about $${fmt(cost)} more than a slab)` : ""}.`;
  }
  return out;
}

export function evaluateAduTypeFit(facts: SiteFacts, profile: JurisdictionProfile): Record<AduTypeName, AduTypeVerdict> {
  const rules = profile.sizeRules;
  const { sideRearFt, separationFt } = facts.setbacksUsed;
  const oneStorySideRearFt = facts.setbacksUsed.oneStorySideRearFt ?? sideRearFt;
  const phraseFor = (sr: number) =>
    `${sr === 0 ? "0 ft (none required)" : `${sr} ft`} from side/rear lot lines and ${separationFt} ft from the home`;

  // ── Detached ADU ──
  let detached: AduTypeVerdict;
  const pick = facts.geometryVerified ? chooseDetachedOption(facts, profile) : null;
  if (facts.geometryVerified && pick && pick.chosen.sizeSqFt >= ADU_MIN_STANDARD_SQFT) {
    const c = pick.chosen;
    const max = c.sizeSqFt;
    const pos = c.zone.position === "rear" ? "rear-yard" : `${c.zone.position.replace("-", " ")} yard`;
    const removedLabel = describeRemoved(facts);
    const phrase = phraseFor(c.stories === 1 ? oneStorySideRearFt : sideRearFt);
    const footprint = Math.min(c.zone.areaSqFt, c.stories === 2 ? Math.ceil(max / 2) : max);
    const sentences: string[] = [];
    if (c.replaces) {
      sentences.push(
        `By replacing the existing ${removedLabel}, a ${c.zone.widthFt} × ${c.zone.depthFt} ft ${pos} area opens up for a new detached unit after required setbacks (${phrase}), measured on the County parcel map and building outlines.`
      );
    } else {
      sentences.push(
        `A ${c.zone.widthFt} × ${c.zone.depthFt} ft ${pos} area fits a detached unit after required setbacks (${phrase}), measured on the County parcel map and building outlines.`
      );
    }
    if (c.stories === 2) {
      sentences.push(
        `Built two stories (~${fmt(footprint)} sq ft per floor), it reaches ${max >= rules.detachedAduMaxSqft ? `the ${fmt(rules.detachedAduMaxSqft)} sq ft maximum` : `${fmt(max)} sq ft`}.`
      );
    } else if (max >= rules.detachedAduMaxSqft) {
      sentences.push(`That's room for a one-story unit at the ${fmt(rules.detachedAduMaxSqft)} sq ft maximum.`);
    }
    const alt = pick.alternatives;
    if (alt.length) sentences.push(alt.join(" "));
    const constraints: string[] = [];
    if (c.replaces) {
      constraints.push(`Requires demolishing the existing ${removedLabel}`);
      constraints.push(
        profile.identity.id === "san-diego-city"
          ? "No replacement parking for a garage demolished for an ADU (Gov. Code § 66314(d)(11)), except in the Beach Impact Area outside a transit priority area (SDMC § 141.0302(b)(10)(C))"
          : "No replacement parking for a garage demolished for an ADU (Gov. Code § 66314(d)(11))"
      );
    }
    if (c.stories === 2) {
      constraints.push(`Two-story design (over 16 ft tall) — ${sideRearFt} ft side/rear setbacks and base-zone height limit apply`);
    } else if (oneStorySideRearFt < sideRearFt) {
      constraints.push(
        `${oneStorySideRearFt} ft side/rear setback applies only to a one-story unit ≤ 16 ft tall; walls within 5 ft of a lot line need a 1-hour fire rating (CRC R302.1)`
      );
    }
    detached = {
      type: "Detached ADU",
      level: "Likely",
      minSqFt: ADU_MIN_STANDARD_SQFT,
      maxSqFt: max,
      sizeLabel: `${range(ADU_MIN_STANDARD_SQFT, max)} (${c.stories === 2 ? `two-story, ~${fmt(footprint)} sq ft footprint` : "one-story"})`,
      description: sentences.join(" "),
      constraints,
      stories: c.stories,
      sizeNote: c.stories === 2 ? `two-story, ~${fmt(footprint)} sq ft footprint` : "one-story",
      replacesAccessory: c.replaces,
      headline: c.replaces
        ? `A detached ADU of up to ${fmt(max)} sq ft${c.stories === 2 ? " (two-story)" : ""} fits by replacing the existing ${removedLabel}.`
        : c.stories === 2
          ? `A two-story detached ADU (~${fmt(footprint)} sq ft footprint) reaches ${fmt(max)} sq ft.`
          : undefined,
    };
  } else if (facts.geometryVerified) {
    if (pick && pick.chosen.sizeSqFt >= ADU_MIN_SMALL_SQFT) {
      const c = pick.chosen;
      const removedLabel = describeRemoved(facts);
      detached = {
        type: "Detached ADU",
        level: "Possible",
        minSqFt: ADU_MIN_SMALL_SQFT,
        maxSqFt: c.sizeSqFt,
        sizeLabel: `${range(ADU_MIN_SMALL_SQFT, c.sizeSqFt)} (${c.stories === 2 ? "two-story" : "one-story"})`,
        description: `Only a compact detached unit fits${c.replaces ? ` (by replacing the existing ${removedLabel})` : ""}: the largest open area after required setbacks (${phraseFor(c.stories === 1 ? oneStorySideRearFt : sideRearFt)}) is about ${c.zone.widthFt} × ${c.zone.depthFt} ft.`,
        constraints: [
          "Compact footprint — below the smallest standard DCS detached plan (400 sq ft)",
          ...(c.replaces ? [`Requires demolishing the existing ${removedLabel}`] : []),
        ],
        stories: c.stories,
        sizeNote: c.stories === 2 ? "two-story" : "one-story",
        replacesAccessory: c.replaces,
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
        description: `Rear/side yard too small after required setbacks (${phraseFor(oneStorySideRearFt)}); no ${ADU_MIN_DIMENSION_FT} × ${ADU_MIN_DIMENSION_FT} ft area remains for a detached unit.${yardNote}`,
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

  detached = applyTerrain(detached, facts);

  // ── Garage Conversion ──
  let garage: AduTypeVerdict;
  // A stall count above ~10 on a residential record is a data-entry value
  // (often the garage sq ft) — treat it as unknown rather than repeat it.
  const stallsImplausible = facts.garageStalls != null && facts.garageStalls > 10;
  const stalls = stallsImplausible ? null : facts.garageStalls;
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
    // A DETACHED garage can also be converted and expanded (or rebuilt
    // larger) into a full detached ADU — size it from the yard it sits in.
    const expandZone = facts.garageAttached === false ? facts.detachedOptions?.oneStory.replaceAccessory ?? null : null;
    const expandMax = expandZone ? Math.min(rules.detachedAduMaxSqft, expandZone.areaSqFt) : 0;
    const expandNote =
      facts.garageAttached === false
        ? expandMax > size + MATERIAL_GAIN_SQFT
          ? ` Because the garage is detached, it can also be converted and expanded into a larger detached ADU — the yard around it fits up to about ${fmt(expandMax)} sq ft one-story after setbacks (the existing garage walls keep their current setbacks; the expansion must meet ADU setbacks).`
          : " Because the garage is detached, it can also be converted and modestly expanded (the existing walls keep their current setbacks; any expansion must meet ADU setbacks)."
        : "";
    garage = {
      type: "Garage Conversion",
      level: confirmed ? "Likely" : "Possible",
      minSqFt: size,
      maxSqFt: size,
      sizeLabel: `${fmt(size)} sq ft`,
      description: `County Assessor records ${confirmed ? "show" : "for the nearest parcel show"} a ${stalls}-car garage${facts.garageAttached === false ? ` (detached${facts.garageSqFtEstimate ? `, ~${fmt(facts.garageSqFtEstimate)} sq ft outline` : ""})` : ""}. Converting it (about ${fmt(size)} sq ft) is typically the fastest, most affordable ADU path, with no replacement parking required under state law (Gov. Code § 66314(d)(11)).${expandNote}${confirmed ? "" : " Confirm the garage on site."}`,
      constraints: [
        "No replacement parking required per state law (Gov. Code § 66314(d)(11))",
        ...(facts.garageAttached === false ? ["Detached garage — convert-and-expand option (expansion must meet ADU setbacks)"] : []),
        ...(confirmed ? [] : ["Parcel match unconfirmed — verify garage on site"]),
      ],
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
      description: stallsImplausible
        ? "The County record's garage entry isn't usable (it doesn't look like a stall count), so garage size needs a site review. If the home has a garage, converting it is typically the most affordable ADU path."
        : "Garage details are not on record for this address. If the home has a garage, converting it is typically the most affordable ADU path.",
      constraints: ["Garage not confirmed — site review required"],
    };
  }

  // ── Attached ADU ──
  let attached: AduTypeVerdict;
  const livingCap = facts.livingAreaSqFt ? Math.round(facts.livingAreaSqFt * 0.5) : rules.attachedAduMaxSqft;
  const attachedCap = Math.max(ATTACHED_MIN_SQFT, Math.min(rules.attachedAduMaxSqft, Math.max(livingCap, 800)));
  if (facts.geometryVerified) {
    const fit = facts.attachedFit;
    const usableDepth = fit ? Math.min(fit.widthFt, fit.depthFt) : 0;
    const y = facts.measuredYards;
    if (fit && fit.areaSqFt >= 150 && (fit.areaSqFt < ATTACHED_MIN_SQFT || usableDepth < ATTACHED_MIN_USABLE_DEPTH_FT)) {
      // Something technically fits, but it's a sliver: a real addition needs
      // ≥ 14 ft of usable depth behind/beside the home after the setback.
      const rearNote = y ? ` The rear yard measures about ${y.rearFt} ft deep (${Math.max(0, y.rearFt - sideRearFt)} ft usable after the ${sideRearFt} ft setback).` : "";
      attached = {
        type: "Attached ADU",
        level: "Limited",
        minSqFt: 0,
        maxSqFt: Math.min(fit.areaSqFt, attachedCap),
        sizeLabel: `Up to ~${fmt(Math.min(fit.areaSqFt, attachedCap))} sq ft (tight — verify on site)`,
        description: `Tight yard: after keeping ${sideRearFt} ft from the lot lines, the largest area next to the home is only about ${fit.widthFt} × ${fit.depthFt} ft — less than the ~${ATTACHED_MIN_USABLE_DEPTH_FT} ft of usable depth a livable addition needs.${rearNote} Recorded yard depths can differ from what's on the ground (patios, slopes, walls), so this needs a site visit.`,
        constraints: ["Tight rear/side yard — verify on site", "Design/structural review of the attachment required"],
      };
    } else if (fit && fit.areaSqFt >= ATTACHED_MIN_SQFT) {
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
