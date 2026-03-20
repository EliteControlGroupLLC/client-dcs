import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, CheckCircle, Users, Award, HardHat, ClipboardCheck } from "lucide-react";

const serviceCategories = [
  {
    title: "Room Additions",
    description: "Expand your living space with a professionally built room addition. Seamlessly integrated with your existing home.",
    price: "Starting at $35,000",
  },
  {
    title: "Structural Repairs",
    description: "Foundation repairs, load-bearing wall modifications, and structural reinforcement by licensed professionals.",
    price: "Custom Pricing",
  },
  {
    title: "Electrical & Plumbing",
    description: "Complete electrical panel upgrades, rewiring, plumbing replacements, and system modernization.",
    price: "Starting at $3,000",
  },
  {
    title: "Permit & Plan Services",
    description: "Navigating San Diego's building codes and permit process. We handle plans, applications, and inspections.",
    price: "Starting at $2,500",
  },
  {
    title: "General Repairs & Maintenance",
    description: "Handyman-level to major repair services. Drywall, framing, doors, trim, and general home maintenance.",
    price: "Starting at $800",
  },
];

const features = [
  {
    icon: HardHat,
    title: "Licensed Contractor",
    description: "Fully licensed General Contractor (B License) with comprehensive liability and workers' comp insurance.",
  },
  {
    icon: Users,
    title: "In-House Crews",
    description: "Experienced in-house construction crews — not subcontracted labor. Consistent quality on every project.",
  },
  {
    icon: ClipboardCheck,
    title: "Project Management",
    description: "Dedicated project manager for every job. Clear communication, timelines, and progress updates.",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "Workmanship warranty on every project. We stand behind our work with responsive follow-up service.",
  },
];

const includes = [
  "Initial consultation and project assessment",
  "Detailed scope of work and written estimate",
  "Permit acquisition and code compliance",
  "Professional construction by licensed crews",
  "Regular progress updates and communication",
  "City inspections coordination",
  "Final walkthrough and punch list completion",
  "Warranty documentation and maintenance guidance",
];

export default function GeneralConstructionPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              GENERAL CONSTRUCTION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Residential Construction Services
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Full-service residential construction for San Diego homeowners. Room additions, structural work,
              system upgrades, and general repairs — all handled by licensed professionals under one roof.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">Projects Starting at $800</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">What We Do</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether it&apos;s a small repair or a major addition, our team has the experience and
              licensing to handle residential construction projects of any scope.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {serviceCategories.map((service) => (
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
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Work With Us?</h2>
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
              Our Process
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Have a Project in Mind?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Tell us about your project and get a free, detailed estimate. No obligation, no pressure.
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
