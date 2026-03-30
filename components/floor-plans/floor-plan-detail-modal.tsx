"use client";

import { useState } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FloorPlanLayout } from "./floor-plan-layout";
import type { FloorPlan } from "@/lib/data/site-data";

// Exterior image mapping
const EXTERIOR_IMAGES: Record<string, string> = {
  "garage-conversion": "/images/floor-plans/garage-conversion-exterior.jpg",
  "compact-detached": "/images/floor-plans/compact-detached-exterior.jpg",
  "efficient-one": "/images/floor-plans/efficient-one-exterior.jpg",
  "cozy-cottage": "/images/floor-plans/cozy-cottage-exterior.jpg",
  "urban-loft": "/images/floor-plans/urban-loft-exterior.jpg",
  "family-suite": "/images/floor-plans/family-suite-exterior.jpg",
  "deluxe-two": "/images/floor-plans/deluxe-two-exterior.jpg",
  "compact-three": "/images/floor-plans/compact-three-exterior.jpg",
  "grand-retreat": "/images/floor-plans/grand-retreat-exterior.jpg",
  "luxury-suite": "/images/floor-plans/luxury-suite-exterior.jpg",
  "modern-four": "/images/floor-plans/modern-four-exterior.jpg",
};

// Plan descriptions
const PLAN_DESCRIPTIONS: Record<string, string> = {
  "garage-conversion": "Transform your existing 2-car garage into a fully functional living space. This 400 sq ft studio layout maximizes every inch with an open living/bedroom area, efficient galley kitchen, full bathroom, and stackable washer/dryer. Perfect for rental income or multigenerational living.",
  "compact-detached": "A standalone 400 sq ft detached ADU with a thoughtful layout that separates living and sleeping areas. Features a full kitchen, bathroom, closet, and in-unit laundry. Ideal for guests, aging parents, or rental income.",
  "efficient-one": "This 500 sq ft attached ADU offers the comfort of a true 1-bedroom with dedicated living, dining, and sleeping areas. The efficient layout includes a full kitchen, bathroom, and laundry closet—all connected seamlessly to your main home.",
  "cozy-cottage": "A charming 600 sq ft craftsman-style ADU with distinct living and bedroom zones. Features a spacious walk-in closet, private patio access, full kitchen with dining area, and in-unit laundry. Perfect for comfortable independent living.",
  "urban-loft": "This 650 sq ft modern loft-style ADU features high ceilings and an open, flexible layout that can accommodate 1-2 bedrooms. Large windows flood the space with natural light, while the contemporary design appeals to style-conscious tenants.",
  "family-suite": "A 750 sq ft 2-bedroom ADU designed for families or roommates. Each bedroom is generously sized with dedicated closet space. The open living and dining area connects to a full kitchen, with convenient in-unit laundry and bathroom.",
  "deluxe-two": "Spacious 850 sq ft 2-bedroom, 2-bathroom ADU with a primary suite featuring its own bathroom and walk-in closet. The second bedroom has easy access to the second full bath. Open-concept living, dining, and kitchen with premium finishes.",
  "compact-three": "An efficiently designed 900 sq ft ADU with 3 bedrooms and 2 bathrooms. Perfect for families or as a high-income rental property. Each bedroom is reasonably sized with the layout maximizing privacy and functionality.",
  "grand-retreat": "A luxurious 1,000 sq ft ADU with a spacious great room, primary suite with walk-in closet and en-suite bathroom, plus flexible space for 2-3 bedrooms. High-end finishes and generous proportions create a true home feel.",
  "luxury-suite": "Our premium 1,200 sq ft single-story ADU offers 3 full bedrooms, 2 bathrooms, and expansive living spaces. The primary suite is truly luxurious with a walk-in closet and private bathroom. Perfect for extended family or premium rental income.",
  "modern-four": "A two-story 1,200 sq ft ADU maximizing space with 4 bedrooms and 2 bathrooms. The first floor features living areas, kitchen, and 2 bedrooms, while the second floor adds 2 more bedrooms with a balcony. Ideal for student housing or larger families.",
};

interface FloorPlanDetailModalProps {
  plan: FloorPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function FloorPlanDetailModal({
  plan,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: FloorPlanDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"layout" | "exterior">("layout");

  if (!plan) return null;

  const exteriorImage = EXTERIOR_IMAGES[plan.id] || "/images/adu-configurator-preview.jpg";
  const description = PLAN_DESCRIPTIONS[plan.id] || `A ${plan.sqFt} sq ft ${plan.bedrooms === 0 ? "studio" : `${plan.bedrooms}-bedroom`} ADU with ${plan.bathrooms} bathroom${plan.bathrooms > 1 ? "s" : ""}.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-secondary mb-2">
                {plan.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  {plan.style}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {plan.type}
                </Badge>
                {plan.popular && (
                  <Badge className="bg-primary text-secondary text-sm">
                    Popular
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4 text-center">
              <Square className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">{plan.sqFt.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Square Feet</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">
                {plan.bedrooms === 0 ? "Studio" : plan.bedrooms}
              </p>
              <p className="text-xs text-muted-foreground">
                {plan.bedrooms === 0 ? "" : `Bedroom${plan.bedrooms > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">{plan.bathrooms}</p>
              <p className="text-xs text-muted-foreground">
                Bathroom{plan.bathrooms > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-secondary">{plan.priceRange}</p>
              <p className="text-xs text-muted-foreground">Price Range</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("layout")}
              className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition ${
                activeTab === "layout"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-secondary"
              }`}
            >
              Floor Plan Layout
            </button>
            <button
              onClick={() => setActiveTab("exterior")}
              className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition ${
                activeTab === "exterior"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-secondary"
              }`}
            >
              Exterior Concept
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Visual */}
            <div>
              {activeTab === "layout" ? (
                <FloorPlanLayout
                  planId={plan.id}
                  sqFt={plan.sqFt}
                  bedrooms={plan.bedrooms}
                  bathrooms={plan.bathrooms}
                  showLabels={true}
                  showDimensions={true}
                />
              ) : (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border">
                  <Image
                    src={exteriorImage}
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
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {description}
              </p>

              <h3 className="font-semibold text-secondary mb-3">Features Included</h3>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Full Kitchen</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>In-Unit Washer/Dryer</span>
                </li>
              </ul>

              {/* Rental Estimate */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-1 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Estimated Monthly Rent
                </h4>
                <p className="text-2xl font-bold text-green-700">
                  ${plan.rentEstimate.low.toLocaleString()} - ${plan.rentEstimate.high.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Based on San Diego market data
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <Link href="/build-your-adu" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-secondary">
                    Customize This Plan
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Talk to Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {(hasPrevious || hasNext) && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Plan
              </Button>
              <Button
                variant="outline"
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
