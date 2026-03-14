"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator } from "lucide-react";

const aduTypes = [
  { label: "Detached ADU (New Build)", baseCost: 175000, perSqFt: 350 },
  { label: "Attached ADU", baseCost: 150000, perSqFt: 300 },
  { label: "Garage Conversion", baseCost: 120000, perSqFt: 250 },
  { label: "Junior ADU (JADU)", baseCost: 80000, perSqFt: 200 },
];

const finishLevels = [
  { label: "Standard", multiplier: 1.0 },
  { label: "Premium", multiplier: 1.25 },
  { label: "Luxury", multiplier: 1.5 },
];

export default function ADUCalculatorPage() {
  const [type, setType] = useState(0);
  const [size, setSize] = useState(500);
  const [finish, setFinish] = useState(0);

  const selected = aduTypes[type];
  const finishLevel = finishLevels[finish];
  const estimate = Math.round((selected.baseCost + (size - 400) * selected.perSqFt) * finishLevel.multiplier);
  const monthlyRent = Math.round(size * 4.5);

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              COST CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Cost Calculator
            </h1>
            <p className="text-xl text-white/80">
              Get a quick estimate of your ADU project cost based on type, size, and finish level.
              For a detailed quote, schedule a free consultation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">ADU Type</label>
                <div className="space-y-2">
                  {aduTypes.map((t, i) => (
                    <button
                      key={t.label}
                      onClick={() => setType(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        type === i
                          ? "border-primary bg-primary/5 text-secondary font-medium"
                          : "border-gray-200 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">
                  Size: {size} sq ft
                </label>
                <input
                  type="range"
                  min={200}
                  max={1200}
                  step={50}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>200 sq ft</span>
                  <span>1,200 sq ft</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Finish Level</label>
                <div className="flex gap-3">
                  {finishLevels.map((f, i) => (
                    <button
                      key={f.label}
                      onClick={() => setFinish(i)}
                      className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        finish === i
                          ? "border-primary bg-primary/5 text-secondary"
                          : "border-gray-200 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <Card className="bg-secondary text-white">
              <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="text-center">
                  <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-white/70 text-sm mb-2">Estimated Project Cost</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    ${estimate.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-sm mb-6">
                    {selected.label} &bull; {size} sq ft &bull; {finishLevel.label}
                  </p>

                  <div className="border-t border-white/10 pt-6 mb-6">
                    <p className="text-white/70 text-sm mb-1">Estimated Monthly Rental Income</p>
                    <p className="text-2xl font-bold text-white">${monthlyRent.toLocaleString()}/mo</p>
                  </div>

                  <p className="text-xs text-white/40 mb-6">
                    * This is an estimate only. Actual costs may vary based on site conditions, design, and permits. Schedule a consultation for an accurate quote.
                  </p>

                  <Link href="/contact">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                      Get Accurate Quote <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Want a Detailed Estimate?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team can provide a detailed, fixed-price quote based on your specific property and project goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Design Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
