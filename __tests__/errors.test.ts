// packages/sdk/__tests__/errors.test.ts
import { describe, it, expect } from 'vitest'
import {
  NoCensorError,
  NoCensorAuthenticationError,
  NoCensorPermissionError,
  NoCensorValidationError,
  NoCensorNotFoundError,
  NoCensorConflictError,
  NoCensorJobNotCancellableError,
  NoCensorLoraNotReadyError,
  NoCensorWebhookLimitReachedError,
  NoCensorWebhookInactiveError,
  NoCensorRateLimitError,
  NoCensorInsufficientCreditsError,
  NoCensorPurchaseRequiredError,
  NoCensorPromptBlockedError,
  NoCensorServerError,
  NoCensorNetworkError,
  NoCensorTimeoutError,
  NoCensorJobFailedError,
  NoCensorWebhookError,
  mapErrorCodeToClass,
} from '../src/errors'

describe('NoCensorError base', () => {
  it('sets name, code, status, requestId, cause', () => {
    const err = new NoCensorError('boom', { code: 'X', status: 418, requestId: 'req_abc', cause: { raw: 'y' } })
    expect(err.name).toBe('NoCensorError')
    expect(err.message).toBe('boom')
    expect(err.code).toBe('X')
    expect(err.status).toBe(418)
    expect(err.requestId).toBe('req_abc')
    expect(err.cause).toEqual({ raw: 'y' })
    expect(err instanceof NoCensorError).toBe(true)
    expect(err instanceof Error).toBe(true)
  })

  it('defaults status and requestId to null', () => {
    const err = new NoCensorError('x', { code: 'Y' })
    expect(err.status).toBeNull()
    expect(err.requestId).toBeNull()
  })
})

describe('instanceof correctness for subclasses', () => {
  const cases: Array<[string, new (m: string, o: { code: string }) => NoCensorError]> = [
    ['auth', NoCensorAuthenticationError],
    ['perm', NoCensorPermissionError],
    ['validation', NoCensorValidationError],
    ['not-found', NoCensorNotFoundError],
    ['conflict', NoCensorConflictError],
    ['rate', NoCensorRateLimitError],
    ['credits', NoCensorInsufficientCreditsError],
    ['purchase', NoCensorPurchaseRequiredError],
    ['prompt', NoCensorPromptBlockedError],
    ['server', NoCensorServerError],
    ['network', NoCensorNetworkError],
    ['timeout', NoCensorTimeoutError],
  ]

  for (const [name, Ctor] of cases) {
    it(`${name} is instanceof NoCensorError`, () => {
      const e = new Ctor('msg', { code: 'C' })
      expect(e instanceof NoCensorError).toBe(true)
      expect(e instanceof Error).toBe(true)
    })
  }
})

describe('conflict subclasses', () => {
  it('JobNotCancellable extends Conflict', () => {
    const e = new NoCensorJobNotCancellableError('x', { code: 'JOB_NOT_CANCELLABLE' })
    expect(e instanceof NoCensorConflictError).toBe(true)
    expect(e instanceof NoCensorError).toBe(true)
  })

  it('LoraNotReady extends Conflict', () => {
    const e = new NoCensorLoraNotReadyError('x', { code: 'LORA_NOT_READY' })
    expect(e instanceof NoCensorConflictError).toBe(true)
  })

  it('WebhookLimitReached extends Conflict', () => {
    const e = new NoCensorWebhookLimitReachedError('x', { code: 'WEBHOOK_LIMIT_REACHED' })
    expect(e instanceof NoCensorConflictError).toBe(true)
  })

  it('WebhookInactive extends Conflict', () => {
    const e = new NoCensorWebhookInactiveError('x', { code: 'WEBHOOK_INACTIVE' })
    expect(e instanceof NoCensorConflictError).toBe(true)
  })
})

describe('NoCensorRateLimitError', () => {
  it('carries retryAfterMs and rateLimit', () => {
    const e = new NoCensorRateLimitError('slow down', {
      code: 'RATE_LIMITED',
      status: 429,
      retryAfterMs: 5000,
      rateLimit: { limit: 10, remaining: 0, resetAt: new Date(0), rateClass: 'generation' },
    })
    expect(e.retryAfterMs).toBe(5000)
    expect(e.rateLimit?.limit).toBe(10)
  })
})

