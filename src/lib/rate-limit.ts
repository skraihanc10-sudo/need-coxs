import { AppError } from "./errors"

/**
 * A small fixed-window rate limiter kept in memory. Cox's Seba runs as one
 * container, so a process-local map is enough; swap for Redis if it scales out.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export const LIMITS = {
  login: { max: 10, windowMs: 10 * 60_000 },
  otpSend: { max: 3, windowMs: 10 * 60_000 },
  otpVerify: { max: 8, windowMs: 10 * 60_000 },
  booking: { max: 10, windowMs: 60 * 60_000 },
  message: { max: 60, windowMs: 10 * 60_000 },
} as const

export function hit(kind: keyof typeof LIMITS, key: string) {
  const { max, windowMs } = LIMITS[kind]
  const now = Date.now()
  const id = `${kind}:${key}`
  const bucket = buckets.get(id)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs })
    return
  }
  bucket.count += 1
  if (bucket.count > max) {
    const minutes = Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000))
    throw new AppError(
      `অনেকবার চেষ্টা হয়েছে। ${minutes} মিনিট পরে আবার চেষ্টা করুন।`,
      `Too many tries. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    )
  }
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
  }
}

/** Tests and local development can turn the limiter off. */
export function limited(kind: keyof typeof LIMITS, key: string) {
  if (process.env.RATE_LIMIT === "off") return
  hit(kind, key)
}
