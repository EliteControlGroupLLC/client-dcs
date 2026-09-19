"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optionClass } from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { ArrowRight, ChefHat } from "lucide-react";

const kitchenSizes = [
  { label: "Small (8x8)", sqFt: 64, multiplier: 0.85 },
  { label: "Standard (10x10)", sqFt: 100, multiplier: 1.0 },
  { label: "Large (12x12)", sqFt: 144, multiplier: 1.3 },
  { label: "Open Concept (15x12)", sqFt: 180, multiplier: 1.6 },
];

const finishLevels = [
  {
    label: "Standard",
    description: "Stock cabinets, laminate counters, basic tile, standard appliances",
    baseCost: 25000,
    multiplier: 1.0,
  },
  {
    label: "Mid-Range",
    description: "Semi-custom cabinets, quartz counters, subway tile, mid-range appliances",
    baseCost: 25000,
    multiplier: 1.5,
  },
  {
    label: "Premium",
    description: "Custom cabinets, premium stone, designer tile, high-end appliances",
    baseCost: 25000,
    multiplier: 2.2,
  },
  {
    label: "Luxury",
    description: "Fully custom cabinetry, exotic stone, custom backsplash, pro-grade appliances",
    baseCost: 25000,
    multiplier: 3.0,
  },
];

const addOns = [
  { label: "Island Addition", cost: 15000, displayCost: "Starting at $15,000" },
  { label: "Open Floor Plan Conversion", cost: 15000, displayCost: "Starting at $15,000" },
  { label: "New Lighting Design", cost: 5000, displayCost: "Starting at $5,000" },
  { label: "Plumbing Relocation", cost: 4000, displayCost: "Starting at $4,000" },
];

export default function KitchenCalculatorPage() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const [finishIndex, setFinishIndex] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  const size = kitchenSizes[sizeIndex];
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
      <section className="bg-secondary text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary-light font-semibold text-sm uppercase tracking-wider mb-4">
              KITCHEN CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Kitchen Remodel Estimator
            </h1>
            <p className="text-xl text-white/80">
              Estimate your kitchen remodel cost based on size, finish level, and upgrades.
              Starting at $25,000 for a standard 10x10 kitchen.
            </p>
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.kitchenCalculator}
        headline="Unlock your kitchen remodel estimate"
        subhead="See your kitchen remodel price range based on size, finish level and upgrades."
        ctaLabel="Unlock My Kitchen Estimate"
      >
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">Kitchen Size</label>
                  <div className="space-y-2">
                    {kitchenSizes.map((s, i) => (
                      <button
                        key={s.label}
                        onClick={() => setSizeIndex(i)}
                        className={optionClass(sizeIndex === i)}
                      >
                        {s.label} — {s.sqFt} sq ft
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
                        className={optionClass(finishIndex === i)}
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
                        className={optionClass(selectedAddOns.includes(i), "flex items-center gap-3 px-4 py-3 cursor-pointer")}
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

              <Card className="bg-secondary text-white border-secondary min-w-0">
                <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                  <div className="text-center">
                    <ChefHat className="h-12 w-12 text-primary-light mx-auto mb-4" />
                    <p className="text-white/70 text-sm mb-2">Estimated Kitchen Remodel</p>
                    <p className="text-3xl md:text-4xl font-bold text-primary-light mb-1 text-balance">
                      ${totalLow.toLocaleString()}&nbsp;&ndash; ${totalHigh.toLocaleString()}
                    </p>
                    <p className="text-white/60 text-sm mb-6">
                      {size.label} &bull; {finish.label} Finish
                    </p>

                    <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                      <p className="text-white/70 text-sm font-semibold">Base scope includes:</p>
                      <ul className="text-white/60 text-sm space-y-1">
                        <li>&bull; Demolition &amp; removal</li>
                        <li>&bull; New cabinets &amp; countertops</li>
                        <li>&bull; Backsplash tile</li>
                        <li>&bull; Flooring</li>
                        <li>&bull; Patch &amp; paint</li>
                        <li>&bull; Standard finish selections</li>
                      </ul>
                    </div>

                    <p className="text-xs text-white/60 mb-6">
                      * Estimate only. Final pricing depends on material selections, site conditions, and design scope.
                    </p>

                    <Link href="/contact">
                      <Button size="lg" rounded="full" className="w-full">
                        Design Your Kitchen <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </LeadGate>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Ready to Transform Your Kitchen?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s design the kitchen you&apos;ve always wanted.
          </p>
          <Link href="/contact">
            <Button size="lg" rounded="full">
              Schedule Free Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
