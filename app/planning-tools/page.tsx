import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Home, FileText, Calculator, Ruler,
  DollarSign, BarChart3, ArrowLeftRight, Palette, Zap,
  Layers, ChefHat, Bath,
} from "lucide-react";

interface ToolItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta: string;
  primary?: boolean;
}

const primaryTools: ToolItem[] = [
  {
    icon: Home,
    title: "Build Your ADU",
    description: "Scan your property, explore ADU options, and see real-time pricing with our flagship planning tool.",
    href: "/build-your-adu",
    cta: "Start Building Your ADU",
    primary: true,
  },
  {
    icon: Zap,
    title: "Instant ADU Price Estimator",
    description: "Get quick price estimates by selecting ADU type, size, bedrooms, bathrooms, and stories.",
    href: "/tools/instant-adu-estimator",
    cta: "Get Instant Estimate",
    primary: true,
  },
  {
    icon: FileText,
    title: "Floor Plans Library",
    description: "Browse pre-designed ADU floor plans from 400 to 1,200 sq ft with specs and pricing.",
    href: "/floor-plans",
    cta: "Browse Plans",
  },
  {
    icon: Calculator,
    title: "ADU Cost Calculator",
    description: "Estimate your ADU project cost based on size, type, and finish level.",
    href: "/adu-calculator",
    cta: "Calculate Cost",
  },
];

const aduTools: ToolItem[] = [
  {
    icon: DollarSign,
    title: "ADU Income Calculator",
    description: "See what your ADU could earn. Estimate rental income, break-even timeline, and long-term ROI.",
    href: "/tools/adu-income-calculator",
    cta: "Calculate Income",
  },
  {
    icon: BarChart3,
    title: "ADU ROI Simulator",
    description: "Model your ADU as an investment with financing, cash flow projections, and payoff timeline.",
    href: "/tools/adu-roi-simulator",
    cta: "Simulate ROI",
  },
  {
    icon: ArrowLeftRight,
    title: "Compare ADU Sizes",
    description: "Compare 400-1,200 sq ft ADUs side by side: cost, rent, footprint, and best use case.",
    href: "/tools/compare-adu-sizes",
    cta: "Compare Sizes",
  },
  {
    icon: Palette,
    title: "ADU Design Inspiration",
    description: "Build your style profile with aesthetics, materials, and finishes to visualize your dream ADU.",
    href: "/tools/adu-design-inspiration",
    cta: "Explore Styles",
  },
  {
    icon: Ruler,
    title: "Design Studio",
    description: "Explore design ideas, materials, and finishes to visualize your future space.",
    href: "/design",
    cta: "Explore Designs",
  },
];

const serviceCalculators: ToolItem[] = [
  {
    icon: Home,
    title: "Roof Price Calculator",
    description: "Estimate your roof replacement cost by area, material type, and complexity level.",
    href: "/tools/roof-calculator",
    cta: "Calculate Roof Cost",
  },
  {
    icon: Layers,
    title: "Concrete Calculator",
    description: "Estimate concrete slab costs by dimensions, finish type, with optional retaining wall pricing.",
    href: "/tools/concrete-calculator",
    cta: "Calculate Concrete",
  },
  {
    icon: ChefHat,
    title: "Kitchen Remodel Calculator",
    description: "Estimate your kitchen remodel starting at $25K for a standard 10x10, with upgrade options.",
    href: "/tools/kitchen-calculator",
    cta: "Calculate Kitchen",
  },
  {
    icon: Bath,
    title: "Bathroom Remodel Calculator",
    description: "Estimate your bathroom renovation starting at $18K for a standard 5x10, with upgrades.",
    href: "/tools/bathroom-calculator",
    cta: "Calculate Bathroom",
  },
];

function ToolCard({ tool, isPrimary = false }: { tool: ToolItem; isPrimary?: boolean }) {
  const Icon = tool.icon;
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-secondary mb-3">{tool.title}</h3>
        <p className="text-muted-foreground mb-6">{tool.description}</p>
        <Link href={tool.href}>
          <Button
            className={isPrimary ? "bg-primary hover:bg-primary-dark text-secondary font-semibold" : ""}
            variant={isPrimary ? "default" : "outline"}
          >
            {tool.cta}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

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
              Use Our Tools to Plan With Confidence
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Explore possibilities, estimate costs, compare options, and visualize your
              project before committing. Smarter planning starts here.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Tools */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2 text-center">Get Started</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Our most powerful planning and estimating tools.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {primaryTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} isPrimary={tool.primary} />
            ))}
          </div>
        </div>
      </section>

      {/* ADU Investment & Design Tools */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2 text-center">ADU Investment &amp; Design Tools</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Understand your ADU as an investment and explore design options.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {aduTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Service Calculators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2 text-center">Service Calculators</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Estimate costs for roofing, concrete, kitchen, and bathroom projects.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {serviceCalculators.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
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
            Our team is ready to help you explore your options and find the best path forward for your project.
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
