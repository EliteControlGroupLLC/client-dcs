import { CheckCircle } from "lucide-react";
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
            <p className="text-2xl font-bold text-primary mb-8">$12,000 – $60,000+</p>
            <a href="#calculator">
              <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-secondary font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
                Open Bathroom Calculator
              </button>
            </a>
          </div>
        </div>
      </section>

      <BathroomCalculatorInline />

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
