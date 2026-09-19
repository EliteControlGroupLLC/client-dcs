"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home } from "lucide-react";
import {
  calcSectionClass,
  controlLabelClass,
  inputPanelClass,
  optionClass,
  rangeClass,
  ResultIcon,
  resultCardClass,
} from "@/components/calculators/calculator-ui";
import { TierComparison, TierWhy, TrustCallout } from "@/components/calculators/tier-explainer";
import { GAF_TRUST, ROOF_COMPLEXITY_WHY, ROOF_OPTIONS } from "@/components/calculators/tier-details";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";

const roofTypes = [
  { label: "GAF Shingle — Value Line", pricePerSquare: 852 },
  { label: "GAF Shingle — Premium Line", pricePerSquare: 1050 },
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

/**
 * Rendered on the service page (dark band with its own heading) and, with
 * `standalone`, as the body of the /tools page (the page hero carries the title).
 */
export function RoofCalculatorInline({ standalone = false }: { standalone?: boolean }) {
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
    <div id="calculator">
      <LeadGate
        className={calcSectionClass}
        interest={LEAD_GATE_INTERESTS.roofCalculator}
        headline="Unlock your roofing estimate"
        subhead="Compare shingle, tile, metal and flat-roof pricing for your home in seconds."
        ctaLabel="Unlock My Roofing Estimate"
      >
        <section className={`py-20 ${calcSectionClass}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            {!standalone && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Roof Price Calculator</h2>
                <p className="text-lg text-white/80">Adjust roof size, material, and complexity to see your estimated range.</p>
              </div>
            )}
            <TrustCallout title={GAF_TRUST.title} text={GAF_TRUST.text} />
            <div className="grid md:grid-cols-2 gap-8 [&>*]:min-w-0">
              <div className={`space-y-8 ${inputPanelClass}`}>
                <div>
                  <label className={controlLabelClass}>
                    Roof Area: {roofArea.toLocaleString()} sq ft
                  </label>
                  <input
                    type="range"
                    min={800}
                    max={5000}
                    step={100}
                    value={roofArea}
                    onChange={(e) => setRoofArea(Number(e.target.value))}
                    className={rangeClass}
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>800 sq ft</span>
                    <span>5,000 sq ft</span>
                  </div>
                </div>

                <div>
                  <label className={controlLabelClass}>Roof Type</label>
                  <div className="space-y-2">
                    {roofTypes.map((t, i) => (
                      <button
                        key={t.label}
                        onClick={() => setRoofType(i)}
                        className={optionClass(roofType === i)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={controlLabelClass}>Roof Complexity</label>
                  <div className="space-y-2">
                    {complexityLevels.map((c, i) => (
                      <button
                        key={c.label}
                        onClick={() => setComplexity(i)}
                        className={optionClass(complexity === i)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Card className={resultCardClass}>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                  <div className="text-center">
                    <ResultIcon icon={Home} />
                    <p className="text-white/75 text-sm mb-2">Estimated Roof Cost</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-1 text-balance">
                      ${lowEstimate.toLocaleString()}&nbsp;&ndash; ${highEstimate.toLocaleString()}
                    </p>
                    <p className="text-white/75 text-sm mb-6">
                      {squares} squares &bull; {selected.label} &bull; {comp.label}
                    </p>

                    <TierWhy title={`Why ${selected.label}`} text={ROOF_OPTIONS.options[roofType].why} />
                    {complexity > 0 && <TierWhy title={`Why ${comp.label.split(" (")[0].toLowerCase()} roofs cost more`} text={ROOF_COMPLEXITY_WHY[complexity]} />}

                    <div className="border-t border-white/10 pt-6 space-y-3 text-left mb-6">
                      <p className="text-white text-sm font-semibold">Typically includes:</p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>&bull; Tear-off of existing roof</li>
                        <li>&bull; New underlayment &amp; flashing</li>
                        <li>&bull; Material &amp; labor</li>
                        <li>&bull; Cleanup &amp; haul-off</li>
                      </ul>
                      <p className="text-white text-sm font-semibold mt-4">May exclude:</p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>&bull; Structural repairs / dry rot</li>
                        <li>&bull; Skylights or solar penetrations</li>
                        <li>&bull; Gutter replacement</li>
                      </ul>
                    </div>

                    <p className="text-xs text-white/70 mb-6">
                      * Estimate only. Actual pricing depends on site conditions, access, and materials selected.
                    </p>

                    <Button asChild size="lg" rounded="full" className="w-full">
                      <Link href="/contact">
                        Get Exact Inspection &amp; Quote <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TierComparison
              title="Every roof is a system"
              intro="The shingles or tile are only the top layer. Longevity comes from what's underneath and how it's installed. Here's how each roof type compares."
              ladder={ROOF_OPTIONS}
              selected={roofType}
              onSelect={setRoofType}
            />
          </div>
        </section>
      </LeadGate>
    </div>
  );
}
