"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { CLIENT_REVIEWS, type ReviewSource } from "@/lib/data/reviews";

const SHOW_MS = 6500; // how long each review stays up
const GAP_MS = 900; // pause between reviews (fade out → next pops in)

function SourceMark({ source }: { source: ReviewSource }) {
  if (source === "Google") {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    );
  }
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#D32323] text-[8px] font-bold leading-none text-white" aria-hidden="true">
      y
    </span>
  );
}

/**
 * Real client reviews that pop up one at a time beside "The Standard We Build
 * By": each slides in, holds, fades out, and the next one follows. Pauses on
 * hover/focus; click jumps to the full reviews section.
 */
export function HeroReviewTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    // Pop in shortly after load / after the previous one faded out.
    if (!visible) {
      const t = window.setTimeout(() => setVisible(true), GAP_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setIndex((i) => (i + 1) % CLIENT_REVIEWS.length), 500);
    }, SHOW_MS);
    return () => window.clearTimeout(t);
  }, [visible, paused, index]);

  const review = CLIENT_REVIEWS[index];

  return (
    <div className="min-h-[9.5rem]" aria-live="polite">
      <a
        href="#reviews"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className={`block rounded-2xl border border-white/20 bg-white/95 p-5 text-left shadow-2xl backdrop-blur-md transition-all duration-500 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SourceMark source={review.source} />
            {review.source} review
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-secondary">&ldquo;{review.excerpt}&rdquo;</p>
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-secondary">{review.author}</span> &middot; {review.project}
        </p>
      </a>
    </div>
  );
}
