"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  LayoutGrid,
  ArrowRight,
  MapPin,
  Maximize2,
  DollarSign,
  Box,
  TrendingUp,
  Home,
  Clock,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const features = [
  { icon: MapPin, label: "Property Analysis" },
  { icon: Maximize2, label: "Size & Layout Options" },
  { icon: DollarSign, label: "Real-Time Pricing" },
  { icon: Box, label: "3D Visualization" },
];

const metrics = [
  {
    icon: DollarSign,
    value: "$3,800",
    label: "Avg Monthly Rental Income",
  },
  {
    icon: TrendingUp,
    value: "20–35%",
    label: "Property Value Increase",
  },
  {
    icon: Clock,
    value: "5–8 Years",
    label: "Average Payback Period",
  },
];

export function SmartTools() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: mainRef, isVisible: mainVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/smart-tools-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-secondary/92" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/95 via-secondary/88 to-secondary/95" />
      </div>
      {/* Architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            SMART PLANNING TOOLS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Plan Your Project With Confidence
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Use our interactive tools to explore possibilities, estimate costs,
            and visualize your future space before committing to a project.
          </p>
        </div>

        {/* Main Feature Module - Design Your ADU */}
        <div ref={mainRef} className={`mb-8 transition-all duration-700 delay-200 ${mainVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-5 text-balance">
                  Design Your ADU in Minutes
                </h3>
                <p className="text-white/70 mb-8 leading-relaxed text-lg">
                  Our step-by-step configurator helps you explore ADU
                  possibilities for your property. Analyze your lot, compare
                  layouts, estimate pricing, and visualize your future space.
                </p>

                {/* Feature Bullets */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {features.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-3 text-white/80"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div>
                  <Link href="/build-your-adu">
                    <Button size="lg" rounded="full" className="group">
                      Start Building Your ADU
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Preview */}
              <div className="relative bg-white/5 border-l border-white/10 flex items-center justify-center min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="relative text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-white/50 text-sm font-medium uppercase tracking-wider">
                    Interactive ADU Configurator Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Module - Floor Plan Library */}
        <div className="mb-12">
          <Link href="/floor-plans" className="block group">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 lg:p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <LayoutGrid className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    Floor Plans Library
                  </h3>
                  <p className="text-white/60">
                    Browse our collection of pre-designed ADU floor plans with
                    detailed specifications and pricing guidance.
                  </p>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-primary shrink-0">
                  Browse Plans
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ADU Value Metrics */}
        <div ref={metricsRef} className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 lg:p-10 transition-all duration-700 delay-200 ${metricsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`text-center ${
                  index !== metrics.length - 1
                    ? "md:border-r md:border-white/10"
                    : ""
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {metric.value}
                </div>
                <div className="text-sm text-white/60">{metric.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-xs mt-8">
            These numbers represent common outcomes for ADUs in San Diego
            depending on size, rent potential, and project cost.
          </p>
        </div>
      </div>
    </section>
  );
}
