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

const features = [
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "No hidden fees or surprise costs. Get detailed, itemized quotes upfront so you know exactly what you're paying for.",
  },
  {
    icon: Shield,
    title: "Fixed-Price Contracts",
    description: "Lock in your price from the start. Our contracts protect you from cost overruns and unexpected expenses.",
  },
  {
    icon: Users,
    title: "In-House Team",
    description: "From architects to craftsmen, our entire team is in-house. Better communication, quality control, and accountability.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We respect your timeline. Our project management ensures milestones are met and your project stays on schedule.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "Premium materials and expert craftsmanship backed by comprehensive warranties. We stand behind our work.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Your dedicated project manager is always just a call away. Real-time updates and responsive communication.",
  },
];

const testimonial = {
  quote: "DCS made our ADU project seamless from start to finish. Their transparent pricing and professional team exceeded our expectations. We're now earning $2,800/month in rental income!",
  author: "Sarah & Michael Thompson",
  location: "La Mesa, CA",
  project: "650 sq ft ADU",
  rating: 5,
};

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            The DCS Difference
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            We&apos;re not just contractors—we&apos;re your partners in bringing your vision to life. 
            Here&apos;s what sets us apart from the rest.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">ST</span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-white/60">{testimonial.location} • {testimonial.project}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white/10 rounded-2xl p-6">
                <h4 className="font-semibold mb-4 text-center">What Our Clients Say</h4>
                <div className="space-y-4">
                  {[
                    { label: "Communication", value: 98 },
                    { label: "Quality of Work", value: 99 },
                    { label: "On-Time Delivery", value: 97 },
                    { label: "Would Recommend", value: 100 },
                  ].map((stat) => (
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

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {["500+ Projects", "15+ Years", "4.9★ Rating", "$50M+ Value"].map((badge) => (
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
