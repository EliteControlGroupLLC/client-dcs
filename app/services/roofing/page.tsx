import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle, Clock, Award, Layers } from "lucide-react";
import { CostCtaSection } from "@/components/calculators/cost-cta-section";

const roofTypes = [
  {
    title: "30-Year Composition Shingle",
    description: "Industry-standard asphalt shingles with excellent value and reliable weather protection for San Diego homes.",
    price: "$852 / roofing square",
  },
  {
    title: "50-Year Composition Shingle",
    description: "Premium architectural shingles with enhanced durability, longer warranty, and superior curb appeal.",
    price: "$1,100 / roofing square",
  },
  {
    title: "Concrete & Clay Tile",
    description: "Classic Southern California tile roofing. Exceptional durability, fire resistance, and timeless aesthetic.",
    price: "$1,400 / roofing square",
  },
  {
    title: "Standing Seam Metal",
    description: "Modern metal roofing with clean lines, superior longevity, and excellent energy efficiency.",
    price: "$1,800 / roofing square",
  },
];

const features = [
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully licensed roofing contractor with comprehensive insurance and manufacturer certifications.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most residential roofs completed in 3-5 days. Emergency repairs within 24-48 hours.",
  },
  {
    icon: Award,
    title: "Warranty Protection",
    description: "Manufacturer warranties up to 50 years plus our workmanship guarantee for peace of mind.",
  },
  {
    icon: Layers,
    title: "Complete Service",
    description: "From inspection and tear-off to underlayment, flashing, and final cleanup. Nothing left undone.",
  },
];

const includes = [
  "Full roof inspection and assessment",
  "Old roof tear-off and disposal",
  "Ice & water shield underlayment",
  "New flashing at all penetrations",
  "Ridge vents and proper ventilation",
  "Drip edge and gutter apron",
  "Complete site cleanup and haul-away",
  "Final inspection and warranty documentation",
];

export default function RoofingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              ROOFING SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Roofing Solutions
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Complete roof replacement, repairs, and new installations for San Diego homes.
              From composition shingles to tile and metal — quality materials and expert installation.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $8,500</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                  Get a Free Estimate <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/tools/roof-calculator">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Roof Price Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Roofing Materials</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We install all major roofing materials. Every option includes professional installation, cleanup, and warranty.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {roofTypes.map((type) => (
              <Card key={type.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-secondary mb-2">{type.title}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <p className="text-lg font-bold text-primary">{type.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Choose DCS for Roofing?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-secondary mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CostCtaSection
        calculatorHref="/tools/roof-calculator"
        calculatorLabel="Open Roof Calculator"
      />

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a New Roof?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Get a free roof inspection and honest estimate. No pressure, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Schedule Free Inspection <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/tools/roof-calculator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Estimate Your Roof Cost
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
