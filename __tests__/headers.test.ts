// packages/sdk/__tests__/headers.test.ts
import { describe, it, expect } from 'vitest'
import { parseRateLimitHeaders, deriveRateClass, normalizeHeaders, parseRetryAfterMs } from '../src/headers'

describe('parseRateLimitHeaders', () => {
  it('parses all three headers', () => {
    const h = new Headers({
      'x-ratelimit-limit': '10',
      'x-ratelimit-remaining': '7',
      'x-ratelimit-reset': '1744156800',
    })
    const info = parseRateLimitHeaders(h, '/api/v1/generate')
    expect(info.limit).toBe(10)
    expect(info.remaining).toBe(7)
    expect(info.resetAt).toEqual(new Date(1744156800 * 1000))
    expect(info.rateClass).toBe('generation')
  })

  it('returns nulls if headers are missing', () => {
    const info = parseRateLimitHeaders(new Headers(), '/api/v1/jobs')
    expect(info.limit).toBeNull()
    expect(info.remaining).toBeNull()
    expect(info.resetAt).toBeNull()
    expect(info.rateClass).toBe('mgmt')
  })

  it('returns nulls for non-finite values', () => {
    const h = new Headers({ 'x-ratelimit-limit': 'foo' })
    const info = parseRateLimitHeaders(h, '/api/v1/health')
    expect(info.limit).toBeNull()
  })
})

describe('deriveRateClass', () => {
  it('classifies generation paths', () => {
    expect(deriveRateClass('/api/v1/generate')).toBe('generation')
    expect(deriveRateClass('/api/v1/face-swap')).toBe('generation')
    expect(deriveRateClass('/api/v1/video')).toBe('generation')
    expect(deriveRateClass('/api/v1/enhance')).toBe('generation')
    expect(deriveRateClass('/api/v1/pipelines')).toBe('generation')
    expect(deriveRateClass('/api/v1/undress')).toBe('generation')
  })

  it('classifies mgmt paths', () => {
    expect(deriveRateClass('/api/v1/jobs')).toBe('mgmt')
    expect(deriveRateClass('/api/v1/jobs/abc-123')).toBe('mgmt')
    expect(deriveRateClass('/api/v1/account')).toBe('mgmt')
    expect(deriveRateClass('/api/v1/models')).toBe('mgmt')
    expect(deriveRateClass('/api/v1/credits')).toBe('mgmt')
    expect(deriveRateClass('/api/v1/payments')).toBe('mgmt')
  })

  it('classifies webhook-mgmt paths', () => {
    expect(deriveRateClass('/api/v1/webhooks')).toBe('webhook-mgmt')
    expect(deriveRateClass('/api/v1/webhooks/wh-1/deliveries')).toBe('webhook-mgmt')
  })

  it('returns null for unknown paths (e.g. /health)', () => {
    expect(deriveRateClass('/api/v1/health')).toBeNull()
  })
})

describe('normalizeHeaders', () => {
  it('passes through Headers instance unchanged', () => {
    const h = new Headers({ 'content-type': 'application/json' })
    const result = normalizeHeaders(h)
    expect(result).toBe(h)
  })

  it('converts Record<string, string> to Headers', () => {
    const result = normalizeHeaders({ 'x-foo': 'bar', 'x-baz': 'qux' })
    expect(result.get('x-foo')).toBe('bar')
    expect(result.get('x-baz')).toBe('qux')
  })

  it('handles array values via append', () => {
    const result = normalizeHeaders({ 'x-multi': ['a', 'b'] })
    expect(result.get('x-multi')).toBe('a, b')
  })

  it('skips undefined values', () => {
    const result = normalizeHeaders({ 'x-present': 'yes', 'x-absent': undefined })
    expect(result.get('x-present')).toBe('yes')
    expect(result.get('x-absent')).toBeNull()
  })
})

describe('parseRetryAfterMs', () => {
  it('parses seconds', () => {
    const h = new Headers({ 'retry-after': '30' })
    expect(parseRetryAfterMs(h)).toBe(30_000)
  })

  it('parses HTTP date', () => {
    const future = new Date(Date.now() + 10_000).toUTCString()
    const result = parseRetryAfterMs(new Headers({ 'retry-after': future }))
    expect(result).toBeGreaterThanOrEqual(9_000)
    expect(result).toBeLessThanOrEqual(11_000)
  })

  it('returns null when header absent', () => {
    expect(parseRetryAfterMs(new Headers())).toBeNull()
  })

  it('returns null for malformed value', () => {
    expect(parseRetryAfterMs(new Headers({ 'retry-after': 'garbage' }))).toBeNull()
  })
})
