"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bath, Check } from "lucide-react";

const bathroomTypes = [
  { id: "half", name: "Half Bath", baseCost: 8000, description: "Toilet + sink only" },
  { id: "full", name: "Full Bath", baseCost: 15000, description: "Toilet, sink, tub/shower" },
  { id: "master", name: "Master Bath", baseCost: 25000, description: "Double vanity, walk-in shower" },
  { id: "luxury", name: "Spa Bathroom", baseCost: 40000, description: "Premium fixtures, soaking tub" },
];

const scopeLevels = [
  { id: "cosmetic", name: "Cosmetic Update", multiplier: 0.5, description: "Paint, fixtures, hardware" },
  { id: "partial", name: "Partial Remodel", multiplier: 0.8, description: "New vanity, flooring, fixtures" },
  { id: "full", name: "Full Remodel", multiplier: 1.0, description: "Gut and replace everything" },
  { id: "expansion", name: "Expansion", multiplier: 1.5, description: "Increase size, move walls" },
];

const features = [
  { id: "heated-floor", name: "Heated Floor", cost: 2500 },
  { id: "frameless", name: "Frameless Glass Shower", cost: 3500 },
  { id: "double-vanity", name: "Double Vanity", cost: 2000 },
  { id: "rain-shower", name: "Rain Shower Head", cost: 800 },
  { id: "smart-toilet", name: "Smart Toilet", cost: 1500 },
  { id: "skylight", name: "Skylight", cost: 2000 },
];

export function BathroomCalculator() {
  const [type, setType] = useState("full");
  const [scope, setScope] = useState("full");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["frameless"]);

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const estimate = useMemo(() => {
    const selectedType = bathroomTypes.find(t => t.id === type);
    const selectedScope = scopeLevels.find(s => s.id === scope);
    
    if (!selectedType || !selectedScope) return { low: 0, high: 0, baseCost: 0, featureCost: 0 };

    const baseCost = selectedType.baseCost * selectedScope.multiplier;
    const featureCost = selectedFeatures.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature?.cost || 0);
    }, 0);

    const totalCost = baseCost + featureCost;

    return {
      low: Math.round(totalCost * 0.9),
      high: Math.round(totalCost * 1.15),
      baseCost: Math.round(baseCost),
      featureCost,
    };
  }, [type, scope, selectedFeatures]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <Bath className="h-6 w-6 text-cyan-500" />
          Bathroom Remodel Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Bathroom Type */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Bathroom Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bathroomTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  type === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Project Scope
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scopeLevels.map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  scope === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Premium Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  selectedFeatures.includes(feature.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedFeatures.includes(feature.id)
                    ? "bg-primary border-primary text-white"
                    : "border-border"
                }`}>
                  {selectedFeatures.includes(feature.id) && <Check className="h-3 w-3" />}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{feature.name}</div>
                  <div className="text-xs text-muted-foreground">+${feature.cost.toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-cyan-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-cyan-700 mb-1">Base Remodel</div>
              <div className="text-2xl font-bold text-cyan-600">
                ${estimate.baseCost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-cyan-700 mb-1">Premium Features</div>
              <div className="text-2xl font-bold text-cyan-600">
                +${estimate.featureCost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-cyan-700 mb-1">Total Estimate</div>
              <div className="text-2xl font-bold text-cyan-600">
                ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-dark text-secondary font-semibold">
          Get Free Bathroom Consultation
        </Button>
      </CardContent>
    </Card>
  );
}
