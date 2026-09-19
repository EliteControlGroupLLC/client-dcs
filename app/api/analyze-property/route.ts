// Server-side Property Analysis Route
// SURGICAL FIX: Moves all external API calls server-side to protect API keys.
// Client calls this route instead of directly calling external providers.
//
// LEGITIMACY GATE: a report is only returned for a REAL San Diego County
// property — the address must resolve to one known address in the county AND
// match a County Assessor (SANDAG) parcel by house number. Otherwise the route
// answers 422 with a machine-readable code instead of a fabricated report:
//   ADDRESS_NOT_FOUND  — no such address / no parcel record
//   ADDRESS_AMBIGUOUS  — several real addresses match (candidates listed)
//   OUT_OF_AREA        — a real address outside San Diego County

import { NextRequest, NextResponse } from "next/server";
import { analyzeProperty } from "@/lib/property-intelligence";
import { resolveSanDiegoAddress } from "@/lib/property-intelligence/geocoding-service";

type AnalyzePropertyErrorCode = "ADDRESS_NOT_FOUND" | "ADDRESS_AMBIGUOUS" | "OUT_OF_AREA";

function lookupFailure(
  code: AnalyzePropertyErrorCode,
  message: string,
  candidates?: string[],
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, code, message, ...(candidates?.length ? { candidates } : {}), ...extra },
    { status: 422 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (address.trim().length < 5) {
      return NextResponse.json(
        { error: "Address too short" },
        { status: 400 }
      );
    }

    const inputAddress = address.trim().replace(/\s+/g, " ");
    console.log(`[SERVER-ANALYSIS] Starting analysis for: ${inputAddress}`);
    const startTime = Date.now();

    // 1) Resolve the typed address to ONE real San Diego County address.
    const resolution = await resolveSanDiegoAddress(inputAddress);
    if (resolution.status === "ambiguous") {
      return lookupFailure(
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
      return lookupFailure(
        "OUT_OF_AREA",
        `${resolution.matchedAddress} is outside San Diego County. Our ADU analysis currently covers San Diego County properties only.`,
        undefined,
        { matchedAddress: resolution.matchedAddress }
      );
    }
    if (resolution.status === "not_found") {
      return lookupFailure(
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
      return lookupFailure(
        "ADDRESS_NOT_FOUND",
        resolution.status === "resolved"
          ? `We found ${resolvedAddress}, but couldn't match it to a San Diego County Assessor parcel record, so we can't produce an accurate report for it. Double-check the house number, or contact us for a manual site review.`
          : "We couldn't find that property in San Diego County records. Check the house number and street, or pick an address from the suggestions.",
        undefined,
        { resolvedAddress: resolution.status === "resolved" ? resolvedAddress : undefined, parcelMatch }
      );
    }

    console.log(`[SERVER-ANALYSIS] Completed in ${elapsedMs}ms, confidence: ${result.confidenceScore}, method: ${result.finalBuildability.geometryMethodUsed}`);

    return NextResponse.json({
      success: true,
      result,
      meta: {
        inputAddress,
        resolvedAddress,
        parcelMatch,
        executionTimeMs: elapsedMs,
        geometryMethod: result.finalBuildability.geometryMethodUsed,
        buildabilityConfidence: result.finalBuildability.buildabilityConfidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[SERVER-ANALYSIS] Error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
