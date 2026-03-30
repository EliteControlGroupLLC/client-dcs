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
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";
import { PROCESS_STEPS } from "@/lib/data/site-data";

const stepIcons = [Laptop, Wallet, FileCheck, HardHat, Key];

export function Process() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible, getDelay } = useStaggeredAnimation(120);

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
        <div className="absolute inset-0 bg-secondary/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/95 via-secondary/85 to-secondary/95" />
      </div>
      {/* Architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
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

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              return (
              <div
                key={step.number}
                className="relative"
                style={{ transitionDelay: stepsVisible ? getDelay(index) : "0ms" }}
              >
                {/* Step card */}
                <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 h-full hover:bg-white/15 hover:border-white/30 transition-all duration-500 ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  {/* Icon circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-5 mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
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
                    <p className="text-white/60 text-sm leading-relaxed mb-4 text-center text-balance">
                      {step.description}
                    </p>

                    {/* Timeline badge */}
                    <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                      {step.timeline}
                    </span>
                  </div>
                </div>

                {/* Arrow connector - mobile/tablet */}
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="flex justify-center py-4 lg:hidden">
                    <ArrowRight className="h-5 w-5 text-primary/50 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>
    </section>
  );
}
