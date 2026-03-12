"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, Home, TrendingUp } from "lucide-react";

const sanDiegoAreas = [
  { id: "downtown", name: "Downtown/Little Italy", rentPerSqFt: 4.50 },
  { id: "la-jolla", name: "La Jolla", rentPerSqFt: 4.25 },
  { id: "north-park", name: "North Park/Hillcrest", rentPerSqFt: 3.75 },
  { id: "pacific-beach", name: "Pacific Beach", rentPerSqFt: 4.00 },
  { id: "mission-valley", name: "Mission Valley", rentPerSqFt: 3.50 },
  { id: "east-county", name: "East County", rentPerSqFt: 3.00 },
  { id: "south-bay", name: "South Bay/Chula Vista", rentPerSqFt: 2.75 },
  { id: "north-county", name: "North County Coastal", rentPerSqFt: 3.75 },
];

export function RentalIncomeCalculator() {
  const [squareFeet, setSquareFeet] = useState(600);
  const [area, setArea] = useState("north-park");
  const [bedrooms, setBedrooms] = useState(1);

  const estimate = useMemo(() => {
    const selectedArea = sanDiegoAreas.find(a => a.id === area);
    if (!selectedArea) return { monthly: 0, annual: 0, low: 0, high: 0 };

    const baseRent = squareFeet * selectedArea.rentPerSqFt;
    const bedroomBonus = bedrooms * 100;
    const monthlyRent = Math.round(baseRent + bedroomBonus);
    
    return {
      monthly: monthlyRent,
      annual: monthlyRent * 12,
      low: Math.round(monthlyRent * 0.9),
      high: Math.round(monthlyRent * 1.1),
    };
  }, [squareFeet, area, bedrooms]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-500" />
          Rental Income Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Square Footage */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            ADU Square Footage
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={squareFeet}
              onChange={(e) => setSquareFeet(Number(e.target.value))}
              min={200}
              max={1200}
              step={50}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-lg font-semibold w-24 text-right">{squareFeet} sq ft</span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            <MapPin className="inline h-4 w-4 mr-1" />
            San Diego Area
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sanDiegoAreas.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setArea(loc.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  area === loc.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-medium">{loc.name}</div>
                <div className="text-xs text-muted-foreground">${loc.rentPerSqFt}/sq ft</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            <Home className="inline h-4 w-4 mr-1" />
            Number of Bedrooms
          </label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setBedrooms(num)}
                className={`w-16 h-12 rounded-lg border-2 font-medium transition-all ${
                  bedrooms === num
                    ? "border-primary bg-primary text-white"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {num === 0 ? "Studio" : num}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-6">
            <div className="text-sm text-green-700 mb-1">Estimated Monthly Rent</div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${estimate.monthly.toLocaleString()}
            </div>
            <div className="text-sm text-green-600/70">
              Range: ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-sm text-blue-700 mb-1">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Annual Income Potential
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              ${estimate.annual.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600/70">
              Before expenses and taxes
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-secondary rounded-xl p-6 text-white text-center">
          <p className="mb-4">Want to maximize your rental income? Our design team can help optimize your ADU layout.</p>
          <Button className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
            Schedule Free Consultation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
