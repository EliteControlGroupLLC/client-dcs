"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Home, Building2, TreePine, MapPin } from "lucide-react";

const propertyTypes = [
  {
    id: "single-family",
    icon: Home,
    title: "Single Family",
    description: "Detached home with private yard",
  },
  {
    id: "multi-family",
    icon: Building2,
    title: "Multi-Family",
    description: "Duplex, triplex, or larger",
  },
  {
    id: "vacant-lot",
    icon: TreePine,
    title: "Vacant Lot",
    description: "Empty lot ready to build",
  },
];

export function StepPropertyInfo() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const handlePropertyTypeSelect = (type: string) => {
    updateConfig({ propertyType: type as "single-family" | "multi-family" | "vacant-lot" });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Tell Us About Your Property</h2>
      <p className="text-muted-foreground mb-8">
        This helps us determine what ADU options are available for your specific situation.
      </p>

      {/* Address input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-2">
          Property Address (Optional)
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your property address"
            value={config.address || ""}
            onChange={(e) => updateConfig({ address: e.target.value })}
            className="pl-12"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          We'll use this to check zoning requirements and provide accurate estimates.
        </p>
      </div>

      {/* Property type selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-4">
          What type of property do you have?
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handlePropertyTypeSelect(type.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                config.propertyType === type.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                config.propertyType === type.id ? "bg-primary text-white" : "bg-muted text-secondary"
              }`}>
                <type.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-secondary">{type.title}</h3>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lot size */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-2">
          Approximate Lot Size (sq ft)
        </label>
        <Input
          type="number"
          placeholder="e.g., 7500"
          value={config.lotSize || ""}
          onChange={(e) => updateConfig({ lotSize: parseInt(e.target.value) || undefined })}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Don't know? No problem! We can help determine this later.
        </p>
      </div>

      {/* Existing structure */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary mb-4">
          Do you have an existing structure on the property?
        </label>
        <div className="flex gap-4">
          {[
            { value: true, label: "Yes, I have a home" },
            { value: false, label: "No, it's vacant" },
          ].map((option) => (
            <button
              key={String(option.value)}
              onClick={() => updateConfig({ existingStructure: option.value })}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                config.existingStructure === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-secondary hover:border-primary/50"
              }`}
            >
              {option.label}
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
