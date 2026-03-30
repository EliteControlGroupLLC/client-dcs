"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Building2, Hammer, ArrowRight, Check, Layers, SquareStack, Sun, Paintbrush, Wrench } from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";
import { PRIMARY_SERVICE_CARDS, SECONDARY_SERVICE_CARDS } from "@/lib/data/site-data";

const iconMap = {
  "adu-solutions": Home,
  "custom-homes": Building2,
  remodeling: Hammer,
  roofing: Layers,
  concrete: SquareStack,
  windows: Sun,
  exterior: Paintbrush,
  "general-construction": Wrench,
};

const featureMap: Record<string, string[]> = {
  "adu-solutions": ["Detached ADUs", "Garage conversions", "Floor-plan options", "Plans and permits"],
  "custom-homes": ["Ground-up homes", "Architectural planning", "Permit coordination", "Premium finish execution"],
  remodeling: ["Kitchen remodels", "Bathroom renovations", "Room additions", "Whole-home updates"],
};

const orderedSecondaryCards = [
  SECONDARY_SERVICE_CARDS.find((service) => service.id === "general-construction"),
  SECONDARY_SERVICE_CARDS.find((service) => service.id === "roofing"),
  SECONDARY_SERVICE_CARDS.find((service) => service.id === "exterior"),
  SECONDARY_SERVICE_CARDS.find((service) => service.id === "concrete"),
  SECONDARY_SERVICE_CARDS.find((service) => service.id === "windows"),
].filter((service): service is NonNullable<(typeof SECONDARY_SERVICE_CARDS)[number]> => Boolean(service));

export function Services() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible, getDelay } = useStaggeredAnimation(150);
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/services-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-secondary/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/90 via-secondary/70 to-secondary/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            OUR SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Full-Service Design-Build Solutions
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            From concept to completion, we manage design, permits, and
            construction with one coordinated team focused on delivering
            well-planned, high-quality building solutions.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PRIMARY_SERVICE_CARDS.map((service, index) => {
            const Icon = iconMap[service.id as keyof typeof iconMap];
            return (
            <div
              key={service.title}
              style={{ transitionDelay: gridVisible ? getDelay(index) : "0ms" }}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${
                service.id === "adu-solutions"
                  ? "bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl ring-1 ring-primary/50"
                  : "bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 hover:border-white/30"
              }`}
            >
              {/* Badge for featured */}
              {service.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {service.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                    service.id === "adu-solutions"
                      ? "bg-primary text-white"
                      : "bg-white/10 text-primary group-hover:bg-primary/20"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white/70 mb-6 leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {(featureMap[service.id] || []).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-white/80"
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <span className="text-lg font-bold text-primary">
                    {service.priceLabel}
                  </span>
                </div>

                {/* CTA */}
                <Link href={service.href}>
                  <Button
                    variant={service.id === "adu-solutions" ? "default" : "outlineWhite"}
                    className="w-full group/btn"
                    rounded="full"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          )})}
        </div>

        {/* Additional Services */}
        <div className="mt-12 border-t border-white/10 pt-12">
          <h3 className="text-center text-lg font-semibold text-white/60 uppercase tracking-wider mb-8">
            More Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {orderedSecondaryCards.map((service) => {
              const Icon = iconMap[service.id as keyof typeof iconMap];
              return (
              <Link key={service.title} href={service.href} className="group">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center h-full">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-1">{service.title}</h4>
                  <p className="text-xs text-white/40">{service.priceLabel}</p>
                </div>
              </Link>
            )})}
          </div>
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className={`text-center mt-16 transition-all duration-700 delay-300 ${ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Explore project options, pricing tools, and planning resources to
            see what you can build.
          </p>
          <Link href="/planning-tools">
            <Button variant="outlineWhite" size="lg" rounded="full" className="group">
              Explore Planning Tools
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
