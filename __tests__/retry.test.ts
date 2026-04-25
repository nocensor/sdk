// packages/sdk/__tests__/retry.test.ts
import { describe, it, expect } from 'vitest'
import { computeRetryDelay, isRetryable } from '../src/retry'

describe('computeRetryDelay', () => {
  it('honors Retry-After in seconds', () => {
    expect(computeRetryDelay(0, '30')).toBe(30_000)
    expect(computeRetryDelay(5, '2')).toBe(2_000)
  })

  it('honors Retry-After as an HTTP date', () => {
    const future = new Date(Date.now() + 10_000).toUTCString()
    const delay = computeRetryDelay(0, future)
    expect(delay).toBeGreaterThanOrEqual(9_000)
    expect(delay).toBeLessThanOrEqual(11_000)
  })

  it('falls through to exp backoff when Retry-After is absent', () => {
    const d0 = computeRetryDelay(0, null)
    expect(d0).toBeGreaterThanOrEqual(400)
    expect(d0).toBeLessThanOrEqual(600)
  })

  it('exp backoff doubles and caps at 30s', () => {
    const d = computeRetryDelay(10, null)
    expect(d).toBeLessThanOrEqual(36_000)
    expect(d).toBeGreaterThanOrEqual(24_000)
  })

  it('falls through to exp backoff if Retry-After is malformed', () => {
    const d = computeRetryDelay(0, 'garbage')
    expect(d).toBeGreaterThanOrEqual(400)
    expect(d).toBeLessThanOrEqual(600)
  })

  it('returns 0 for past HTTP dates', () => {
    const past = new Date(Date.now() - 10_000).toUTCString()
    expect(computeRetryDelay(0, past)).toBe(0)
  })
})

describe('isRetryable', () => {
  it('retries on 429', () => {
    expect(isRetryable(429)).toBe(true)
  })

  it('retries on 5xx except 501 and 505', () => {
    expect(isRetryable(500)).toBe(true)
    expect(isRetryable(502)).toBe(true)
    expect(isRetryable(503)).toBe(true)
    expect(isRetryable(504)).toBe(true)
    expect(isRetryable(501)).toBe(false)
    expect(isRetryable(505)).toBe(false)
  })

  it('does not retry on 4xx (except 429)', () => {
    expect(isRetryable(400)).toBe(false)
    expect(isRetryable(401)).toBe(false)
    expect(isRetryable(403)).toBe(false)
    expect(isRetryable(404)).toBe(false)
    expect(isRetryable(409)).toBe(false)
  })
})
