import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Users, 
  Clock, 
  Shield,
  CheckCircle,
  Star
} from "lucide-react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/data/site-data";

const stats = [
  { value: COMPANY_INFO.stats.projectsCompleted, label: "Projects Completed" },
  { value: `${COMPANY_INFO.yearsExperience}+`, label: "Years in Construction" },
  { value: "98%", label: "Client Satisfaction" },
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

const testimonials = [
  {
    name: "Sarah M.",
    location: "La Jolla",
    project: "ADU Construction",
    quote: "The team built an incredible ADU in our backyard. They were professional, communicative, and the quality exceeded our expectations. Now we have rental income that covers our mortgage!",
    rating: 5,
  },
  {
    name: "Michael R.",
    location: "North Park",
    project: "Kitchen Remodel",
    quote: "From design to completion, the process was seamless. They helped us navigate permits and kept the project on budget. Our new kitchen is absolutely stunning.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Pacific Beach",
    project: "Custom Homes",
    quote: "Building our dream home was a big decision. The team made it easy with their transparent pricing and expert guidance. We couldn&apos;t be happier with the result.",
    rating: 5,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {COMPANY_INFO.yearsExperience} Years in the Field. Built Different Since Day One.
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Distinct Construction Solutions is a San Diego design-build firm founded by Jordan Talavera in 2022 &mdash; 
              backed by over a decade of hands-on construction experience and a commitment to doing things the right way.
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
                <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 text-center">
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
                In 2022, Jordan founded Distinct Construction Solutions. Not as another general contractor, 
                but as a design-build firm with real systems in place: fixed-price contracts, dedicated 
                project management, weekly client updates, and a process designed around transparency from 
                the first call to the final walkthrough.
              </p>
              <p>
                Every project we&apos;ve taken on has made us sharper. Early on, we learned that clear 
                communication matters more than anything else. We built better scoping documents. We tightened 
                our timelines. We invested in 3D design so clients could see exactly what they were getting 
                before a single nail was driven.
              </p>
              <p>
                Today, DCS is one of San Diego&apos;s most trusted ADU and residential construction firms. 
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
          <div className="grid md:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">{value.title}</h3>
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Why Homeowners Choose Us
              </h2>
              <ul className="space-y-4">
                {[
                  "Design-build model: One team from concept to completion",
                  "Transparent pricing with no hidden costs",
                  "Dedicated project manager for every job",
                  "3D visualization before construction begins",
                  "Warranty on all workmanship",
                  "Financing options available",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <Award className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Team Photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-secondary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location} • {testimonial.project}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let&apos;s Build Something Great Together
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re planning an ADU, remodel, or new construction, we&apos;re here to make 
            your vision a reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
                Get Free Consultation
              </Button>
            </Link>
            <Link href="/services/adu-solutions">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
