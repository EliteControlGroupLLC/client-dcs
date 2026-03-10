"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { ADUProgress } from "./adu-progress";
import { ADUPriceSidebar } from "./adu-price-sidebar";
import { StepWelcome } from "./steps/step-welcome";
import { StepPropertyInfo } from "./steps/step-property-info";
import { StepADUType } from "./steps/step-adu-type";
import { StepSize } from "./steps/step-size";
import { StepLayout } from "./steps/step-layout";
import { StepStyle } from "./steps/step-style";
import { StepFeatures } from "./steps/step-features";
import { StepUpgrades } from "./steps/step-upgrades";
import { StepContact } from "./steps/step-contact";

const steps = [
  { id: 1, title: "Welcome", component: StepWelcome },
  { id: 2, title: "Property Info", component: StepPropertyInfo },
  { id: 3, title: "ADU Type", component: StepADUType },
  { id: 4, title: "Size", component: StepSize },
  { id: 5, title: "Layout", component: StepLayout },
  { id: 6, title: "Style", component: StepStyle },
  { id: 7, title: "Features", component: StepFeatures },
  { id: 8, title: "Upgrades", component: StepUpgrades },
  { id: 9, title: "Get Quote", component: StepContact },
];

export function ADUBuilder() {
  const { currentStep } = useADU();
  
  const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component || StepWelcome;

  return (
    <div className="min-h-screen bg-muted pt-20">
      {/* Progress bar */}
      <ADUProgress steps={steps} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <CurrentStepComponent />
            </div>
          </div>
          
          {/* Price sidebar */}
          <div className="lg:col-span-1">
            <ADUPriceSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
