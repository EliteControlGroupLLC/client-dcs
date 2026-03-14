// In-memory rate limiter for API routes
// Uses a sliding window approach per IP address

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * @param identifier - Unique identifier (typically IP address or IP+route)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  // No existing entry or window expired — allow and start new window
  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  // Within window — check count
  if (existing.count < config.maxRequests) {
    existing.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - existing.count,
      resetAt: existing.resetAt,
      retryAfterSeconds: 0,
    };
  }

  // Rate limited
  const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
  return {
    allowed: false,
    remaining: 0,
    resetAt: existing.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Extract client IP from request headers (works with Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Pre-configured rate limit profiles for different API routes
export const RATE_LIMITS = {
  // Lead submission / contact forms — 5 per 15 min per IP
  formSubmission: { maxRequests: 5, windowSeconds: 15 * 60 },
  // Property report generation — 10 per 15 min per IP
  propertyReport: { maxRequests: 10, windowSeconds: 15 * 60 },
  // Newsletter signup — 3 per 15 min per IP
  newsletter: { maxRequests: 3, windowSeconds: 15 * 60 },
  // ADU configurator — 10 per 15 min per IP
  aduConfig: { maxRequests: 10, windowSeconds: 15 * 60 },
  // Regulation scan (public status) — 30 per min per IP
  regulationStatus: { maxRequests: 30, windowSeconds: 60 },
} as const;
