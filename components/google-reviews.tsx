"use client";

import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import { CLIENT_REVIEWS } from "@/lib/data/reviews";

// Real client reviews (Google + Yelp), verbatim — see lib/data/reviews.ts.
const reviews = CLIENT_REVIEWS;

function ReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-4">
      <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-4"}`}>
        &ldquo;{text}&rdquo;
      </p>
      {text.length > 180 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export function GoogleReviews() {
  // Check if reviews are still pending (all reviews have isPending flag)
  const hasPendingReviews = reviews.length === 0;

  // If all reviews are pending, show a simplified CTA section instead
  if (hasPendingReviews) {
    return (
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-lg font-semibold text-secondary">Find Us on Google</span>
          </div>
          <p className="text-muted-foreground mb-6">
            See what our clients are saying about their experience working with Distinct Construction Solutions.
          </p>
          <a
            href="https://www.google.com/search?q=Distinct+Construction+Solutions+Chula+Vista+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-secondary font-semibold px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            Read Our Google Reviews
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-20 bg-muted scroll-mt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-lg font-semibold text-secondary">Google &amp; Yelp Reviews</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-2xl font-bold text-secondary ml-2">5.0</span>
          </div>
          <p className="text-muted-foreground">From homeowners we&apos;ve worked with</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {reviews.map((review, index) => (
            <div
              key={`${review.author}-${index}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <ReviewText text={review.text} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-secondary text-sm">{review.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.project} &middot; {review.source}
                    {review.date ? `, ${review.date}` : ""}
                  </p>
                </div>
                {review.source === "Google" ? (
                  <svg className="h-5 w-5 text-muted-foreground/50" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ) : (
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#D32323] text-[11px] font-bold text-white"
                    aria-label="Yelp"
                  >
                    y
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA to leave a review */}
        <div className="text-center mt-10">
          <a
            href="https://www.google.com/search?q=Distinct+Construction+Solutions+Chula+Vista+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            See all reviews on Google
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
