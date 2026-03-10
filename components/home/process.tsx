"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenTool, HardHat, Key, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Free Consultation",
    description: "Share your vision with us. We'll assess your property, discuss your goals, and provide initial guidance on feasibility and budget.",
    duration: "1-2 Days",
  },
  {
    number: "02",
    icon: PenTool,
    title: "Design & Permits",
    description: "Our in-house architects create custom plans. We handle all permits and approvals, keeping you informed every step of the way.",
    duration: "4-8 Weeks",
  },
  {
    number: "03",
    icon: HardHat,
    title: "Construction",
    description: "Our expert crews bring your project to life with quality materials and meticulous attention to detail. Weekly progress updates included.",
    duration: "4-6 Months",
  },
  {
    number: "04",
    icon: Key,
    title: "Final Walkthrough",
    description: "We conduct a thorough inspection together, address any items, and hand over the keys to your completed project with full warranty.",
    duration: "1 Week",
  },
];

export function Process() {
  return (
    <section className="py-24 bg-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 text-balance">
            Simple, Transparent Process
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We've streamlined our process to make your construction experience as smooth as possible. 
            Here's how we turn your vision into reality.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                  {/* Number badge */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 mx-auto lg:mx-0">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>

                  <div className="text-center lg:text-left">
                    <span className="text-5xl font-bold text-primary/10">{step.number}</span>
                    <h3 className="text-xl font-bold text-secondary mt-2 mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {step.duration}
                    </span>
                  </div>
                </div>

                {/* Arrow connector - mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-4 lg:hidden">
                    <ArrowRight className="h-6 w-6 text-primary rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/process">
            <Button size="lg" rounded="full">
              Learn More About Our Process
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
