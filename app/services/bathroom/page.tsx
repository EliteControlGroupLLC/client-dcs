import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CostCtaSection } from "@/components/calculators/cost-cta-section";

const features = [
  "Custom tile work (floor, shower, backsplash)",
  "Vanity and cabinetry installation",
  "Plumbing fixture upgrades",
  "Walk-in shower conversions",
  "Bathtub installation or replacement",
  "Lighting and ventilation upgrades",
  "Heated flooring options",
  "Full project management",
];

export default function BathroomPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              BATHROOM RENOVATION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Upgrade Your Bathroom
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Modern bathroom renovations with premium materials, expert craftsmanship, and transparent pricing.
              From simple updates to full renovations.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $12,000</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                  Get a Free Quote <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Bathroom Projects
                </Button>
              </Link>
            </div>
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
              {features.map((item) => (
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
        calculatorHref="/tools/bathroom-calculator"
        calculatorLabel="Open Bathroom Calculator"
      />

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a New Bathroom?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s create the bathroom you deserve.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Schedule Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
