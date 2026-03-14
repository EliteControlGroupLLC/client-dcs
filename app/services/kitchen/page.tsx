import { CheckCircle } from "lucide-react";
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
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              KITCHEN REMODELING
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Create Your Dream Kitchen
            </h1>
            <p className="text-xl text-white/80 mb-8">
              From layout redesign to premium finishes, we build kitchens that are beautiful,
              functional, and built to last. Transparent pricing with no hidden costs.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">$18,000 – $75,000+</p>
            <a href="#calculator">
              <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-secondary font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
                Open Kitchen Calculator
              </button>
            </a>
          </div>
        </div>
      </section>

      <KitchenCalculatorInline />

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
    </div>
  );
}
