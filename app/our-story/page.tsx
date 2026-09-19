import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FOUNDER, FOUNDER_STORY } from "@/lib/data/founder-story";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How TruthCore was born: after 12 years in construction, founder Jordan Talavera set out to build a general contractor people can actually trust.",
};

export default function OurStoryPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">How TruthCore Was Born</h1>
            <p className="text-xl text-white/80">
              Who we are, why we exist, and how Distinct Construction Solutions became TruthCore &mdash; in
              our founder&apos;s own words.
            </p>
          </div>
        </div>
      </section>

      {/* The letter */}
      <section className="py-20 bg-white">
        <article className="container mx-auto px-4 max-w-3xl">
          {FOUNDER_STORY.map((section, i) => (
            <div key={i} className={i === 0 ? "" : "mt-12"}>
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">{section.heading}</h2>
              )}
              <div className="space-y-5">
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className={`text-lg leading-relaxed text-secondary/80 ${
                      i === 0 && j === 0 ? "font-serif text-2xl md:text-3xl leading-snug text-secondary" : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
              {section.pullQuote && (
                <blockquote className="mt-10 border-l-2 border-accent pl-6">
                  <p className="font-serif text-3xl md:text-4xl italic leading-tight text-primary">
                    &ldquo;{section.pullQuote}&rdquo;
                  </p>
                </blockquote>
              )}
            </div>
          ))}

          {/* Signature */}
          <div className="mt-14 border-t border-border pt-8">
            <p className="font-serif text-3xl italic text-secondary">{FOUNDER.name}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">{FOUNDER.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">TruthCore, a DBA of Distinct Construction Solutions</p>
          </div>
        </article>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Work With a Contractor You Can Trust</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Honest answers, real numbers, and a team that takes accountability &mdash; from the first call to the
            final walkthrough.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full" className="w-full sm:w-auto">
              <Link href="/contact">Start Your Project</Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
              <Link href="/#reviews">Read Client Reviews</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
