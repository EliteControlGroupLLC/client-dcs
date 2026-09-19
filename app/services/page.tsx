import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, Hammer, Paintbrush, Fence, Layers, SquareStack, Sun, Wrench, ChefHat, Bath } from "lucide-react";
import { SERVICE_CARDS } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "Services",
};

const iconMap = {
  "adu-solutions": Home,
  "custom-homes": Hammer,
  remodeling: Paintbrush,
  roofing: Layers,
  concrete: SquareStack,
  windows: Sun,
  exterior: Fence,
  "general-construction": Wrench,
  kitchen: ChefHat,
  bathroom: Bath,
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              OUR SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Full-Service <span className="whitespace-nowrap">Design-Build</span> Solutions
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
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {SERVICE_CARDS.map((service) => {
              const Icon = iconMap[service.id as keyof typeof iconMap];
              return (
                <Card key={service.title} className="relative w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {service.badge && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      {service.badge}
                    </div>
                  )}
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-secondary mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <p className="text-lg font-bold text-primary mt-auto mb-6">{service.priceLabel}</p>
                    <Button asChild variant="outline" rounded="full" className="group self-start">
                      <Link href={service.href}>
                        Learn More <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s discuss what&apos;s possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full">
              <Link href="/build-your-adu">
                Build Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full">
              <Link href="/contact">
                Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
