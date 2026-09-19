"use client";

import { Shield } from "lucide-react";

export function TrustBar() {
  return (
    <section className="bg-secondary py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Phones: two centered lines (claim / license) instead of a mid-phrase wrap */}
        <div className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-3">
          <span className="flex items-center gap-2 text-sm text-white/80">
            <Shield className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            Licensed California General Contractor
          </span>
          <span className="hidden text-sm text-white/40 sm:inline" aria-hidden="true">|</span>
          <span className="text-sm text-white/75"><span className="hidden sm:inline">Distinct Construction Solutions dba TruthCore &middot; </span>License #1098531</span>
        </div>
      </div>
    </section>
  );
}
