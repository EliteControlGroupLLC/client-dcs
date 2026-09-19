import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { CheckCircle, Shield, Clock, Star, Phone } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO, SERVICE_PRICING, getYearsExperience } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "San Diego ADU Builder | Free Quote | TruthCore",
  description:
    "Build your dream ADU in San Diego. Detached ADUs starting at $175,000 and garage conversions starting at $155,000. Licensed, bonded, and insured. Get your free quote today.",
  openGraph: {
    title: "San Diego ADU Builder | Detached ADUs Starting at $175,000",
    description:
      "Build your dream ADU in San Diego. Detached ADUs starting at $175,000. Licensed, bonded, and insured. Free consultation.",
    images: ["/images/og-image.jpg"],
  },
};

const benefits = [
  "Fixed-price contracts — no surprises",
  "In-house design & build team",
  "Average 4-month build time",
  "All permits handled for you",
  "Licensed, bonded & insured",
  "500+ projects completed",
];

const steps = [
  { step: "1", title: "Free Consultation", desc: "Tell us about your project" },
  { step: "2", title: "Custom Design", desc: "We create your ADU plan" },
  { step: "3", title: "Fixed-Price Quote", desc: "No hidden fees, guaranteed" },
  { step: "4", title: "We Build It", desc: "Sit back while we handle everything" },
];

export default function ADUSanDiegoLP() {
  return (
    <div className="min-h-screen">
      {/* Hero — No Navigation, focused on conversion */}
      <section className="bg-secondary text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-primary-light" />
                <span className="text-sm text-primary-light font-medium">
                  San Diego&apos;s #1 ADU Builder
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Build Your Dream
                <span className="text-primary-light"> ADU in San Diego</span>
              </h1>

              <p className="text-xl text-white/80 mb-6">
                Detached ADUs starting at <span className="text-primary-light font-bold">{SERVICE_PRICING.adu.detachedStartingPrice}</span>. Garage conversions from <span className="text-primary-light font-bold">{SERVICE_PRICING.adu.startingPrice}</span>.
                We handle everything — design, permits, and construction. One team, one price, zero stress.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="h-4 w-4 text-primary-light" />
                  4-Month Average Build
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Star className="h-4 w-4 text-primary-light" />
                  500+ Projects Completed
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-primary-light shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Lead Form */}
            <div id="lead-form" className="bg-white rounded-2xl p-8 shadow-2xl">
              <LeadForm
                source="google-ads-adu-san-diego"
                heading="Get Your Free ADU Quote"
                buttonText="Get My Free Quote"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <ul className="grid grid-cols-2 gap-y-2 text-center md:flex md:flex-wrap md:justify-center md:gap-x-8 text-white font-semibold text-sm md:text-base">
            {["500+ Projects", `${getYearsExperience()}+ Years Experience`, "Licensed & Bonded", "$50M+ Value Delivered"].map((item, i) => (
              <li key={item} className="md:flex md:items-center md:gap-8">
                {i > 0 && <span aria-hidden className="hidden md:inline text-white/60">•</span>}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold text-secondary mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Image */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12">
            Our Recent Work
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-balcony.webp"
                alt="Modern ADU with balcony in San Diego"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-yard.webp"
                alt="Two-bedroom ADU with yard"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/kitchen-remodel.webp"
                alt="Modern kitchen remodel"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your ADU?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Get a free, no-obligation quote in 24 hours. Call us or fill out the form above.
          </p>
          <a href={`tel:${COMPANY_INFO.phoneHref}`} className="inline-block">
            <Button size="lg" rounded="full">
              <Phone className="h-5 w-5" />
              Call {COMPANY_INFO.phone}
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
