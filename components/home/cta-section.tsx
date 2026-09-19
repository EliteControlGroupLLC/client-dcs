"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Home, Users } from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";

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
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible, getDelay } = useStaggeredAnimation(150);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background - green to deep blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary" />


      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-balance">
            Start Designing Your ADU Today
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Explore what you can build on your property, see real pricing, and
            design your future space in minutes.
          </p>
        </div>

        {/* CTA Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ctaOptions.map((option, index) => (
            <div
              key={option.title}
              style={{ transitionDelay: cardsVisible ? getDelay(index) : "0ms" }}
              className={`group flex h-full flex-col rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${
                option.primary
                  ? "bg-white text-secondary border border-white shadow-2xl shadow-black/20"
                  : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  option.primary
                    ? "bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30"
                    : "bg-white/10"
                }`}
              >
                <option.icon className="h-7 w-7 text-white" aria-hidden="true" />
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-semibold mb-3 ${
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
              <Link href={option.href} className="mt-auto">
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
        <p className="text-center text-white/60 text-sm mt-12">
          No pressure. No obligations. Just expert guidance when you&apos;re ready.
        </p>
      </div>
    </section>
  );
}
