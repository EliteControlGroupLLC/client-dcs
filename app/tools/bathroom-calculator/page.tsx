"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bath } from "lucide-react";

const bathroomSizes = [
  { label: "Half Bath (Powder Room)", sqFt: 25, multiplier: 0.55 },
  { label: "Small Full Bath (5x8)", sqFt: 40, multiplier: 0.8 },
  { label: "Standard Full Bath (5x10)", sqFt: 50, multiplier: 1.0 },
  { label: "Large / Primary Bath (8x12)", sqFt: 96, multiplier: 1.6 },
  { label: "Spa-Style Primary (10x14)", sqFt: 140, multiplier: 2.2 },
];

const finishLevels = [
  {
    label: "Standard",
    description: "Fiberglass tub/shower, stock vanity, basic tile, standard fixtures",
    baseCost: 18000,
    multiplier: 1.0,
  },
  {
    label: "Mid-Range",
    description: "Tile shower, semi-custom vanity, porcelain tile, upgraded fixtures",
    baseCost: 18000,
    multiplier: 1.5,
  },
  {
    label: "Premium",
    description: "Custom shower, designer vanity, natural stone, premium fixtures",
    baseCost: 18000,
    multiplier: 2.2,
  },
  {
    label: "Luxury / Spa",
    description: "Frameless glass, custom tile, freestanding tub, rain shower, heated floors",
    baseCost: 18000,
    multiplier: 3.0,
  },
];

const addOns = [
  { label: "Heated Floor", cost: 2500 },
  { label: "Frameless Glass Shower Door", cost: 2000 },
  { label: "Freestanding Soaking Tub", cost: 3500 },
  { label: "Double Vanity Upgrade", cost: 2000 },
  { label: "Plumbing Relocation", cost: 3500 },
];

export default function BathroomCalculatorPage() {
  const [sizeIndex, setSizeIndex] = useState(2);
  const [finishIndex, setFinishIndex] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  const size = bathroomSizes[sizeIndex];
  const finish = finishLevels[finishIndex];
  const baseCost = Math.round(finish.baseCost * finish.multiplier * size.multiplier);
  const addOnCost = selectedAddOns.reduce((sum, i) => sum + addOns[i].cost, 0);
  const totalLow = Math.round((baseCost + addOnCost) * 0.9);
  const totalHigh = Math.round((baseCost + addOnCost) * 1.15);

  const toggleAddOn = (index: number) => {
    setSelectedAddOns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              BATHROOM CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bathroom Remodel Estimator
            </h1>
            <p className="text-xl text-white/80">
              Estimate your bathroom renovation cost. Starting at $18,000 for a standard 5x10 bathroom.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Bathroom Size</label>
                <div className="space-y-2">
                  {bathroomSizes.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSizeIndex(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        sizeIndex === i
                          ? "border-primary bg-primary/5 text-secondary font-medium"
                          : "border-gray-200 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Finish Level</label>
                <div className="space-y-2">
                  {finishLevels.map((f, i) => (
                    <button
                      key={f.label}
                      onClick={() => setFinishIndex(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        finishIndex === i
                          ? "border-primary bg-primary/5 text-secondary font-medium"
                          : "border-gray-200 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium">{f.label}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{f.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Optional Upgrades</label>
                <div className="space-y-2">
                  {addOns.map((a, i) => (
                    <label
                      key={a.label}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAddOns.includes(i)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddOns.includes(i)}
                        onChange={() => toggleAddOn(i)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-secondary">{a.label}</span>
                      <span className="text-sm text-muted-foreground ml-auto">+${a.cost.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Card className="bg-secondary text-white">
              <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="text-center">
                  <Bath className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-white/70 text-sm mb-2">Estimated Bathroom Remodel</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    ${totalLow.toLocaleString()} &ndash; ${totalHigh.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-sm mb-6">
                    {size.label} &bull; {finish.label} Finish
                  </p>

                  <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                    <p className="text-white/70 text-sm font-semibold">Base scope includes:</p>
                    <ul className="text-white/60 text-sm space-y-1">
                      <li>&bull; Shower retile with tub or shower pan</li>
                      <li>&bull; Vanity &amp; mirror</li>
                      <li>&bull; Lighting upgrades</li>
                      <li>&bull; New toilet</li>
                      <li>&bull; Tile flooring</li>
                      <li>&bull; Paint</li>
                    </ul>
                  </div>

                  <p className="text-xs text-white/40 mb-6">
                    * Estimate only. Final pricing depends on material selections, plumbing conditions, and design scope.
                  </p>

                  <Link href="/contact">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                      Request Exact Pricing <ArrowRight className="h-5 w-5 ml-2" />
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
            Ready for Your Bathroom Transformation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s create the bathroom you deserve.
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
