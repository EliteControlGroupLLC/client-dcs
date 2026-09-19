import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RoofCalculatorInline } from "@/components/calculators/roof-calculator-inline";

export const metadata: Metadata = {
  title: "Roof Price Calculator",
};

// Same calculator as the service page (one source of truth for prices and
// layout); the page hero carries the title, so it renders `standalone`.
export default function RoofCalculatorPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              ROOFING CALCULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Roof Price Calculator
            </h1>
            <p className="text-xl text-white/80">
              Get a smart estimate for your roof replacement or new roof installation.
              Adjust roof size, material, and complexity to see your estimated range.
            </p>
          </div>
        </div>
      </section>

      <RoofCalculatorInline standalone />

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] border-t border-white/10 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Professional Roof Inspection?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team can inspect your roof, provide exact measurements, and deliver a detailed quote with no obligation.
          </p>
          <Button asChild size="lg" rounded="full">
            <Link href="/contact">
              Schedule Free Inspection <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
