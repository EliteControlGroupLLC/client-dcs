"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, TrendingUp } from "lucide-react";
import { getRentEstimate } from "@/lib/data/site-data";

const aduSizes = [
  { label: "400 sq ft (Studio)", sqFt: 400, bedrooms: 0, type: "detached" },
  { label: "500 sq ft (1 Bed)", sqFt: 500, bedrooms: 1, type: "detached" },
  { label: "700 sq ft (1-2 Bed)", sqFt: 700, bedrooms: 1, type: "detached" },
  { label: "1,000 sq ft (2-3 Bed)", sqFt: 1000, bedrooms: 2, type: "detached" },
  { label: "1,200 sq ft (3-4 Bed)", sqFt: 1200, bedrooms: 3, type: "detached" },
];

export default function ADUIncomeCalculatorPage() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const [projectCost, setProjectCost] = useState(200000);
  const [customRent, setCustomRent] = useState<number | null>(null);

  const size = aduSizes[sizeIndex];
  const rentData = getRentEstimate(size.sqFt, size.type, size.bedrooms);
  const baseRent = Math.round((rentData.low + rentData.high) / 2);
  const monthlyRent = customRent ?? baseRent;
  const annualIncome = monthlyRent * 12;
  const monthsToBreakeven = Math.ceil(projectCost / monthlyRent);
  const yearsToBreakeven = Math.round(monthsToBreakeven / 12 * 10) / 10;
  const fiveYearIncome = annualIncome * 5;
  const tenYearIncome = annualIncome * 10;

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              ADU INCOME CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              See What Your ADU Could Earn
            </h1>
            <p className="text-xl text-white/80">
              Turn extra space into income. Estimate your ADU&apos;s rental potential based on
              San Diego market rates and see your projected return.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">ADU Size</label>
                <div className="space-y-2">
                  {aduSizes.map((s, i) => {
                    const rent = getRentEstimate(s.sqFt, s.type, s.bedrooms);
                    const avgRent = Math.round((rent.low + rent.high) / 2);
                    return (
                      <button
                        key={s.label}
                        onClick={() => { setSizeIndex(i); setCustomRent(null); }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          sizeIndex === i
                            ? "border-primary bg-primary/5 text-secondary font-medium"
                            : "border-gray-200 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <span>{s.label}</span>
                        <span className="text-primary ml-2 text-sm font-semibold">
                          ~${avgRent.toLocaleString()}/mo
                        </span>
                      </button>
                    );
                  })}
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
                  className="w-full accent-primary"
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
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$1,500/mo</span>
                  <span>$7,000/mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-secondary text-white">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <DollarSign className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-white/70 text-sm">Projected Monthly Income</p>
                    <p className="text-4xl font-bold text-primary">${monthlyRent.toLocaleString()}</p>
                    <p className="text-white/50 text-sm">per month</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-white/60 text-xs mb-1">Annual Income</p>
                      <p className="text-xl font-bold text-white">${annualIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-white/60 text-xs mb-1">Break-Even</p>
                      <p className="text-xl font-bold text-white">~{yearsToBreakeven} years</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-white/60 text-xs mb-1">5-Year Income</p>
                      <p className="text-xl font-bold text-primary">${fiveYearIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-white/60 text-xs mb-1">10-Year Income</p>
                      <p className="text-xl font-bold text-primary">${tenYearIncome.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary mb-2" />
                    <p className="text-sm text-white/80">
                      Based on San Diego market rates, your {size.sqFt} sq ft ADU could generate
                      <strong className="text-primary"> ${tenYearIncome.toLocaleString()}</strong> over 10 years,
                      potentially paying for itself in <strong className="text-primary">~{yearsToBreakeven} years</strong>.
                    </p>
                  </div>

                  <p className="text-xs text-white/40 mb-4">
                    * Based on current San Diego rental market estimates. Actual rental income depends on location, finishes, and market conditions.
                  </p>

                  <Link href="/contact">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                      Explore Your ADU Options <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Want a Detailed Feasibility Report?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get a comprehensive property analysis with ADU options, income projections, and ROI estimates specific to your property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Scan Your Property <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
