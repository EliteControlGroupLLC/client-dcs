"use client";

import { Shield, Award, CheckCircle, Clock } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "CA License #123456",
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Best of Houzz 2024",
  },
  {
    icon: CheckCircle,
    title: "100% Satisfaction",
    description: "Guaranteed Quality",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "99% Success Rate",
  },
];

const certifications = [
  "BBB A+ Rated",
  "NARI Certified",
  "EPA Lead-Safe",
  "Energy Star Partner",
];

export function TrustBar() {
  return (
    <section className="bg-muted py-8 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Trust Items */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-secondary">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="text-xs font-medium text-muted-foreground px-3 py-1.5 bg-white rounded-full border border-border"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
