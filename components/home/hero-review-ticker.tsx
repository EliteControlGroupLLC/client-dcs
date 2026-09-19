"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { CLIENT_REVIEWS } from "@/lib/data/reviews";

const SHOW_MS = 7000; // how long each review stays up
const GAP_MS = 700; // pause between reviews

// TruthCore palette tokens (app/globals.css): secondary = emerald-charcoal
// surface, accent = Antique Gold, accent-light = pale gold for names.

/**
 * Boutique review "pop-up": real client reviews glide in one at a time within
 * the hero, hold, and fade out. Emerald-charcoal glass, gold hairlines, serif
 * quote, a thin gold timer line. Pauses on hover/focus; click → #reviews.
 */
export function HeroReviewTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (!visible) {
      const t = window.setTimeout(() => setVisible(true), GAP_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setIndex((i) => (i + 1) % CLIENT_REVIEWS.length), 600);
    }, SHOW_MS);
    return () => window.clearTimeout(t);
  }, [visible, paused, index]);

  const review = CLIENT_REVIEWS[index];
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(CLIENT_REVIEWS.length).padStart(2, "0")}`;

  return (
    <div className="min-h-[12rem]" aria-live="polite">
      <a
        href="#reviews"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        // Same box as the "Standard We Build By" card above it: full column
        // width, rounded-2xl, p-6 sm:p-8. It fades up (never sideways) so its
        // edges always line up with that card's edges.
        className={`group relative block w-full overflow-hidden rounded-2xl border border-accent/35 bg-secondary/80 p-6 sm:p-8 text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-700 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 motion-reduce:transition-none ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {/* Header: label · counter · stars */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Client Review <span className="ml-2 text-white/40">{counter}</span>
          </span>
          <span className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
            ))}
          </span>
        </div>

        {/* Quote */}
        <p className="relative mt-4 font-serif text-lg italic leading-relaxed text-white/90">
          <span aria-hidden="true" className="absolute -left-4 -top-2 font-serif text-4xl not-italic leading-none text-accent/60">
            &ldquo;
          </span>
          {review.excerpt}
        </p>

        {/* Hairline + attribution */}
        <div className="mt-5 h-px w-12 bg-accent/50" aria-hidden="true" />
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{review.author}</span>
          <span className="text-xs text-white/55">
            {review.project} · {review.source}
          </span>
        </div>

        {/* Thin gold timer line (restarts per review, freezes while paused) */}
        {visible && (
          <span
            aria-hidden="true"
            key={index}
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent/70 motion-reduce:hidden"
            style={{
              animation: `tc-review-timer ${SHOW_MS}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        )}
        <style>{`@keyframes tc-review-timer { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
      </a>
    </div>
  );
}
