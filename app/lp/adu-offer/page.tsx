"use client";

import { LeadForm } from "@/components/lead-form";
import { CheckCircle, Phone, Star, ArrowRight } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah M.",
    location: "La Jolla, CA",
    text: "DCS built our 600 sq ft ADU in just 4 months. The whole process was seamless — from design to move-in.",
    rating: 5,
  },
  {
    name: "James R.",
    location: "Pacific Beach, CA",
    text: "We converted our garage into a beautiful studio ADU. It now generates $2,500/month in rental income!",
    rating: 5,
  },
  {
    name: "Maria L.",
    location: "Chula Vista, CA",
    text: "Best decision we made. Our mother-in-law now has her own space right in our backyard. DCS made it easy.",
    rating: 5,
  },
];

export default function ADUOfferLP() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero — Visual-first for Meta/Social */}
      <section className="relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/projects/adu-exterior-yard.webp"
            alt="Beautiful ADU in San Diego backyard"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium">Limited Time Offer</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Your Backyard Could Be
                <span className="text-primary block">Earning You $2,500/mo</span>
              </h1>

              <p className="text-xl text-white/80 mb-6">
                Build an ADU in your San Diego backyard. We handle design, permits, and construction — all for a fixed price starting at <span className="text-primary font-bold">$175K</span>.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">$2,500+</div>
                  <div className="text-sm text-white/70">Monthly Rental Income</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">30%+</div>
                  <div className="text-sm text-white/70">Property Value Increase</div>
                </div>
              </div>

              <a
                href="tel:+18588330705"
                className="inline-flex items-center gap-2 text-white/80 hover:text-primary transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>Or call us: (858) 833-0705</span>
              </a>
            </div>

            {/* Lead Form */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <LeadForm
                source="meta-ads-adu-offer"
                heading="Claim Your Free Design Consultation"
                buttonText="Get Started — It's Free"
              />

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">5.0 rating</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Join 500+ happy homeowners who built with DCS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — Key for Meta Ads */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-secondary text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ADU Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-secondary mb-4">
            Why Build an ADU?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            San Diego homeowners are adding ADUs to generate income, house family, and increase property value.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Rental Income", desc: "Earn $2,000-$3,500/month renting your ADU" },
              { title: "Property Value", desc: "Increase your home value by 20-30%" },
              { title: "Multi-Generational Living", desc: "Keep family close with private space" },
              { title: "Home Office", desc: "A dedicated workspace steps from your home" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-secondary">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Our Recent Projects
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-balcony.webp"
                alt="Modern ADU with balcony"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src="/images/projects/bathroom-renovation.webp"
                alt="Luxury bathroom renovation"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src="/images/projects/bedroom-interior.webp"
                alt="Custom bedroom interior"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Start Building Your ADU Today
          </h2>
          <p className="text-secondary/70 mb-8">
            Join 500+ San Diego homeowners. Free consultation, fixed-price quotes, and a team that handles everything.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+18588330705"
              className="inline-flex items-center gap-2 bg-secondary text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-secondary-light transition-colors"
            >
              <Phone className="h-5 w-5" />
              Call (858) 833-0705
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-white text-secondary font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
