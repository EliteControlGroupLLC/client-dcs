"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Modern Studio ADU",
    location: "La Jolla, CA",
    sqft: "450 sq ft",
    type: "ADU",
    image: null, // Placeholder - user will upload
  },
  {
    id: 2,
    title: "Two-Bedroom ADU",
    location: "Pacific Beach, CA",
    sqft: "800 sq ft",
    type: "ADU",
    image: null,
  },
  {
    id: 3,
    title: "Modern Kitchen Remodel",
    location: "Carlsbad, CA",
    sqft: "Kitchen",
    type: "Remodel",
    image: null,
  },
  {
    id: 4,
    title: "Custom Home Build",
    location: "Encinitas, CA",
    sqft: "3,200 sq ft",
    type: "New Construction",
    image: null,
  },
  {
    id: 5,
    title: "Garage Conversion ADU",
    location: "Chula Vista, CA",
    sqft: "600 sq ft",
    type: "ADU",
    image: null,
  },
  {
    id: 6,
    title: "Bathroom Renovation",
    location: "Del Mar, CA",
    sqft: "Bathroom",
    type: "Remodel",
    image: null,
  },
];

export function GalleryPreview() {
  return (
    <section className="py-24 bg-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Our Work
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary text-balance">
              Featured Projects
            </h2>
          </div>
          <Link href="/gallery">
            <Button variant="outline" rounded="full" className="group">
              View All Projects
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Link 
              key={project.id} 
              href={`/gallery/${project.id}`}
              className={`group relative overflow-hidden rounded-2xl aspect-[4/3] ${
                index === 0 ? "md:col-span-2 md:row-span-2 md:aspect-square" : ""
              }`}
            >
              {/* Placeholder background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Project info */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-xs font-medium text-primary bg-primary/20 w-fit px-3 py-1 rounded-full mb-3">
                  {project.type}
                </span>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/70">
                    {project.location} • {project.sqft}
                  </p>
                  <ExternalLink className="h-4 w-4 text-white/50 group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Placeholder text */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <span className="text-white text-sm">Project Image</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Projects Completed" },
              { value: "150+", label: "ADUs Built" },
              { value: "50+", label: "Custom Homes" },
              { value: "300+", label: "Remodels" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
