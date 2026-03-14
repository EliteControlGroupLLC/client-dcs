"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Ruler, Check } from "lucide-react";
import { ADU_SIZES } from "@/lib/types/adu";
import { formatCurrency } from "@/lib/utils";

const sizeOptions = [
  {
    id: "studio",
    ...ADU_SIZES.studio,
    popular: false,
  },
  {
    id: "1-bed",
    ...ADU_SIZES["1-bed"],
    popular: true,
  },
  {
    id: "2-bed",
    ...ADU_SIZES["2-bed"],
    popular: false,
  },
];

export function StepSize() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const handleSizeSelect = (sizeId: string) => {
    const sizeInfo = sizeOptions.find((s) => s.id === sizeId);
    if (sizeInfo) {
      updateConfig({
        size: sizeId as "studio" | "1-bed" | "2-bed" | "custom",
        sqft: sizeInfo.sqft,
        bedrooms: sizeInfo.beds,
        bathrooms: sizeInfo.baths,
      });
    }
  };

  const handleCustomSize = (sqft: number) => {
    updateConfig({
      size: "custom",
      sqft: sqft,
      bedrooms: sqft <= 400 ? 0 : sqft <= 600 ? 1 : 2,
      bathrooms: sqft <= 600 ? 1 : 2,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Select Your ADU Size</h2>
      <p className="text-muted-foreground mb-8">
        Choose a pre-configured size or customize to your needs.
      </p>

      {/* Size options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {sizeOptions.map((size) => (
          <button
            key={size.id}
            onClick={() => handleSizeSelect(size.id)}
            className={`relative p-5 rounded-xl border-2 text-center transition-all ${
              config.size === size.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {size.popular && (
              <span className="absolute top-2 right-2 text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            
            <div className="text-3xl font-bold text-secondary mb-1">{size.sqft}</div>
            <div className="text-sm text-muted-foreground mb-3">sq ft</div>
            
            <h3 className="font-semibold text-secondary mb-2">{size.label}</h3>
            
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-3">
              <span>{size.beds === 0 ? "Studio" : `${size.beds} Bed`}</span>
              <span>•</span>
              <span>{size.baths} Bath</span>
            </div>
            
            <div className="text-lg font-bold text-primary">
              {formatCurrency(size.price)}
            </div>
            <div className="text-xs text-muted-foreground">Starting price</div>
          </button>
        ))}
      </div>

      {/* Custom size option */}
      <div className={`p-5 rounded-xl border-2 transition-all ${
        config.size === "custom"
          ? "border-primary bg-primary/5"
          : "border-border"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              config.size === "custom" ? "bg-primary text-white" : "bg-muted text-secondary"
            }`}>
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary">Custom Size</h3>
              <p className="text-sm text-muted-foreground">Enter your desired square footage</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            type="number"
            placeholder="Enter sq ft"
            value={config.size === "custom" ? config.sqft || "" : ""}
            onChange={(e) => handleCustomSize(parseInt(e.target.value) || 0)}
            onFocus={() => updateConfig({ size: "custom" })}
            className="max-w-[200px]"
            min={200}
            max={1200}
          />
          <span className="text-sm text-muted-foreground">sq ft (200-1,200)</span>
        </div>
        
        {config.size === "custom" && config.sqft && config.sqft > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Estimated price: <span className="font-bold text-primary">{formatCurrency(config.sqft * 427)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Size guide */}
      <div className="mt-6 bg-muted rounded-xl p-4">
        <h4 className="font-medium text-secondary mb-2">Size Guide</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Studio (400 sq ft): Perfect for rental income or home office
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            1 Bedroom (600 sq ft): Ideal for long-term tenants or guests
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            2 Bedroom (800 sq ft): Great for families or maximum rental income
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
