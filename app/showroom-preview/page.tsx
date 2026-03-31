import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Layers, Box, Sparkles } from "lucide-react";

const categories = [
  {
    icon: Layers,
    title: "Flooring",
    description: "Hardwood, tile, luxury vinyl, and more. Browse options that fit your style and budget.",
    count: "50+ Options",
  },
  {
    icon: Palette,
    title: "Finishes & Paint",
    description: "Interior and exterior finishes curated for modern San Diego homes.",
    count: "100+ Colors",
  },
  {
    icon: Box,
    title: "Cabinetry & Fixtures",
    description: "Kitchen and bathroom cabinetry, hardware, and plumbing fixtures.",
    count: "75+ Styles",
  },
  {
    icon: Sparkles,
    title: "Countertops & Tile",
    description: "Quartz, granite, marble, and ceramic tile selections for every room.",
    count: "40+ Materials",
  },
];

export default function ShowroomPreviewPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              DIGITAL SHOWROOM
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Materials, Finishes & Design Options
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Browse our curated selection of materials, finishes, fixtures, and design options.
              Visualize your project before construction begins.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a category to explore available options for your project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{cat.title}</h3>
                  <p className="text-muted-foreground mb-4">{cat.description}</p>
                  <span className="text-sm font-medium text-primary">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Selecting?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our design team can walk you through material options and help you make selections
            that match your vision and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Build Your ADU
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
