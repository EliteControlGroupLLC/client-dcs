"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler, Check, X, Home, Users, Bed, Bath } from "lucide-react";

const aduSizes = [
  {
    size: 400,
    name: "Compact",
    layout: "Studio / 1 Bed",
    bedrooms: "0-1",
    bathrooms: "1",
    ideal: "Single tenant, home office, short-term rental",
    priceRange: "$100k - $140k",
    rentRange: "$1,800 - $2,200",
    features: {
      fullKitchen: true,
      separateBedroom: false,
      laundry: false,
      storage: false,
      outdoorSpace: false,
    },
  },
  {
    size: 600,
    name: "Standard",
    layout: "1 Bed / 1 Bath",
    bedrooms: "1",
    bathrooms: "1",
    ideal: "Single tenant, couple, aging parent",
    priceRange: "$150k - $200k",
    rentRange: "$2,200 - $2,800",
    features: {
      fullKitchen: true,
      separateBedroom: true,
      laundry: true,
      storage: true,
      outdoorSpace: false,
    },
  },
  {
    size: 800,
    name: "Comfortable",
    layout: "2 Bed / 1 Bath",
    bedrooms: "2",
    bathrooms: "1",
    ideal: "Small family, roommates, multi-generational",
    priceRange: "$200k - $280k",
    rentRange: "$2,800 - $3,500",
    features: {
      fullKitchen: true,
      separateBedroom: true,
      laundry: true,
      storage: true,
      outdoorSpace: true,
    },
  },
  {
    size: 1000,
    name: "Spacious",
    layout: "2 Bed / 2 Bath",
    bedrooms: "2",
    bathrooms: "2",
    ideal: "Family, luxury rental, primary residence",
    priceRange: "$280k - $360k",
    rentRange: "$3,500 - $4,500",
    features: {
      fullKitchen: true,
      separateBedroom: true,
      laundry: true,
      storage: true,
      outdoorSpace: true,
    },
  },
];

export function SizeCompareCalculator() {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([400, 600, 800]);

  const toggleSize = (size: number) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter(s => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const selectedADUs = aduSizes.filter(adu => selectedSizes.includes(adu.size));

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-secondary flex items-center gap-2">
          <Ruler className="h-6 w-6 text-orange-500" />
          ADU Size Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Size Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Select sizes to compare (click to toggle)
          </label>
          <div className="flex flex-wrap gap-3">
            {aduSizes.map((adu) => (
              <button
                key={adu.size}
                onClick={() => toggleSize(adu.size)}
                className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedSizes.includes(adu.size)
                    ? "border-primary bg-primary text-white"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {adu.size} sq ft - {adu.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Features</th>
                {selectedADUs.map((adu) => (
                  <th key={adu.size} className="text-center py-4 px-4">
                    <div className="font-bold text-secondary">{adu.size} sq ft</div>
                    <div className="text-sm text-primary font-medium">{adu.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-4 flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Layout
                </td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4 font-medium">
                    {adu.layout}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  Bedrooms
                </td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4">
                    {adu.bedrooms}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 flex items-center gap-2">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  Bathrooms
                </td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4">
                    {adu.bathrooms}
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-muted/30">
                <td className="py-4 px-4 font-medium">Est. Build Cost</td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4 font-bold text-secondary">
                    {adu.priceRange}
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-green-50">
                <td className="py-4 px-4 font-medium">Monthly Rent</td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4 font-bold text-green-600">
                    {adu.rentRange}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Full Kitchen</td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4">
                    {adu.features.fullKitchen ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Separate Bedroom</td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4">
                    {adu.features.separateBedroom ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">In-Unit Laundry</td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4">
                    {adu.features.laundry ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">
                  <Users className="inline h-4 w-4 mr-2 text-muted-foreground" />
                  Ideal For
                </td>
                {selectedADUs.map((adu) => (
                  <td key={adu.size} className="text-center py-4 px-4 text-sm text-muted-foreground">
                    {adu.ideal}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center bg-muted rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            Not sure which size is right for your property? Our team can assess your lot and recommend the optimal ADU size.
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
            Get Free Property Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
