import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MapPin, Ruler } from "lucide-react";

const projects = [
  {
    id: "1",
    title: "Modern Studio ADU",
    location: "La Jolla, CA",
    sqft: "450 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-balcony.png",
    description: "A modern studio ADU featuring an open floor plan, high ceilings, and a private balcony. Designed for maximum natural light and comfortable living in a compact footprint.",
  },
  {
    id: "2",
    title: "Two-Bedroom ADU",
    location: "Pacific Beach, CA",
    sqft: "800 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-yard.png",
    description: "A spacious two-bedroom ADU with a full kitchen, living area, and private yard access. Built as a detached unit with modern finishes and energy-efficient design.",
  },
  {
    id: "3",
    title: "Garage Conversion ADU",
    location: "Chula Vista, CA",
    sqft: "600 sq ft",
    type: "ADU",
    image: "/images/projects/adu-exterior-side.png",
    description: "A complete garage-to-ADU conversion featuring a bedroom, full bathroom, kitchenette, and living area. An efficient transformation that maximizes existing space.",
  },
  {
    id: "4",
    title: "Modern Kitchen Remodel",
    location: "Carlsbad, CA",
    sqft: "Kitchen",
    type: "Remodel",
    image: "/images/projects/kitchen-remodel.png",
    description: "A full kitchen remodel with custom cabinetry, quartz countertops, modern appliances, and an open layout. Designed for both functionality and style.",
  },
  {
    id: "5",
    title: "Custom Home Build",
    location: "Encinitas, CA",
    sqft: "3,200 sq ft",
    type: "Custom Homes",
    image: "/images/projects/bedroom-interior.png",
    description: "A custom-built home featuring modern architecture, open living spaces, and premium finishes throughout. Designed for comfortable family living with attention to every detail.",
  },
  {
    id: "6",
    title: "Bathroom Renovation",
    location: "Del Mar, CA",
    sqft: "Bathroom",
    type: "Remodel",
    image: "/images/projects/bathroom-renovation.png",
    description: "A complete bathroom renovation with custom tile work, a walk-in shower, modern vanity, and updated fixtures. Clean, contemporary design with premium materials.",
  },
];

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary mb-4">Project Not Found</h1>
          <Link href="/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex((p) => p.id === id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
            <span className="block text-xs font-semibold text-primary bg-white/10 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full mb-3 border border-white/10">
              {project.type}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {project.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4" />
                {project.sqft}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-secondary mb-4">About This Project</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {project.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Start a Similar Project <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/build-your-adu">
              <Button size="lg" variant="outline">
                Design Your ADU
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {prevProject ? (
              <Link href={`/gallery/${prevProject.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">{prevProject.title}</span>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link href={`/gallery/${nextProject.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
                <span className="text-sm">{nextProject.title}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </div>
  );
}
