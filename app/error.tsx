"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route-level error boundary: renders inside the root layout (header/footer
// stay intact) using the standard interior-page hero.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              SOMETHING WENT WRONG
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">This page hit an unexpected error</h1>
            <p className="text-xl text-white/80 mb-8">
              Please try again. If it keeps happening, our team is one call away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" rounded="full" onClick={reset} className="w-full sm:w-auto">
                <RotateCw className="h-5 w-5" /> Try Again
              </Button>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
