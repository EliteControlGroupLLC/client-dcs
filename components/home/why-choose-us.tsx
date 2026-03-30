"use client";

import { 
  Shield, 
  DollarSign, 
  Users, 
  Clock, 
  Award, 
  Headphones,
  CheckCircle,
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
    <section className="py-24 bg-secondary text-white relative overflow-hidden">
      {/* Subtle premium grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Subtle lighting texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(62,205,162,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(62,205,162,0.05),transparent_50%)]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            The Distinct Construction Solutions Difference
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Premium residential work depends on tighter systems, better planning, and cleaner execution.
            That is the standard we build around from the first pricing conversation through final delivery.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              style={{ transitionDelay: gridVisible ? getDelay(index) : "0ms" }}
              className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors shadow-lg shadow-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-3">
                Client Experience Standard
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Built to feel organized before construction even starts
              </h3>
              <p className="text-white/70 leading-relaxed max-w-2xl">
                Homeowners choose DCS when they want more than a bid and a promise. We build the
                project around scope clarity, permit readiness, premium detailing, and consistent
                communication so the experience feels controlled from the start.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
              <p className="text-sm font-semibold text-white mb-3">Real review integration</p>
              <p className="text-sm leading-relaxed text-white/65">
                Verified Google and Yelp review excerpts are being curated for client approval. No
                placeholder quotes are shown here until approved copy is supplied.
              </p>
              <a
                href="https://www.google.com/search?q=Distinct+Construction+Solutions+Chula+Vista+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
              >
                View public review profiles
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {bottomMetrics.map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-white/60">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
