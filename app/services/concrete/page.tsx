import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle, Ruler, Award, Layers } from "lucide-react";
import { ConcreteCalculatorInline } from "@/components/calculators/concrete-calculator-inline";
import { RETAINING_WALL_BASE_PRICE_PER_LF, formatRate } from "@/components/calculators/pricing";

export const metadata: Metadata = {
  title: "Concrete Services",
};

const concreteServices = [
  {
    title: "Driveways & Walkways",
    description: "Durable, professionally finished concrete driveways and walkways. Broom finish, stamped, or exposed aggregate options.",
    price: "Starting at $17.50/sq ft",
  },
  {
    title: "Patios & Pool Decks",
    description: "Custom concrete patios and pool surrounds with decorative finishes. Built for San Diego outdoor living.",
    price: "Starting at $22/sq ft",
  },
  {
    title: "Retaining Walls",
    description: "Engineered retaining walls for hillside properties, terracing, and landscape support. Block or poured concrete.",
    price: `Starting at ${formatRate(RETAINING_WALL_BASE_PRICE_PER_LF)}/linear ft`,
  },
  {
    title: "Foundations & Slabs",
    description: "Structural foundations for ADUs, additions, and new construction. Properly reinforced and inspected.",
    price: "Custom Pricing",
  },
];

const features = [
  {
    icon: Ruler,
    title: "Precision Work",
    description: "Properly graded, formed, and finished for long-lasting results and proper drainage.",
  },
  {
    icon: Shield,
    title: "Reinforced Construction",
    description: "Rebar and wire mesh reinforcement standard on all structural pours for maximum durability.",
  },
  {
    icon: Award,
    title: "Premium Finishes",
    description: "Broom finish, stamped patterns, exposed aggregate, and colored concrete options available.",
  },
  {
    icon: Layers,
    title: "Full Service",
    description: "From excavation and grading to forming, pouring, finishing, and sealing. Complete turnkey service.",
  },
];

const includes = [
  "Site preparation and excavation",
  "Proper grading and compaction",
  "Forming and rebar/wire mesh reinforcement",
  "Concrete pour with proper mix design",
  "Professional finishing (your choice of style)",
  "Control joints for crack prevention",
  "Curing compound application",
  "Complete site cleanup",
];

export default function ConcretePage() {
  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              CONCRETE SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Professional Concrete Work
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Driveways, patios, retaining walls, and foundations — built to last with quality materials
              and expert craftsmanship. Serving San Diego homeowners with transparent pricing.
            </p>
            <p className="text-2xl font-bold text-accent">Starting at $17.50/sq ft</p>
          </div>
        </div>
      </section>

      <ConcreteCalculatorInline />

      <section className="py-20 bg-secondary border-t border-white/10 text-white bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Concrete Services</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              From flatwork to structural foundations, we handle all types of residential concrete projects.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {concreteServices.map((service) => (
              <Card key={service.title} className="h-full flex flex-col overflow-hidden bg-secondary-light text-white border-white/10 shadow-lg shadow-black/20 hover:border-accent/50 transition-colors">
                <CardContent className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                  <p className="text-white/80 mb-4">{service.description}</p>
                  <p className="text-lg font-bold text-accent-light mt-auto">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary border-t border-white/10 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Homeowners Choose Us for Concrete</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full bg-secondary-light text-white border-white/10 shadow-lg shadow-black/20 hover:border-accent/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/75">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary border-t border-white/10 text-white bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary border-t border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Concrete Project?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            From driveways and patios to retaining walls and foundations, get a free, no-obligation quote.
          </p>
          <Button asChild size="lg" rounded="full">
            <Link href="/contact">
              Schedule On-Site Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
