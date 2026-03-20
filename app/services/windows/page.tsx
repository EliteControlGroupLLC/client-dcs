import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle, Sun, Thermometer, Eye } from "lucide-react";

const windowTypes = [
  {
    title: "Vinyl Windows",
    description: "Premium vinyl frames with advanced multi-chamber construction and Low-E glass. Exceptional thermal performance, minimal maintenance, and industry-leading warranties.",
    price: "Starting at $750/window installed",
  },
  {
    title: "Aluminum Windows",
    description: "Architectural-grade aluminum frames with thermal breaks for contemporary and mid-century modern homes. Ultra-slim sightlines maximize glass area and natural light.",
    price: "Starting at $1,800/window installed",
  },
  {
    title: "Fiberglass Windows",
    description: "Premium composite fiberglass with the lowest expansion rate of any frame material. Superior structural integrity, paintable exteriors, and exceptional durability for decades.",
    price: "Starting at $800/window installed",
  },
  {
    title: "Sliding Glass Doors",
    description: "Premium multi-panel sliding systems for seamless indoor-outdoor California living. Smooth operation, tight seals, and maximum glass for unobstructed views.",
    price: "Starting at $3,000/door installed",
  },
];

const features = [
  {
    icon: Thermometer,
    title: "Lower Energy Bills",
    description: "Dual-pane Low-E glass with argon fill cuts heat transfer by up to 50%. Your HVAC works less, and you feel the difference in comfort and monthly bills.",
  },
  {
    icon: Shield,
    title: "Quiet Your Home",
    description: "Premium multi-pane construction creates an acoustic barrier that dramatically reduces street noise, traffic, and neighborhood sounds.",
  },
  {
    icon: Sun,
    title: "Protect Your Interiors",
    description: "Advanced UV-blocking coatings prevent fading of furniture, flooring, and artwork while still letting natural light flood your spaces.",
  },
  {
    icon: Eye,
    title: "Add Resale Value",
    description: "Quality window replacements consistently rank among the highest-ROI home improvements, often returning 70-80% of investment at resale.",
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
              Transform your home with premium window systems from top manufacturers. We install 
              high-performance vinyl, architectural aluminum, and composite fiberglass windows - each 
              professionally measured, sealed, and trimmed to ensure years of trouble-free operation 
              and maximum energy efficiency.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $750/window installed</p>
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
