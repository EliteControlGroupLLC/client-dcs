import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  return { title: project ? project.title : "Project Not Found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return (
      <div className="min-h-screen">
        <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
                GALLERY
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Project Not Found</h1>
              <p className="text-xl text-white/80 mb-8">We couldn&apos;t find that project.</p>
              <Link href="/gallery" className="inline-block w-full sm:w-auto">
                <Button size="lg" rounded="full" className="w-full sm:w-auto">
                  <ArrowLeft className="h-5 w-5" /> Back to Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentIndex = GALLERY_PROJECTS.findIndex((item) => item.id === id);
  const prevProject = currentIndex > 0 ? GALLERY_PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < GALLERY_PROJECTS.length - 1 ? GALLERY_PROJECTS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh] bg-secondary">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-secondary/20" />
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-4">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
            <span className="block w-fit rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm mb-4">
              {project.type}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
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
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]">
        <div className="container mx-auto px-4 max-w-3xl">
          {project.imageStatus === "pending-replacement" && project.imageNote && (
            <div className="mb-8 rounded-2xl border border-accent/30 bg-secondary-light p-5 shadow-lg shadow-black/20">
              <p className="text-sm font-semibold text-accent-light">Visual asset pending</p>
              <p className="mt-1 text-sm text-white/75">{project.imageNote}</p>
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About This Project</h2>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            {project.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" className="w-full sm:w-auto">
                Start a Similar Project <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/build-your-adu" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" variant="outlineWhite" className="w-full sm:w-auto">
                Design Your ADU
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 bg-secondary border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center gap-6">
            {prevProject ? (
              <Link href={`/gallery/${prevProject.id}`} className="flex items-center gap-2 min-h-11 text-white/75 hover:text-accent-light transition-colors">
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="text-sm">{prevProject.title}</span>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link href={`/gallery/${nextProject.id}`} className="flex items-center gap-2 min-h-11 text-right ml-auto text-white/75 hover:text-accent-light transition-colors">
                <span className="text-sm">{nextProject.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </div>
  );
}
