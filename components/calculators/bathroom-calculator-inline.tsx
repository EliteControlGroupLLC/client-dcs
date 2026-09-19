"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bath } from "lucide-react";
import {
  calcSectionClass,
  checkboxClass,
  controlLabelClass,
  inputPanelClass,
  optionClass,
  ResultIcon,
  resultCardClass,
} from "@/components/calculators/calculator-ui";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";

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
  { label: "Heated Floor", cost: 10000 },
  { label: "Frameless Glass Shower Door", cost: 2500 },
  { label: "Freestanding Soaking Tub", cost: 3500 },
  { label: "Double Vanity Upgrade", cost: 2000 },
  { label: "Plumbing Relocation", cost: 3500 },
];

/**
 * Rendered on the service page (dark band with its own heading) and, with
 * `standalone`, as the body of the /tools page (the page hero carries the title).
 */
export function BathroomCalculatorInline({ standalone = false }: { standalone?: boolean }) {
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
    <div id="calculator">
      <LeadGate
        className={calcSectionClass}
        interest={LEAD_GATE_INTERESTS.bathroomCalculator}
        headline="Unlock your bathroom remodel estimate"
        subhead="See your bathroom remodel price range based on size, finish level and upgrades."
        ctaLabel="Unlock My Bathroom Estimate"
      >
        <section className={`py-20 ${calcSectionClass}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            {!standalone && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Bathroom Remodel Estimator</h2>
                <p className="text-lg text-white/80">Estimate your bathroom renovation cost. Starting at $18,000 for a standard 5x10 bathroom.</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className={`space-y-8 ${inputPanelClass}`}>
                <div>
                  <label className={controlLabelClass}>Bathroom Size</label>
                  <div className="space-y-2">
                    {bathroomSizes.map((s, i) => (
                      <button
                        key={s.label}
                        onClick={() => setSizeIndex(i)}
                        className={optionClass(sizeIndex === i)}
                      >
                        {s.label}
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
                    <ResultIcon icon={Bath} />
                    <p className="text-white/75 text-sm mb-2">Estimated Bathroom Remodel</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${totalLow.toLocaleString()}&nbsp;&ndash; ${totalHigh.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm mb-6">
                      {size.label} &bull; {finish.label} Finish
                    </p>

                    <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                      <p className="text-white text-sm font-semibold">Base scope includes:</p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>&bull; Shower retile with tub or shower pan</li>
                        <li>&bull; Vanity &amp; mirror</li>
                        <li>&bull; Lighting upgrades</li>
                        <li>&bull; New toilet</li>
                        <li>&bull; Tile flooring</li>
                        <li>&bull; Paint</li>
                      </ul>
                    </div>

                    <p className="text-xs text-white/70 mb-6">
                      * Estimate only. Final pricing depends on material selections, plumbing conditions, and design scope.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Request Exact Pricing <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </LeadGate>
    </div>
  );
}
