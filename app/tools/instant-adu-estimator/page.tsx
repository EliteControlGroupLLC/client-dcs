"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optionClass, ResultIcon, resultCardClass } from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { ArrowRight, Zap, Check, X } from "lucide-react";
import { estimateAduPriceRange, getRentEstimate } from "@/lib/data/site-data";

const aduTypes = [
  { label: "Detached ADU", id: "detached", type: "detached" },
  { label: "Attached ADU", id: "attached", type: "attached" },
  { label: "Garage Conversion (2-Car)", id: "garage-2", type: "garage-conversion", garageStalls: 2 as const },
  { label: "Garage Conversion (3-Car)", id: "garage-3", type: "garage-conversion", garageStalls: 3 as const },
  { label: "Two-Story ADU", id: "two-story", type: "two-story", stories: 2 as const },
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

  const availableSizes = useMemo(() => {
    if (selected.id === "attached") return [500];
    if (selected.id === "two-story") return [1200];
    return sizeOptions;
  }, [selected.id]);

  // Choosing a type snaps size / beds / baths / stories to what that build
  // path supports (done in the click handler rather than an effect so the
  // estimate never renders with a stale combination).
  const selectType = (index: number) => {
    const id = aduTypes[index].id;
    const sizes = id === "attached" ? [500] : id === "two-story" ? [1200] : sizeOptions;
    setTypeIndex(index);
    if (!sizes.includes(size)) setSize(sizes[0]);
    if (id === "attached") {
      setBedrooms(1);
      setBathrooms(1);
      setStories(1);
    } else if (id === "garage-2") {
      setBedrooms(0);
      setBathrooms(1);
      setStories(1);
    } else if (id === "garage-3") {
      setBedrooms(1);
      setBathrooms(1);
      setStories(1);
    } else if (id === "two-story") {
      setBedrooms(4);
      setBathrooms(2);
      setStories(2);
    }
  };

  const maxBedrooms = useMemo(() => {
    if (selected.id === "garage-2") return 0;
    if (selected.id === "garage-3") return 1;
    if (selected.id === "attached") return 1;
    if (selected.id === "two-story") return 4;
    if (size <= 400) return 1;
    if (size <= 500) return 1;
    if (size <= 700) return 2;
    if (size <= 1000) return 3;
    return 4;
  }, [selected.id, size]);

  const effectiveBedrooms = Math.min(bedrooms, maxBedrooms);
  const bathroomOptions = size >= 1000 || selected.id === "two-story" ? [1, 2] : [1];
  const effectiveBathrooms = bathroomOptions.includes(bathrooms) ? bathrooms : bathroomOptions[0];

  const { low: lowEstimate, high: highEstimate } = useMemo(() => {
    return estimateAduPriceRange({
      sqFt: isGarage ? 400 : size,
      type: selected.type,
      bedrooms: effectiveBedrooms,
      bathrooms: effectiveBathrooms,
      stories: selected.id === "two-story" ? 2 : stories,
      garageStalls: selected.garageStalls,
    });
  }, [effectiveBathrooms, effectiveBedrooms, isGarage, selected, size, stories]);

  const rentEstimate = useMemo(() => {
    return getRentEstimate(
      isGarage ? 400 : size,
      selected.type,
      effectiveBedrooms,
      {
        stories: selected.id === "two-story" ? 2 : stories,
        garageStalls: selected.garageStalls,
      }
    );
  }, [effectiveBedrooms, isGarage, selected, size, stories]);

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
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              INSTANT ESTIMATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Instant ADU Price Estimator
            </h1>
            <p className="text-xl text-white/80">
              Get quick numbers. Select your ADU type, size, and configuration to see an
              estimated price range in seconds.
            </p>
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.instantAduEstimator}
        headline="Unlock your instant ADU estimate"
        subhead="Pick your ADU type, size and configuration to see an estimated price range in seconds."
        ctaLabel="Unlock My ADU Estimate"
      >
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">ADU Type</label>
                  <div className="space-y-2">
                    {aduTypes.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => selectType(i)}
                        className={optionClass(typeIndex === i)}
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
                      {availableSizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={optionClass(size === s, "px-4 py-2 text-sm font-medium")}
                        >
                          {s.toLocaleString()} sq ft
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4].filter(b => b <= maxBedrooms || b === 0).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBedrooms(b)}
                        className={optionClass(bedrooms === b, "flex-1 px-3 py-2 text-sm font-medium")}
                      >
                        {b === 0 ? "Studio" : b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">Bathrooms</label>
                    <div className="flex gap-2">
                      {bathroomOptions.map((b) => (
                        <button
                          key={b}
                          onClick={() => setBathrooms(b)}
                          className={optionClass(bathrooms === b, "flex-1 py-2 text-sm font-medium")}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">Stories</label>
                    <div className="flex gap-2">
                      {[1, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStories(s)}
                          disabled={selected.id === "garage-2" || selected.id === "garage-3" || selected.id === "attached"}
                          className={optionClass(stories === s, "flex-1 py-2 text-sm font-medium")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <ResultIcon icon={Zap} />
                    <p className="text-white/75 text-sm mb-2">Estimated Price Range</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${lowEstimate.toLocaleString()}&nbsp;&ndash; ${highEstimate.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm">
                      {selected.label} &bull; {isGarage ? "Existing garage shell" : `${size.toLocaleString()} sq ft`} &bull; {effectiveBedrooms === 0 ? "Studio" : `${effectiveBedrooms} Bed`}, {effectiveBathrooms} Bath
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-6 mb-4">
                    <p className="text-white/75 text-sm mb-1">Estimated Rental Potential</p>
                    <p className="text-2xl font-bold text-white">
                      ${rentEstimate.low.toLocaleString()}&nbsp;&ndash; ${rentEstimate.high.toLocaleString()}/mo
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      Based on the current TruthCore plan library and San Diego market rates for the selected build path
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-6 space-y-4 mb-6">
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Generally includes:</p>
                      <ul className="space-y-1.5">
                        {included.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                            <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Generally excludes:</p>
                      <ul className="space-y-1.5">
                        {excluded.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                            <X className="h-4 w-4 text-white/60 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 mb-6">
                    * Estimate only. Pricing based on standard scope for San Diego. Actual pricing depends on site, design, and selections.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Request Exact Pricing <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outlineWhite" rounded="full" className="w-full">
                      <Link href="/build-your-adu">
                        Scan Your Property <ArrowRight className="h-5 w-5 ml-2" />
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
            Want to Compare Options?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Use our comparison tool to see different ADU sizes and types side by side.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full">
              <Link href="/tools/compare-adu-sizes">
                Compare ADU Sizes <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full">
              <Link href="/tools/adu-income-calculator">
                Calculate Income Potential
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
