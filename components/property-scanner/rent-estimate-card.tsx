"use client";

import { DollarSign, TrendingUp, ExternalLink } from "lucide-react";

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
}

interface RentEstimateCardProps {
  data: RentEstimateData;
}

export function RentEstimateCard({ data }: RentEstimateCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-secondary text-sm">Rent Estimates</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
          San Diego Market Data
        </span>
      </div>

      <div className="space-y-3">
        {data.estimates.map((est) => (
          <div key={est.aduType} className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-secondary capitalize">
                {est.aduType.replace(/-/g, " ")}
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">
                  ${est.monthlyRent.toLocaleString()}/mo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Annual</p>
                <p className="text-xs font-semibold text-secondary">
                  ${est.annualRent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Range</p>
                <p className="text-[11px] font-medium text-secondary">{est.rentRange}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">$/sqft</p>
                <p className="text-xs font-semibold text-secondary">
                  ${est.pricePerSqft.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          Based on current San Diego County rental market data
        </span>
      </div>
    </div>
  );
}
