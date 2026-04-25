// packages/sdk/src/retry.ts
// Retry math: Retry-After parser + exp backoff with jitter.

const MAX_BACKOFF_MS = 30_000
const BASE_BACKOFF_MS = 500
const JITTER_FRACTION = 0.2

export function computeRetryDelay(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10)
    if (Number.isFinite(seconds) && String(seconds) === retryAfter.trim()) {
      return Math.max(0, seconds * 1000)
    }
    const date = Date.parse(retryAfter)
    if (Number.isFinite(date)) {
      return Math.max(0, date - Date.now())
    }
  }

  const base = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt)
  const jitter = base * JITTER_FRACTION * (Math.random() * 2 - 1)
  return Math.max(0, Math.floor(base + jitter))
}

export function isRetryable(status: number): boolean {
  if (status === 429) return true
  if (status >= 500 && status < 600 && status !== 501 && status !== 505) return true
  return false
}
