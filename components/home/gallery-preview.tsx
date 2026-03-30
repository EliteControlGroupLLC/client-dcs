"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { GALLERY_PROJECTS, COMPANY_INFO } from "@/lib/data/site-data";

const projects = GALLERY_PROJECTS.map(p => ({
  id: parseInt(p.id),
  title: p.title,
  location: p.location,
  sqft: p.sqft,
  type: p.type,
  image: p.image,
}));

const projectStats = [
  { value: COMPANY_INFO.stats.projectsCompleted, label: "Projects Completed" },
  { value: COMPANY_INFO.stats.adusBuilt, label: "ADUs Built" },
  { value: COMPANY_INFO.stats.customHomes, label: "Custom Homes" },
  { value: COMPANY_INFO.stats.remodels, label: "Remodels" },
];

export function GalleryPreview() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle architectural background */}
      <div className="absolute inset-0">
        <Image
          src="/images/featured-projects-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.03]"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/95 to-muted" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
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
        <div ref={gridRef} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {projects.map((project, index) => (
            <Link 
              key={project.id} 
              href={`/gallery/${project.id}`}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3] ${
                index === 0 ? "md:col-span-2 md:row-span-2 md:aspect-square" : ""
              }`}
            >
              {/* Project image */}
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-secondary" />
              )}
              
              {/* Glass-style content overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Project info with glass effect */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Type badge */}
                <span className="text-xs font-semibold text-primary bg-white/10 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full mb-3 border border-white/10">
                  {project.type}
                </span>
                
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/70">
                    {project.location} • {project.sqft}
                  </p>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-white group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats bar with glass styling */}
        <div ref={statsRef} className={`mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 transition-all duration-700 delay-300 ${statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {projectStats.map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
