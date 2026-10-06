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
 * The client's IP, for rate limiting.
 *
 * NOT the first entry of x-forwarded-for. Vercel (like most proxies) APPENDS
 * the real client IP to whatever XFF chain the caller sent, so the first entry
 * is whatever the caller typed — anyone could send a random one per request
 * and every per-IP limit in this app would evaporate. The last hop is the one
 * our own edge wrote, so that is the one to trust.
 *
 * Platform headers that a proxy sets (and strips from client input) are
 * preferred where available.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  const platform =
    headers.get("x-vercel-forwarded-for") || // Vercel: real client, client-supplied value stripped
    headers.get("cf-connecting-ip") || // Cloudflare: same guarantee
    headers.get("x-real-ip");
  if (platform?.trim()) return platform.trim();

  // Fall back to the LAST x-forwarded-for hop — the one our edge appended.
  const chain = headers.get("x-forwarded-for");
  if (chain) {
    const hops = chain
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return "unknown";
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
  // Email validation — 10 per minute per IP
  emailValidation: { maxRequests: 10, windowSeconds: 60 },
  // Phone OTP send — 3 per 10 min, applied per IP and per phone number
  phoneSend: { maxRequests: 3, windowSeconds: 10 * 60 },
  // Phone OTP send, slow-drip cap per PHONE NUMBER — 10 per 24h. Nobody needs
  // ten codes to one handset in a day; this is the toll-fraud brake.
  phoneSendDaily: { maxRequests: 10, windowSeconds: 24 * 60 * 60 },
  // Same, per IP — but far looser, because one IP is routinely many people:
  // mobile carriers (CGNAT), an office, a coffee shop. A tight per-IP daily
  // cap turns away the 11th genuine visitor of the day, and losing a real
  // customer is worse than the cost of a few extra messages.
  phoneSendDailyPerIp: { maxRequests: 50, windowSeconds: 24 * 60 * 60 },
  // Phone OTP verify — 5 per 5 min, applied per IP and per phone number
  phoneVerify: { maxRequests: 5, windowSeconds: 5 * 60 },
  // Address autocomplete (one call per debounced keystroke) — 60 per min per IP
  addressSuggest: { maxRequests: 60, windowSeconds: 60 },
  // Lead gate form submission (new visitor) — 5 per 15 min per IP
  leadGateSubmit: { maxRequests: 5, windowSeconds: 15 * 60 },
  // Lead gate interest registration with an existing pass — 30 per 15 min per IP
  leadGateRegister: { maxRequests: 30, windowSeconds: 15 * 60 },
} as const;
