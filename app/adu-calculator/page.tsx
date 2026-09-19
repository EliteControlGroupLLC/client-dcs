"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optionClass, ResultIcon, resultCardClass } from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { ArrowRight, Calculator } from "lucide-react";
import { estimateAduPriceRange, getRentEstimate } from "@/lib/data/site-data";

const aduTypes = [
  { label: "Detached ADU", type: "detached", bedrooms: 1, bathrooms: 1 },
  { label: "Attached ADU", type: "attached", bedrooms: 1, bathrooms: 1 },
  { label: "Garage Conversion", type: "garage-conversion", bedrooms: 0, bathrooms: 1, garageStalls: 2 as const },
  { label: "Two-Story ADU", type: "two-story", bedrooms: 4, bathrooms: 2, stories: 2 as const },
];

const finishLevels = [
  { label: "Standard", multiplier: 1.0 },
  { label: "Premium", multiplier: 1.08 },
  { label: "Luxury", multiplier: 1.15 },
];

export default function ADUCalculatorPage() {
  const [type, setType] = useState(0);
  const [size, setSize] = useState(500);
  const [finish, setFinish] = useState(0);

  const selected = aduTypes[type];
  const finishLevel = finishLevels[finish];
  const adjustedSize = selected.type === "garage-conversion" ? 400 : selected.type === "attached" ? 500 : selected.type === "two-story" ? 1200 : size;
  const derivedBedrooms = useMemo(() => {
    if (selected.type === "garage-conversion") return 0;
    if (selected.type === "attached") return 1;
    if (selected.type === "two-story") return 4;
    if (adjustedSize <= 400) return 0;
    if (adjustedSize <= 650) return 1;
    if (adjustedSize <= 1000) return 2;
    return 3;
  }, [adjustedSize, selected.type]);
  const derivedBathrooms = selected.type === "two-story" || adjustedSize >= 850 ? 2 : 1;
  const estimateRange = estimateAduPriceRange({
    sqFt: adjustedSize,
    type: selected.type,
    bedrooms: derivedBedrooms,
    bathrooms: derivedBathrooms,
    stories: selected.stories ?? 1,
    garageStalls: selected.garageStalls,
  });
  const estimateLow = Math.round(estimateRange.low * finishLevel.multiplier);
  const estimateHigh = Math.round(estimateRange.high * finishLevel.multiplier);
  const rentEstimate = getRentEstimate(adjustedSize, selected.type, derivedBedrooms, {
    stories: selected.stories ?? 1,
    garageStalls: selected.garageStalls,
  });

  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              COST CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              ADU Cost Calculator
            </h1>
            <p className="text-xl text-white/80">
              Get a quick estimate of your ADU project cost based on type, size, and finish level.
              For a detailed quote, schedule a free consultation.
            </p>
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.aduCalculator}
        headline="Unlock your ADU cost estimate"
        subhead="Get a San Diego ADU cost range based on type, size and finish level."
        ctaLabel="Unlock My ADU Estimate"
      >
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              {/* Input */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">ADU Type</label>
                  <div className="space-y-2">
                    {aduTypes.map((t, i) => (
                      <button
                        key={t.label}
                        onClick={() => setType(i)}
                        className={optionClass(type === i)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Size: {adjustedSize} sq ft
                  </label>
                  <input
                    type="range"
                    min={400}
                    max={1200}
                    step={50}
                    value={adjustedSize}
                    onChange={(e) => setSize(Number(e.target.value))}
                    disabled={selected.type === "garage-conversion" || selected.type === "attached" || selected.type === "two-story"}
                    className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>400 sq ft</span>
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
                        className={optionClass(finish === i, "flex-1 px-4 py-3 text-sm font-medium")}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result */}
              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                  <div className="text-center">
                    <ResultIcon icon={Calculator} />
                    <p className="text-white/75 text-sm mb-2">Estimated Project Cost</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${estimateLow.toLocaleString()}&nbsp;&ndash; ${estimateHigh.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm mb-6">
                      {selected.label} &bull; {adjustedSize} sq ft &bull; {finishLevel.label}
                    </p>

                    <div className="border-t border-white/10 pt-6 mb-6">
                      <p className="text-white/75 text-sm mb-1">Estimated Monthly Rental Income</p>
                      <p className="text-2xl font-bold text-white">
                        ${rentEstimate.low.toLocaleString()}&nbsp;&ndash; ${rentEstimate.high.toLocaleString()}/mo
                      </p>
                    </div>

                    <p className="text-xs text-white/70 mb-6">
                      * This is an estimate only. Actual costs may vary based on site conditions, design, and permits. Schedule a consultation for an accurate quote.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Get Accurate Quote <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </LeadGate>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want a Detailed Estimate?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team can provide a detailed, fixed-price quote based on your specific property and project goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full">
              <Link href="/build-your-adu">
                Design Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full">
              <Link href="/contact">
                Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
