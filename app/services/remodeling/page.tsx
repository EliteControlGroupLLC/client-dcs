import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, Bath, ChefHat, Paintbrush, CheckCircle } from "lucide-react";
import { CostCtaSection } from "@/components/calculators/cost-cta-section";

const remodelTypes = [
  {
    icon: ChefHat,
    title: "Kitchen Remodeling",
    description: "Transform your kitchen with modern layouts, premium countertops, custom cabinetry, and updated appliances.",
    starting: "$18,000",
    href: "/services/kitchen",
  },
  {
    icon: Bath,
    title: "Bathroom Renovation",
    description: "Upgrade your bathroom with new tile, fixtures, vanities, and modern design for comfort and style.",
    starting: "$12,000",
    href: "/services/bathroom",
  },
  {
    icon: Home,
    title: "Whole Home Remodel",
    description: "Complete home transformation from layout changes to finishes. Open floor plans, updated systems, and modern design.",
    starting: "$50,000",
    href: "/contact",
  },
  {
    icon: Paintbrush,
    title: "Interior Updates",
    description: "Flooring, painting, lighting, and finish upgrades to refresh your living spaces.",
    starting: "$8,000",
    href: "/contact",
  },
];

export default function RemodelingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              REMODELING SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Home
            </h1>
            <p className="text-xl text-white/80 mb-8">
              From kitchens and bathrooms to whole-home renovations, we deliver quality remodeling
              with transparent pricing and professional project management.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $18,000</p>
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Get a Free Quote <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Remodeling Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We handle every type of residential remodel with the same attention to detail and quality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {remodelTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2">{type.title}</h3>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <p className="text-lg font-bold text-primary mb-4">Starting at {type.starting}</p>
                    <Link href={type.href}>
                      <Button variant="outline" className="group">
                        Learn More <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <CostCtaSection
        calculatorHref="/planning-tools"
        calculatorLabel="Open Project Calculator"
      />

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Remodel?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Tell us about your project and get a free, no-obligation quote.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Get Free Quote <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
