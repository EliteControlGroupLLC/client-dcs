import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, BarChart3, Layout } from "lucide-react";

export function NextStepCTA() {
  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
      {/* Main CTA */}
      <div className="bg-white rounded-2xl border border-border p-8 text-center mb-6">
        <h3 className="text-2xl font-bold text-secondary mb-2">Ready to Take the Next Step?</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Our team will verify these findings with a detailed site review and help you choose the best path forward.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact">
            <Button size="lg" rounded="full" className="group w-full sm:w-auto">
              <Calendar className="h-5 w-5" />
              Book Free Property Review
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/services/adu-solutions">
            <Button variant="outline" size="lg" rounded="full" className="w-full sm:w-auto">
              <Layout className="h-5 w-5" />
              See ADU Options
            </Button>
          </Link>
          <Link href="/adu-calculator">
            <Button variant="ghost" size="lg" rounded="full" className="w-full sm:w-auto">
              <BarChart3 className="h-5 w-5" />
              Compare Sizes &amp; Prices
            </Button>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <strong>Disclaimer:</strong> This is a preliminary property scan providing estimated feasibility and planning-level guidance only.
          Final ADU design and permitting requirements are subject to site verification, survey, title review, zoning confirmation,
          utility conditions, and city approval. Results do not constitute guaranteed permitting approval.
        </p>
      </div>
    </div>
  );
}
