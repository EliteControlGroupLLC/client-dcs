import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle, Paintbrush, Sun, Home } from "lucide-react";

const exteriorServices = [
  {
    title: "Exterior Painting",
    description: "Professional prep and paint with premium exterior coatings. Complete surface preparation, priming, and multiple finish coats for lasting results.",
    price: "Starting at $12,500",
  },
  {
    title: "Siding & Stucco",
    description: "New siding installation or complete stucco repair and re-coating. Transform your home's exterior with materials built for San Diego's climate.",
    price: "Starting at $15,000",
  },
  {
    title: "Decks & Pergolas",
    description: "Custom wood and composite decking, pergolas, and outdoor structures designed for California outdoor living.",
    price: "Starting at $12,000",
  },
  {
    title: "Fencing & Gates",
    description: "Privacy fencing, decorative gates, and property enclosures. Wood, vinyl, metal, and composite options.",
    price: "Starting at $5,000",
  },
  {
    title: "Outdoor Living Spaces",
    description: "Custom patios, outdoor kitchens, fire pits, and entertainment areas designed for year-round enjoyment.",
    price: "Starting at $75,000",
  },
  {
    title: "Landscape Hardscaping",
    description: "Pavers, retaining walls, walkways, and stone work to enhance your outdoor environment.",
    price: "Starting at $25,000",
  },
];

const features = [
  {
    icon: Sun,
    title: "Elevate Your Property Value",
    description: "Strategic exterior improvements can add 5-15% to your home's resale value while making it the standout property on your street.",
  },
  {
    icon: Home,
    title: "Transform Your Lifestyle",
    description: "Unlock your outdoor spaces for entertaining, relaxation, and everyday living. San Diego's climate is perfect for outdoor rooms you'll actually use.",
  },
  {
    icon: Shield,
    title: "Build a More Intentional Home",
    description: "A well-designed exterior isn't just maintenance - it's the finishing touch that ties your entire property together into a cohesive, polished whole.",
  },
  {
    icon: Paintbrush,
    title: "Invest in Better Living",
    description: "Quality exterior work creates spaces that enhance how you live every day - from morning coffee on a custom deck to evening gatherings around a fire pit.",
  },
];

const includes = [
  "On-site consultation and design planning",
  "Material selection guidance",
  "All necessary permits and approvals",
  "Professional installation by experienced crews",
  "Proper drainage and grading considerations",
  "Complete site cleanup and debris removal",
  "Final walkthrough and quality inspection",
  "Workmanship warranty on all projects",
];

export default function ExteriorPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              EXTERIOR IMPROVEMENTS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Enhance Your Home&apos;s Exterior
            </h1>
            <p className="text-xl text-white/80 mb-8">
              From painting and siding to decks, fencing, and outdoor living spaces — complete exterior
              improvement services designed for San Diego homes and lifestyles.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Starting at $12,000</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Exterior Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive exterior improvement services to protect, beautify, and add value to your property.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {exteriorServices.map((service) => (
              <Card key={service.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-secondary mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <p className="text-lg font-bold text-primary">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Invest in Your Exterior?</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Upgrade Your Exterior?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss your vision. Free consultation and detailed estimates with no obligation.
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
