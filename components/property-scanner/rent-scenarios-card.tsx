"use client";

import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RentScenario {
  conservative: { monthlyRent: number; annualRent: number };
  market: { monthlyRent: number; annualRent: number };
  premium: { monthlyRent: number; annualRent: number };
  source: "rentcast" | "estimated";
  aduType: string;
  basis?: string;
}

interface RentScenariosCardProps {
  scenarios: RentScenario[];
}

export function RentScenariosCard({ scenarios }: RentScenariosCardProps) {
  if (!scenarios || scenarios.length === 0) return null;
  const market = scenarios.every((s) => s.source === "rentcast");

  return (
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Rent Scenarios</h3>
            <p className="text-sm text-white/75">Based on your recommended ADU</p>
          </div>
        </div>
        {market ? (
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
        {scenarios.map((scenario) => (
          <div key={scenario.aduType} className="bg-secondary border border-white/10 rounded-xl p-3">
            <p className="text-xs font-semibold text-white capitalize mb-2">
              {scenario.aduType.replace(/-/g, " ")}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Conservative */}
              <div className="bg-white/[0.04] rounded-lg p-2 border border-amber-400/30">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-amber-300" />
                  <span className="text-xs font-medium text-amber-200">Conservative</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ${scenario.conservative.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-white/75">/month</p>
              </div>

              {/* Market */}
              <div className="bg-white/[0.04] rounded-lg p-2 border border-accent/40">
                <div className="flex items-center gap-1 mb-1">
                  <Minus className="h-3 w-3 text-accent" />
                  <span className="text-xs font-medium text-accent">Market</span>
                </div>
                <p className="text-sm font-bold text-accent">
                  ${scenario.market.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-white/75">/month</p>
              </div>

              {/* Premium */}
              <div className="bg-white/[0.04] rounded-lg p-2 border border-white/10">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <span className="text-xs font-medium text-white">Premium</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ${scenario.premium.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-white/75">/month</p>
              </div>
            </div>

            {/* Annual summary */}
            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-xs text-white/75">
              <span>Annual range: ${scenario.conservative.annualRent.toLocaleString()}&nbsp;– ${scenario.premium.annualRent.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/75 mt-3">
        {market
          ? "Conservative / premium = the low and high end of RentCast's rent range for this address; market = its point estimate."
          : "Conservative / premium = low and high end of a San Diego County ADU rent table for this unit size (planning estimate, not a market quote for this address)."}{" "}
        Actual rents depend on unit quality, finishes and market conditions.
      </p>
    </div>
  );
}
