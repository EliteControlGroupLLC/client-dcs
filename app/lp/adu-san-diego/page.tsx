import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { CheckCircle, Shield, Clock, Star } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "San Diego ADU Builder | Free Quote | Distinct Construction Solutions",
  description:
    "Build your dream ADU in San Diego. Detached ADUs at $427/sq ft. Licensed, bonded, and insured. Fixed-price contracts. Average 4-month build time. Get your free quote today.",
  openGraph: {
    title: "San Diego ADU Builder | Detached ADUs at $427/sq ft",
    description:
      "Build your dream ADU in San Diego. Licensed & bonded. Fixed-price contracts. Free consultation.",
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
      <section className="bg-secondary text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  San Diego&apos;s #1 ADU Builder
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Build Your Dream
                <span className="text-primary"> ADU in San Diego</span>
              </h1>

              <p className="text-lg text-white/80 mb-6">
                Detached ADUs at <span className="text-primary font-bold text-2xl">$427/sq ft</span>. Garage conversions from <span className="text-primary font-bold text-2xl">$120,000</span>.
                We handle everything — design, permits, and construction. One team, one price, zero stress.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="h-4 w-4 text-primary" />
                  4-Month Average Build
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Star className="h-4 w-4 text-primary" />
                  500+ Projects Completed
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Lead Form */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
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
      <section className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-secondary font-semibold text-sm md:text-base">
            <span>500+ Projects</span>
            <span>•</span>
            <span>15+ Years Experience</span>
            <span>•</span>
            <span>Licensed & Bonded</span>
            <span>•</span>
            <span>$50M+ Value Delivered</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="font-bold text-secondary mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Image */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-secondary mb-8">
            Our Recent Work
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-balcony.webp"
                alt="Modern ADU with balcony in San Diego"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-yard.webp"
                alt="Two-bedroom ADU with yard"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/projects/kitchen-remodel.webp"
                alt="Modern kitchen remodel"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary py-16 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your ADU?
          </h2>
          <p className="text-white/70 mb-8">
            Get a free, no-obligation quote in 24 hours. Call us or fill out the form above.
          </p>
          <a
            href="tel:+18588330705"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-primary-dark transition-colors"
          >
            Call (858) 833-0705
          </a>
        </div>
      </section>
    </div>
  );
}