describe('NoCensorJobFailedError', () => {
  it('carries jobId and job', () => {
    const job = { id: 'j1', status: 'failed' as const }
    const e = new NoCensorJobFailedError('job failed', { code: 'JOB_FAILED', jobId: 'j1', job })
    expect(e.jobId).toBe('j1')
    expect(e.job).toBe(job)
  })
})

describe('mapErrorCodeToClass', () => {
  it('maps known codes', () => {
    expect(mapErrorCodeToClass('UNAUTHORIZED', 401)).toBe(NoCensorAuthenticationError)
    expect(mapErrorCodeToClass('FORBIDDEN', 403)).toBe(NoCensorPermissionError)
    expect(mapErrorCodeToClass('INSUFFICIENT_SCOPE', 403)).toBe(NoCensorPermissionError)
    expect(mapErrorCodeToClass('LORA_NOT_OWNED', 403)).toBe(NoCensorPermissionError)
    expect(mapErrorCodeToClass('INSUFFICIENT_CREDITS', 402)).toBe(NoCensorInsufficientCreditsError)
    expect(mapErrorCodeToClass('PURCHASE_REQUIRED', 402)).toBe(NoCensorPurchaseRequiredError)
    expect(mapErrorCodeToClass('PROMPT_BLOCKED', 400)).toBe(NoCensorPromptBlockedError)
    expect(mapErrorCodeToClass('VALIDATION_ERROR', 422)).toBe(NoCensorValidationError)
    expect(mapErrorCodeToClass('INVALID_REQUEST', 400)).toBe(NoCensorValidationError)
    expect(mapErrorCodeToClass('NOT_FOUND', 404)).toBe(NoCensorNotFoundError)
    expect(mapErrorCodeToClass('JOB_NOT_FOUND', 404)).toBe(NoCensorNotFoundError)
    expect(mapErrorCodeToClass('JOB_NOT_CANCELLABLE', 409)).toBe(NoCensorJobNotCancellableError)
    expect(mapErrorCodeToClass('LORA_NOT_READY', 409)).toBe(NoCensorLoraNotReadyError)
    expect(mapErrorCodeToClass('WEBHOOK_LIMIT_REACHED', 409)).toBe(NoCensorWebhookLimitReachedError)
    expect(mapErrorCodeToClass('WEBHOOK_INACTIVE', 409)).toBe(NoCensorWebhookInactiveError)
    expect(mapErrorCodeToClass('RATE_LIMITED', 429)).toBe(NoCensorRateLimitError)
    expect(mapErrorCodeToClass('DB_ERROR', 500)).toBe(NoCensorServerError)
    expect(mapErrorCodeToClass('GPU_UNAVAILABLE', 503)).toBe(NoCensorServerError)
  })

  it('falls through to base NoCensorError for unknown 4xx codes', () => {
    expect(mapErrorCodeToClass('NEW_FUTURE_CODE', 400)).toBe(NoCensorError)
  })

  it('falls through to NoCensorServerError for unknown 5xx codes', () => {
    expect(mapErrorCodeToClass('NEW_FUTURE_CODE', 500)).toBe(NoCensorServerError)
    expect(mapErrorCodeToClass('FEATURE_UNAVAILABLE', 503)).toBe(NoCensorServerError)
  })
})

describe('NoCensorWebhookError', () => {
  it('carries reason, header, and skewMs', () => {
    const e = new NoCensorWebhookError('bad sig', {
      code: 'WEBHOOK_VERIFICATION_FAILED',
      reason: 'bad_signature',
      header: 'x-nocensor-signature',
      skewMs: 12345,
    })
    expect(e instanceof NoCensorError).toBe(true)
    expect(e.name).toBe('NoCensorWebhookError')
    expect(e.reason).toBe('bad_signature')
    expect(e.header).toBe('x-nocensor-signature')
    expect(e.skewMs).toBe(12345)
  })

  it('allows optional header and skewMs to be undefined', () => {
    const e = new NoCensorWebhookError('stale', {
      code: 'WEBHOOK_VERIFICATION_FAILED',
      reason: 'stale_timestamp',
    })
    expect(e.header).toBeUndefined()
    expect(e.skewMs).toBeUndefined()
  })
})

describe('api key anti-leak', () => {
  it('JSON.stringify of an error does not contain the api key', () => {
    const e = new NoCensorAuthenticationError('bad', {
      code: 'UNAUTHORIZED',
      status: 401,
      requestId: 'req_1',
    })
    const serialized = JSON.stringify(e)
    expect(serialized).not.toContain('nc_live_')
  })
})
