import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { BathroomCalculatorInline } from "@/components/calculators/bathroom-calculator-inline";

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
      <section className="bg-secondary text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary-light font-semibold text-sm uppercase tracking-wider mb-4">
              BATHROOM RENOVATION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Upgrade Your Bathroom
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Modern bathroom renovations with premium materials, expert craftsmanship, and transparent pricing.
              From simple updates to full renovations.
            </p>
            <p className="text-2xl font-bold text-primary-light">$12,000 – $60,000+</p>
          </div>
        </div>
      </section>

      <BathroomCalculatorInline />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
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

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Your Bathroom Transformation?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s create the bathroom you deserve.
          </p>
          <Link href="/contact">
            <Button size="lg" rounded="full">
              Schedule On-Site Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
