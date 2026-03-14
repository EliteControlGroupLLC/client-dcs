import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, FileText, Calculator, Ruler } from "lucide-react";

const tools = [
  {
    icon: Home,
    title: "ADU Builder",
    description: "Design your ADU step by step. Choose your lot, layout, size, style, and see real-time pricing.",
    href: "/build-your-adu",
    cta: "Start Building Your ADU",
    primary: true,
  },
  {
    icon: FileText,
    title: "Floor Plans Library",
    description: "Browse our collection of pre-designed ADU floor plans with detailed specifications and pricing.",
    href: "/floor-plans",
    cta: "Browse Plans",
    primary: false,
  },
  {
    icon: Calculator,
    title: "ADU Cost Calculator",
    description: "Get a quick estimate of your ADU project cost based on size, type, and finish level.",
    href: "/adu-calculator",
    cta: "Calculate Cost",
    primary: false,
  },
  {
    icon: Ruler,
    title: "Design Studio",
    description: "Explore design ideas, materials, and finishes to visualize your future space.",
    href: "/design",
    cta: "Explore Designs",
    primary: false,
  },
];

export default function PlanningToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              PLANNING TOOLS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Plan Your Project With Confidence
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Use our interactive tools to explore possibilities, estimate costs, and visualize
              your future space before committing to a project.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-3">{tool.title}</h3>
                    <p className="text-muted-foreground mb-6">{tool.description}</p>
                    <Link href={tool.href}>
                      <Button
                        className={tool.primary ? "bg-primary hover:bg-primary-dark text-secondary font-semibold" : ""}
                        variant={tool.primary ? "default" : "outline"}
                      >
                        {tool.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Need Expert Guidance?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team is ready to help you explore your options and find the best path forward.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Schedule a Consultation
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
