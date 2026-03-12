"use client";

import Image from "next/image";
import {
  Laptop,
  Wallet,
  FileCheck,
  HardHat,
  Key,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Laptop,
    title: "Design Your ADU & Get Pricing",
    description:
      "Use our online planning tools to explore what you can build on your property. Choose your ADU type, layout, size, and style to see realistic pricing and project possibilities.",
    timeline: "1 Day",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Funding & Pre-Approval",
    description:
      "Once you understand the project scope and estimated cost, we help review funding options and confirm your project budget. This step ensures the project is financially ready to move forward.",
    timeline: "2–3 Days",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Design, Engineering & Permits",
    description:
      "Our team prepares architectural plans, coordinates engineering, and manages the permitting process with the city. We guide the project through approvals so construction can begin.",
    timeline: "6–9 Months",
  },
  {
    number: "04",
    icon: HardHat,
    title: "Construction",
    description:
      "Our construction team builds your project using professional project management, organized scheduling, and clear progress updates.",
    timeline: "3–4 Months",
  },
  {
    number: "05",
    icon: Key,
    title: "Final Walkthrough",
    description:
      "We walk through the completed project with you, address final details, and ensure everything meets expectations before delivering the finished space.",
    timeline: "About 1 Week",
  },
];

export function Process() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/process-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-secondary/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/95 via-secondary/85 to-secondary/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            OUR PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Simple, Transparent, Proven Process
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            We've structured our process to help homeowners plan with confidence
            and move smoothly from idea to completed project. Here's how we turn
            your vision into reality.
          </p>
        </div>

        {/* Steps - Horizontal Flow */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 h-full hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                  {/* Icon circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-5 mx-auto">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>

                  <div className="text-center">
                    {/* Step number */}
                    <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                      Step {step.number}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mt-2 mb-3 text-balance">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Timeline badge */}
                    <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                      {step.timeline}
                    </span>
                  </div>
                </div>

                {/* Arrow connector - mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-4 lg:hidden">
                    <ArrowRight className="h-5 w-5 text-primary/50 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
