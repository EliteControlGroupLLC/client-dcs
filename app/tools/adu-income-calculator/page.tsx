"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optionClass, ResultIcon, resultCardClass, resultTileClass } from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { ArrowRight, DollarSign, TrendingUp } from "lucide-react";

const aduSizes = [
  { label: "400 sq ft (Studio)", sqFt: 400, bedrooms: 0, type: "detached", baselineRent: 2400 },
  { label: "500 sq ft (1 Bed)", sqFt: 500, bedrooms: 1, type: "detached", baselineRent: 2700 },
  { label: "700 sq ft (1-2 Bed)", sqFt: 700, bedrooms: 1, type: "detached", baselineRent: 3350 },
  { label: "1,000 sq ft (2-3 Bed)", sqFt: 1000, bedrooms: 2, type: "detached", baselineRent: 4250 },
  { label: "1,200 sq ft (3-4 Bed)", sqFt: 1200, bedrooms: 4, type: "two-story", baselineRent: 5500 },
];

export default function ADUIncomeCalculatorPage() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const [projectCost, setProjectCost] = useState(200000);
  const [customRent, setCustomRent] = useState<number | null>(null);

  const size = aduSizes[sizeIndex];
  const baseRent = size.baselineRent;
  const monthlyRent = customRent ?? baseRent;
  const annualIncome = monthlyRent * 12;
  const monthsToBreakeven = Math.ceil(projectCost / monthlyRent);
  const yearsToBreakeven = Math.round(monthsToBreakeven / 12 * 10) / 10;
  const fiveYearIncome = annualIncome * 5;
  const tenYearIncome = annualIncome * 10;

  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              ADU INCOME CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              See What Your ADU Could Earn
            </h1>
            <p className="text-xl text-white/80">
              Turn extra space into income. Estimate your ADU&apos;s rental potential based on
              San Diego market rates and see your projected return.
            </p>
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.aduIncomeCalculator}
        headline="Unlock your ADU rental income estimate"
        subhead="See what an ADU on your property could earn in rent each month and year."
        ctaLabel="Unlock My Income Estimate"
      >
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">ADU Size</label>
                  <div className="space-y-2">
                    {aduSizes.map((s, i) => (
                      <button
                        key={s.label}
                        onClick={() => { setSizeIndex(i); setCustomRent(null); }}
                        className={optionClass(sizeIndex === i)}
                      >
                        <span>{s.label}</span>
                        <span className="text-primary ml-2 text-sm font-semibold">
                          ~${s.baselineRent.toLocaleString()}/mo
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Estimated Project Cost: ${projectCost.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={80000}
                    max={800000}
                    step={5000}
                    value={projectCost}
                    onChange={(e) => setProjectCost(Number(e.target.value))}
                    className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$80K</span>
                    <span>$800K</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Monthly Rent (adjust if needed): ${monthlyRent.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={1500}
                    max={7000}
                    step={100}
                    value={monthlyRent}
                    onChange={(e) => setCustomRent(Number(e.target.value))}
                    className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$1,500/mo</span>
                    <span>$7,000/mo</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className={resultCardClass}>
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <ResultIcon icon={DollarSign} />
                      <p className="text-white/75 text-sm mb-2">Projected Monthly Income</p>
                      <p className="text-3xl md:text-4xl font-bold text-accent mb-1">${monthlyRent.toLocaleString()}</p>
                      <p className="text-white/75 text-sm">per month</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className={`${resultTileClass} p-4 text-center`}>
                        <p className="text-white/75 text-xs mb-1">Annual Income</p>
                        <p className="text-xl font-bold text-white">${annualIncome.toLocaleString()}</p>
                      </div>
                      <div className={`${resultTileClass} p-4 text-center`}>
                        <p className="text-white/75 text-xs mb-1">Break-Even</p>
                        <p className="text-xl font-bold text-white">~{yearsToBreakeven} years</p>
                      </div>
                      <div className={`${resultTileClass} p-4 text-center`}>
                        <p className="text-white/75 text-xs mb-1">5-Year Income</p>
                        <p className="text-xl font-bold text-accent">${fiveYearIncome.toLocaleString()}</p>
                      </div>
                      <div className={`${resultTileClass} p-4 text-center`}>
                        <p className="text-white/75 text-xs mb-1">10-Year Income</p>
                        <p className="text-xl font-bold text-accent">${tenYearIncome.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className={`${resultTileClass} p-4 mb-6`}>
                      <TrendingUp className="h-5 w-5 text-accent mb-2" />
                      <p className="text-sm text-white/80">
                        Based on the approved TruthCore rent assumptions, your {size.sqFt} sq ft ADU could generate
                        <strong className="text-accent"> ${tenYearIncome.toLocaleString()}</strong> over 10 years,
                        potentially paying for itself in <strong className="text-accent">~{yearsToBreakeven} years</strong>.
                      </p>
                    </div>

                    <p className="text-xs text-white/70 mb-4">
                      * Baseline rent targets follow the current TruthCore plan library and San Diego market assumptions. Actual rental income depends on location, finish quality, and lease strategy.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Explore Your ADU Options <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </LeadGate>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want a Detailed Feasibility Report?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Get a comprehensive property analysis with ADU options, income projections, and ROI estimates specific to your property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full">
              <Link href="/build-your-adu">
                Scan Your Property <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full">
              <Link href="/contact">
                Schedule Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
