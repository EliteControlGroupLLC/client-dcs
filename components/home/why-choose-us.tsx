"use client";

import { 
  Shield, 
  DollarSign, 
  Users, 
  Clock, 
  Award, 
  Headphones,
  CheckCircle,
  Star
} from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation";

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

const testimonial = {
  quote: "Our ADU project was seamless from start to finish. The transparent pricing and professional team exceeded our expectations. We're now earning $2,800/month in rental income.",
  author: "Sarah & Michael Thompson",
  location: "La Mesa, CA",
  project: "650 sq ft ADU",
  rating: 5,
};

const satisfactionStats = [
  { label: "Communication", value: 100 },
  { label: "Quality of Work", value: 99 },
  { label: "On-Time Delivery", value: 95 },
  { label: "Would Recommend", value: 100 },
];

const bottomMetrics = [
  "500+ Projects",
  "15+ Years Experience",
  "$50M+ Project Value Delivered",
];

export function WhyChooseUs() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible, getDelay } = useStaggeredAnimation(100);
  const { ref: testimonialRef, isVisible: testimonialVisible } = useScrollAnimation();

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
            We're not just contractors — we're your partners in bringing your vision to life. 
            Here's what sets Distinct Construction Solutions apart.
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

        {/* Testimonial */}
        <div ref={testimonialRef} className={`bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10 transition-all duration-700 delay-200 ${testimonialVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">ST</span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-white/60">{testimonial.location} — {testimonial.project}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                <h4 className="font-semibold mb-4 text-center">Client Satisfaction</h4>
                <div className="space-y-4">
                  {satisfactionStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{stat.label}</span>
                        <span className="font-medium">{stat.value}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
