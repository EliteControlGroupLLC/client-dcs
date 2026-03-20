"use client";

import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RentScenario {
  conservative: { monthlyRent: number; annualRent: number };
  market: { monthlyRent: number; annualRent: number };
  premium: { monthlyRent: number; annualRent: number };
  source: "rentcast" | "estimated";
  aduType: string;
}

interface RentScenariosCardProps {
  scenarios: RentScenario[];
}

export function RentScenariosCard({ scenarios }: RentScenariosCardProps) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary text-sm">Rent Scenarios</h3>
            <p className="text-[10px] text-muted-foreground">Based on your recommended ADU</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
          San Diego Market Data
        </span>
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div key={scenario.aduType} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-secondary capitalize mb-2">
              {scenario.aduType.replace(/-/g, " ")}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Conservative */}
              <div className="bg-white rounded-lg p-2 border border-amber-100">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-medium text-amber-600">Conservative</span>
                </div>
                <p className="text-sm font-bold text-secondary">
                  ${scenario.conservative.monthlyRent.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">/month</p>
              </div>

              {/* Market */}
              <div className="bg-white rounded-lg p-2 border border-emerald-100">
                <div className="flex items-center gap-1 mb-1">
                  <Minus className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-600">Market</span>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  ${scenario.market.monthlyRent.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">/month</p>
              </div>

              {/* Premium */}
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-600">Premium</span>
                </div>
                <p className="text-sm font-bold text-secondary">
                  ${scenario.premium.monthlyRent.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">/month</p>
              </div>
            </div>

            {/* Annual summary */}
            <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground">
              <span>Annual range: ${scenario.conservative.annualRent.toLocaleString()} - ${scenario.premium.annualRent.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        Scenarios based on San Diego County market data. Actual rents depend on unit quality, location, and market conditions.
      </p>
    </div>
  );
}
