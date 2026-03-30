import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MapPin, Ruler } from "lucide-react";
import { GALLERY_PROJECTS, getProjectById } from "@/lib/data/site-data";

export function generateStaticParams() {
  return GALLERY_PROJECTS.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProjectById(id);

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

  const currentIndex = GALLERY_PROJECTS.findIndex((item) => item.id === id);
  const prevProject = currentIndex > 0 ? GALLERY_PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < GALLERY_PROJECTS.length - 1 ? GALLERY_PROJECTS[currentIndex + 1] : null;

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
          {project.imageStatus === "pending-replacement" && project.imageNote && (
            <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-secondary">Visual asset pending</p>
              <p className="mt-1 text-sm text-muted-foreground">{project.imageNote}</p>
            </div>
          )}
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
