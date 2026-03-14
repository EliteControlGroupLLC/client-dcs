import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, Hammer, Paintbrush } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "ADU Solutions",
    description: "Detached ADUs, attached ADUs, garage conversions, and JADUs. Full design-build service from permits to completion.",
    starting: "$120,000",
    href: "/services/adu-solutions",
    badge: "Most Popular",
  },
  {
    icon: Hammer,
    title: "New Construction",
    description: "Custom homes built from the ground up. Complete design-build with transparent pricing and professional project management.",
    starting: "Custom Pricing",
    href: "/services/new-construction",
    badge: null,
  },
  {
    icon: Paintbrush,
    title: "Remodeling",
    description: "Kitchen remodels, bathroom renovations, and whole-home transformations with quality materials and expert execution.",
    starting: "$18,000",
    href: "/services/remodeling",
    badge: null,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              OUR SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Full-Service Design-Build Solutions
            </h1>
            <p className="text-xl text-white/80">
              From ADUs to custom homes and renovations, we handle everything from design
              to construction under one roof. Transparent pricing. Professional delivery.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                  {service.badge && (
                    <div className="absolute top-4 right-4 bg-primary text-secondary text-xs font-bold px-3 py-1 rounded-full">
                      {service.badge}
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-3">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <p className="text-lg font-bold text-primary mb-6">Starting at {service.starting}</p>
                    <Link href={service.href}>
                      <Button variant="outline" className="w-full group">
                        Learn More <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s discuss what&apos;s possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Build Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
