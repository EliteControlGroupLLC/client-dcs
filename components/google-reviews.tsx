"use client";

import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import { CLIENT_REVIEWS } from "@/lib/data/reviews";

// Real client reviews (Google + Yelp), verbatim — see lib/data/reviews.ts.
const reviews = CLIENT_REVIEWS;

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=Distinct+Construction+Solutions+Chula+Vista+reviews";

function ReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className={`font-serif text-lg italic leading-relaxed text-white/85 ${expanded ? "" : "line-clamp-5"}`}>
        &ldquo;{text}&rdquo;
      </p>
      {text.length > 200 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light underline-offset-4 transition-colors hover:underline"
        >
          {expanded ? "Show less" : "Read full review"}
        </button>
      )}
    </div>
  );
}

function GoldStars({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden="true" className={`${className} fill-accent text-accent`} />
      ))}
    </span>
  );
}

/**
 * Review cards for interior and landing pages — same dark "life" card as the
 * homepage section (stars · source/date, serif quote, gold hairline, name,
 * project), for use inside a bg-secondary section. Real reviews, verbatim.
 */
export function ReviewCards({ reviews: items }: { reviews: typeof CLIENT_REVIEWS }) {
  return (
    <>
      <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((review, index) => (
          <figure
            key={`${review.author}-${index}`}
            className="flex h-full flex-col rounded-2xl border border-accent/30 bg-secondary-light p-6 shadow-lg shadow-black/20 transition-colors duration-300 hover:border-accent/50 sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <GoldStars />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                {review.source}
                {review.date ? ` · ${review.date}` : ""}
              </span>
            </div>
            <blockquote className="flex-1">
              <ReviewText text={review.text} />
            </blockquote>
            <div className="mt-6 h-px w-12 bg-accent/50" aria-hidden="true" />
            <figcaption className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{review.author}</p>
              <p className="mt-1 text-xs text-white/75">{review.project}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-b border-accent/50 pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-light"
        >
          See all reviews on Google
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}

export function GoogleReviews() {
  // Check if reviews are still pending (all reviews have isPending flag)
  const hasPendingReviews = reviews.length === 0;

  // If all reviews are pending, show a simplified CTA section instead
  if (hasPendingReviews) {
    return (
      <section className="relative py-20 bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-lg font-semibold text-white">Find Us on Google</span>
          </div>
          <p className="text-white/80 mb-6">
            See what our clients are saying about their experience working with Distinct Construction Solutions.
          </p>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-black/20 hover:bg-primary-dark transition-colors"
          >
            Read Our Google Reviews
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="relative scroll-mt-20 overflow-hidden border-t border-white/10 bg-secondary py-20">
      {/* Soft emerald wash for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
            Client Reviews
          </span>
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">In their words</h2>
          <div className="mx-auto mt-6 h-px w-16 bg-accent/60" aria-hidden="true" />
          <div className="mt-6 flex items-center justify-center gap-3">
            <GoldStars className="h-4 w-4" />
            <span className="text-sm text-white/75">5.0 from homeowners on Google &amp; Yelp</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <figure
              key={`${review.author}-${index}`}
              className={`flex h-full flex-col rounded-2xl border border-accent/30 bg-secondary-light p-6 shadow-lg shadow-black/20 sm:p-8 ${index === 0 ? "md:col-span-2" : ""} transition-colors duration-300 hover:border-accent/50`}
            >
              <div className="mb-5 flex items-center justify-between">
                <GoldStars />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  {review.source}
                  {review.date ? ` · ${review.date}` : ""}
                </span>
              </div>
              <blockquote className="flex-1">
                <ReviewText text={review.text} />
              </blockquote>
              <div className="mt-6 h-px w-12 bg-accent/50" aria-hidden="true" />
              <figcaption className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{review.author}</p>
                <p className="mt-1 text-xs text-white/75">{review.project}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Link out */}
        <div className="mt-12 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b border-accent/50 pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-light"
          >
            See all reviews on Google
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
