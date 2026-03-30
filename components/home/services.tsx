"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Building2, Hammer, ArrowRight, Check, Layers, SquareStack, Sun, Paintbrush, Wrench } from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";

const services = [
  {
    icon: Home,
    title: "ADU Solutions",
    badge: "Most Popular",
    description:
      "Complete accessory dwelling units from permits to keys. Maximize your property value with a rental unit, guest house, or multigenerational living space.",
    features: [
      "Detached ADUs",
      "Garage Conversions",
      "Junior ADUs",
      "Full Permits Included",
    ],
    price: "Starting at $120,000",
    href: "/services/adu-solutions",
    featured: true,
  },
  {
    icon: Building2,
    title: "Custom Homes",
    description:
      "Custom homes designed and built to your vision. From architectural planning to final construction, our team manages the entire process under one roof.",
    features: [
      "Custom Homes",
      "Spec Homes",
      "Multi-Family",
      "Ground-Up Construction",
    ],
    price: "Custom Pricing",
    href: "/services/new-construction",
  },
  {
    icon: Hammer,
    title: "Remodeling",
    description:
      "Transform your existing space with thoughtful renovation and modernization services designed to improve functionality, comfort, and value.",
    features: [
      "Kitchen Remodels",
      "Bathroom Renovations",
      "Room Additions",
      "Whole Home Renovations",
    ],
    price: "Starting at $18,000",
    href: "/services/remodeling",
  },
];

const additionalServices = [
  {
    icon: Layers,
    title: "Roofing",
    description: "Shingles, tile, and metal roofing with professional installation.",
    href: "/services/roofing",
    price: "Starting at $12,500",
  },
  {
    icon: SquareStack,
    title: "Concrete",
    description: "Driveways, patios, retaining walls, and foundations.",
    href: "/services/concrete",
    price: "Starting at $17.50/sq ft",
  },
  {
    icon: Sun,
    title: "Windows",
    description: "Energy-efficient window replacement and installation.",
    href: "/services/windows",
    price: "Starting at $750/window",
  },
  {
    icon: Paintbrush,
    title: "Exterior Improvements",
    description: "Painting, siding, decks, fencing, and outdoor living.",
    href: "/services/exterior",
    price: "Starting at $12,000",
  },
  {
    icon: Wrench,
    title: "General Construction",
    description: "Additions, structural work, electrical, plumbing, and repairs.",
    href: "/services/general-construction",
    price: "Starting at $800",
  },
];

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
          {services.map((service, index) => (
            <div
              key={service.title}
              style={{ transitionDelay: gridVisible ? getDelay(index) : "0ms" }}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${
                service.featured
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
                    service.featured
                      ? "bg-primary text-white"
                      : "bg-white/10 text-primary group-hover:bg-primary/20"
                  }`}
                >
                  <service.icon className="h-7 w-7" />
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
                  {service.features.map((feature) => (
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
                    {service.price}
                  </span>
                </div>

                {/* CTA */}
                <Link href={service.href}>
                  <Button
                    variant={service.featured ? "default" : "outlineWhite"}
                    className="w-full group/btn"
                    rounded="full"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-12 border-t border-white/10 pt-12">
          <h3 className="text-center text-lg font-semibold text-white/60 uppercase tracking-wider mb-8">
            More Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {additionalServices.map((service) => (
              <Link key={service.title} href={service.href} className="group">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center h-full">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-1">{service.title}</h4>
                  <p className="text-xs text-white/40">{service.price}</p>
                </div>
              </Link>
            ))}
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
