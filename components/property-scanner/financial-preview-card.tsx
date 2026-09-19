"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

interface FinancialScenario {
  scenarioName: string;
  scenarioType: string;
  projectedUnits: number;
  estimatedBuildCost: number;
  estimatedSoftCost: number;
  estimatedTotalCost: number;
  estimatedLoanAmount: number;
  estimatedDownPayment: number;
  estimatedMonthlyPayment: number;
  estimatedMonthlyIncome: number;
  estimatedMonthlyCashflow: number;
  estimatedAnnualGrossIncome: number;
  estimatedAnnualNetCashflow: number;
  estimatedRoi: number;
  estimatedPaybackYears: number;
  estimatedValueAdd: number;
  rentSource?: "rentcast" | "estimated";
  rentBasis?: string;
  assumptions?: string[];
}

interface FinancialPreviewCardProps {
  scenarios: FinancialScenario[];
  disclaimer?: string;
}

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString()}`;
}

export function FinancialPreviewCard({ scenarios, disclaimer }: FinancialPreviewCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (scenarios.length === 0) return null;

  // Show the best single-unit scenario as the primary
  const primaryScenario = scenarios.find((s) => s.scenarioType !== "maximize") || scenarios[0];
  const maximizeScenario = scenarios.find((s) => s.scenarioType === "maximize");

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-secondary">Financial Preview</h3>
          <p className="text-sm text-muted-foreground">Planning estimates — costs, rent, and returns (assumptions below)</p>
        </div>
      </div>

      {/* Primary scenario highlight */}
      <div className="rounded-xl bg-gradient-to-br from-secondary/[0.03] to-secondary/[0.08] border border-secondary/10 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-secondary">{primaryScenario.scenarioName}</h4>
          {primaryScenario.estimatedMonthlyCashflow > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-primary/10 text-primary">
              Cash Flow Positive
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Est. Total Cost</p>
            <p className="text-base font-bold text-secondary">
              {formatCurrency(primaryScenario.estimatedTotalCost)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Monthly Rent{" "}
              {primaryScenario.rentSource === "rentcast" ? "(RentCast)" : primaryScenario.rentSource ? "(planning est.)" : ""}
            </p>
            <p className="text-base font-bold text-primary">
              {formatCurrencyFull(primaryScenario.estimatedMonthlyIncome)}/mo
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Monthly Cash Flow</p>
            <p className={`text-base font-bold ${
              primaryScenario.estimatedMonthlyCashflow >= 0 ? "text-primary" : "text-red-700"
            }`}>
              {primaryScenario.estimatedMonthlyCashflow >= 0 ? "+" : ""}
              {formatCurrencyFull(primaryScenario.estimatedMonthlyCashflow)}/mo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-secondary/10">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className="text-xs font-semibold text-secondary">{primaryScenario.estimatedRoi}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Payback</p>
              <p className="text-xs font-semibold text-secondary">
                {primaryScenario.estimatedPaybackYears < 99
                  ? `~${primaryScenario.estimatedPaybackYears} yrs`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Value Add (cost-based)</p>
              <p className="text-xs font-semibold text-secondary">
                +{formatCurrency(primaryScenario.estimatedValueAdd)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maximize scenario callout */}
      {maximizeScenario && (
        <div className="rounded-xl bg-primary/[0.04] border border-primary/20 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-secondary">
                {maximizeScenario.scenarioName}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-primary/10 text-primary">
              {maximizeScenario.projectedUnits} units
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-sm font-bold text-secondary">
                {formatCurrency(maximizeScenario.estimatedTotalCost)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Income</p>
              <p className="text-sm font-bold text-primary">
                {formatCurrencyFull(maximizeScenario.estimatedMonthlyIncome)}/mo
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cash Flow</p>
              <p className={`text-sm font-bold ${
                maximizeScenario.estimatedMonthlyCashflow >= 0 ? "text-primary" : "text-red-700"
              }`}>
                {maximizeScenario.estimatedMonthlyCashflow >= 0 ? "+" : ""}
                {formatCurrencyFull(maximizeScenario.estimatedMonthlyCashflow)}/mo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All scenarios expandable */}
      {scenarios.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">All Scenarios</p>
          {scenarios.map((scenario, i) => (
            <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="w-full min-h-11 flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary">{scenario.scenarioName}</span>
                  {scenario.projectedUnits > 1 && (
                    <span className="text-xs text-muted-foreground">
                      ({scenario.projectedUnits} units)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${
                    scenario.estimatedMonthlyCashflow >= 0 ? "text-primary" : "text-red-700"
                  }`}>
                    {scenario.estimatedMonthlyCashflow >= 0 ? "+" : ""}
                    {formatCurrencyFull(scenario.estimatedMonthlyCashflow)}/mo
                  </span>
                  {expandedIndex === i ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedIndex === i && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-2 border-t border-border/30">
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Build Cost</p>
                    <p className="text-xs font-semibold">{formatCurrencyFull(scenario.estimatedBuildCost)}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Soft Costs</p>
                    <p className="text-xs font-semibold">{formatCurrencyFull(scenario.estimatedSoftCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Down Payment</p>
                    <p className="text-xs font-semibold">{formatCurrencyFull(scenario.estimatedDownPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="text-xs font-semibold">{formatCurrencyFull(scenario.estimatedMonthlyPayment)}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Annual ROI</p>
                    <p className="text-xs font-semibold">{scenario.estimatedRoi}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Value Add</p>
                    <p className="text-xs font-semibold text-primary">+{formatCurrencyFull(scenario.estimatedValueAdd)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {primaryScenario.assumptions && primaryScenario.assumptions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs font-medium text-secondary mb-1">How these numbers are estimated</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {primaryScenario.assumptions.map((a) => (
              <li key={a} className="text-xs text-muted-foreground leading-relaxed">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {disclaimer && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
