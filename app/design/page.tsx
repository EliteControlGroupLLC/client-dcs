import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Layout, Lightbulb, Eye } from "lucide-react";

const designServices = [
  {
    icon: Layout,
    title: "Floor Plan Design",
    description: "Custom floor plans designed to maximize your space, natural light, and functionality.",
  },
  {
    icon: Palette,
    title: "Interior Design",
    description: "Material selection, color palettes, and finish coordination for a cohesive look.",
  },
  {
    icon: Eye,
    title: "3D Visualization",
    description: "See your project come to life with realistic 3D renderings before construction begins.",
  },
  {
    icon: Lightbulb,
    title: "Design Consultation",
    description: "Work with our in-house design team to explore ideas and refine your vision.",
  },
];

export default function DesignPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              DESIGN SERVICES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Design Your Dream Space
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Our in-house design team works with you to create spaces that reflect your style,
              meet your needs, and stay within your budget.
            </p>
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Start Designing <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Our Design Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to construction-ready plans, we handle every aspect of the design process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {designServices.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Designing?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a free design consultation and let&apos;s bring your vision to life.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Schedule Consultation <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
