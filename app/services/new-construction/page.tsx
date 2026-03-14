import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, Shield, Users, CheckCircle, Ruler, Lightbulb } from "lucide-react";
import { CostCtaSection } from "@/components/calculators/cost-cta-section";

const features = [
  {
    icon: Ruler,
    title: "Custom Design",
    description: "Every home is designed from scratch to match your vision, lifestyle, and budget.",
  },
  {
    icon: Shield,
    title: "Quality Construction",
    description: "Built to the highest standards using premium materials and proven methods.",
  },
  {
    icon: Users,
    title: "In-House Team",
    description: "Architects, designers, and builders working together under one roof for seamless delivery.",
  },
  {
    icon: Lightbulb,
    title: "Energy Efficient",
    description: "Modern building techniques and materials for lower utility costs and environmental impact.",
  },
];

const includes = [
  "Architectural design and 3D visualization",
  "Engineering and structural planning",
  "All permits and city approvals",
  "Foundation to finish construction",
  "Interior and exterior finishes",
  "Final inspection and walkthrough",
  "Warranty on all workmanship",
];

export default function NewConstructionPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              NEW CONSTRUCTION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Your Custom Dream Home
            </h1>
            <p className="text-xl text-white/80 mb-8">
              From the ground up, we build custom homes that reflect your lifestyle.
              Full design-build service with transparent pricing and professional project management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                  Get a Custom Quote <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Build With DCS?</h2>
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

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CostCtaSection
        calculatorHref="/planning-tools"
        calculatorLabel="Open Project Calculator"
      />

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let&apos;s Build Your Dream Home</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Every great home starts with a conversation. Tell us about your vision and we&apos;ll show you what&apos;s possible.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Start Your Project <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
