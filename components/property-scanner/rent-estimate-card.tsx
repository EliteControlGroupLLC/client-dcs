"use client";

import { DollarSign, TrendingUp } from "lucide-react";

interface RentEstimateData {
  estimates: {
    aduType: string;
    monthlyRent: number;
    annualRent: number;
    rentRange: string;
    pricePerSqft: number;
    source: "rentcast" | "estimated";
    confidence: number;
  }[];
  available: true;
  source: "rentcast" | "estimated";
  basis?: string;
  comparableCount?: number;
  comparables?: {
    address: string;
    monthlyRent: number;
    squareFootage: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    distanceMiles: number | null;
  }[];
}

interface RentEstimateCardProps {
  data: RentEstimateData;
}

export function RentEstimateCard({ data }: RentEstimateCardProps) {
  return (
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Rent Estimates</h3>
        </div>
        {data.source === "rentcast" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-accent/10 text-accent-light border border-accent/30">
            RentCast market estimate
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-amber-500/10 text-amber-200 border border-amber-400/30">
            Planning estimate
          </span>
        )}
      </div>

      <div className="space-y-3">
        {data.estimates.map((est) => (
          <div key={est.aduType} className="bg-secondary border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white capitalize">
                {est.aduType.replace(/-/g, " ")}
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-sm font-bold text-accent">
                  ${est.monthlyRent.toLocaleString()}/mo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-white/75">Annual</p>
                <p className="text-xs font-semibold text-white">
                  ${est.annualRent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/75">Range</p>
                <p className="text-xs font-semibold text-white">{est.rentRange.replace(" - ", "\u00A0– ")}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">$/sqft</p>
                <p className="text-xs font-semibold text-white">
                  {Number.isFinite(est.pricePerSqft) ? `$${est.pricePerSqft.toFixed(2)}` : "—"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.source === "rentcast" && data.comparables && data.comparables.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-white">Nearby rental comparables</p>
          {data.comparables.slice(0, 3).map((c) => (
            <p key={c.address} className="text-xs text-white/75 flex justify-between gap-2 min-w-0">
              <span className="truncate min-w-0">
                {c.address}
                {c.squareFootage ? ` · ${c.squareFootage.toLocaleString()} sq ft` : ""}
                {c.bedrooms != null ? ` · ${c.bedrooms} bd` : ""}
                {c.distanceMiles != null ? ` · ${c.distanceMiles} mi` : ""}
              </span>
              <span className="font-medium text-white whitespace-nowrap">${c.monthlyRent.toLocaleString()}/mo</span>
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/10">
        <span className="text-xs text-white/75">
          {data.basis ??
            (data.source === "rentcast"
              ? "RentCast rent estimate for this address"
              : "Planning estimate from a San Diego County ADU rent table — not a market quote for this address")}
        </span>
      </div>
    </div>
  );
}
