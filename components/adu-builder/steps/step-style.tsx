"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ADU_STYLES } from "@/lib/types/adu";

const styleColors = {
  modern: "from-slate-600 to-slate-800",
  contemporary: "from-stone-500 to-stone-700",
  craftsman: "from-amber-600 to-amber-800",
  spanish: "from-orange-500 to-red-700",
  farmhouse: "from-emerald-600 to-emerald-800",
};

const exteriorOptions = [
  { id: "stucco", label: "Stucco", description: "Smooth, durable finish" },
  { id: "siding", label: "Siding", description: "Wood or composite" },
  { id: "brick", label: "Brick", description: "Classic, timeless look" },
  { id: "mixed", label: "Mixed Materials", description: "Combination of finishes" },
];

const roofOptions = [
  { id: "flat", label: "Flat Roof", description: "Modern, minimalist" },
  { id: "pitched", label: "Pitched Roof", description: "Traditional, classic" },
  { id: "shed", label: "Shed Roof", description: "Contemporary angle" },
];

export function StepStyle() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Choose Your Style</h2>
      <p className="text-muted-foreground mb-8">
        Select the architectural style and finishes for your ADU.
      </p>

      {/* Style selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-4">
          Architectural Style
        </label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ADU_STYLES).map(([id, style]) => (
            <button
              key={id}
              onClick={() => updateConfig({ style: id as keyof typeof ADU_STYLES })}
              className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                config.style === id
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Style preview gradient */}
              <div className={`h-24 bg-gradient-to-br ${styleColors[id as keyof typeof styleColors]}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-12 bg-white/20 rounded-lg" />
                </div>
              </div>
              
              <div className="p-3 text-left">
                <h3 className="font-semibold text-secondary text-sm">{style.label}</h3>
                <p className="text-xs text-muted-foreground">{style.description}</p>
              </div>
              
              {config.style === id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Exterior finish */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-4">
          Exterior Finish
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {exteriorOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateConfig({ exteriorFinish: option.id as "stucco" | "siding" | "brick" | "mixed" })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                config.exteriorFinish === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <h4 className="font-medium text-secondary text-sm">{option.label}</h4>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Roof style */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-4">
          Roof Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {roofOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateConfig({ roofStyle: option.id as "flat" | "pitched" | "shed" })}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                config.roofStyle === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Simple roof visualization */}
              <div className="w-12 h-8 mx-auto mb-2 relative">
                <div className={`absolute bottom-0 w-full h-4 bg-muted rounded-sm ${
                  config.roofStyle === option.id ? "bg-primary/20" : ""
                }`} />
                {option.id === "flat" && (
                  <div className="absolute top-1 w-full h-1 bg-secondary/40 rounded" />
                )}
                {option.id === "pitched" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-b-[16px] border-l-transparent border-r-transparent border-b-secondary/40" />
                )}
                {option.id === "shed" && (
                  <div className="absolute top-0 right-0 w-full h-3 bg-secondary/40 origin-right -skew-y-6" />
                )}
              </div>
              <h4 className="font-medium text-secondary text-sm">{option.label}</h4>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          ))}
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
