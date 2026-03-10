"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Home, 
  TrendingUp, 
  DollarSign, 
  Ruler, 
  Hammer,
  UtensilsCrossed,
  Bath,
  ArrowLeft
} from "lucide-react";
import { ADUPriceCalculator } from "@/components/calculators/adu-price-calculator";
import { RentalIncomeCalculator } from "@/components/calculators/rental-income-calculator";
import { ROICalculator } from "@/components/calculators/roi-calculator";
import { SizeCompareCalculator } from "@/components/calculators/size-compare-calculator";
import { RoofCalculator } from "@/components/calculators/roof-calculator";
import { ConcreteCalculator } from "@/components/calculators/concrete-calculator";
import { KitchenCalculator } from "@/components/calculators/kitchen-calculator";
import { BathroomCalculator } from "@/components/calculators/bathroom-calculator";

type CalculatorType = 
  | "menu" 
  | "adu-price" 
  | "rental-income" 
  | "roi" 
  | "size-compare" 
  | "roof" 
  | "concrete" 
  | "kitchen" 
  | "bathroom";

const calculators = [
  {
    id: "adu-price" as const,
    title: "ADU Price Estimator",
    description: "Get an instant estimate for your ADU project based on size, type, and finishes",
    icon: Home,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "rental-income" as const,
    title: "Rental Income Calculator",
    description: "Calculate potential monthly rental income based on San Diego market rates",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "roi" as const,
    title: "ROI Calculator",
    description: "See your return on investment timeline and property value increase",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "size-compare" as const,
    title: "ADU Size Comparison",
    description: "Compare different ADU sizes to find the perfect fit for your property",
    icon: Ruler,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "roof" as const,
    title: "Roof Cost Calculator",
    description: "Estimate roofing costs based on area, material, and complexity",
    icon: Hammer,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "concrete" as const,
    title: "Concrete Calculator",
    description: "Calculate concrete needs for foundations, driveways, and patios",
    icon: Calculator,
    color: "bg-slate-100 text-slate-600",
  },
  {
    id: "kitchen" as const,
    title: "Kitchen Remodel Calculator",
    description: "Estimate your kitchen remodel costs by room size and finish level",
    icon: UtensilsCrossed,
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "bathroom" as const,
    title: "Bathroom Remodel Calculator",
    description: "Get cost estimates for bathroom renovations of any scope",
    icon: Bath,
    color: "bg-cyan-100 text-cyan-600",
  },
];

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("menu");

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "adu-price":
        return <ADUPriceCalculator />;
      case "rental-income":
        return <RentalIncomeCalculator />;
      case "roi":
        return <ROICalculator />;
      case "size-compare":
        return <SizeCompareCalculator />;
      case "roof":
        return <RoofCalculator />;
      case "concrete":
        return <ConcreteCalculator />;
      case "kitchen":
        return <KitchenCalculator />;
      case "bathroom":
        return <BathroomCalculator />;
      default:
        return null;
    }
  };

  if (activeCalculator !== "menu") {
    return (
      <div className="min-h-screen bg-muted py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => setActiveCalculator("menu")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Calculators
          </Button>
          {renderCalculator()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Smart Construction Calculators
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Use our free tools to estimate costs, calculate ROI, and plan your next project with confidence.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Card 
                key={calc.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0"
                onClick={() => setActiveCalculator(calc.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${calc.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg text-secondary">{calc.title}</CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open Calculator
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Need a Detailed Estimate?
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            Our calculators provide rough estimates. For an accurate quote tailored to your specific project, schedule a free consultation with our experts.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
            Get Free Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
