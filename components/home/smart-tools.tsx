"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  Calculator, 
  TrendingUp, 
  LayoutGrid, 
  ArrowRight,
  Sparkles,
  DollarSign,
  PieChart
} from "lucide-react";

const tools = [
  {
    icon: Wand2,
    title: "Build Your ADU",
    description: "Our interactive configurator guides you through designing your perfect ADU with real-time pricing.",
    href: "/build-your-adu",
    color: "bg-primary",
    featured: true,
  },
  {
    icon: Calculator,
    title: "ADU Price Calculator",
    description: "Get an instant estimate based on your specific requirements and preferences.",
    href: "/calculators/adu",
    color: "bg-secondary",
  },
  {
    icon: TrendingUp,
    title: "ROI Calculator",
    description: "Calculate your potential return on investment from rental income or property value increase.",
    href: "/calculators/roi",
    color: "bg-accent",
  },
  {
    icon: LayoutGrid,
    title: "Floor Plans Library",
    description: "Browse our collection of pre-designed floor plans with detailed specifications and pricing.",
    href: "/floor-plans",
    color: "bg-primary-dark",
  },
];

const quickStats = [
  { icon: DollarSign, value: "$2,500", label: "Avg Monthly Rental Income" },
  { icon: PieChart, value: "25-35%", label: "Property Value Increase" },
  { icon: TrendingUp, value: "5-7 yrs", label: "Average Payback Period" },
];

export function SmartTools() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            <Sparkles className="h-4 w-4" />
            Smart Planning Tools
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 text-balance">
            Plan Your Project with Confidence
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Use our interactive tools to explore options, estimate costs, and visualize your future space 
            before committing to anything.
          </p>
        </div>

        {/* Main Tool - Build Your ADU */}
        <div className="mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary-light text-white">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Interactive Experience</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                    Design Your ADU in Minutes
                  </h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Our step-by-step configurator helps you explore ADU possibilities for your property. 
                    Get instant pricing, see floor plan options, and visualize your future space.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Property Analysis", "Size & Layout Options", "Real-Time Pricing", "3D Visualization"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/build-your-adu">
                    <Button size="lg" rounded="full" className="group">
                      Start Building Your ADU
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  {/* Placeholder for interactive preview */}
                  <div className="aspect-[4/3] rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-white/60 text-sm">Interactive ADU Configurator Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tools.slice(1).map((tool) => (
            <Link key={tool.title} href={tool.href}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Try Now
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-muted rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {quickStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
