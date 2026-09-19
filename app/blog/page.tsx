import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
};

const posts = [
  {
    title: "How Much Does an ADU Cost in San Diego in 2026?",
    excerpt: "A comprehensive guide to ADU costs in San Diego, including construction, permits, design, and financing. Learn what to expect before starting your project.",
    category: "ADU Guide",
    date: "Coming Soon",
    readTime: "8 min read",
  },
  {
    title: "5 Things to Know Before Building an ADU",
    excerpt: "From zoning rules to financing options, here are the five most important things every San Diego homeowner should know before starting an ADU project.",
    category: "ADU Tips",
    date: "Coming Soon",
    readTime: "5 min read",
  },
  {
    title: "Garage Conversion vs. New Build ADU: Which Is Right for You?",
    excerpt: "Compare the costs, timelines, and benefits of converting your garage versus building a brand-new ADU on your property.",
    category: "ADU Guide",
    date: "Coming Soon",
    readTime: "6 min read",
  },
  {
    title: "San Diego ADU Permit Process Explained",
    excerpt: "A step-by-step walkthrough of the ADU permitting process in San Diego, including timelines, requirements, and how to avoid common delays.",
    category: "Permits",
    date: "Coming Soon",
    readTime: "7 min read",
  },
  {
    title: "Kitchen Remodeling Trends for 2026",
    excerpt: "The latest kitchen design trends for San Diego homeowners, from open layouts to smart appliances and sustainable materials.",
    category: "Remodeling",
    date: "Coming Soon",
    readTime: "4 min read",
  },
  {
    title: "How to Finance Your ADU Project",
    excerpt: "Explore the best financing options for your ADU, including home equity loans, construction loans, and California-specific programs.",
    category: "Financing",
    date: "Coming Soon",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              BLOG
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Insights & Guides
            </h1>
            <p className="text-xl text-white/80">
              Expert advice on ADUs, construction, remodeling, and home improvement in San Diego.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.title} className="flex h-full flex-col overflow-hidden">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <span className="mt-auto text-sm text-primary font-medium">{post.date}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Have a Question?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our team is happy to help.
          </p>
          <Link href="/contact">
            <Button size="lg" rounded="full">
              Contact Us <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
