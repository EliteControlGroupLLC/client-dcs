import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Homes",
};

const journeySections = [
  {
    number: "01",
    title: "Your Vision, Our Starting Point",
    description:
      "Every custom home begins with a conversation. We sit down with you to understand how you live — how you cook, how you entertain, where your family gathers, and what moments matter most. This is not about checking boxes on a floor plan. It is about designing a home that feels like it was always meant to be yours.",
  },
  {
    number: "02",
    title: "Architecture That Reflects You",
    description:
      "Our design team translates your lifestyle into architecture. We align exterior form with interior flow so that every room connects with intention. From the entry sequence to the way natural light moves through your home at different hours of the day, every detail is considered before a single wall goes up.",
  },
  {
    number: "03",
    title: "Materials, Lighting, and Mood",
    description:
      "We guide you through material selections, lighting design, and interior finishes that work together to create atmosphere. Warm wood tones against clean plaster. Recessed lighting that shifts the mood from morning energy to evening calm. The goal is a home that feels as good as it looks — a space where texture, light, and proportion come together.",
  },
  {
    number: "04",
    title: "Indoor-Outdoor Living, Designed for San Diego",
    description:
      "San Diego living is about the connection between inside and out. We design seamless transitions — sliding walls that open to courtyards, kitchens that extend to outdoor dining, and private retreats that blur the line between interior comfort and the California landscape. Your home should breathe with the climate.",
  },
  {
    number: "05",
    title: "Guided Through Every Decision",
    description:
      "Building a custom home involves hundreds of decisions. We walk beside you through every one — from structural engineering and permit strategy to cabinet hardware and paint finish. Our project platform gives you real-time visibility into schedules, progress photos, and approvals so you always know exactly where your home stands.",
  },
  {
    number: "06",
    title: "The Moment You Walk In",
    description:
      "There is a moment at the end of every project that makes everything worth it. The front door opens. The light hits the floors the way you imagined. The kitchen feels exactly right. The view from the bedroom is everything you hoped for. That moment — when you stand in a space that was built around your life — is what we build toward.",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Discovery and Design Vision",
    description: "We learn how you live and translate your lifestyle into a design concept that shapes every decision moving forward.",
  },
  {
    step: 2,
    title: "Architecture and Interior Alignment",
    description: "Floor plans, elevations, material palettes, and lighting concepts are developed together as one cohesive vision.",
  },
  {
    step: 3,
    title: "Engineering, Permits, and Pre-Construction",
    description: "Structural engineering, city permits, and construction planning are managed by our team so you can focus on the exciting parts.",
  },
  {
    step: 4,
    title: "Construction with Full Visibility",
    description: "Your home is built by our in-house team with organized scheduling, quality inspections, and real-time project updates through our client platform.",
  },
  {
    step: 5,
    title: "Final Walkthrough and Delivery",
    description: "We walk through every room together, address final details, and hand you the keys to a home that was designed around your life.",
  },
];

export default function CustomHomesPage() {
  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              CUSTOM HOMES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              A Home Designed Around <span className="text-accent">Your Life</span>
            </h1>
            <p className="text-xl text-white/80 mb-4">
              Building a custom home is one of the most personal things you will ever do.
              It deserves a team that treats your vision with the same care you would —
              from the first sketch to the final walkthrough.
            </p>
            <p className="text-lg text-white/75 mb-8">
              We are a boutique design-build firm in San Diego that brings together architecture,
              interior design, and construction under one roof. Every home we build is a
              collaboration — shaped by how you live, not by a template.
            </p>
            <Button asChild size="lg" rounded="full" className="group">
              <Link href="/contact">
                Start Your Custom Home Journey <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Custom Home Journey */}
      <section className="py-20 bg-secondary border-t border-white/10 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              THE JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Building a Custom Home Feels Like
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              This is not a checklist. It is an experience — one that should feel
              exciting, intentional, and deeply personal from beginning to end.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            {journeySections.map((section) => (
              <div key={section.number} className="relative pl-20">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-secondary border-2 border-accent/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">{section.number}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <p className="text-white/80 leading-relaxed text-lg">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-secondary border-t border-white/10 text-white bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              OUR PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How We Build Your Custom Home
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              A structured, transparent process designed to keep you informed
              and confident at every stage.
            </p>
          </div>

          {/* 5 steps: 2 per row on small tablets, 3 + 2 on tablets, one row of 5 on desktop — odd rows stay centered */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 max-w-6xl mx-auto">
            {processSteps.map((item) => (
              <div key={item.step} className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)] text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-balance">{item.title}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Emotional CTA */}
      <section className="py-20 bg-secondary border-t border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Imagine Walking Into Your Finished Home at Sunset
            </h2>
            <p className="text-lg text-white/80 mb-4">
              The light is warm. The floors feel right underfoot. The kitchen opens to the patio
              exactly the way you pictured it. Your family is already making it theirs.
            </p>
            <p className="text-lg text-white/80 mb-8">
              That feeling — of standing in a space that was built around your life — is what
              we work toward from day one. Every material, every decision, every detail leads here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" rounded="full" className="group">
                <Link href="/contact">
                  Start Your Custom Home Journey <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outlineWhite" rounded="full">
                <Link href="/gallery">
                  View Our Work
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
