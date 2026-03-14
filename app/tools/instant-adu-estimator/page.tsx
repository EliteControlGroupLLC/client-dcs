"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Check, X } from "lucide-react";

const aduTypes = [
  { label: "Detached ADU (New Build)", perSqFt: 375, id: "detached" },
  { label: "Garage Conversion (2-Car)", perSqFt: 0, flatCost: 100000, id: "garage-2" },
  { label: "Garage Conversion (3-Car)", perSqFt: 0, flatCost: 120000, id: "garage-3" },
  { label: "Two-Story ADU", perSqFt: 400, id: "two-story" },
];

const sizeOptions = [400, 500, 700, 1000, 1200];

export default function InstantADUEstimatorPage() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [size, setSize] = useState(500);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [stories, setStories] = useState(1);

  const selected = aduTypes[typeIndex];
  const isGarage = selected.id.startsWith("garage");

  const baseCost = isGarage
    ? (selected as { flatCost: number }).flatCost
    : size * selected.perSqFt;

  const lowEstimate = Math.round(baseCost * 0.95);
  const highEstimate = Math.round(baseCost * 1.1);
  const estimatedRent = Math.round(size * 4.2);

  const included = [
    "Architectural plans & engineering",
    "City permits & plan check fees",
    "Full construction & labor",
    "Standard appliances",
    "Solar (per Title 24)",
    "Standard finish selections",
  ];

  const excluded = [
    "Landscaping & hardscaping",
    "Specialty site improvements",
    "Major upgrade selections beyond standard allowances",
    "Furniture & staging",
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              INSTANT ESTIMATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Instant ADU Price Estimator
            </h1>
            <p className="text-xl text-white/80">
              Get quick numbers. Select your ADU type, size, and configuration to see an
              estimated price range in seconds.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">ADU Type</label>
                <div className="space-y-2">
                  {aduTypes.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setTypeIndex(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        typeIndex === i
                          ? "border-primary bg-primary/5 text-secondary font-medium"
                          : "border-gray-200 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isGarage && (
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          size === s
                            ? "border-primary bg-primary/5 text-secondary"
                            : "border-gray-200 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {s.toLocaleString()} sq ft
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">Bedrooms</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBedrooms(b)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          bedrooms === b
                            ? "border-primary bg-primary/5 text-secondary"
                            : "border-gray-200 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {b === 0 ? "Studio" : b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">Bathrooms</label>
                  <div className="flex gap-2">
                    {[1, 2].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBathrooms(b)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          bathrooms === b
                            ? "border-primary bg-primary/5 text-secondary"
                            : "border-gray-200 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">Stories</label>
                  <div className="flex gap-2">
                    {[1, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStories(s)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          stories === s
                            ? "border-primary bg-primary/5 text-secondary"
                            : "border-gray-200 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-secondary text-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-white/70 text-sm mb-1">Estimated Price Range</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    ${lowEstimate.toLocaleString()} &ndash; ${highEstimate.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-sm">
                    {selected.label} &bull; {isGarage ? "Standard scope" : `${size.toLocaleString()} sq ft`} &bull; {bedrooms === 0 ? "Studio" : `${bedrooms} Bed`}, {bathrooms} Bath
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mb-4">
                  <p className="text-white/60 text-sm mb-2">Estimated Rental Potential</p>
                  <p className="text-2xl font-bold text-white">${estimatedRent.toLocaleString()}/mo</p>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-4 mb-6">
                  <div>
                    <p className="text-white/70 text-sm font-semibold mb-2">Generally includes:</p>
                    <ul className="space-y-1.5">
                      {included.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-semibold mb-2">Generally excludes:</p>
                    <ul className="space-y-1.5">
                      {excluded.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                          <X className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-white/40 mb-6">
                  * Estimate only. Pricing based on standard scope for San Diego. Actual pricing depends on site, design, and selections.
                </p>

                <div className="space-y-3">
                  <Link href="/contact">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                      Request Exact Pricing <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/build-your-adu">
                    <Button size="lg" variant="outlineWhite" className="w-full">
                      Scan Your Property <ArrowRight className="h-5 w-5 ml-2" />
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
            Want to Compare Options?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use our comparison tool to see different ADU sizes and types side by side.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/compare-adu-sizes">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Compare ADU Sizes <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/tools/adu-income-calculator">
              <Button size="lg" variant="outline">
                Calculate Income Potential
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
