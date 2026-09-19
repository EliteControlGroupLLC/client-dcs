"use client";

import { 
  Shield, 
  DollarSign, 
  Users, 
  Clock, 
  Award, 
  Headphones,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";
import { COMPANY_INFO, getYearsExperience } from "@/lib/data/site-data";

const features = [
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "No hidden fees or surprise costs. We provide clear project guidance and realistic pricing so you understand exactly what to expect before construction begins.",
  },
  {
    icon: Shield,
    title: "Fixed-Price Contracts",
    description: "Because we design every project in-house before construction begins, we can offer true fixed pricing. Your contract locks in the cost from day one — no surprises, no change-order confusion.",
  },
  {
    icon: Users,
    title: "In-House Team",
    description: "We operate as a full ecosystem — design, estimating, planning, project coordination, and construction all under one roof. This means faster decisions, fewer delays, and full accountability at every stage.",
  },
  {
    icon: Clock,
    title: "Reliable Project Delivery",
    description: "Every project is managed through our internal project platform where clients can view schedules, progress photos, updates, RFIs, and change orders in real time — keeping you informed and in control.",
  },
  {
    icon: Award,
    title: "Quality Control",
    description: "We use internal quality control checklists and multiple inspections at every stage to ensure work meets our standards before moving forward. Nothing gets signed off until it passes our review process.",
  },
  {
    icon: Headphones,
    title: "Dedicated Project Support",
    description: "Your project manager remains your primary point of contact throughout construction, providing updates, guidance, and responsive communication.",
  },
];

const bottomMetrics = [
  `${COMPANY_INFO.stats.projectsCompleted} Projects`,
  `${getYearsExperience()}+ Years Experience`,
  `${COMPANY_INFO.stats.valueDelivered} Project Value Delivered`,
];

export function WhyChooseUs() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible, getDelay } = useStaggeredAnimation(100);

  return (
    <section className="py-20 bg-secondary text-white relative overflow-hidden">
      {/* Subtle lighting texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(111,163,163,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(111,163,163,0.05),transparent_50%)]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            The TruthCore Difference
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Premium residential work depends on tighter systems, better planning, and cleaner execution.
            That is the standard we build around from the first pricing conversation through final delivery.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              style={{ transitionDelay: gridVisible ? getDelay(index) : "0ms" }}
              className={`bg-secondary-light rounded-2xl p-8 border border-white/10 shadow-lg shadow-black/20 hover:border-accent/50 transition-all duration-500 group ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6 group-hover:bg-primary-dark transition-colors shadow-lg shadow-black/20">
                <feature.icon className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-secondary-light rounded-2xl p-6 sm:p-8 lg:p-12 border border-white/10 shadow-lg shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">
                Client Experience Standard
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Built to feel organized before construction even starts
              </h3>
              <p className="text-white/80 leading-relaxed max-w-2xl">
                Homeowners choose TruthCore when they want more than a bid and a promise. We build the
                project around scope clarity, permit readiness, premium detailing, and consistent
                communication so the experience feels controlled from the start.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-secondary p-6 sm:p-8">
              <p className="text-sm font-semibold text-white mb-3">Real client reviews</p>
              <p className="text-sm leading-relaxed text-white/80">
                Every review on this site is a real Google or Yelp review from a homeowner we
                worked with, quoted word for word.
              </p>
              <a
                href="#reviews"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light transition-colors"
              >
                Read client reviews
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12">
          {bottomMetrics.map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-white/75">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
