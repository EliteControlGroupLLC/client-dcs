"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Layers } from "lucide-react";
import { optionClass, ResultIcon, resultCardClass } from "@/components/calculators/calculator-ui";
import {
  RETAINING_WALL_BASE_HEIGHT_FT,
  RETAINING_WALL_BASE_PRICE_PER_LF,
  formatRate,
  retainingWallCost,
  retainingWallPricePerLF,
} from "@/components/calculators/pricing";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";

const finishTypes = [
  { label: "Standard Broom Finish", pricePerSqFt: 17.5 },
  { label: "Exposed Aggregate", pricePerSqFt: 25 },
  { label: "Stamped Concrete", pricePerSqFt: 30 },
  { label: "Stained / Colored", pricePerSqFt: 28 },
  { label: "Polished Concrete", pricePerSqFt: 35 },
  { label: "Decorative (Premium)", pricePerSqFt: 45 },
];

const thicknessOptions = [
  { label: '4" (Standard slab)', inches: 4 },
  { label: '5" (Reinforced)', inches: 5 },
  { label: '6" (Heavy-duty)', inches: 6 },
];

/**
 * Rendered on the service page (muted band with its own heading) and, with
 * `standalone`, as the body of the /tools page (the page hero carries the title).
 */
export function ConcreteCalculatorInline({ standalone = false }: { standalone?: boolean }) {
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(20);
  const [thickness, setThickness] = useState(0);
  const [finish, setFinish] = useState(0);
  const [hasRetainingWall, setHasRetainingWall] = useState(false);
  const [wallLength, setWallLength] = useState(20);
  const [wallHeight, setWallHeight] = useState(4);

  const sqFt = length * width;
  const selectedFinish = finishTypes[finish];
  const thicknessMultiplier = thicknessOptions[thickness].inches / 4;
  const slabCost = Math.round(sqFt * selectedFinish.pricePerSqFt * thicknessMultiplier);
  const wallPricePerLF = retainingWallPricePerLF(wallHeight);
  const wallCost = hasRetainingWall ? retainingWallCost(wallLength, wallHeight) : 0;
  const totalLow = Math.round((slabCost + wallCost) * 0.9);
  const totalHigh = Math.round((slabCost + wallCost) * 1.15);
  const cubicYards = Math.round((sqFt * thicknessOptions[thickness].inches / 12 / 27) * 10) / 10;

  return (
    <div id="calculator">
      <LeadGate
        className={standalone ? undefined : "bg-muted"}
        interest={LEAD_GATE_INTERESTS.concreteCalculator}
        headline="Unlock your concrete estimate"
        subhead="Driveways, patios, walkways and slabs — see your price range with finish, thickness and retaining-wall options."
        ctaLabel="Unlock My Concrete Estimate"
      >
        <section className={standalone ? "py-20" : "py-20 bg-muted"}>
          <div className="container mx-auto px-4 max-w-5xl">
            {!standalone && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Concrete Project Estimator</h2>
                <p className="text-lg text-muted-foreground">Estimate costs for driveways, patios, walkways, and slabs.</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Length: {length} ft
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Width: {width} ft
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">
                    Total Area: <span className="text-primary">{sqFt.toLocaleString()} sq ft</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">Thickness</label>
                  <div className="flex gap-3">
                    {thicknessOptions.map((t, i) => (
                      <button
                        key={t.label}
                        onClick={() => setThickness(i)}
                        className={optionClass(thickness === i, "flex-1 px-3 py-3 text-sm font-medium")}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-3">Finish Type</label>
                  <div className="space-y-2">
                    {finishTypes.map((f, i) => (
                      <button
                        key={f.label}
                        onClick={() => setFinish(i)}
                        className={optionClass(finish === i)}
                      >
                        <span>{f.label}</span>
                        <span className="text-muted-foreground ml-2 text-sm">(from {formatRate(f.pricePerSqFt)}/sq ft)</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <label className="flex items-center gap-3 min-h-11 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasRetainingWall}
                      onChange={(e) => setHasRetainingWall(e.target.checked)}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-sm font-semibold text-secondary">Add Retaining Wall Estimate</span>
                  </label>
                  {hasRetainingWall && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Wall Length: {wallLength} ft
                        </label>
                        <input
                          type="range"
                          min={5}
                          max={80}
                          step={1}
                          value={wallLength}
                          onChange={(e) => setWallLength(Number(e.target.value))}
                          className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Wall Height: {wallHeight} ft
                        </label>
                        <input
                          type="range"
                          min={2}
                          max={10}
                          step={1}
                          value={wallHeight}
                          onChange={(e) => setWallHeight(Number(e.target.value))}
                          className="w-full h-11 -my-3.5 accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                  {hasRetainingWall && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Retaining walls are {formatRate(RETAINING_WALL_BASE_PRICE_PER_LF)} per linear foot up to {RETAINING_WALL_BASE_HEIGHT_FT} ft tall;
                      each additional foot of height adds {formatRate(RETAINING_WALL_BASE_PRICE_PER_LF / RETAINING_WALL_BASE_HEIGHT_FT)}/LF.
                    </p>
                  )}
                </div>
              </div>

              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                  <div className="text-center">
                    <ResultIcon icon={Layers} />
                    <p className="text-white/75 text-sm mb-2">Estimated Project Cost</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${totalLow.toLocaleString()}&nbsp;&ndash; ${totalHigh.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm mb-6">
                      {sqFt.toLocaleString()} sq ft &bull; {selectedFinish.label} &bull; ~{cubicYards} cubic yards
                    </p>

                    {hasRetainingWall && (
                      <div className="border-t border-white/10 pt-4 mb-4">
                        <p className="text-white/75 text-sm">
                          Slab: ~${slabCost.toLocaleString()} &bull; Retaining Wall: ~${wallCost.toLocaleString()}
                        </p>
                        <p className="text-white/75 text-sm mt-1">
                          Wall: {wallLength} LF &times; {formatRate(wallPricePerLF)}/LF ({wallHeight} ft tall)
                        </p>
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                      <p className="text-white text-sm font-semibold">Scope assumptions:</p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>&bull; Standard site preparation &amp; grading</li>
                        <li>&bull; Rebar or fiber mesh reinforcement</li>
                        <li>&bull; Forming, pouring &amp; finishing</li>
                        <li>&bull; Expansion joints &amp; curing</li>
                      </ul>
                    </div>

                    <p className="text-xs text-white/70 mb-6">
                      * Estimate only. Actual pricing depends on site access, grading, soil conditions, and design.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Get Exact Site Evaluation <ArrowRight className="h-5 w-5 ml-2" />
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
