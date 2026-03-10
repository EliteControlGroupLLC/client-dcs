"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

const projectTypes = [
  { id: "foundation", name: "Foundation", thickness: 4, pricePerYard: 150 },
  { id: "driveway", name: "Driveway", thickness: 4, pricePerYard: 140 },
  { id: "patio", name: "Patio/Walkway", thickness: 4, pricePerYard: 135 },
  { id: "slab", name: "Garage Slab", thickness: 4, pricePerYard: 145 },
];

const finishTypes = [
  { id: "standard", name: "Standard Broom Finish", multiplier: 1.0 },
  { id: "stamped", name: "Stamped Concrete", multiplier: 1.8 },
  { id: "exposed", name: "Exposed Aggregate", multiplier: 1.5 },
  { id: "colored", name: "Colored Concrete", multiplier: 1.3 },
];

export function ConcreteCalculator() {
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(20);
  const [projectType, setProjectType] = useState("patio");
  const [finish, setFinish] = useState("standard");

  const estimate = useMemo(() => {
    const selectedProject = projectTypes.find(p => p.id === projectType);
    const selectedFinish = finishTypes.find(f => f.id === finish);
    
    if (!selectedProject || !selectedFinish) return { yards: 0, low: 0, high: 0 };

    const sqFt = length * width;
    const cubicFt = sqFt * (selectedProject.thickness / 12);
    const cubicYards = cubicFt / 27;
    const roundedYards = Math.ceil(cubicYards * 10) / 10; // Round up to nearest 0.1

    const materialCost = roundedYards * selectedProject.pricePerYard;
    const laborCost = sqFt * 6 * selectedFinish.multiplier;
    const totalCost = materialCost + laborCost;

    return {
      sqFt,
      yards: roundedYards,
      low: Math.round(totalCost * 0.9),
      high: Math.round(totalCost * 1.1),
    };
  }, [length, width, projectType, finish]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <Calculator className="h-6 w-6 text-slate-500" />
          Concrete Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Dimensions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Length (feet)
            </label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              min={1}
              max={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Width (feet)
            </label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={1}
              max={200}
            />
          </div>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Project Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setProjectType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  projectType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-xs text-muted-foreground">{type.thickness}&quot; thick</div>
              </button>
            ))}
          </div>
        </div>

        {/* Finish Type */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Finish Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {finishTypes.map((f) => (
              <button
                key={f.id}
                onClick={() => setFinish(f.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  finish === f.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm">{f.name}</div>
                {f.multiplier > 1 && (
                  <div className="text-xs text-muted-foreground">
                    +{Math.round((f.multiplier - 1) * 100)}% labor
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Area</div>
            <div className="text-2xl font-bold text-secondary">{estimate.sqFt}</div>
            <div className="text-sm text-muted-foreground">sq ft</div>
          </div>
          <div className="bg-muted rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Concrete Needed</div>
            <div className="text-2xl font-bold text-secondary">{estimate.yards}</div>
            <div className="text-sm text-muted-foreground">cubic yards</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Est. Total Cost</div>
            <div className="text-2xl font-bold text-primary">
              ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">installed</div>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
          Get Free Concrete Estimate
        </Button>
      </CardContent>
    </Card>
  );
}
