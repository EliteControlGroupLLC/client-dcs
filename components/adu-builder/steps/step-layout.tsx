"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, LayoutDashboard, Columns, SplitSquareVertical } from "lucide-react";

const layoutOptions = [
  {
    id: "open",
    icon: LayoutDashboard,
    title: "Open Concept",
    description: "Living, dining, and kitchen flow together",
    features: ["Feels more spacious", "Great for entertaining", "Natural light flows through"],
    popular: true,
  },
  {
    id: "traditional",
    icon: Columns,
    title: "Traditional",
    description: "Defined rooms with separate spaces",
    features: ["More privacy", "Distinct functional areas", "Classic feel"],
  },
  {
    id: "split",
    icon: SplitSquareVertical,
    title: "Split Layout",
    description: "Bedrooms separated from living area",
    features: ["Maximum privacy", "Ideal for roommates", "Quiet sleeping areas"],
  },
];

export function StepLayout() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const handleLayoutSelect = (layout: string) => {
    updateConfig({ layout: layout as "open" | "traditional" | "split" });
  };

  // Determine available bedroom/bathroom options based on size
  const getBedOptions = () => {
    if (config.size === "studio" || (config.sqft && config.sqft <= 400)) return [0];
    if (config.size === "1-bed" || (config.sqft && config.sqft <= 600)) return [0, 1];
    return [1, 2, 3];
  };

  const getBathOptions = () => {
    if (config.size === "studio" || (config.sqft && config.sqft <= 400)) return [1];
    if (config.size === "1-bed" || (config.sqft && config.sqft <= 600)) return [1];
    return [1, 2];
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Choose Your Layout</h2>
      <p className="text-muted-foreground mb-8">
        Select how you want your space organized.
      </p>

      {/* Layout options */}
      <div className="space-y-4 mb-8">
        {layoutOptions.map((layout) => (
          <button
            key={layout.id}
            onClick={() => handleLayoutSelect(layout.id)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all flex gap-4 ${
              config.layout === layout.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${
              config.layout === layout.id ? "bg-primary text-white" : "bg-muted text-secondary"
            }`}>
              <layout.icon className="h-7 w-7" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-secondary">{layout.title}</h3>
                {layout.popular && (
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{layout.description}</p>
              <div className="flex flex-wrap gap-2">
                {layout.features.map((feature) => (
                  <span key={feature} className="text-xs bg-muted px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bedroom/Bathroom selection */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Number of Bedrooms
          </label>
          <div className="flex gap-2">
            {getBedOptions().map((num) => (
              <button
                key={num}
                onClick={() => updateConfig({ bedrooms: num })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  config.bedrooms === num
                    ? "border-primary bg-primary text-white"
                    : "border-border text-secondary hover:border-primary/50"
                }`}
              >
                {num === 0 ? "Studio" : num}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Number of Bathrooms
          </label>
          <div className="flex gap-2">
            {getBathOptions().map((num) => (
              <button
                key={num}
                onClick={() => updateConfig({ bathrooms: num })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  config.bathrooms === num
                    ? "border-primary bg-primary text-white"
                    : "border-border text-secondary hover:border-primary/50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
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
