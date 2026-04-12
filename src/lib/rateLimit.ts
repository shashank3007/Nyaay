/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for single-instance deployments (Vercel serverless, single Node process).
 * For multi-instance production, replace with an Upstash Redis or Vercel KV backend.
 */

interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

// Prune stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number   // Unix ms
}

export function rateLimit(
  identifier: string,
  { limit, windowSec }: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSec * 1000

  const entry = store.get(identifier)

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { success: true, limit, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, limit, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract a request identifier (IP address) from a Next.js request.
 * Falls back to 'anonymous' when running in environments without real IPs.
 */
export function getRequestIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'anonymous'
}
