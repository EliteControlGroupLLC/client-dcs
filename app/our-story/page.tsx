import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Camera, FileText, HardHat, IdCard, MessagesSquare, Sparkles, type LucideIcon } from "lucide-react";
import { FOUNDER, FOUNDER_STORY } from "@/lib/data/founder-story";
import { Logo } from "@/components/layout/logo";

const listIcons: Record<string, LucideIcon> = {
  Documentation: FileText,
  "Progress photos": Camera,
  "RFIs & coordination": MessagesSquare,
  Warranties: BadgeCheck,
  "Employee compliance": IdCard,
  Safety: HardHat,
  "Site cleanliness": Sparkles,
};

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              How{" "}
              <Logo variant="light" inline className="h-[0.74em] align-[-0.02em] mx-[0.02em]" />{" "}
              Was Born
            </h1>
            <p className="text-xl text-white/80">
              Who we are, why we exist, and how Distinct Construction Solutions became TruthCore &mdash; in
              our founder&apos;s own words.
            </p>
          </div>
        </div>
      </section>

      {/* The letter — dark, per owner (no white backgrounds) */}
      <section className="relative py-20 border-t border-white/10 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(51,102,102,0.25),transparent_60%)]" />
        <article className="relative container mx-auto px-4 max-w-3xl">
          {FOUNDER_STORY.map((section, i) => {
            const renderParagraph = (p: string, j: number) => (
              <p
                key={j}
                className={
                  i === 0 && j === 0
                    ? "font-serif text-2xl md:text-3xl leading-snug text-white"
                    : "text-lg leading-relaxed text-white/80"
                }
              >
                {p}
              </p>
            );
            const split = section.list ? section.listAfter ?? section.paragraphs.length : section.paragraphs.length;
            return (
              <div key={i} className={i === 0 ? "" : "mt-14"}>
                {section.heading && (
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">{section.heading}</h2>
                )}
                <div className="space-y-5">{section.paragraphs.slice(0, split).map(renderParagraph)}</div>
                {section.list && (
                  <ul className="my-8 grid gap-4 sm:grid-cols-2">
                    {section.list.map((item, k, all) => {
                      const Icon = listIcons[item.title] ?? BadgeCheck;
                      // Odd count: the last card spans both columns so the grid ends evenly.
                      const spanLast = all.length % 2 === 1 && k === all.length - 1;
                      return (
                        <li
                          key={item.title}
                          className={`flex items-start gap-4 rounded-2xl border border-white/10 bg-secondary-light p-5 shadow-lg shadow-black/20 ${
                            spanLast ? "sm:col-span-2" : ""
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                            <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block font-semibold text-white">{item.title}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-white/75">{item.text}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {split < section.paragraphs.length && (
                  <div className="space-y-5">
                    {section.paragraphs.slice(split).map((p, j) => renderParagraph(p, split + j))}
                  </div>
                )}
                {section.pullQuote && (
                  <blockquote className="mt-10 border-l-2 border-accent pl-6">
                    <p className="font-serif text-3xl md:text-4xl italic leading-tight text-accent">
                      &ldquo;{section.pullQuote}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
            );
          })}

          {/* Signature */}
          <div className="mt-16 border-t border-white/10 pt-8">
            <p className="font-serif text-3xl italic text-white">{FOUNDER.name}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-accent">{FOUNDER.title}</p>
            <p className="mt-1 text-sm text-white/65">TruthCore, a DBA of Distinct Construction Solutions</p>
          </div>
        </article>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
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
