"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Calculator, Home, ChefHat, Bath, Layers, SquareStack, Sun, Wrench } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-secondary">Calculate Your Project</h2>
              <p className="text-sm text-muted-foreground">Select the type of project you&apos;d like to estimate.</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Calculator Options */}
          <div className="p-4 space-y-2">
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
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Calculator className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 text-center">
            <Link
              href="/planning-tools"
              onClick={onClose}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View All Planning Tools →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
