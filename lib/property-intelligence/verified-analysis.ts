// Verified property analysis — the single gate every public entry point uses.
// A report is only produced for a REAL San Diego County property: the address
// must resolve to one known county address AND match a County Assessor
// (SANDAG) parcel by house number. Otherwise a machine-readable failure:
//   ADDRESS_NOT_FOUND  — no such address / no parcel record
//   ADDRESS_AMBIGUOUS  — several real addresses match (candidates listed)
//   OUT_OF_AREA        — a real address outside San Diego County

import { analyzeProperty } from "./analysis-engine";
import { resolveSanDiegoAddress } from "./geocoding-service";
import type { PropertyAnalysisResult } from "./types";

export type AnalyzePropertyErrorCode = "ADDRESS_NOT_FOUND" | "ADDRESS_AMBIGUOUS" | "OUT_OF_AREA";

export type VerifiedAnalysis =
  | {
      ok: true;
      result: PropertyAnalysisResult;
      inputAddress: string;
      resolvedAddress: string;
      parcelMatch: string;
      elapsedMs: number;
    }
  | {
      ok: false;
      code: AnalyzePropertyErrorCode;
      message: string;
      candidates?: string[];
      extra?: Record<string, unknown>;
    };

function fail(
  code: AnalyzePropertyErrorCode,
  message: string,
  candidates?: string[],
  extra?: Record<string, unknown>
): VerifiedAnalysis {
  return { ok: false, code, message, candidates, extra };
}

export async function runVerifiedAnalysis(address: string): Promise<VerifiedAnalysis> {
  const inputAddress = address.trim().replace(/\s+/g, " ");
  const startTime = Date.now();

  // 1) Resolve the typed address to ONE real San Diego County address.
  const resolution = await resolveSanDiegoAddress(inputAddress);
  if (resolution.status === "ambiguous") {
    return fail(
      "ADDRESS_AMBIGUOUS",
      resolution.localityMismatch
        ? resolution.candidates.length === 1
          ? `We couldn't find that exact address. Did you mean ${resolution.candidates[0]}?`
          : "We couldn't find that exact address. Did you mean one of these?"
        : "That address matches more than one property in San Diego County. Please pick the right one.",
      resolution.candidates
    );
  }
  if (resolution.status === "out_of_area") {
    return fail(
      "OUT_OF_AREA",
      `${resolution.matchedAddress} is outside San Diego County. Our ADU analysis currently covers San Diego County properties only.`,
      undefined,
      { matchedAddress: resolution.matchedAddress }
    );
  }
  if (resolution.status === "not_found") {
    return fail(
      "ADDRESS_NOT_FOUND",
      "We couldn't find that property in San Diego County. Check the house number and street, or pick an address from the suggestions."
    );
  }
  if (resolution.status === "unavailable") {
    // Geocoder outage: don't guess — fall through with the typed address;
    // the parcel gate below still refuses anything not on County record.
    console.error(`[SERVER-ANALYSIS] Address resolver unavailable: ${resolution.reason}`);
  }
  const resolvedAddress = resolution.status === "resolved" ? resolution.address : inputAddress;

  // 2) Run the analysis on the resolved full address.
  const result = await analyzeProperty(resolvedAddress);
  const elapsedMs = Date.now() - startTime;

  // 3) Parcel gate — the engine must have matched the County Assessor parcel
  //    by house number (situs, incl. multi-address ranges). A "nearest" or
  //    "address-point" match means the County has no record of this house
  //    number on that parcel, so any report would be built on a neighbor's
  //    lot or on assumed defaults. Refuse rather than fabricate.
  const parcelMatch = result.siteFacts?.parcelMatch ?? "none";
  const apn = result.property?.apn?.value;
  const hasApn = typeof apn === "string" && apn.trim() !== "" && apn !== "Not available";
  if (parcelMatch !== "exact-address" || !hasApn) {
    console.warn(
      `[SERVER-ANALYSIS] Refusing report for "${resolvedAddress}": parcelMatch=${parcelMatch}, apn=${hasApn ? apn : "none"}`
    );
    return fail(
      "ADDRESS_NOT_FOUND",
      resolution.status === "resolved"
        ? `We found ${resolvedAddress}, but couldn't match it to a San Diego County Assessor parcel record, so we can't produce an accurate report for it. Double-check the house number, or contact us for a manual site review.`
        : "We couldn't find that property in San Diego County records. Check the house number and street, or pick an address from the suggestions.",
      undefined,
      { resolvedAddress: resolution.status === "resolved" ? resolvedAddress : undefined, parcelMatch }
    );
  }

  return { ok: true, result, inputAddress, resolvedAddress, parcelMatch, elapsedMs };
}
