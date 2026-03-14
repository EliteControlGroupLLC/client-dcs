"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Palette, Check } from "lucide-react";

const styles = [
  { id: "modern", label: "Modern", description: "Clean lines, flat roofs, large windows, minimalist palette" },
  { id: "contemporary", label: "Contemporary", description: "Current trends, mixed materials, open layouts" },
  { id: "minimal", label: "Minimal", description: "Simple forms, neutral tones, functional beauty" },
  { id: "warm-modern", label: "Warm Modern", description: "Modern structure with warm wood tones and natural textures" },
  { id: "spanish", label: "Spanish-Inspired", description: "Stucco, tile roof accents, arched details, terracotta warmth" },
  { id: "coastal", label: "Clean Coastal", description: "Light tones, natural materials, breezy and relaxed" },
];

const roofStyles = [
  { id: "flat", label: "Flat / Low Slope" },
  { id: "gable", label: "Gable" },
  { id: "hip", label: "Hip" },
  { id: "shed", label: "Shed / Single Slope" },
];

const exteriorMaterials = [
  { id: "stucco", label: "Smooth Stucco" },
  { id: "wood", label: "Wood / Wood-Look Siding" },
  { id: "mixed", label: "Mixed (Stucco + Wood)" },
  { id: "metal", label: "Metal Panel Accents" },
  { id: "stone", label: "Stone Veneer" },
];

const windowStyles = [
  { id: "large", label: "Large Floor-to-Ceiling" },
  { id: "standard", label: "Standard Sized" },
  { id: "clerestory", label: "Clerestory / High Windows" },
  { id: "corner", label: "Corner Windows" },
];

const kitchenMoods = [
  { id: "bright", label: "Bright & Clean" },
  { id: "warm", label: "Warm & Natural" },
  { id: "bold", label: "Bold & Dramatic" },
  { id: "minimal-k", label: "Minimal & Sleek" },
];

const bathroomMoods = [
  { id: "spa", label: "Spa-Like Retreat" },
  { id: "modern-b", label: "Modern & Crisp" },
  { id: "warm-b", label: "Warm & Earthy" },
  { id: "classic", label: "Clean Classic" },
];

const finishLevels = [
  { id: "standard", label: "Standard", description: "Quality materials, clean execution" },
  { id: "premium", label: "Premium", description: "Upgraded selections, designer touches" },
  { id: "luxury", label: "Luxury", description: "High-end finishes, custom details" },
];

type SelectionState = {
  style: string | null;
  roof: string | null;
  exterior: string | null;
  windows: string | null;
  kitchen: string | null;
  bathroom: string | null;
  finish: string | null;
};

export default function ADUDesignInspirationPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<SelectionState>({
    style: null, roof: null, exterior: null, windows: null,
    kitchen: null, bathroom: null, finish: null,
  });

  const select = (key: keyof SelectionState, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      title: "Choose Your Style",
      subtitle: "What overall aesthetic speaks to you?",
      key: "style" as const,
      options: styles,
    },
    {
      title: "Roof Style",
      subtitle: "Select a roof direction",
      key: "roof" as const,
      options: roofStyles,
    },
    {
      title: "Exterior Material",
      subtitle: "Choose your exterior look",
      key: "exterior" as const,
      options: exteriorMaterials,
    },
    {
      title: "Window Style",
      subtitle: "How should natural light flow in?",
      key: "windows" as const,
      options: windowStyles,
    },
    {
      title: "Kitchen Mood",
      subtitle: "What feeling do you want in the kitchen?",
      key: "kitchen" as const,
      options: kitchenMoods,
    },
    {
      title: "Bathroom Mood",
      subtitle: "What feeling do you want in the bathroom?",
      key: "bathroom" as const,
      options: bathroomMoods,
    },
    {
      title: "Finish Level",
      subtitle: "How refined should the finishes be?",
      key: "finish" as const,
      options: finishLevels,
    },
  ];

  const currentStep = steps[step];
  const isComplete = step >= steps.length;
  const completedCount = Object.values(selections).filter(Boolean).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const getLabel = (key: keyof SelectionState) => {
    const val = selections[key];
    if (!val) return null;
    const stepDef = steps.find((s) => s.key === key);
    const opt = stepDef?.options.find((o) => o.id === val);
    return opt?.label ?? val;
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              DESIGN INSPIRATION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Design Inspiration Builder
            </h1>
            <p className="text-xl text-white/80">
              Explore the look and feel you want for your ADU. Select your preferences and
              we&apos;ll build your style profile with recommended aesthetics and layouts.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {Math.min(step + 1, steps.length)} of {steps.length}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!isComplete ? (
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-2">{currentStep.title}</h2>
              <p className="text-muted-foreground mb-8">{currentStep.subtitle}</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => select(currentStep.key, opt.id)}
                    className={`text-left px-5 py-4 rounded-xl border-2 transition-all ${
                      selections[currentStep.key] === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/30"
                    }`}
                  >
                    <span className="font-semibold text-secondary block">{opt.label}</span>
                    {"description" in opt && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {(opt as { description?: string }).description}
                      </span>
                    )}
                    {selections[currentStep.key] === opt.id && (
                      <Check className="h-4 w-4 text-primary mt-2" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!selections[currentStep.key]}
                  className="bg-primary hover:bg-primary-dark text-secondary font-semibold"
                >
                  {step === steps.length - 1 ? "See My Style Profile" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              <div className="text-center mb-10">
                <Palette className="h-14 w-14 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-secondary mb-2">Your ADU Style Profile</h2>
                <p className="text-muted-foreground">Based on your selections, here&apos;s your personalized design direction.</p>
              </div>

              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Style</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("style")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Roof Style</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("roof")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Exterior Material</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("exterior")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Window Style</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("windows")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kitchen Mood</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("kitchen")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bathroom Mood</p>
                      <p className="font-bold text-secondary text-lg">{getLabel("bathroom")}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Finish Level</p>
                    <p className="font-bold text-primary text-lg">{getLabel("finish")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary text-white mb-8">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-3">Ready to Bring This Vision to Life?</h3>
                  <p className="text-white/70 mb-6">
                    Share your style profile with our design team and let&apos;s start planning your ADU.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/build-your-adu">
                      <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                        Start Building Your ADU <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outlineWhite">
                        Schedule Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <button
                onClick={() => { setStep(0); setSelections({ style: null, roof: null, exterior: null, windows: null, kitchen: null, bathroom: null, finish: null }); }}
                className="text-primary text-sm font-semibold hover:underline mx-auto block"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
