"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  Grid3x3, 
  Home, 
  Hammer,
  UtensilsCrossed,
  Bath,
  Building2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { GALLERY_PROJECTS } from "@/lib/data/site-data";

const categories = [
  { id: "all", name: "All Projects", icon: Grid3x3 },
  { id: "adu", name: "ADUs", icon: Home },
  { id: "remodel", name: "Remodels", icon: Hammer },
  { id: "kitchen", name: "Kitchens", icon: UtensilsCrossed },
  { id: "bathroom", name: "Bathrooms", icon: Bath },
  { id: "custom-home", name: "Custom Homes", icon: Building2 },
] as const;

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = activeCategory === "all" 
    ? GALLERY_PROJECTS
    : GALLERY_PROJECTS.filter((project) => project.category === activeCategory);

  return (
    <div className="min-h-screen bg-muted">
      <section className="pt-40 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              GALLERY
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Our Work
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A tighter look at the projects that define our design-build work across ADUs, remodels, and custom residential construction.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 h-11 px-5 rounded-full border text-sm font-medium transition-all ${
                    active
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-border text-secondary hover:bg-primary/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/gallery/${project.id}`} className="group block h-full">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/15 to-transparent" />
                    <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        {project.type}
                      </span>
                      {project.imageStatus === "pending-replacement" && (
                        <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                          Replacement image pending
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                      <p className="text-sm text-white/80">
                        {project.location} • {project.sqft}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                    {project.imageNote && (
                      <p className="mt-3 text-xs font-medium text-primary">{project.imageNote}</p>
                    )}
                    <span className="mt-auto pt-4 self-start inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      View project details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Let us help you create something amazing. Schedule a free consultation to discuss your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" rounded="full" className="w-full sm:w-auto font-semibold">
                Get Free Consultation <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/build-your-adu">
              <Button size="lg" rounded="full" variant="outlineWhite" className="w-full sm:w-auto">
                Design Your ADU
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
