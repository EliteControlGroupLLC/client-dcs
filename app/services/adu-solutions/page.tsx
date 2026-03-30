import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Shield
} from "lucide-react";
import Link from "next/link";
import {
  DetachedADUFloorPlan,
  AttachedADUFloorPlan,
  GarageConversionFloorPlan,
  FloorPlanLegend,
} from "@/components/floor-plans";
import { SERVICE_PRICING } from "@/lib/data/site-data";

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
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ADU Solutions in San Diego
            </h1>
            <p className="text-xl text-white/80 mb-8">
              We design and build detached ADUs, attached ADUs, and garage conversions for homeowners
              who want better use of their lot, stronger rental performance, or flexible family living.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">
              Starting at {SERVICE_PRICING.adu.startingPrice}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/build-your-adu">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                  Open ADU Calculator
                </Button>
              </Link>
            </div>
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

          <div className="grid md:grid-cols-2 gap-8">
            {aduTypes.map((type, index) => {
              const FloorPlan = floorPlanComponents[index];
              return (
              <Card key={type.title} className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
                  <FloorPlan className="w-full max-w-[380px] h-auto" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-secondary mb-2">{type.title}</h3>
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

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Rental Income</h3>
              <p className="text-sm text-muted-foreground">
                Typical DCS ADU products can support roughly $2,000-$6,000/month depending on size and layout
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Property Value</h3>
              <p className="text-sm text-muted-foreground">
                Add usable square footage and create a more valuable long-term real estate asset
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Multi-Gen Living</h3>
              <p className="text-sm text-muted-foreground">
                Create independent living space for family without leaving the property
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Financial Security</h3>
              <p className="text-sm text-muted-foreground">
                Add an income-producing or family-supporting asset on land you already own
              </p>
            </div>
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

          <div className="grid md:grid-cols-5 gap-6">
            {process.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-secondary text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your ADU?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to explore your options. We&apos;ll assess your property and provide a detailed estimate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Design Your ADU
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
