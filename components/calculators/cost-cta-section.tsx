import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";

interface CostCtaSectionProps {
  calculatorHref?: string;
  calculatorLabel?: string;
}

export function CostCtaSection({
  calculatorHref = "/planning-tools",
  calculatorLabel = "Open Project Calculator",
}: CostCtaSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calculator className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-secondary mb-3">
            Not sure about cost?
          </h3>
          <p className="text-muted-foreground mb-6">
            Use our calculator to estimate your project in seconds.
          </p>
          <Link href={calculatorHref}>
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold group">
              {calculatorLabel}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
