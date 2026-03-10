"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
}

interface ADUProgressProps {
  steps: Step[];
}

export function ADUProgress({ steps }: ADUProgressProps) {
  const { currentStep, goToStep } = useADU();
  
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="bg-white border-b border-border sticky top-20 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile: Simple progress */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps.find((s) => s.id === currentStep)?.title}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Desktop: Step indicators */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            
            {steps.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isClickable = step.id <= currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  className={`relative flex flex-col items-center group ${
                    isClickable ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-white border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span
                    className={`absolute -bottom-6 text-xs whitespace-nowrap transition-colors ${
                      isCurrent
                        ? "text-primary font-medium"
                        : isCompleted
                        ? "text-secondary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
