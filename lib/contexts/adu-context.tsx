"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ADUConfiguration, calculateADUPrice } from "@/lib/types/adu";

interface ADUContextType {
  config: Partial<ADUConfiguration>;
  currentStep: number;
  totalSteps: number;
  updateConfig: (updates: Partial<ADUConfiguration>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetConfig: () => void;
  pricing: { base: number; upgrades: number; total: number };
}

const defaultConfig: Partial<ADUConfiguration> = {
  propertyType: "single-family",
  existingStructure: true,
  aduType: "detached",
  size: "1-bed",
  sqft: 600,
  bedrooms: 1,
  bathrooms: 1,
  layout: "open",
  style: "modern",
  exteriorFinish: "stucco",
  roofStyle: "flat",
  features: ["kitchen-full", "bathroom-full", "washer-dryer", "hvac"],
  upgrades: [],
  timeline: "3-months",
};

const ADUContext = createContext<ADUContextType | undefined>(undefined);

export function ADUProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Partial<ADUConfiguration>>(defaultConfig);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  const updateConfig = useCallback((updates: Partial<ADUConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
  }, [totalSteps]);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    setCurrentStep(1);
  }, []);

  const pricing = calculateADUPrice(config);

  return (
    <ADUContext.Provider
      value={{
        config,
        currentStep,
        totalSteps,
        updateConfig,
        nextStep,
        prevStep,
        goToStep,
        resetConfig,
        pricing,
      }}
    >
      {children}
    </ADUContext.Provider>
  );
}

export function useADU() {
  const context = useContext(ADUContext);
  if (context === undefined) {
    throw new Error("useADU must be used within an ADUProvider");
  }
  return context;
}
