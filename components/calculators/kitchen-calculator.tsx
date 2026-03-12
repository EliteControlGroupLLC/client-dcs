"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Check } from "lucide-react";

const kitchenSizes = [
  { id: "small", name: "Small Kitchen", sqFt: "< 100 sq ft", baseCost: 15000 },
  { id: "medium", name: "Medium Kitchen", sqFt: "100-150 sq ft", baseCost: 25000 },
  { id: "large", name: "Large Kitchen", sqFt: "150-200 sq ft", baseCost: 40000 },
  { id: "xlarge", name: "Extra Large", sqFt: "200+ sq ft", baseCost: 55000 },
];

const finishLevels = [
  { id: "budget", name: "Budget-Friendly", multiplier: 0.8, description: "Stock cabinets, laminate counters" },
  { id: "mid", name: "Mid-Range", multiplier: 1.0, description: "Semi-custom cabinets, quartz counters" },
  { id: "upscale", name: "Upscale", multiplier: 1.5, description: "Custom cabinets, premium finishes" },
  { id: "luxury", name: "Luxury", multiplier: 2.2, description: "High-end everything, designer touches" },
];

const upgrades = [
  { id: "island", name: "Kitchen Island", cost: 5000 },
  { id: "appliances", name: "New Appliances", cost: 8000 },
  { id: "lighting", name: "Upgraded Lighting", cost: 2500 },
  { id: "flooring", name: "New Flooring", cost: 4000 },
  { id: "backsplash", name: "Tile Backsplash", cost: 2000 },
  { id: "plumbing", name: "Move Plumbing", cost: 3500 },
];

export function KitchenCalculator() {
  const [size, setSize] = useState("medium");
  const [finish, setFinish] = useState("mid");
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>(["appliances", "lighting"]);

  const toggleUpgrade = (id: string) => {
    if (selectedUpgrades.includes(id)) {
      setSelectedUpgrades(selectedUpgrades.filter(u => u !== id));
    } else {
      setSelectedUpgrades([...selectedUpgrades, id]);
    }
  };

  const estimate = useMemo(() => {
    const selectedSize = kitchenSizes.find(s => s.id === size);
    const selectedFinish = finishLevels.find(f => f.id === finish);
    
    if (!selectedSize || !selectedFinish) return { low: 0, high: 0, baseCost: 0, upgradeCost: 0 };

    const baseCost = selectedSize.baseCost * selectedFinish.multiplier;
    const upgradeCost = selectedUpgrades.reduce((sum, id) => {
      const upgrade = upgrades.find(u => u.id === id);
      return sum + (upgrade?.cost || 0);
    }, 0);

    const totalCost = baseCost + upgradeCost;

    return {
      low: Math.round(totalCost * 0.9),
      high: Math.round(totalCost * 1.15),
      baseCost: Math.round(baseCost),
      upgradeCost,
    };
  }, [size, finish, selectedUpgrades]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-rose-500" />
          Kitchen Remodel Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Kitchen Size */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Kitchen Size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kitchenSizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSize(s.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  size === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.sqFt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Finish Level */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Finish Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {finishLevels.map((f) => (
              <button
                key={f.id}
                onClick={() => setFinish(f.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  finish === f.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upgrades */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Additional Upgrades
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {upgrades.map((upgrade) => (
              <button
                key={upgrade.id}
                onClick={() => toggleUpgrade(upgrade.id)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  selectedUpgrades.includes(upgrade.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedUpgrades.includes(upgrade.id)
                    ? "bg-primary border-primary text-white"
                    : "border-border"
                }`}>
                  {selectedUpgrades.includes(upgrade.id) && <Check className="h-3 w-3" />}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{upgrade.name}</div>
                  <div className="text-xs text-muted-foreground">+${upgrade.cost.toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-rose-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-rose-700 mb-1">Base Remodel</div>
              <div className="text-2xl font-bold text-rose-600">
                ${estimate.baseCost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-rose-700 mb-1">Upgrades</div>
              <div className="text-2xl font-bold text-rose-600">
                +${estimate.upgradeCost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-rose-700 mb-1">Total Estimate</div>
              <div className="text-2xl font-bold text-rose-600">
                ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
          Get Free Kitchen Consultation
        </Button>
      </CardContent>
    </Card>
  );
}
