import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Home, FileText, Calculator, Ruler,
  DollarSign, BarChart3, ArrowLeftRight, Palette, Zap,
  Layers, ChefHat, Bath,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Tools",
};

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
    description: "Estimate ADU cost ranges using the same floor-plan pricing logic used across the rest of the site.",
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
    description: "Generate exterior and interior concept visuals based on your preferred style, materials, and finish direction.",
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
    <Card
      className={`h-full flex flex-col overflow-hidden bg-secondary-light shadow-lg shadow-black/20 transition-colors ${
        isPrimary ? "border-accent/60 ring-1 ring-accent/30 hover:border-accent" : "border-white/10 hover:border-accent/50"
      }`}
    >
      <CardContent className="p-8 flex flex-col flex-1">
        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
        <p className="text-white/80 mb-6">{tool.description}</p>
        <div className="mt-auto">
          <Button asChild variant={isPrimary ? "default" : "outlineWhite"} rounded="full">
            <Link href={tool.href}>
              {tool.cta}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Cards wrap and center so an odd last row (e.g. 5 tools in 3 columns) stays centered.
const cardCell = "w-full md:w-[calc(50%-0.75rem)]";
const cardCell3 = "w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
      <p className="text-lg text-white/80 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

export default function PlanningToolsPage() {
  return (
    <div className="min-h-screen bg-secondary text-white">
      {/* Hero */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              PLANNING TOOLS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Estimate Your Project Instantly
            </h1>
            <p className="text-xl text-white/80">
              Use our smart tools to calculate pricing, feasibility, and options
              before starting your project.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Tools */}
      <section className="py-20 bg-secondary border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeader title="Get Started" subtitle="Our most powerful planning and estimating tools." />
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {primaryTools.map((tool) => (
              <div key={tool.title} className={cardCell}>
                <ToolCard tool={tool} isPrimary={tool.primary} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADU Investment & Design Tools */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeader title="ADU Investment & Design Tools" subtitle="Understand your ADU as an investment and explore design options." />
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {aduTools.map((tool) => (
              <div key={tool.title} className={cardCell3}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Calculators */}
      <section className="py-20 bg-secondary border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeader title="Service Calculators" subtitle="Estimate costs for roofing, concrete, kitchen, and bathroom projects." />
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {serviceCalculators.map((tool) => (
              <div key={tool.title} className={cardCell}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] border-t border-white/10 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Expert Guidance?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team is ready to help you explore your options and find the best path forward for your project.
          </p>
          <Button asChild size="lg" rounded="full">
            <Link href="/contact">
              Schedule a Consultation
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
