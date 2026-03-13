import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, Home, Shield, Calculator, CheckCircle } from "lucide-react";

const options = [
  {
    icon: Home,
    title: "Home Equity Loans",
    description: "Use your existing home equity to fund your ADU or remodel project. Often the most affordable option with competitive rates.",
  },
  {
    icon: DollarSign,
    title: "Construction Loans",
    description: "Specialized financing designed for new construction projects. Funds are released in stages as work progresses.",
  },
  {
    icon: Shield,
    title: "FHA 203(k) Loans",
    description: "Government-backed loans that combine your mortgage and renovation costs into a single loan with favorable terms.",
  },
  {
    icon: Calculator,
    title: "ADU-Specific Programs",
    description: "California offers special financing programs for ADU construction, including CalHFA ADU grants and local incentives.",
  },
];

export default function FinancingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              FINANCING
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Flexible Financing Options
            </h1>
            <p className="text-xl text-white/80 mb-8">
              We work with trusted lenders to help you find the right financing for your project.
              Multiple options available to fit your budget and goals.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Financing Options</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ll help you explore the best financing path for your project during our consultation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Card key={option.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-3">{option.title}</h3>
                    <p className="text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              How It Works
            </h2>
            <div className="space-y-6 text-left mt-8">
              {[
                "Schedule a free consultation to discuss your project scope and budget.",
                "We provide a detailed project estimate with transparent pricing.",
                "Our financing partners review your options and present the best terms.",
                "Once approved, construction begins with your approved financing in place.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Financing?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss your project and find the best financing solution for you.
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
