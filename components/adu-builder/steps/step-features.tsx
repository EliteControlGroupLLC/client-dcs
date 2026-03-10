"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Plus } from "lucide-react";
import { ADU_FEATURES } from "@/lib/types/adu";
import { formatCurrency } from "@/lib/utils";

export function StepFeatures() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const toggleFeature = (featureId: string) => {
    const feature = ADU_FEATURES.find((f) => f.id === featureId);
    if (feature?.included) return; // Can't toggle included features

    const currentFeatures = config.features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter((f) => f !== featureId)
      : [...currentFeatures, featureId];
    
    updateConfig({ features: newFeatures });
  };

  const isSelected = (featureId: string) => {
    return config.features?.includes(featureId) || false;
  };

  const includedFeatures = ADU_FEATURES.filter((f) => f.included);
  const optionalFeatures = ADU_FEATURES.filter((f) => !f.included);

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Select Features</h2>
      <p className="text-muted-foreground mb-8">
        All essentials are included. Add optional features to customize your ADU.
      </p>

      {/* Included features */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          Included in Every ADU
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {includedFeatures.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-medium text-secondary">{feature.label}</span>
                <span className="block text-xs text-primary">Included</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional features */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          Optional Add-Ons
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {optionalFeatures.map((feature) => (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                isSelected(feature.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isSelected(feature.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {isSelected(feature.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-secondary block">{feature.label}</span>
                <span className="text-sm text-primary font-medium">+{formatCurrency(feature.price)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected features summary */}
      {optionalFeatures.some((f) => isSelected(f.id)) && (
        <div className="bg-muted rounded-xl p-4 mb-8">
          <h4 className="font-medium text-secondary mb-2">Selected Add-Ons</h4>
          <div className="space-y-1">
            {optionalFeatures
              .filter((f) => isSelected(f.id))
              .map((feature) => (
                <div key={feature.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{feature.label}</span>
                  <span className="font-medium text-secondary">+{formatCurrency(feature.price)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

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
