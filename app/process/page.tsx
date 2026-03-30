import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, DollarSign, FileText, Hammer, CheckCircle } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/data/site-data";

const stepIcons = [Pencil, DollarSign, FileText, Hammer, CheckCircle];

export default function ProcessPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              OUR PROCESS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent, Proven Process
            </h1>
            <p className="text-xl text-white/80 mb-8">
              We&apos;ve structured our process to help homeowners plan with confidence and move
              smoothly from idea to completed project.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {PROCESS_STEPS.map((item, index) => {
              const Icon = stepIcons[index];
              return (
                <div key={item.step} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {item.step}
                    </div>
                    {item.step < PROCESS_STEPS.length && (
                      <div className="w-0.5 h-full bg-primary/20 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-secondary">{item.title}</h3>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {item.timeline}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Take the first step toward your dream project. Our team is ready to guide you through every step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-your-adu">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Build Your ADU <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
