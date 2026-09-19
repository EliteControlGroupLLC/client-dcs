import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { KitchenCalculatorInline } from "@/components/calculators/kitchen-calculator-inline";

const features = [
  "Custom cabinetry design and installation",
  "Premium countertops (quartz, granite, marble)",
  "Modern appliance installation",
  "Plumbing and electrical updates",
  "Flooring and backsplash tile",
  "Lighting design and installation",
  "Open floor plan conversions",
  "Full project management",
];

export default function KitchenPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary-light font-semibold text-sm uppercase tracking-wider mb-4">
              KITCHEN REMODELING
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Create Your Dream Kitchen
            </h1>
            <p className="text-xl text-white/80 mb-8">
              From layout redesign to premium finishes, we build kitchens that are beautiful,
              functional, and built to last. Transparent pricing with no hidden costs.
            </p>
            <p className="text-2xl font-bold text-primary-light">$18,000 – $75,000+</p>
          </div>
        </div>
      </section>

      <KitchenCalculatorInline />

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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Kitchen?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s design the kitchen you&apos;ve always wanted.
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
