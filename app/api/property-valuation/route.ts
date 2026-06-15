// Server-side Property Valuation Route
// Returns current home value + nearby comparable sales (AVM), and the
// estimated value the recommended ADU would add. Keeps the provider key server-side.

import { NextRequest, NextResponse } from "next/server";
import {
  getPropertyValuation,
  getPropertyOwner,
  computeAduValueAdd,
} from "@/lib/property-intelligence/valuation-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      homeAreaSqFt,
      recommendedAduSqFt,
      aduAnnualNetIncome,
      aduTotalCost,
    } = body as {
      address?: string;
      homeAreaSqFt?: number | null;
      recommendedAduSqFt?: number | null;
      aduAnnualNetIncome?: number | null;
      aduTotalCost?: number | null;
    };

    if (!address || typeof address !== "string" || address.trim().length < 5) {
      return NextResponse.json({ error: "Valid address is required" }, { status: 400 });
    }

    const [valuation, owner] = await Promise.all([
      getPropertyValuation(address, homeAreaSqFt ?? null),
      getPropertyOwner(address),
    ]);

    const aduValueAdd = computeAduValueAdd({
      recommendedAduSqFt: recommendedAduSqFt && recommendedAduSqFt > 0 ? recommendedAduSqFt : 0,
      homePricePerSqft: valuation.pricePerSqft,
      aduAnnualNetIncome: aduAnnualNetIncome ?? null,
      aduTotalCost: aduTotalCost ?? null,
    });

    const projectedValue =
      valuation.estimatedValue !== null
        ? {
            low: valuation.estimatedValue + aduValueAdd.low,
            expected: valuation.estimatedValue + aduValueAdd.expected,
            high: valuation.estimatedValue + aduValueAdd.high,
          }
        : null;

    return NextResponse.json({
      success: true,
      valuation,
      owner,
      aduValueAdd,
      projectedValue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PROPERTY-VALUATION] Error:", error);
    return NextResponse.json(
      {
        error: "Valuation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
