"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home } from "lucide-react";

const roofTypes = [
  { label: "30-Year Composition Shingle", pricePerSquare: 852 },
  { label: "50-Year Composition Shingle", pricePerSquare: 1050 },
  { label: "Concrete Tile", pricePerSquare: 1200 },
  { label: "Clay Tile", pricePerSquare: 1500 },
  { label: "Standing Seam Metal", pricePerSquare: 1800 },
  { label: "Flat / Low-Slope (TPO/Modified)", pricePerSquare: 950 },
];

const complexityLevels = [
  { label: "Simple (Gable/Hip)", multiplier: 1.0 },
  { label: "Moderate (Multiple planes)", multiplier: 1.15 },
  { label: "Complex (Cut-ups, dormers)", multiplier: 1.35 },
];

export function RoofCalculatorInline() {
  const [roofArea, setRoofArea] = useState(2000);
  const [roofType, setRoofType] = useState(0);
  const [complexity, setComplexity] = useState(0);

  const selected = roofTypes[roofType];
  const comp = complexityLevels[complexity];
  const squares = roofArea / 100;
  const baseCost = Math.round(squares * selected.pricePerSquare * comp.multiplier);
  const lowEstimate = Math.round(baseCost * 0.9);
  const highEstimate = Math.round(baseCost * 1.1);

  return (
    <section id="calculator" className="py-16 bg-muted">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">Roof Price Calculator</h2>
          <p className="text-muted-foreground">Adjust roof size, material, and complexity to see your estimated range.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-3">
                Roof Area: {roofArea.toLocaleString()} sq ft
              </label>
              <input
                type="range"
                min={800}
                max={5000}
                step={100}
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>800 sq ft</span>
                <span>5,000 sq ft</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-3">Roof Type</label>
              <div className="space-y-2">
                {roofTypes.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => setRoofType(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      roofType === i
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
              <label className="block text-sm font-semibold text-secondary mb-3">Roof Complexity</label>
              <div className="space-y-2">
                {complexityLevels.map((c, i) => (
                  <button
                    key={c.label}
                    onClick={() => setComplexity(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      complexity === i
                        ? "border-primary bg-primary/5 text-secondary font-medium"
                        : "border-gray-200 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-secondary text-white">
            <CardContent className="p-8 flex flex-col justify-center h-full">
              <div className="text-center">
                <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-white/70 text-sm mb-2">Estimated Roof Cost</p>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  ${lowEstimate.toLocaleString()} &ndash; ${highEstimate.toLocaleString()}
                </p>
                <p className="text-white/50 text-sm mb-6">
                  {squares} squares &bull; {selected.label} &bull; {comp.label}
                </p>

                <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                  <p className="text-white/70 text-sm font-semibold">Typically includes:</p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>&bull; Tear-off of existing roof</li>
                    <li>&bull; New underlayment &amp; flashing</li>
                    <li>&bull; Material &amp; labor</li>
                    <li>&bull; Cleanup &amp; haul-off</li>
                  </ul>
                  <p className="text-white/70 text-sm font-semibold mt-4">May exclude:</p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>&bull; Structural repairs / dry rot</li>
                    <li>&bull; Skylights or solar penetrations</li>
                    <li>&bull; Gutter replacement</li>
                  </ul>
                </div>

                <p className="text-xs text-white/40 mb-6">
                  * Estimate only. Actual pricing depends on site conditions, access, and materials selected.
                </p>

                <Link href="/contact">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
                    Get Exact Inspection &amp; Quote <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
