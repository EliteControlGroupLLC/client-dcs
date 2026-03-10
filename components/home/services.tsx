"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, Hammer, ArrowRight, Sparkles } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "ADU Solutions",
    description: "Complete accessory dwelling units from permits to keys. Maximize your property value with a rental unit or guest house.",
    features: ["Detached & Attached ADUs", "Garage Conversions", "JADUs", "Full Permits Included"],
    price: "Starting at $175,000",
    href: "/services/adu-solutions",
    featured: true,
  },
  {
    icon: Building2,
    title: "New Construction",
    description: "Custom homes built to your specifications. From modern minimalist to traditional designs, we bring your vision to life.",
    features: ["Custom Homes", "Spec Homes", "Multi-Family", "Commercial"],
    price: "Custom Pricing",
    href: "/services/new-construction",
  },
  {
    icon: Hammer,
    title: "Remodeling",
    description: "Transform your existing space with expert renovation services. Kitchens, bathrooms, whole-home makeovers and more.",
    features: ["Kitchen Remodels", "Bathroom Renovations", "Room Additions", "Whole Home"],
    price: "Starting at $50,000",
    href: "/services/remodeling",
  },
];

export function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            <Sparkles className="h-4 w-4" />
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 text-balance">
            Full-Service Design-Build Solutions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From initial concept to final walkthrough, we handle every aspect of your construction project 
            with transparent pricing and exceptional craftsmanship.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card 
              key={service.title} 
              className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                service.featured ? "ring-2 ring-primary shadow-lg" : ""
              }`}
            >
              {service.featured && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  service.featured ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}>
                  <service.icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-bold text-secondary mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-border">
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                </div>

                {/* CTA */}
                <Link href={service.href}>
                  <Button 
                    variant={service.featured ? "default" : "outline"} 
                    className="w-full group/btn"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Not sure which service is right for you?</p>
          <Link href="/contact">
            <Button variant="secondary" size="lg" rounded="full">
              Schedule a Free Consultation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
