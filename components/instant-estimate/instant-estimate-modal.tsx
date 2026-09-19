"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, Home, ChefHat, Bath, Layers, SquareStack, Sun, Wrench } from "lucide-react";

const calculatorOptions = [
  {
    icon: Home,
    title: "ADU Cost Calculator",
    description: "Estimate your ADU project cost",
    href: "/adu-calculator",
  },
  {
    icon: ChefHat,
    title: "Kitchen Remodel Estimator",
    description: "Kitchen renovation pricing",
    href: "/tools/kitchen-calculator",
  },
  {
    icon: Bath,
    title: "Bathroom Remodel Calculator",
    description: "Bathroom renovation estimates",
    href: "/tools/bathroom-calculator",
  },
  {
    icon: Layers,
    title: "Roof Cost Estimator",
    description: "Roof replacement pricing",
    href: "/tools/roof-calculator",
  },
  {
    icon: SquareStack,
    title: "Concrete / Hardscape Estimator",
    description: "Driveways, patios, walls",
    href: "/tools/concrete-calculator",
  },
  {
    icon: Sun,
    title: "Window Replacement Calculator",
    description: "Window installation pricing",
    href: "/planning-tools",
  },
  {
    icon: Wrench,
    title: "Garage Conversion Calculator",
    description: "Garage to ADU estimates",
    href: "/tools/instant-adu-estimator",
  },
];

export function InstantEstimateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Escape closes; lock page scroll behind the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="instant-estimate-title"
          className="pointer-events-auto flex w-full max-w-lg max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in"
        >
          {/* Header */}
          <div className="shrink-0 border-b border-border px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 id="instant-estimate-title" className="text-xl font-bold text-secondary">Calculate Your Project</h2>
              <p className="text-sm text-muted-foreground">Select the type of project you&apos;d like to estimate.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 shrink-0 rounded-full bg-muted text-muted-foreground hover:bg-border hover:text-secondary flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Calculator Options — rows inset so their content lines up with the header text */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-1">
            {calculatorOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.title}
                  href={option.href}
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-6 py-2 text-center">
            <Link
              href="/planning-tools"
              onClick={onClose}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View All Planning Tools
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
