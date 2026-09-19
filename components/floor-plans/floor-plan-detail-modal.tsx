"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  Bath,
  Square,
  DollarSign,
  Home,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getRentEstimate, type FloorPlan } from "@/lib/data/site-data";

interface FloorPlanDetailModalProps {
  plan: FloorPlan | null;
  isOpen: boolean;
  initialTab?: "layout" | "customize";
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function FloorPlanDetailModal({
  plan,
  isOpen,
  initialTab = "layout",
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: FloorPlanDetailModalProps) {
  // Drawn floor-plan layouts aren't published yet, so the "layout" entry point
  // opens the exterior concept instead of a placeholder panel.
  const startTab = initialTab === "customize" ? "customize" : "exterior";
  const [activeTab, setActiveTab] = useState<"exterior" | "customize">(startTab);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

  useEffect(() => {
    setActiveTab(startTab);
  }, [startTab, plan?.id]);

  useEffect(() => {
    setSelectedVariationIndex(0);
  }, [plan?.id]);

  const selectedVariation = useMemo(() => {
    if (!plan) return null;
    return plan.supportedVariations[selectedVariationIndex] ?? plan.supportedVariations[0] ?? null;
  }, [plan, selectedVariationIndex]);

  const selectedRent = useMemo(
    () => {
      if (!plan || !selectedVariation) {
        return { low: 0, high: 0 };
      }

      return getRentEstimate(plan.sqFt, plan.type, selectedVariation.bedrooms, {
        stories: selectedVariation.stories,
        garageStalls: plan.id === "garage-conversion" && selectedVariation.bedrooms > 0 ? 3 : 2,
      });
    },
    [plan, selectedVariation]
  );

  if (!plan || !selectedVariation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl">
        <DialogHeader className="min-w-0 p-6 pb-0 text-left">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-secondary mb-3 pr-8">
                {plan.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm text-secondary">
                  {plan.style}
                </Badge>
                <Badge variant="outline" className="text-sm text-secondary">
                  {plan.type}
                </Badge>
                {plan.popular && (
                  <Badge className="bg-primary text-white text-sm">
                    Popular
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-w-0 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Square className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">{plan.sqFt.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Square Feet</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">
                {(selectedVariation?.bedrooms ?? plan.bedrooms) === 0 ? "Studio" : selectedVariation?.bedrooms ?? plan.bedrooms}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedVariation?.bedrooms ?? plan.bedrooms) === 0 ? "Bedroom count" : `Bedroom${(selectedVariation?.bedrooms ?? plan.bedrooms) > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">{selectedVariation?.bathrooms ?? plan.bathrooms}</p>
              <p className="text-xs text-muted-foreground">
                Bathroom{(selectedVariation?.bathrooms ?? plan.bathrooms) > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-base md:text-lg font-bold text-secondary">
                ${selectedVariation.priceLow.toLocaleString()}&nbsp;&ndash;<wbr /> ${selectedVariation.priceHigh.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Price Range</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("exterior")}
              className={`px-2 sm:px-4 py-2 min-h-11 leading-tight font-medium text-sm border-b-2 -mb-px transition ${
                activeTab === "exterior"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-secondary"
              }`}
            >
              Exterior Concept
            </button>
            <button
              onClick={() => setActiveTab("customize")}
              className={`px-2 sm:px-4 py-2 min-h-11 leading-tight font-medium text-sm border-b-2 -mb-px transition ${
                activeTab === "customize"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-secondary"
              }`}
            >
              Customize
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-2 gap-6 [&>*]:min-w-0">
            {/* Visual */}
            <div>
              {activeTab === "customize" ? (
                <div className="space-y-3">
                  {plan.supportedVariations.map((variation, index) => {
                    const active = index === selectedVariationIndex;
                    return (
                      <button
                        key={variation.label}
                        type="button"
                        onClick={() => setSelectedVariationIndex(index)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-secondary">{variation.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{variation.description}</p>
                          </div>
                          {active ? <Badge className="bg-primary text-white">Selected</Badge> : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-secondary/5 px-3 py-1">{variation.bedrooms === 0 ? "Studio" : `${variation.bedrooms} bed`}</span>
                          <span className="rounded-full bg-secondary/5 px-3 py-1">{variation.bathrooms} bath</span>
                          <span className="rounded-full bg-secondary/5 px-3 py-1">{variation.stories} {variation.stories === 1 ? "story" : "stories"}</span>
                          <span className="rounded-full bg-secondary/5 px-3 py-1">${variation.priceLow.toLocaleString()}&nbsp;&ndash; ${variation.priceHigh.toLocaleString()}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
                  <Image
                    src={plan.exteriorImage}
                    alt={`${plan.name} exterior concept`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Description and Features */}
            <div>
              <h3 className="font-semibold text-secondary mb-3">About This Plan</h3>
              <p className="text-sm font-medium text-primary mb-2">{plan.summary}</p>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {plan.description}
              </p>

              <div className="mb-6 rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Practical dimensions
                </p>
                <p className="font-semibold text-secondary">{plan.dimensions.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Final room shapes can adjust based on the selected configuration and lot conditions.
                </p>
              </div>

              <h3 className="font-semibold text-secondary mb-3">Features Included</h3>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-secondary">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Rental Estimate */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
                <h4 className="font-semibold text-secondary mb-1 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Estimated Monthly Rent
                </h4>
                <p className="text-2xl font-bold text-primary">
                  ${selectedRent.low.toLocaleString()}&nbsp;&ndash; ${selectedRent.high.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on the selected plan configuration and current TruthCore planning assumptions
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/build-your-adu?plan=${plan.id}&bedrooms=${selectedVariation.bedrooms}&bathrooms=${selectedVariation.bathrooms}&stories=${selectedVariation.stories}`}
                  className="flex-1"
                >
                  <Button rounded="full" className="w-full">
                    Use This Configuration
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" rounded="full" className="w-full">
                    Talk to an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {(hasPrevious || hasNext) && (
            <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                rounded="full"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Plan
              </Button>
              <Button
                variant="outline"
                rounded="full"
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-2"
              >
                Next Plan
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FloorPlanDetailModal;
