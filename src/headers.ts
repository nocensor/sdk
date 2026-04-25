// packages/sdk/src/headers.ts
// Header normalization helpers + rate-limit parsing + rate-class derivation.

import type { RateLimitInfo } from './errors'

export type HeadersLike = Headers | Record<string, string | string[] | undefined>

export function normalizeHeaders(h: HeadersLike): Headers {
  if (h instanceof Headers) return h
  const out = new Headers()
  for (const [key, value] of Object.entries(h)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) out.append(key, v)
    } else {
      out.set(key, value)
    }
  }
  return out
}

function parseIntOrNull(v: string | null): number | null {
  if (!v) return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

export function parseRateLimitHeaders(headers: Headers, path: string): RateLimitInfo {
  const limit = parseIntOrNull(headers.get('x-ratelimit-limit'))
  const remaining = parseIntOrNull(headers.get('x-ratelimit-remaining'))
  const resetUnix = parseIntOrNull(headers.get('x-ratelimit-reset'))
  return {
    limit,
    remaining,
    resetAt: resetUnix !== null ? new Date(resetUnix * 1000) : null,
    rateClass: deriveRateClass(path),
  }
}

const GENERATION_PREFIXES = [
  '/api/v1/generate',
  '/api/v1/face-swap',
  '/api/v1/video',
  '/api/v1/enhance',
  '/api/v1/pipelines',
  '/api/v1/undress',
]
const MGMT_PREFIXES = ['/api/v1/jobs', '/api/v1/account', '/api/v1/models', '/api/v1/credits', '/api/v1/payments']
const WEBHOOK_MGMT_PREFIXES = ['/api/v1/webhooks']

export function deriveRateClass(path: string): 'generation' | 'mgmt' | 'webhook-mgmt' | null {
  for (const p of GENERATION_PREFIXES) {
    if (path === p || path.startsWith(p + '/') || path.startsWith(p + '?')) return 'generation'
  }
  for (const p of WEBHOOK_MGMT_PREFIXES) {
    if (path === p || path.startsWith(p + '/') || path.startsWith(p + '?')) return 'webhook-mgmt'
  }
  for (const p of MGMT_PREFIXES) {
    if (path === p || path.startsWith(p + '/') || path.startsWith(p + '?')) return 'mgmt'
  }
  return null
}

export function parseRetryAfterMs(headers: Headers): number | null {
  const v = headers.get('retry-after')
  if (!v) return null
  const seconds = parseInt(v, 10)
  if (Number.isFinite(seconds) && String(seconds) === v.trim()) return seconds * 1000
  const date = Date.parse(v)
  if (Number.isFinite(date)) return Math.max(0, date - Date.now())
  return null
}
