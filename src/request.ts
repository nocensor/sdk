// packages/sdk/src/request.ts
// Core request layer: auth, fetch wrapper, retry, error mapping, rate-limit parse.

import {
  NoCensorError,
  NoCensorNetworkError,
  NoCensorTimeoutError,
  NoCensorRateLimitError,
  mapErrorCodeToClass,
  type RateLimitInfo,
  type ErrorInit,
} from './errors'
import { computeRetryDelay, isRetryable } from './retry'
import { parseRateLimitHeaders, parseRetryAfterMs } from './headers'
import { anySignal } from './any-signal'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface RequestOverrides {
  signal?: AbortSignal
  idempotencyKey?: string
  /** Additional headers merged on top of defaults. */
  headers?: Record<string, string>
  /** Per-request timeout override (ms). */
  timeout?: number
  /** Per-request maxRetries override. Set to 0 to disable. */
  maxRetries?: number
}

export interface RequestContext {
  baseUrl: string
  apiKey: string
  userAgent: string
  fetch: typeof globalThis.fetch
  timeout: number
  maxRetries: number
  onRateLimit?: (info: RateLimitInfo) => void
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; status?: number; request_id?: string }
}

interface ApiEnvelope<T> {
  data: T
  meta?: Record<string, unknown>
}

export interface RequestResultWithMeta<T> {
  data: T
  meta: Record<string, unknown>
}

export async function doRequest<T = unknown>(
  ctx: RequestContext,
  method: HttpMethod,
  path: string,
  body?: unknown,
  init: RequestOverrides = {},
): Promise<T> {
  return (await doRequestEnvelope<T>(ctx, method, path, body, init)).data
}

export async function doRequestWithMeta<T = unknown>(
  ctx: RequestContext,
  method: HttpMethod,
  path: string,
  body?: unknown,
  init: RequestOverrides = {},
): Promise<RequestResultWithMeta<T>> {
  const env = await doRequestEnvelope<T>(ctx, method, path, body, init)
  return { data: env.data, meta: env.meta ?? {} }
}

async function doRequestEnvelope<T = unknown>(
  ctx: RequestContext,
  method: HttpMethod,
  path: string,
  body?: unknown,
  init: RequestOverrides = {},
): Promise<ApiEnvelope<T>> {
  const url = `${ctx.baseUrl}${path}`
  const headers = new Headers({
    Authorization: `Bearer ${ctx.apiKey}`,
    Accept: 'application/json',
    'User-Agent': ctx.userAgent,
  })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (init.idempotencyKey) headers.set('Idempotency-Key', init.idempotencyKey)
  if (init.headers) for (const [k, v] of Object.entries(init.headers)) headers.set(k, v)

  const serializedBody = body === undefined ? undefined : JSON.stringify(body)
  const maxRetries = init.maxRetries ?? ctx.maxRetries
  const timeoutMs = init.timeout ?? ctx.timeout

  let attempt = 0
  while (true) {
    const timeoutController = new AbortController()
    const timer = setTimeout(() => timeoutController.abort(), timeoutMs)
    const signal = anySignal([init.signal, timeoutController.signal])

    let response: Response
    try {
      response = await ctx.fetch(url, {
        method,
        headers,
        body: serializedBody,
        signal,
      })
    } catch (err) {
      clearTimeout(timer)
      const isAbort = err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')
      if (isAbort && timeoutController.signal.aborted && !init.signal?.aborted) {
        if (attempt < maxRetries) {
          const delay = computeRetryDelay(attempt, null)
          await sleep(delay)
          attempt++
          continue
        }
        throw new NoCensorTimeoutError(`Request timed out after ${timeoutMs}ms: ${method} ${path}`, {
          code: 'TIMEOUT',
          status: null,
          cause: err,
        })
      }
      if (isAbort && init.signal?.aborted) throw err
      if (attempt < maxRetries) {
        const delay = computeRetryDelay(attempt, null)
        await sleep(delay)
        attempt++
        continue
      }
      throw new NoCensorNetworkError(`Network error: ${method} ${path}`, {
        code: 'NETWORK_ERROR',
        status: null,
        cause: err,
      })
    } finally {
      clearTimeout(timer)
    }

    if (ctx.onRateLimit) {
      const info = parseRateLimitHeaders(response.headers, path)
      try {
        ctx.onRateLimit(info)
      } catch {
        /* swallow */
      }
    }

    if (response.ok) {
      if (response.status === 204) return { data: undefined as T, meta: {} }
      const bodyJson = (await response.json()) as ApiEnvelope<T>
      return bodyJson
    }

    let errBody: ApiErrorBody = {}
    try {
      errBody = (await response.json()) as ApiErrorBody
    } catch {
      /* ignore */
    }
    const code = errBody.error?.code ?? 'UNKNOWN'
    const message = errBody.error?.message ?? `HTTP ${response.status}`
    const requestId = errBody.error?.request_id ?? response.headers.get('x-request-id') ?? null
    const retryAfterMs = parseRetryAfterMs(response.headers)

    const shouldRetry = shouldRetryStatus(response.status, code, retryAfterMs, attempt < maxRetries)
    if (shouldRetry) {
      const delay = retryAfterMs ?? computeRetryDelay(attempt, response.headers.get('retry-after'))
      await sleep(delay)
      attempt++
      continue
    }

    throw buildError(code, response.status, message, requestId, errBody, retryAfterMs, response.headers, path)
  }
}

function shouldRetryStatus(status: number, code: string, retryAfterMs: number | null, retriesRemain: boolean): boolean {
  if (!retriesRemain) return false
  if (!isRetryable(status)) return false
  if (status === 503 && code === 'GPU_UNAVAILABLE' && retryAfterMs === null) return false
  return true
}

function buildError(
  code: string,
  status: number,
  message: string,
  requestId: string | null,
  errBody: unknown,
  retryAfterMs: number | null,
  headers: Headers,
  path: string,
): NoCensorError {
  const ErrorClass = mapErrorCodeToClass(code, status)
  const init: ErrorInit = { code, status, requestId, cause: errBody }

  if (ErrorClass === NoCensorRateLimitError) {
    return new NoCensorRateLimitError(message, {
      ...init,
      retryAfterMs: retryAfterMs ?? 0,
      rateLimit: parseRateLimitHeaders(headers, path),
    })
  }

  return new ErrorClass(message, init) as NoCensorError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
