import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle, Sun, Thermometer, Eye } from "lucide-react";

const windowTypes = [
  {
    title: "Vinyl Windows",
    description: "Energy-efficient vinyl frames with double-pane glass. Low maintenance, excellent insulation, and great value.",
    price: "Starting at $450/window",
  },
  {
    title: "Aluminum Windows",
    description: "Sleek, modern aluminum frames ideal for contemporary homes. Slim profiles with maximum glass area.",
    price: "Starting at $600/window",
  },
  {
    title: "Fiberglass Windows",
    description: "Premium fiberglass frames with superior durability and thermal performance. Paintable and long-lasting.",
    price: "Starting at $750/window",
  },
  {
    title: "Sliding Glass Doors",
    description: "Large sliding glass doors for seamless indoor-outdoor living. Energy efficient with smooth operation.",
    price: "Starting at $1,800/door",
  },
];

const features = [
  {
    icon: Thermometer,
    title: "Energy Efficient",
    description: "Low-E glass and insulated frames reduce energy costs and keep your home comfortable year-round.",
  },
  {
    icon: Shield,
    title: "Enhanced Security",
    description: "Multi-point locking systems and impact-resistant glass options for safety and peace of mind.",
  },
  {
    icon: Sun,
    title: "UV Protection",
    description: "Advanced coatings block harmful UV rays while letting natural light flood your spaces.",
  },
  {
    icon: Eye,
    title: "Curb Appeal",
    description: "Modern window designs that enhance your home's appearance and increase property value.",
  },
];

const includes = [
  "Professional window measurement and sizing",
  "Removal and disposal of old windows",
  "New window installation with proper flashing",
  "Weatherproofing and insulation around frames",
  "Interior and exterior trim and caulking",
  "Hardware installation and adjustment",
  "Screen installation where applicable",
  "Final cleanup and quality inspection",
];

export default function WindowsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              WINDOW SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Window Replacement & Installation
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Upgrade your home with energy-efficient windows. Professional installation of vinyl,
              aluminum, and fiberglass windows with proper weatherproofing and trim work.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $450/window</p>
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Schedule On-Site Consultation <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Window Options</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We install all major window types and brands. Every installation includes proper weatherproofing and trim.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {windowTypes.map((type) => (
              <Card key={type.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-secondary mb-2">{type.title}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <p className="text-lg font-bold text-primary">{type.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Benefits of New Windows</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-secondary mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for New Windows?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free in-home consultation. We&apos;ll measure, recommend, and provide a detailed quote.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Schedule On-Site Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
