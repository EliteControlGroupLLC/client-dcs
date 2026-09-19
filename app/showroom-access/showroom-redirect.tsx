"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Rendered inside <LeadGate> once the visitor is unlocked: hand off to the
// showroom store (a route handler, so a full navigation — not router.push).
export function ShowroomRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <section className="py-16 md:py-24" data-lead-gate="unlocked">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-secondary mb-2">You&apos;re in — opening the showroom…</h2>
        <p className="text-muted-foreground">
          Not redirected?{" "}
          <a href={to} className="text-primary-dark font-semibold underline underline-offset-4">
            Enter the showroom
          </a>
        </p>
      </div>
    </section>
  );
}
