"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Home, Users } from "lucide-react";

const ctaOptions = [
  {
    icon: Building2,
    title: "Build Your ADU",
    description:
      "Use our interactive ADU builder to explore what you can build on your property, customize layouts, and see real-time pricing.",
    buttonText: "Start Building Your ADU",
    href: "/build-your-adu",
    primary: true,
  },
  {
    icon: Home,
    title: "Design Your Home",
    description:
      "Planning a remodel or custom home? Explore layouts, design ideas, and project possibilities with our planning tools.",
    buttonText: "Start Designing",
    href: "/design",
    primary: false,
  },
  {
    icon: Users,
    title: "Speak With Our Team",
    description:
      "Have questions or want expert guidance? Our team is ready to help you move forward with confidence.",
    buttonText: "Schedule Consultation",
    href: "/contact",
    primary: false,
  },
];

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background - green to deep blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary" />

      {/* Architectural grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
        }}
      />

      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
            Start Designing Your ADU Today
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-2">
            Explore what you can build on your property, see real pricing, and
            design your future space in minutes.
          </p>
          <p className="text-white/60">
            No pressure. No obligations. Just clarity.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ctaOptions.map((option) => (
            <div
              key={option.title}
              className={`group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                option.primary
                  ? "bg-white text-secondary shadow-2xl shadow-black/20 ring-2 ring-white/50"
                  : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  option.primary
                    ? "bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30"
                    : "bg-white/10"
                }`}
              >
                <option.icon
                  className={`h-8 w-8 ${
                    option.primary ? "text-white" : "text-white"
                  }`}
                />
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-bold mb-3 ${
                  option.primary ? "text-secondary" : "text-white"
                }`}
              >
                {option.title}
              </h3>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed mb-6 ${
                  option.primary ? "text-muted-foreground" : "text-white/70"
                }`}
              >
                {option.description}
              </p>

              {/* Button */}
              <Link href={option.href}>
                <Button
                  variant={option.primary ? "default" : "outlineWhite"}
                  size="default"
                  rounded="full"
                  className={`w-full group/btn ${
                    option.primary ? "" : "hover:bg-white hover:text-secondary"
                  }`}
                >
                  {option.buttonText}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer reassurance text */}
        <p className="text-center text-white/50 text-sm mt-16">
          No pressure. No obligations. Just expert guidance when you&apos;re ready.
        </p>
      </div>
    </section>
  );
}
