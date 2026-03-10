"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Hammer, Sparkles, Star } from "lucide-react";

type ADUType = "attached" | "detached" | "garage-conversion" | "jadu";
type FinishLevel = "standard" | "premium" | "luxury";

const aduTypes = [
  { id: "attached" as const, label: "Attached ADU", basePrice: 250, icon: Home },
  { id: "detached" as const, label: "Detached ADU", basePrice: 300, icon: Home },
  { id: "garage-conversion" as const, label: "Garage Conversion", basePrice: 150, icon: Hammer },
  { id: "jadu" as const, label: "Junior ADU", basePrice: 125, icon: Home },
];

const finishLevels = [
  { id: "standard" as const, label: "Standard", multiplier: 1.0, description: "Quality finishes, functional design" },
  { id: "premium" as const, label: "Premium", multiplier: 1.25, description: "Upgraded materials, enhanced features" },
  { id: "luxury" as const, label: "Luxury", multiplier: 1.5, description: "High-end finishes, custom details" },
];

export function ADUPriceCalculator() {
  const [squareFeet, setSquareFeet] = useState(600);
  const [aduType, setAduType] = useState<ADUType>("detached");
  const [finishLevel, setFinishLevel] = useState<FinishLevel>("standard");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);

  const estimate = useMemo(() => {
    const selectedType = aduTypes.find(t => t.id === aduType);
    const selectedFinish = finishLevels.find(f => f.id === finishLevel);
    
    if (!selectedType || !selectedFinish) return { low: 0, high: 0 };

    const basePrice = selectedType.basePrice * selectedFinish.multiplier;
    const bathroomExtra = (bathrooms - 1) * 15000;
    const bedroomExtra = (bedrooms - 1) * 5000;
    
    const totalBase = (squareFeet * basePrice) + bathroomExtra + bedroomExtra;
    
    return {
      low: Math.round(totalBase * 0.9),
      high: Math.round(totalBase * 1.1),
    };
  }, [squareFeet, aduType, finishLevel, bedrooms, bathrooms]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          ADU Price Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Square Footage */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Square Footage
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={squareFeet}
              onChange={(e) => setSquareFeet(Number(e.target.value))}
              min={200}
              max={1200}
              className="w-32"
            />
            <input
              type="range"
              value={squareFeet}
              onChange={(e) => setSquareFeet(Number(e.target.value))}
              min={200}
              max={1200}
              step={50}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-20">sq ft</span>
          </div>
        </div>

        {/* ADU Type */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            ADU Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aduTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setAduType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    aduType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${aduType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">${type.basePrice}/sq ft</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Finish Level */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Finish Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {finishLevels.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setFinishLevel(finish.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  finishLevel === finish.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {finish.id === "standard" && <Hammer className="h-4 w-4" />}
                  {finish.id === "premium" && <Sparkles className="h-4 w-4" />}
                  {finish.id === "luxury" && <Star className="h-4 w-4" />}
                  <span className="font-medium">{finish.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">{finish.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Bedrooms
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setBedrooms(num)}
                  className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                    bedrooms === num
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Bathrooms
            </label>
            <div className="flex gap-2">
              {[1, 1.5, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setBathrooms(num)}
                  className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                    bathrooms === num
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-secondary rounded-xl p-6 text-white">
          <div className="text-sm text-white/70 mb-2">Estimated Project Cost</div>
          <div className="text-4xl font-bold mb-4">
            ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
          </div>
          <div className="text-sm text-white/70 mb-4">
            Based on {squareFeet} sq ft {aduTypes.find(t => t.id === aduType)?.label} with {finishLevels.find(f => f.id === finishLevel)?.label.toLowerCase()} finishes
          </div>
          <Button className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
            Get Detailed Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
