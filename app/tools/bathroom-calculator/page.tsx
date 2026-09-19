import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BathroomCalculatorInline } from "@/components/calculators/bathroom-calculator-inline";

export const metadata: Metadata = {
  title: "Bathroom Remodel Estimator",
};

// Same calculator as the service page (one source of truth for prices and
// layout); the page hero carries the title, so it renders `standalone`.
export default function BathroomCalculatorPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              BATHROOM CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Bathroom Remodel Estimator
            </h1>
            <p className="text-xl text-white/80">
              Estimate your bathroom renovation cost. Starting at $18,000 for a standard 5x10 bathroom.
            </p>
          </div>
        </div>
      </section>

      <BathroomCalculatorInline standalone />

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Bathroom Transformation?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s create the bathroom you deserve.
          </p>
          <Button asChild size="lg" rounded="full">
            <Link href="/contact">
              Schedule Free Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
