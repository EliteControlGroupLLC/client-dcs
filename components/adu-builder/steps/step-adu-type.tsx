"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Home, Link, Warehouse, DoorOpen, Check, Info } from "lucide-react";

const aduTypes = [
  {
    id: "detached",
    icon: Home,
    title: "Detached ADU",
    description: "Standalone structure in your backyard",
    features: ["Maximum privacy", "Most design flexibility", "Higher resale value"],
    recommended: true,
  },
  {
    id: "attached",
    icon: Link,
    title: "Attached ADU",
    description: "Connected to your main home",
    features: ["Shared wall reduces cost", "Easier utility connections", "Indoor access option"],
  },
  {
    id: "garage-conversion",
    icon: Warehouse,
    title: "Garage Conversion",
    description: "Transform your existing garage",
    features: ["Lower construction cost", "Faster build time", "Uses existing structure"],
  },
  {
    id: "jadu",
    icon: DoorOpen,
    title: "Junior ADU (JADU)",
    description: "Within existing home, max 500 sq ft",
    features: ["Lowest cost option", "Minimal permits", "Share utilities with main home"],
  },
];

export function StepADUType() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const handleTypeSelect = (type: string) => {
    updateConfig({ aduType: type as "detached" | "attached" | "garage-conversion" | "jadu" });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Choose Your ADU Type</h2>
      <p className="text-muted-foreground mb-8">
        Select the type of ADU that best fits your property and goals.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {aduTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className={`relative p-5 rounded-xl border-2 text-left transition-all ${
              config.aduType === type.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {type.recommended && (
              <span className="absolute top-2 right-2 text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full">
                Recommended
              </span>
            )}
            
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
              config.aduType === type.id ? "bg-primary text-white" : "bg-muted text-secondary"
            }`}>
              <type.icon className="h-6 w-6" />
            </div>
            
            <h3 className="font-semibold text-secondary mb-1">{type.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
            
            <ul className="space-y-1">
              {type.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className={`h-3 w-3 ${config.aduType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-muted rounded-xl p-4 flex gap-3 mb-8">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-secondary mb-1">Not sure which type is right for you?</p>
          <p className="text-muted-foreground">
            California allows most properties to build at least one ADU. Our team will help you 
            determine the best option during your free consultation.
          </p>
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
