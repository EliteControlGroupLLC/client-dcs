"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hammer } from "lucide-react";

const roofMaterials = [
  { id: "asphalt", name: "Asphalt Shingles", pricePerSqFt: 4.5, lifespan: "20-25 years" },
  { id: "metal", name: "Metal Roofing", pricePerSqFt: 9, lifespan: "40-70 years" },
  { id: "tile", name: "Clay/Concrete Tile", pricePerSqFt: 12, lifespan: "50+ years" },
  { id: "flat", name: "Flat/TPO Membrane", pricePerSqFt: 7, lifespan: "15-30 years" },
];

const complexityLevels = [
  { id: "simple", name: "Simple (Gable/Hip)", multiplier: 1.0 },
  { id: "moderate", name: "Moderate (Multiple slopes)", multiplier: 1.2 },
  { id: "complex", name: "Complex (Dormers, valleys)", multiplier: 1.4 },
];

export function RoofCalculator() {
  const [roofArea, setRoofArea] = useState(2000);
  const [material, setMaterial] = useState("asphalt");
  const [complexity, setComplexity] = useState("simple");
  const [tearOff, setTearOff] = useState(true);

  const estimate = useMemo(() => {
    const selectedMaterial = roofMaterials.find(m => m.id === material);
    const selectedComplexity = complexityLevels.find(c => c.id === complexity);
    
    if (!selectedMaterial || !selectedComplexity) return { low: 0, high: 0 };

    const baseCost = roofArea * selectedMaterial.pricePerSqFt * selectedComplexity.multiplier;
    const tearOffCost = tearOff ? roofArea * 1.5 : 0;
    const totalCost = baseCost + tearOffCost;

    return {
      low: Math.round(totalCost * 0.9),
      high: Math.round(totalCost * 1.1),
      lifespan: selectedMaterial.lifespan,
    };
  }, [roofArea, material, complexity, tearOff]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <Hammer className="h-6 w-6 text-amber-500" />
          Roof Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Roof Area */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Roof Area (square feet)
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              className="w-32"
            />
            <input
              type="range"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              min={500}
              max={5000}
              step={100}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tip: Roof area is typically 1.5x your home&apos;s footprint
          </p>
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Roofing Material
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roofMaterials.map((mat) => (
              <button
                key={mat.id}
                onClick={() => setMaterial(mat.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  material === mat.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm">{mat.name}</div>
                <div className="text-xs text-muted-foreground">${mat.pricePerSqFt}/sq ft</div>
                <div className="text-xs text-primary mt-1">{mat.lifespan}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Roof Complexity
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {complexityLevels.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setComplexity(comp.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  complexity === comp.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{comp.name}</div>
                <div className="text-xs text-muted-foreground">
                  {comp.multiplier > 1 ? `+${(comp.multiplier - 1) * 100}% cost` : "Base pricing"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tear Off */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTearOff(!tearOff)}
            className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${
              tearOff ? "bg-primary border-primary text-white" : "border-border"
            }`}
          >
            {tearOff && "✓"}
          </button>
          <label className="text-sm font-medium text-secondary">
            Include tear-off of existing roof (+$1.50/sq ft)
          </label>
        </div>

        {/* Result */}
        <div className="bg-amber-50 rounded-xl p-6">
          <div className="text-sm text-amber-700 mb-2">Estimated Roof Cost</div>
          <div className="text-4xl font-bold text-amber-600 mb-2">
            ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
          </div>
          <div className="text-sm text-amber-600/70">
            Expected lifespan: {estimate.lifespan}
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
          Get Free Roofing Estimate
        </Button>
      </CardContent>
    </Card>
  );
}
