"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Grid3x3, 
  Home, 
  Hammer,
  UtensilsCrossed,
  Bath,
  X
} from "lucide-react";
import Link from "next/link";

const categories = [
  { id: "all", name: "All Projects", icon: Grid3x3 },
  { id: "adu", name: "ADUs", icon: Home },
  { id: "remodel", name: "Remodels", icon: Hammer },
  { id: "kitchen", name: "Kitchens", icon: UtensilsCrossed },
  { id: "bathroom", name: "Bathrooms", icon: Bath },
];

const projects = [
  { id: 1, category: "adu", title: "Modern Detached ADU", location: "La Jolla", sqFt: 650 },
  { id: 2, category: "adu", title: "Garage Conversion", location: "North Park", sqFt: 450 },
  { id: 3, category: "kitchen", title: "Contemporary Kitchen", location: "Pacific Beach", sqFt: 180 },
  { id: 4, category: "bathroom", title: "Spa Master Bath", location: "Del Mar", sqFt: 120 },
  { id: 5, category: "adu", title: "Craftsman ADU", location: "Hillcrest", sqFt: 800 },
  { id: 6, category: "remodel", title: "Whole Home Renovation", location: "Mission Hills", sqFt: 2400 },
  { id: 7, category: "kitchen", title: "Farmhouse Kitchen", location: "Encinitas", sqFt: 200 },
  { id: 8, category: "adu", title: "Junior ADU", location: "Ocean Beach", sqFt: 400 },
  { id: 9, category: "bathroom", title: "Modern Guest Bath", location: "Point Loma", sqFt: 80 },
  { id: 10, category: "remodel", title: "Mid-Century Update", location: "Kensington", sqFt: 1800 },
  { id: 11, category: "adu", title: "Two-Story ADU", location: "Scripps Ranch", sqFt: 1000 },
  { id: 12, category: "kitchen", title: "Open Concept Kitchen", location: "Carmel Valley", sqFt: 250 },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const filteredProjects = activeCategory === "all" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Our Work
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our portfolio of completed projects. Each one represents our commitment to quality craftsmanship.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="overflow-hidden cursor-pointer group"
              onClick={() => setSelectedProject(project.id)}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-12 w-12 text-primary/40" />
                </div>
                <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">View Project</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-secondary">{project.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.location} • {project.sqFt} sq ft
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Lightbox */}
        {selectedProject && selectedProjectData && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-20 w-20 text-primary/40" />
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  {selectedProjectData.title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {selectedProjectData.location} • {selectedProjectData.sqFt} sq ft
                </p>
                <p className="text-muted-foreground">
                  This project showcases our commitment to quality craftsmanship and attention to detail. 
                  Each element was carefully designed and executed to meet our client&apos;s vision.
                </p>
              </div>
            </div>
          </div>
        )}

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
