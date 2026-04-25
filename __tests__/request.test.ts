// packages/sdk/__tests__/request.test.ts
import { describe, it, expect, vi } from 'vitest'
import { doRequest, type RequestContext } from '../src/request'
import { createMockFetch } from './_helpers/mock-fetch'
import {
  NoCensorAuthenticationError,
  NoCensorNotFoundError,
  NoCensorValidationError,
  NoCensorRateLimitError,
  NoCensorServerError,
  NoCensorNetworkError,
  NoCensorTimeoutError,
  NoCensorJobNotCancellableError,
} from '../src/errors'

function ctx(overrides: Partial<RequestContext> = {}): RequestContext {
  const m = createMockFetch()
  return {
    baseUrl: 'https://nocensor.ai',
    apiKey: 'nc_live_test',
    userAgent: 'nocensor-sdk/0.1.0',
    fetch: m.fetch as unknown as typeof globalThis.fetch,
    timeout: 60_000,
    maxRetries: 2,
    onRateLimit: undefined,
    ...overrides,
    _mock: m,
  } as unknown as RequestContext
}

describe('doRequest auth + headers', () => {
  it('sets Authorization: Bearer <key> header', async () => {
    const c = ctx()
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 200, body: { data: { id: 'j1' } } })
    await doRequest(c, 'GET', '/api/v1/jobs/j1')
    expect(mock.calls[0]?.headers.get('authorization')).toBe('Bearer nc_live_test')
  })

  it('sets User-Agent header', async () => {
    const c = ctx()
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 200, body: { data: {} } })
    await doRequest(c, 'GET', '/api/v1/health')
    expect(mock.calls[0]?.headers.get('user-agent')).toBe('nocensor-sdk/0.1.0')
  })

  it('sets Content-Type and stringifies body', async () => {
    const c = ctx()
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 200, body: { data: {} } })
    await doRequest(c, 'POST', '/api/v1/generate', { prompt: 'hi' })
    expect(mock.calls[0]?.headers.get('content-type')).toBe('application/json')
    expect(mock.calls[0]?.body).toBe('{"prompt":"hi"}')
  })

  it('returns unwrapped data field', async () => {
    const c = ctx()
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 200, body: { data: { id: 'xyz', status: 'pending' } } })
    const result = await doRequest<{ id: string; status: string }>(c, 'POST', '/api/v1/generate', { prompt: 'x' })
    expect(result).toEqual({ id: 'xyz', status: 'pending' })
  })
})

describe('doRequest error mapping', () => {
  it('401 → NoCensorAuthenticationError', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED', message: 'bad key', status: 401, request_id: 'req_1' } },
    })
    await expect(doRequest(c, 'GET', '/api/v1/account')).rejects.toBeInstanceOf(NoCensorAuthenticationError)
  })

  it('404 → NoCensorNotFoundError with requestId', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 404,
      body: { error: { code: 'JOB_NOT_FOUND', message: 'missing', status: 404, request_id: 'req_42' } },
    })
    try {
      await doRequest(c, 'GET', '/api/v1/jobs/xxx')
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorNotFoundError)
      expect((e as NoCensorNotFoundError).requestId).toBe('req_42')
      expect((e as NoCensorNotFoundError).code).toBe('JOB_NOT_FOUND')
    }
  })

  it('409 JOB_NOT_CANCELLABLE → NoCensorJobNotCancellableError', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 409,
      body: { error: { code: 'JOB_NOT_CANCELLABLE', message: 'already done', status: 409, request_id: 'r' } },
    })
    await expect(doRequest(c, 'DELETE', '/api/v1/jobs/j1')).rejects.toBeInstanceOf(NoCensorJobNotCancellableError)
  })

  it('422 VALIDATION_ERROR → NoCensorValidationError', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', message: 'bad', status: 422, request_id: 'r' } },
    })
    await expect(doRequest(c, 'POST', '/api/v1/generate', {})).rejects.toBeInstanceOf(NoCensorValidationError)
  })

  it('429 → NoCensorRateLimitError with retryAfterMs', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 429,
      headers: { 'retry-after': '30', 'content-type': 'application/json' },
      body: { error: { code: 'RATE_LIMITED', message: 'slow', status: 429, request_id: 'r' } },
    })
    try {
      await doRequest(c, 'POST', '/api/v1/generate', {})
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorRateLimitError)
      expect((e as NoCensorRateLimitError).retryAfterMs).toBe(30_000)
    }
  })

  it('unknown error code falls through to base NoCensorError', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 400,
      body: { error: { code: 'FUTURE_CODE', message: 'x', status: 400, request_id: 'r' } },
    })
    try {
      await doRequest(c, 'GET', '/api/v1/account')
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as { code: string }).code).toBe('FUTURE_CODE')
    }
  })
})

