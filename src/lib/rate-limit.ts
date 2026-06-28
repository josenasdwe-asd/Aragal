/**
 * Simple in-memory rate limiter for API routes.
 *
 * Tracks requests per IP address within a time window. Returns true if the
 * request is allowed, false if the limit has been exceeded.
 *
 * Note: in-memory means it resets on server restart. For multi-instance
 * production, use Upstash Redis. For cost-0 single-instance, this is fine.
 */

type RateRecord = { count: number; firstAt: number };
const buckets = new Map<string, Map<string, RateRecord>>();

/**
 * Check if a request from the given IP is allowed under the rate limit.
 * Returns { allowed: boolean, retryAfter: number (seconds) }.
 */
export function rateLimit(
  namespace: string,
  ip: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  if (!buckets.has(namespace)) {
    buckets.set(namespace, new Map());
  }
  const ns = buckets.get(namespace)!;
  const now = Date.now();

  const record = ns.get(ip);
  if (record) {
    if (now - record.firstAt > windowMs) {
      ns.delete(ip);
    } else if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.firstAt + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }
  }

  // Increment
  const existing = ns.get(ip);
  if (existing && now - existing.firstAt < windowMs) {
    existing.count += 1;
  } else {
    ns.set(ip, { count: 1, firstAt: now });
  }

  return { allowed: true, retryAfter: 0 };
}

/** Extract client IP from request headers (Vercel proxy-aware). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

/** Create a 429 rate-limited response with Retry-After header. */
export function rateLimitedResponse(retryAfter: number, message?: string) {
  return Response.json(
    {
      ok: false,
      error: message ?? `Demasiadas peticiones. Intenta en ${retryAfter}s.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}
