"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Calendar, MessageSquare } from "lucide-react";

const ctaOptions = [
  {
    icon: Calendar,
    title: "Schedule Consultation",
    description: "Free 30-minute call to discuss your project",
    href: "/contact",
    primary: true,
  },
  {
    icon: Phone,
    title: "Call Us Now",
    description: "(619) 555-1234",
    href: "tel:+16195551234",
    primary: false,
  },
  {
    icon: MessageSquare,
    title: "Start Online",
    description: "Use our Build Your ADU tool",
    href: "/build-your-adu",
    primary: false,
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary-dark text-white relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Take the first step toward your dream space. Whether you're considering an ADU, 
            planning a remodel, or building a custom home, we're here to help make it happen.
          </p>
        </div>

        {/* CTA Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {ctaOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className={`group rounded-2xl p-6 text-center transition-all hover:-translate-y-1 ${
                option.primary 
                  ? "bg-white text-secondary shadow-xl" 
                  : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                option.primary ? "bg-primary/10" : "bg-white/10"
              }`}>
                <option.icon className={`h-7 w-7 ${option.primary ? "text-primary" : "text-white"}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${option.primary ? "text-secondary" : "text-white"}`}>
                {option.title}
              </h3>
              <p className={`text-sm ${option.primary ? "text-muted-foreground" : "text-white/70"}`}>
                {option.description}
              </p>
              {option.primary && (
                <div className="mt-4">
                  <Button size="sm" rounded="full" className="group/btn">
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom text */}
        <p className="text-center text-white/60 text-sm mt-12">
          No pressure, no obligations. Just honest advice from experienced professionals.
        </p>
      </div>
    </section>
  );
}
