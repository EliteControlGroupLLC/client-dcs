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
    <div className="min-h-screen bg-muted pt-28 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
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
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-white text-secondary hover:bg-primary/10"
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
            <Link key={project.id} href={`/gallery/${project.id}`} className="group">
              <Card className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/15 to-transparent" />
                  <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {project.type}
                    </span>
                    {project.imageStatus === "pending-replacement" && (
                      <span className="rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        Replacement image pending
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-semibold text-white text-lg">{project.title}</h3>
                    <p className="text-sm text-white/70">
                      {project.location} • {project.sqft}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                  {project.imageNote && (
                    <p className="mt-3 text-xs font-medium text-primary">{project.imageNote}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    View project details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            Let us help you create something amazing. Schedule a free consultation to discuss your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Get Free Consultation
              </Button>
            </Link>
            <Link href="/build-your-adu">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Design Your ADU
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
