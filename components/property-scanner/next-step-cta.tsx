import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, BarChart3, Layout } from "lucide-react";

export function NextStepCTA() {
  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
      {/* Main CTA */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary mb-2">Ready to Take the Next Step?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Our team will verify these findings with a detailed site review and help you choose the best path forward.
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Button asChild size="lg" rounded="full" className="group w-full sm:w-auto">
            <Link href="/contact">
              <Calendar className="h-5 w-5" />
              Book Free Property Review
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" rounded="full" className="w-full sm:w-auto">
            <Link href="/services/adu-solutions">
              <Layout className="h-5 w-5" />
              See ADU Options
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" rounded="full" className="w-full sm:w-auto">
            <Link href="/adu-calculator">
              <BarChart3 className="h-5 w-5" />
              Compare Sizes &amp; Prices
            </Link>
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <strong>Disclaimer:</strong> This is a preliminary property scan providing estimated feasibility and planning-level guidance only.
          Final ADU design and permitting requirements are subject to site verification, survey, title review, zoning confirmation,
          utility conditions, and city approval. Results do not constitute guaranteed permitting approval.
        </p>
      </div>
    </div>
  );
}
