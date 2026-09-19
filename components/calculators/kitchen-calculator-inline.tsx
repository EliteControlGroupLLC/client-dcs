"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChefHat } from "lucide-react";
import {
  calcSectionClass,
  checkboxClass,
  controlLabelClass,
  inputPanelClass,
  optionClass,
  ResultIcon,
  resultCardClass,
} from "@/components/calculators/calculator-ui";
import { KITCHEN_ADD_ONS } from "@/components/calculators/pricing";
import { TierComparison, TierWhy } from "@/components/calculators/tier-explainer";
import { KITCHEN_TIERS } from "@/components/calculators/tier-details";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";

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

const addOns = KITCHEN_ADD_ONS;

/**
 * Rendered on the service page (dark band with its own heading) and, with
 * `standalone`, as the body of the /tools page (the page hero carries the title).
 */
export function KitchenCalculatorInline({ standalone = false }: { standalone?: boolean }) {
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
    <div id="calculator">
      <LeadGate
        className={calcSectionClass}
        interest={LEAD_GATE_INTERESTS.kitchenCalculator}
        headline="Unlock your kitchen remodel estimate"
        subhead="See your kitchen remodel price range based on size, finish level and upgrades."
        ctaLabel="Unlock My Kitchen Estimate"
      >
        <section className={`py-20 ${calcSectionClass}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            {!standalone && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Kitchen Remodel Estimator</h2>
                <p className="text-lg text-white/80">Estimate your kitchen remodel cost based on size, finish level, and upgrades.</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className={`space-y-8 ${inputPanelClass}`}>
                <div>
                  <label className={controlLabelClass}>Kitchen Size</label>
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
                  <label className={controlLabelClass}>Finish Level</label>
                  <div className="space-y-2">
                    {finishLevels.map((f, i) => (
                      <button
                        key={f.label}
                        onClick={() => setFinishIndex(i)}
                        className={optionClass(finishIndex === i)}
                      >
                        <span className="font-medium">{f.label}</span>
                        <span className="block text-xs text-white/80 font-normal mt-1">{f.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={controlLabelClass}>Optional Upgrades</label>
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
                          className={checkboxClass}
                        />
                        <span className="text-sm">{a.label}</span>
                        <span className="text-sm ml-auto tabular-nums">+${a.cost.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                  <div className="text-center">
                    <ResultIcon icon={ChefHat} />
                    <p className="text-white/75 text-sm mb-2">Estimated Kitchen Remodel</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${totalLow.toLocaleString()}&nbsp;&ndash; ${totalHigh.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm mb-6">
                      {size.label} &bull; {finish.label} Finish
                    </p>

                    <TierWhy
                      title={finishIndex === 0 ? "What Standard gets you" : `Why ${finish.label} costs more`}
                      text={KITCHEN_TIERS.options[finishIndex].why}
                    />

                    <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                      <p className="text-white text-sm font-semibold">Base scope includes:</p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>&bull; Demolition &amp; removal</li>
                        <li>&bull; New cabinets &amp; countertops</li>
                        <li>&bull; Backsplash tile</li>
                        <li>&bull; Flooring</li>
                        <li>&bull; Patch &amp; paint</li>
                        <li>&bull; Standard finish selections</li>
                      </ul>
                    </div>

                    <p className="text-xs text-white/70 mb-6">
                      * Estimate only. Final pricing depends on material selections, site conditions, and design scope.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Design Your Kitchen <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TierComparison
              title="What you're really paying for"
              intro="Two kitchens can look similar in a photo and be built completely differently. Here's what changes inside the cabinets, under the counters and behind the walls at every level."
              ladder={KITCHEN_TIERS}
              selected={finishIndex}
              onSelect={setFinishIndex}
            />
          </div>
        </section>
      </LeadGate>
    </div>
  );
}
