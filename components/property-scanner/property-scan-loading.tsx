"use client";

import { useState, useEffect } from "react";
import { Search, LayoutGrid, Ruler, CheckCircle2 } from "lucide-react";

const scanSteps = [
  { icon: Search, label: "Scanning property...", duration: 1500 },
  { icon: LayoutGrid, label: "Reviewing lot layout...", duration: 2000 },
  { icon: Ruler, label: "Checking setbacks, usable yard area, and ADU potential...", duration: 2500 },
  { icon: CheckCircle2, label: "Analysis complete", duration: 800 },
];

interface PropertyScanLoadingProps {
  address: string;
  onComplete: () => void;
}

export function PropertyScanLoading({ address, onComplete }: PropertyScanLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let totalElapsed = 0;
    const totalDuration = scanSteps.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      totalElapsed += 50;
      setProgress(Math.min((totalElapsed / totalDuration) * 100, 100));

      let elapsed = 0;
      for (let i = 0; i < scanSteps.length; i++) {
        elapsed += scanSteps[i].duration;
        if (totalElapsed < elapsed) {
          setCurrentStep(i);
          break;
        }
        if (i === scanSteps.length - 1) {
          setCurrentStep(scanSteps.length - 1);
        }
      }

      if (totalElapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Scanner animation */}
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
        <div className="absolute inset-4 rounded-full bg-primary/5 flex items-center justify-center">
          {(() => {
            const step = scanSteps[currentStep];
            if (!step) return null;
            const Icon = step.icon;
            return <Icon className="h-10 w-10 text-primary" />;
          })()}
        </div>
      </div>

      {/* Address being scanned */}
      <p className="text-sm text-muted-foreground mb-2">Analyzing</p>
      <p className="text-lg font-semibold text-secondary mb-8">{address}</p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 w-full max-w-md">
        {scanSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-primary/5 border border-primary/20"
                  : isComplete
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              <StepIcon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-primary" : isComplete ? "text-success" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-secondary" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {isComplete && (
                <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
