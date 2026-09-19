import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "Our Process",
};

export default function ProcessPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              OUR PROCESS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent, Proven Process
            </h1>
            <p className="text-xl text-white/80">
              We&apos;ve structured our process to help homeowners plan with confidence and move
              smoothly from idea to completed project.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary border-t border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {PROCESS_STEPS.map((item) => {
              return (
                <div key={item.step} className="flex gap-4 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 ring-4 ring-secondary shadow-lg shadow-black/20">
                      {item.step}
                    </div>
                    {item.step < PROCESS_STEPS.length && (
                      <div className="w-0.5 flex-1 bg-accent/30 -mb-6 mt-2" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 rounded-2xl bg-secondary-light border border-white/10 shadow-lg shadow-black/20 p-6 transition-colors hover:border-accent/50">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <span className="text-xs font-semibold text-accent-light bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
                        {item.timeline}
                      </span>
                    </div>
                    <p className="text-white/80">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] border-t border-white/10 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Take the first step toward your dream project. Our team is ready to guide you through every step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" className="w-full sm:w-auto">
                Build Your ADU <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