describe('doRequest retries', () => {
  it('retries on 500 up to maxRetries', async () => {
    const c = ctx({ maxRetries: 2 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 500, body: { error: { code: 'DB_ERROR', message: 'x', status: 500, request_id: 'r' } } })
    mock.queue({ status: 500, body: { error: { code: 'DB_ERROR', message: 'x', status: 500, request_id: 'r' } } })
    mock.queue({ status: 200, body: { data: { ok: true } } })
    const result = await doRequest<{ ok: boolean }>(c, 'GET', '/api/v1/account')
    expect(result.ok).toBe(true)
    expect(mock.calls).toHaveLength(3)
  }, 10_000)

  it('does NOT retry 503 GPU_UNAVAILABLE without Retry-After', async () => {
    const c = ctx({ maxRetries: 3 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 503,
      body: { error: { code: 'GPU_UNAVAILABLE', message: 'busy', status: 503, request_id: 'r' } },
    })
    await expect(doRequest(c, 'POST', '/api/v1/generate', {})).rejects.toBeInstanceOf(NoCensorServerError)
    expect(mock.calls).toHaveLength(1)
  })

  it('DOES retry 503 GPU_UNAVAILABLE when Retry-After is set', async () => {
    const c = ctx({ maxRetries: 2 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 503,
      headers: { 'retry-after': '0', 'content-type': 'application/json' },
      body: { error: { code: 'GPU_UNAVAILABLE', message: 'busy', status: 503, request_id: 'r' } },
    })
    mock.queue({ status: 200, body: { data: { ok: true } } })
    const result = await doRequest<{ ok: boolean }>(c, 'POST', '/api/v1/generate', {})
    expect(result.ok).toBe(true)
    expect(mock.calls).toHaveLength(2)
  })
})

describe('doRequest network + timeout', () => {
  it('fetch rejection → NoCensorNetworkError', async () => {
    const c = ctx({ maxRetries: 0 })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ networkError: new Error('socket closed') })
    await expect(doRequest(c, 'GET', '/api/v1/health')).rejects.toBeInstanceOf(NoCensorNetworkError)
  })

  it('honors per-request timeout → NoCensorTimeoutError', async () => {
    const fetchThatHangs = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal
          if (signal) {
            if (signal.aborted) {
              reject(new DOMException('aborted', 'AbortError'))
              return
            }
            signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
          }
        }),
    )
    const c: RequestContext = {
      baseUrl: 'https://nocensor.ai',
      apiKey: 'nc_live_test',
      userAgent: 'nocensor-sdk/0.1.0',
      fetch: fetchThatHangs as unknown as typeof globalThis.fetch,
      timeout: 50,
      maxRetries: 0,
    }
    await expect(doRequest(c, 'GET', '/api/v1/health')).rejects.toBeInstanceOf(NoCensorTimeoutError)
  }, 2_000)
})

describe('doRequest onRateLimit', () => {
  it('fires with parsed info on authenticated response', async () => {
    const captured: unknown[] = []
    const c = ctx({ onRateLimit: (info) => captured.push(info) })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-ratelimit-limit': '10',
        'x-ratelimit-remaining': '9',
        'x-ratelimit-reset': '1744156800',
      },
      body: { data: {} },
    })
    await doRequest(c, 'POST', '/api/v1/generate', {})
    expect(captured).toHaveLength(1)
    expect((captured[0] as { limit: number }).limit).toBe(10)
  })

  it('swallows errors thrown by onRateLimit', async () => {
    const c = ctx({
      onRateLimit: () => {
        throw new Error('instrumentation broken')
      },
    })
    const mock = (c as unknown as { _mock: ReturnType<typeof createMockFetch> })._mock
    mock.queue({ status: 200, body: { data: {} } })
    await expect(doRequest(c, 'GET', '/api/v1/health')).resolves.toBeDefined()
  })
})
