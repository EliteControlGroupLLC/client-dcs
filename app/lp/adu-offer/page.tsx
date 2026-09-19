"use client";

import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { CheckCircle, Phone, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/data/site-data";
import { CLIENT_REVIEWS } from "@/lib/data/reviews";
import { ReviewCards } from "@/components/google-reviews";

const aduReviews = CLIENT_REVIEWS.filter((review) => review.project.startsWith("ADU")).slice(0, 3);

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
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-40 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 mb-6">
                <Star className="h-4 w-4 text-accent fill-accent" aria-hidden="true" />
                <span className="text-sm font-medium text-accent-light">Limited Time Offer</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-balance">
                Your Backyard Could Be
                <span className="text-accent block text-balance">Earning You $2,500/mo</span>
              </h1>

              <p className="text-xl text-white/80 mb-6">
                Build an ADU in your San Diego backyard. We handle design, permits, and construction — all for a fixed price starting at <span className="text-accent font-bold">$175K</span>.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-secondary-light border border-white/10 shadow-lg shadow-black/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">$2,500+</div>
                  <div className="text-sm text-white/75">Monthly Rental Income</div>
                </div>
                <div className="bg-secondary-light border border-white/10 shadow-lg shadow-black/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">20–35%</div>
                  <div className="text-sm text-white/75">Property Value Increase</div>
                </div>
              </div>

              <a
                href={`tel:${COMPANY_INFO.phoneHref}`}
                className="inline-flex min-h-11 items-center gap-2 text-white/80 hover:text-accent-light transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>Or call us: {COMPANY_INFO.phone}</span>
              </a>
            </div>

            {/* Lead Form */}
            <div id="lead-form" className="bg-white rounded-2xl p-8 shadow-2xl">
              <LeadForm
                source="meta-ads-adu-offer"
                heading="Claim Your Free Design Consultation"
                buttonText="Get Started — It's Free"
              />

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">5.0 rating</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Join 500+ happy homeowners who built with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews — real Google & Yelp reviews from ADU clients, verbatim */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12">
            What ADU Clients Say
          </h2>
          <ReviewCards reviews={aduReviews} />
        </div>
      </section>

      {/* Why ADU Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-4">
            Why Build an ADU?
          </h2>
          <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            San Diego homeowners are adding ADUs to generate income, house family, and increase property value.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Rental Income", desc: "Earn $2,000 – $3,500/month renting your ADU" },
              { title: "Property Value", desc: "Increase your home value by 20–35%" },
              { title: "Multi-Generational Living", desc: "Keep family close with private space" },
              { title: "Home Office", desc: "A dedicated workspace steps from your home" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Our Recent Projects
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-balcony.webp"
                alt="Modern ADU with balcony"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/adu-exterior-side.webp"
                alt="Detached ADU exterior side view"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/projects/kitchen-remodel.webp"
                alt="Premium kitchen remodel"
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Building Your ADU Today
          </h2>
          <p className="text-lg text-white/85 mb-8">
            Join 500+ San Diego homeowners. Free consultation, fixed-price quotes, and a team that handles everything.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={`tel:${COMPANY_INFO.phoneHref}`}>
              <Button size="lg" rounded="full" variant="secondary" className="w-full sm:w-auto">
                <Phone className="h-5 w-5" />
                Call {COMPANY_INFO.phone}
              </Button>
            </a>
            <Link href="#lead-form">
              <Button size="lg" rounded="full" className="w-full sm:w-auto bg-white text-secondary shadow-lg shadow-secondary/20 hover:bg-white/90">
                Get Free Quote
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
