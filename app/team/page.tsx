import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TEAM } from "@/lib/data/team";

export const metadata: Metadata = {
  title: "Meet the Team",
  description:
    "Meet the people behind TruthCore: the founder, operations, design, project management, land development, and finance team building across San Diego County.",
};

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Our Team
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Meet the Team</h1>
            <p className="text-xl text-white/80">
              The people who answer your call, draw your plans, run your jobsite, and keep every number honest.
            </p>
          </div>
        </div>
      </section>

      {/* Team cards: each image already carries the name, title and bio. */}
      <section className="relative py-20 border-t border-white/10 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(51,102,102,0.25),transparent_60%)]" />
        <div className="relative container mx-auto px-4">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member, i) => (
              <li
                key={member.name}
                className="overflow-hidden rounded-2xl border border-white/10 bg-secondary-light shadow-lg shadow-black/20"
              >
                <Image
                  src={member.image}
                  alt={`${member.name}, ${member.title}. ${member.bio}`}
                  width={1200}
                  height={1500}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full"
                  priority={i < 3}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Work With a Team You Can Trust</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Honest answers, real numbers, and people who take accountability &mdash; from the first call to the
            final walkthrough.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" rounded="full" className="w-full sm:w-auto">
              <Link href="/contact">Start Your Project</Link>
            </Button>
            <Button asChild size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
              <Link href="/our-story">Read Our Story</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
