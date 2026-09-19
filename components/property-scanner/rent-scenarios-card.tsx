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
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">Rent Scenarios</h3>
            <p className="text-sm text-muted-foreground">Based on your recommended ADU</p>
          </div>
        </div>
        {market ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary">
            RentCast market estimate
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            Planning estimate
          </span>
        )}
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div key={scenario.aduType} className="bg-muted rounded-xl p-3">
            <p className="text-xs font-semibold text-secondary capitalize mb-2">
              {scenario.aduType.replace(/-/g, " ")}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Conservative */}
              <div className="bg-white rounded-lg p-2 border border-amber-100">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">Conservative</span>
                </div>
                <p className="text-sm font-bold text-secondary">
                  ${scenario.conservative.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>

              {/* Market */}
              <div className="bg-white rounded-lg p-2 border border-primary/20">
                <div className="flex items-center gap-1 mb-1">
                  <Minus className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Market</span>
                </div>
                <p className="text-sm font-bold text-primary">
                  ${scenario.market.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>

              {/* Premium */}
              <div className="bg-white rounded-lg p-2 border border-border">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-secondary" />
                  <span className="text-xs font-medium text-secondary">Premium</span>
                </div>
                <p className="text-sm font-bold text-secondary">
                  ${scenario.premium.monthlyRent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>

            {/* Annual summary */}
            <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
              <span>Annual range: ${scenario.conservative.annualRent.toLocaleString()} - ${scenario.premium.annualRent.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {market
          ? "Conservative / premium = the low and high end of RentCast's rent range for this address; market = its point estimate."
          : "Conservative / premium = low and high end of a San Diego County ADU rent table for this unit size (planning estimate, not a market quote for this address)."}{" "}
        Actual rents depend on unit quality, finishes and market conditions.
      </p>
    </div>
  );
}
