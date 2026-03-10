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

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "ADUs Built" },
];

const values = [
  {
    icon: Award,
    title: "Quality Craftsmanship",
    description: "We never cut corners. Every project meets our rigorous quality standards.",
  },
  {
    icon: Users,
    title: "Client-Focused",
    description: "Your vision drives our work. We listen, collaborate, and deliver.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We respect your time with realistic timelines and consistent updates.",
  },
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Full protection for you and your property throughout the project.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "La Jolla",
    project: "ADU Construction",
    quote: "DCS built an incredible ADU in our backyard. The team was professional, communicative, and the quality exceeded our expectations. Now we have rental income that covers our mortgage!",
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
    project: "New Construction",
    quote: "Building our dream home was a big decision. DCS made it easy with their transparent pricing and expert guidance. We couldn&apos;t be happier with the result.",
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
              Building Dreams in San Diego Since 2009
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Distinct Construction Solutions is a family-owned, design-build company dedicated to 
              transforming San Diego homes with quality craftsmanship and exceptional service.
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
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Founded in 2009 by a team of passionate builders, Distinct Construction Solutions 
                began with a simple mission: deliver exceptional construction services that 
                transform houses into dream homes.
              </p>
              <p>
                Over the years, we&apos;ve grown from a small remodeling company to San Diego&apos;s 
                trusted design-build partner for ADUs, custom homes, and renovations. Our success 
                is built on a foundation of integrity, quality, and genuine care for our clients.
              </p>
              <p>
                Today, we&apos;re proud to be at the forefront of San Diego&apos;s ADU movement, helping 
                homeowners maximize their property value while addressing the housing needs of 
                our community.
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

      {/* Why Choose DCS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Why Choose DCS?
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
