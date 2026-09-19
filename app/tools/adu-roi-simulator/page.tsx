"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { selectClass, ResultIcon, resultCardClass, resultTileClass } from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { ArrowRight, BarChart3 } from "lucide-react";
import { estimateAduPriceRange, getAverageMonthlyRent } from "@/lib/data/site-data";

const scenarioPresets = [
  {
    label: "500 sq ft Attached ADU",
    sqFt: 500,
    type: "attached",
    bedrooms: 1,
    bathrooms: 1,
    stories: 1,
  },
  {
    label: "750 sq ft Detached ADU",
    sqFt: 750,
    type: "detached",
    bedrooms: 2,
    bathrooms: 1,
    stories: 1,
  },
  {
    label: "1,000 sq ft Detached ADU",
    sqFt: 1000,
    type: "detached",
    bedrooms: 3,
    bathrooms: 2,
    stories: 1,
  },
  {
    label: "1,200 sq ft Two-Story ADU",
    sqFt: 1200,
    type: "two-story",
    bedrooms: 4,
    bathrooms: 2,
    stories: 2,
  },
] as const;

export default function ADUROISimulatorPage() {
  const defaultScenario = scenarioPresets[0];
  const defaultRange = estimateAduPriceRange(defaultScenario);
  const defaultCost = Math.round((defaultRange.low + defaultRange.high) / 2);
  const [presetIndex, setPresetIndex] = useState(0);
  const [projectCost, setProjectCost] = useState(defaultCost);
  const [monthlyRent, setMonthlyRent] = useState(
    getAverageMonthlyRent(
      defaultScenario.sqFt,
      defaultScenario.type,
      defaultScenario.bedrooms,
      { stories: defaultScenario.stories }
    )
  );
  const [loanAmount, setLoanAmount] = useState(defaultCost);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Calculate monthly mortgage payment
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  const monthlyPayment = loanAmount > 0 && monthlyRate > 0
    ? Math.round(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1))
    : 0;

  const monthlyCashFlow = monthlyRent - monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const downPayment = projectCost - loanAmount;
  const cashOnCashReturn = downPayment > 0 ? Math.round((annualCashFlow / downPayment) * 1000) / 10 : 0;

  // Break-even on total investment
  const totalInvestment = projectCost;
  const monthsToPayoff = monthlyCashFlow > 0 ? Math.ceil(totalInvestment / monthlyCashFlow) : 0;
  const yearsToPayoff = Math.round(monthsToPayoff / 12 * 10) / 10;

  // 10-year projection
  const tenYearIncome = monthlyRent * 12 * 10;
  const tenYearPayments = monthlyPayment * 12 * 10;
  const tenYearNetCashFlow = tenYearIncome - tenYearPayments;

  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              ROI SIMULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              ADU ROI Scenario Simulator
            </h1>
            <p className="text-xl text-white/80">
              Model your ADU as an investment. Adjust project cost, financing, and rent to see
              projected cash flow, return, and payoff timeline.
            </p>
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.aduRoiSimulator}
        headline="Unlock the ADU ROI simulator"
        subhead="Model build cost, financing and rent to see your ADU payback period and return."
        ctaLabel="Unlock the ROI Simulator"
      >
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Recommended Scenario
                  </label>
                  <select
                    value={presetIndex}
                    onChange={(e) => {
                      const nextIndex = Number(e.target.value);
                      const preset = scenarioPresets[nextIndex];
                      const nextRange = estimateAduPriceRange(preset);
                      const nextCost = Math.round((nextRange.low + nextRange.high) / 2);
                      setPresetIndex(nextIndex);
                      setProjectCost(nextCost);
                      setMonthlyRent(
                        getAverageMonthlyRent(preset.sqFt, preset.type, preset.bedrooms, {
                          stories: preset.stories,
                        })
                      );
                      setLoanAmount(nextCost);
                    }}
                    className={selectClass}
                  >
                    {scenarioPresets.map((preset, index) => (
                      <option key={preset.label} value={index}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Project Cost: ${projectCost.toLocaleString()}
                  </label>
                  <input
                    type="range" min={80000} max={800000} step={5000}
                    value={projectCost}
                    onChange={(e) => { setProjectCost(Number(e.target.value)); if (Number(e.target.value) < loanAmount) setLoanAmount(Number(e.target.value)); }}
                    className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$80K</span><span>$800K</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Monthly Rent: ${monthlyRent.toLocaleString()}
                  </label>
                  <input
                    type="range" min={1500} max={7000} step={100}
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$1,500</span><span>$7,000</span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm font-semibold text-secondary mb-4">Financing Assumptions</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Loan Amount: ${loanAmount.toLocaleString()} <span className="text-primary">(Down: ${downPayment.toLocaleString()})</span>
                      </label>
                      <input
                        type="range" min={0} max={projectCost} step={5000}
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Interest Rate: {interestRate}%
                      </label>
                      <input
                        type="range" min={3} max={12} step={0.25}
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Loan Term: {loanTermYears} years
                      </label>
                      <input
                        type="range" min={5} max={40} step={5}
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(Number(e.target.value))}
                        className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8">
                  <ResultIcon icon={BarChart3} />
                  <h3 className="text-xl font-semibold text-center text-white mb-6">Investment Projection</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-white/75 text-sm">Monthly Loan Payment</span>
                      <span className="font-bold text-white">${monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-white/75 text-sm">Monthly Rental Income</span>
                      <span className="font-bold text-accent">${monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-white/75 text-sm">Monthly Cash Flow</span>
                      <span className={`font-bold text-lg ${monthlyCashFlow >= 0 ? "text-accent" : "text-red-400"}`}>
                        {monthlyCashFlow >= 0 ? "+" : ""}${monthlyCashFlow.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-white/75 text-sm">Annual Cash Flow</span>
                      <span className={`font-bold ${annualCashFlow >= 0 ? "text-accent" : "text-red-400"}`}>
                        {annualCashFlow >= 0 ? "+" : ""}${annualCashFlow.toLocaleString()}
                      </span>
                    </div>
                    {downPayment > 0 && (
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/75 text-sm">Cash-on-Cash Return</span>
                        <span className={`font-bold ${cashOnCashReturn >= 0 ? "text-accent" : "text-red-400"}`}>
                          {cashOnCashReturn}%
                        </span>
                      </div>
                    )}
                    {monthlyCashFlow > 0 && (
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/75 text-sm">Rough Payoff Timeline</span>
                        <span className="font-bold text-white">~{yearsToPayoff} years</span>
                      </div>
                    )}
                  </div>

                  <div className={`${resultTileClass} p-4 mb-6`}>
                    <p className="text-sm text-white/80">
                      <strong className="text-accent">10-Year Outlook:</strong>{" "}
                      ${tenYearIncome.toLocaleString()} gross rental income
                      {loanAmount > 0 && <> minus ${tenYearPayments.toLocaleString()} in loan payments</>}
                      {" "}= <strong className="text-accent">${tenYearNetCashFlow.toLocaleString()} net</strong>
                    </p>
                  </div>

                  <p className="text-xs text-white/70 mb-6">
                    * Simplified projection. Does not account for taxes, insurance, maintenance, vacancy, or rent increases. Consult a financial advisor.
                  </p>

                  <Button asChild size="lg" rounded="full" className="w-full">
                    <Link href="/contact">
                      Explore Your ADU Investment <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </LeadGate>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Realistic Numbers Before You Commit
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team can provide a detailed feasibility analysis and financing guidance specific to your property.
          </p>
          <Button asChild size="lg" rounded="full">
            <Link href="/build-your-adu">
              Scan Your Property <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
