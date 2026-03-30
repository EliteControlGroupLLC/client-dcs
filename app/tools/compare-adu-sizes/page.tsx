"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeftRight, Check } from "lucide-react";
import { estimateAduPriceRange, formatPriceRange, getRentEstimate } from "@/lib/data/site-data";

const aduOptions = [
  {
    sqFt: 400,
    label: "400 sq ft",
    bedBath: "Studio / 1 Bed, 1 Bath",
    useCase: "Compact rental, home office, guest suite",
    estimatedCost: "$120K - $175K",
    estimatedRent: "$2,000 - $2,800/mo",
    yardDemand: "Minimal (~500 sq ft footprint)",
    bestFor: "Garage conversions, tight lots, budget-conscious builds",
  },
  {
    sqFt: 500,
    label: "500 sq ft",
    bedBath: "1 Bed, 1 Bath",
    useCase: "Rental unit, young professional, in-law suite",
    estimatedCost: formatPriceRange(
      estimateAduPriceRange({ sqFt: 500, type: "attached", bedrooms: 1, bathrooms: 1 }).low,
      estimateAduPriceRange({ sqFt: 500, type: "attached", bedrooms: 1, bathrooms: 1 }).high
    ),
    estimatedRent: "$2,500 - $2,800/mo",
    yardDemand: "Low (~600 sq ft footprint)",
    bestFor: "First-time ADU builders, strong rental ROI",
  },
  {
    sqFt: 700,
    label: "700 sq ft",
    bedBath: "1-2 Bed, 1 Bath",
    useCase: "Family ADU, long-term rental, multigenerational",
    estimatedCost: formatPriceRange(
      estimateAduPriceRange({ sqFt: 700, type: "detached", bedrooms: 2, bathrooms: 1 }).low,
      estimateAduPriceRange({ sqFt: 700, type: "detached", bedrooms: 2, bathrooms: 1 }).high
    ),
    estimatedRent: "$3,000 - $3,700/mo",
    yardDemand: "Moderate (~800 sq ft footprint)",
    bestFor: "Balanced size and ROI, flexible use",
  },
  {
    sqFt: 1000,
    label: "1,000 sq ft",
    bedBath: "2-3 Bed, 2 Bath",
    useCase: "Full family unit, premium rental, aging parents",
    estimatedCost: formatPriceRange(
      estimateAduPriceRange({ sqFt: 1000, type: "detached", bedrooms: 3, bathrooms: 2 }).low,
      estimateAduPriceRange({ sqFt: 1000, type: "detached", bedrooms: 3, bathrooms: 2 }).high
    ),
    estimatedRent: "$4,000 - $4,500/mo",
    yardDemand: "Significant (~1,100 sq ft footprint)",
    bestFor: "Larger lots, family housing, higher rental income",
  },
  {
    sqFt: 1200,
    label: "1,200 sq ft",
    bedBath: "3-4 Bed, 2-2.5 Bath",
    useCase: "Full-size home, two-story option, maximum rental",
    estimatedCost: "$495,000-$520,000",
    estimatedRent: "$5,000 - $6,000/mo",
    yardDemand: "High (~1,300 sq ft or two-story)",
    bestFor: "Large lots, maximum livable space, two-story builds, up to 4 bedrooms",
  },
];

const fields = [
  { key: "bedBath", label: "Bed / Bath" },
  { key: "useCase", label: "Use Case" },
  { key: "estimatedCost", label: "Estimated Cost" },
  { key: "estimatedRent", label: "Rental Potential" },
  { key: "yardDemand", label: "Yard / Footprint Demand" },
  { key: "bestFor", label: "Best For" },
] as const;

export default function CompareADUSizesPage() {
  const [leftIndex, setLeftIndex] = useState(1);
  const [rightIndex, setRightIndex] = useState(3);

  const left = aduOptions[leftIndex];
  const right = aduOptions[rightIndex];

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              COMPARE ADU SIZES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Compare ADU Options Side by Side
            </h1>
            <p className="text-xl text-white/80">
              Not sure which size ADU is right for you? Compare key factors like cost, rental
              income, footprint, and use case to find your best fit.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Selectors */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-12">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Option A</label>
              <select
                value={leftIndex}
                onChange={(e) => setLeftIndex(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-secondary font-medium bg-white"
              >
                {aduOptions.map((opt, i) => (
                  <option key={opt.sqFt} value={i}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Option B</label>
              <select
                value={rightIndex}
                onChange={(e) => setRightIndex(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-secondary font-medium bg-white"
              >
                {aduOptions.map((opt, i) => (
                  <option key={opt.sqFt} value={i}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-secondary text-white">
              <div className="p-4 text-sm font-semibold">Category</div>
              <div className="p-4 text-center border-l border-white/10">
                <span className="text-primary font-bold text-lg">{left.label}</span>
              </div>
              <div className="p-4 text-center border-l border-white/10">
                <span className="text-primary font-bold text-lg">{right.label}</span>
              </div>
            </div>

            {/* Rows */}
            {fields.map((field, i) => (
              <div key={field.key} className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="p-4 text-sm font-semibold text-secondary border-t">{field.label}</div>
                <div className="p-4 text-sm text-muted-foreground border-t border-l text-center">
                  {left[field.key]}
                </div>
                <div className="p-4 text-sm text-muted-foreground border-t border-l text-center">
                  {right[field.key]}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-secondary text-lg mb-3">{left.label} ADU</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {left.bestFor}
                  </li>
                </ul>
                <Link href="/build-your-adu">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                    Build a {left.label} ADU <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-secondary text-lg mb-3">{right.label} ADU</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {right.bestFor}
                  </li>
                </ul>
                <Link href="/build-your-adu">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                    Build a {right.label} ADU <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Still Not Sure? Let Us Help.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team can evaluate your property and recommend the best ADU size and type for your goals.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Schedule Free Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
