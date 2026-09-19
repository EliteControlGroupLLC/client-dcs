import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDER, FOUNDER_STORY_TEASER, FOUNDER_TEASER_QUOTE } from "@/lib/data/founder-story";
import { Logo } from "@/components/layout/logo";

/** Homepage teaser for the founder's story (/our-story). */
export function FounderStory() {
  return (
    <section className="py-20 relative overflow-hidden bg-secondary">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              How{" "}
              <Logo variant="light" inline className="h-[0.74em] align-[-0.02em] mx-[0.02em]" />{" "}
              Was Born
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">{FOUNDER_STORY_TEASER}</p>
            <Button asChild size="lg" rounded="full" className="group w-full sm:w-auto">
              <Link href="/our-story">
                Read the Full Story
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <figure className="rounded-2xl border border-accent/40 bg-secondary-light p-6 sm:p-8 shadow-lg shadow-black/20">
            <blockquote className="space-y-4">
              <p className="font-serif text-2xl md:text-3xl italic leading-snug text-white/90">
                &ldquo;{FOUNDER_TEASER_QUOTE}&rdquo;
              </p>
              <p className="font-serif text-4xl md:text-5xl italic leading-none text-accent">Not anymore.</p>
            </blockquote>
            <div className="mt-6 h-px w-12 bg-accent/60" aria-hidden="true" />
            <figcaption className="mt-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-light">{FOUNDER.name}</p>
              <p className="mt-1 text-sm text-white/65">{FOUNDER.title}</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
