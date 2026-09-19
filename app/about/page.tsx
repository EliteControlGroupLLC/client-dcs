import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ReviewCards } from "@/components/google-reviews";
import { 
  Award,
  Users,
  Clock, 
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { COMPANY_INFO, getYearsExperience } from "@/lib/data/site-data";
import { CLIENT_REVIEWS } from "@/lib/data/reviews";

export const metadata: Metadata = {
  title: "About Us",
};

// Real Google/Yelp reviews (verbatim): an ADU client, a roofing client, a repeat-referral client.
const aboutReviews = [CLIENT_REVIEWS[0], CLIENT_REVIEWS[1], CLIENT_REVIEWS[3]];

const stats = [
  { value: COMPANY_INFO.stats.projectsCompleted, label: "Projects Completed" },
  { value: `${getYearsExperience()}+`, label: "Years in Construction" },
  { value: COMPANY_INFO.stats.clientSatisfaction, label: "Client Satisfaction" },
  { value: COMPANY_INFO.stats.adusBuilt, label: "ADUs Built" },
];

const values = [
  {
    icon: Award,
    title: "Precision-Built, Every Detail",
    description: "We hold ourselves to a higher standard. Every joint, every finish, every material is selected and installed with intention.",
  },
  {
    icon: Users,
    title: "Your Project, Your Team",
    description: "A dedicated project manager on every job. Direct communication, no runaround.",
  },
  {
    icon: Clock,
    title: "Timelines You Can Trust",
    description: "We set realistic schedules, then we hit them. Weekly updates so you always know where things stand.",
  },
  {
    icon: Shield,
    title: "Licensed, Bonded, and Insured",
    description: "Full liability coverage and workers comp on every project. Your investment is protected.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              ABOUT US
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getYearsExperience()}+ years of field experience, design-build discipline, and premium residential execution.
            </h1>
            <p className="text-xl text-white/80">
              Distinct Construction Solutions is a Lemon Grove-based design-build firm shaped by hands-on construction experience that began in 2014 and matured into a more disciplined way to deliver residential projects across San Diego County. Today we do business as TruthCore, our DBA &mdash; the same licensed team and the same standards.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/85">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              Our Story
            </h2>
            <div className="space-y-5 text-lg text-muted-foreground">
              <p>
                Jordan Talavera started in construction in 2014. Not behind a desk &mdash; on job sites, 
                framing walls, pouring foundations, learning the trade from the ground up. Over the next 
                several years, he worked on everything from small remodels to full-scale custom builds 
                across San Diego.
              </p>
              <p>
                That experience taught him something most contractors never talk about: the gap between 
                what homeowners are promised and what actually gets delivered. Missed timelines, vague pricing, 
                disappearing project managers. He saw it happen over and over &mdash; and decided to build a 
                company that did things differently.
              </p>
              <p>
                Distinct Construction Solutions was built around a different operating standard: fixed-price
                contracts where the scope is ready, dedicated project management, weekly client updates,
                and a process designed around transparency from the first call to the final walkthrough.
              </p>
              <p>
                Every project we&apos;ve taken on has made us sharper. Early on, we learned that clear 
                communication matters more than anything else. We built better scoping documents. We tightened 
                our timelines. We invested in 3D design so clients could see exactly what they were getting 
                before a single nail was driven.
              </p>
              <p>
                Today, TruthCore is one of San Diego&apos;s most trusted ADU and residential construction firms. 
                We&apos;ve helped homeowners add income-generating units to their properties, build custom homes 
                from scratch, and renovate spaces that had been neglected for years. Our clients don&apos;t just 
                hire us &mdash; they refer us. That&apos;s the standard we hold ourselves to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
            What Sets Us Apart
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
            Why Homeowners Choose Us
          </h2>
          <ul className="grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Design-build model: One team from concept to completion",
              "Transparent pricing with no hidden costs",
              "Dedicated project manager for every job",
              "3D visualization before construction begins",
              "Warranty on all workmanship",
              "Financing options available",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials — real Google & Yelp reviews, verbatim */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
            Verified Reviews
          </h2>
          <ReviewCards reviews={aboutReviews} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let&apos;s Build Something Great Together
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re planning an ADU, remodel, or new construction, we&apos;re here to make 
            your vision a reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" rounded="full" className="w-full sm:w-auto">
                Get Free Consultation
              </Button>
            </Link>
            <Link href="/services/adu-solutions" className="w-full sm:w-auto">
              <Button size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
