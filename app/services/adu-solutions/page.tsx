import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  DetachedADUFloorPlan,
  AttachedADUFloorPlan,
  GarageConversionFloorPlan,
  FloorPlanLegend,
} from "@/components/floor-plans";
import { SERVICE_PRICING } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "ADU Solutions",
};

const floorPlanComponents = [
  DetachedADUFloorPlan,
  AttachedADUFloorPlan,
  GarageConversionFloorPlan,
];

const aduTypes = [
  {
    title: "Detached ADU",
    description: "A standalone backyard home designed for privacy, better resale positioning, and the widest range of premium floor-plan options.",
    sqFt: "400-1,200 sq ft",
    timeline: "10-14 months",
    features: ["Strongest plan flexibility", "Best fit for premium rentals", "Private detached living"],
  },
  {
    title: "Attached ADU",
    description: "Built as an addition to the main residence for lots where a detached structure is less efficient or a connected family suite makes more sense.",
    sqFt: "500+ sq ft",
    timeline: "9-12 months",
    features: ["Efficient utility tie-ins", "Clean integration with the existing home", "Strong option for tighter lots"],
  },
  {
    title: "Garage Conversion",
    description: "Transform an existing 2-car or 3-car garage shell into a code-compliant living space with a faster delivery path and lower entry price.",
    sqFt: "400 sq ft",
    timeline: "6-8 months",
    features: ["Best lower-cost entry point", "Uses existing structure efficiently", "Strong studio or compact one-bed potential"],
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Rental Income",
    description: "Typical TruthCore ADU products can support roughly $2,000 – $6,000/month depending on size and layout",
  },
  {
    icon: Home,
    title: "Property Value",
    description: "Add usable square footage and create a more valuable long-term real estate asset",
  },
  {
    icon: Users,
    title: "Multi-Gen Living",
    description: "Create independent living space for family without leaving the property",
  },
  {
    icon: Shield,
    title: "Financial Security",
    description: "Add an income-producing or family-supporting asset on land you already own",
  },
];

const process = [
  { step: 1, title: "Design Your ADU and Get Pricing", description: "Use our online tools to explore ADU options for your property. Choose your type, layout, and style to see realistic pricing." },
  { step: 2, title: "Funding and Pre-Approval Guidance", description: "We help review funding options and confirm your project budget so the project is financially ready to move forward." },
  { step: 3, title: "Plans, Engineering, and Permits", description: "Our team prepares architectural plans, coordinates engineering, and manages the full permitting process with the city." },
  { step: 4, title: "Construction and Project Management", description: "Our construction team builds your ADU with organized scheduling, quality oversight, and clear progress updates." },
  { step: 5, title: "Final Walkthrough and Delivery", description: "We walk through the completed ADU with you, address final details, and hand over the keys." },
];

export default function ADUSolutionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              ADU SOLUTIONS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              ADU Solutions in San Diego
            </h1>
            <p className="text-xl text-white/80 mb-8">
              We design and build detached ADUs, attached ADUs, and garage conversions for homeowners
              who want better use of their lot, stronger rental performance, or flexible family living.
            </p>
            <p className="text-2xl font-bold text-accent mb-8">
              Starting at {SERVICE_PRICING.adu.startingPrice}
            </p>
            <Button asChild size="lg" rounded="full">
              <Link href="/build-your-adu">
                Open ADU Calculator <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ADU Types */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Types of ADUs We Build
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every property is different. We help you choose the product that fits the lot, budget, permit path, and long-term use case.
            </p>
          </div>

          <FloorPlanLegend className="mb-8" />

          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {aduTypes.map((type, index) => {
              const FloorPlan = floorPlanComponents[index];
              return (
              <Card key={type.title} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex flex-col overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
                  <FloorPlan className="w-full max-w-[380px] h-auto" />
                </div>
                <CardContent className="p-8 flex-1">
                  <h3 className="text-xl font-semibold text-secondary mb-2">{type.title}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <div className="flex gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-primary" />
                      {type.sqFt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      {type.timeline}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Why Build an ADU?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-secondary mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Our ADU Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From first conversation to move-in day, here is how we bring your ADU to life.
            </p>
          </div>

          {/* 5 steps: 2 per row on small tablets, 3 + 2 on tablets, one row of 5 on desktop — odd rows stay centered */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 max-w-6xl mx-auto">
            {process.map((item) => (
              <div key={item.step} className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)] text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2 text-balance">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your ADU?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to explore your options. We&apos;ll assess your property and provide a detailed estimate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full">
              <Link href="/build-your-adu">
                Design Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
