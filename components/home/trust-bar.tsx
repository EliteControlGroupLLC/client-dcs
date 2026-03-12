"use client";

import { Shield } from "lucide-react";

export function TrustBar() {
  return (
    <section className="bg-secondary py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-white/80">
            Licensed California General Contractor
          </span>
          <span className="text-sm text-white/60">|</span>
          <span className="text-sm text-white/60">License #1098531</span>
        </div>
      </div>
    </section>
  );
}
