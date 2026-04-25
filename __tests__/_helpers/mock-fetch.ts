// packages/sdk/__tests__/_helpers/mock-fetch.ts
import { vi, type Mock } from 'vitest'

export interface MockResponse {
  status?: number
  body?: unknown
  headers?: Record<string, string>
  /** Simulate a network-level failure (fetch rejection). */
  networkError?: Error
}

export interface CapturedCall {
  url: string
  method: string
  headers: Headers
  body: string | undefined
}

export interface MockFetch {
  fetch: Mock
  /** Enqueue the next response for the next fetch call. */
  queue: (r: MockResponse) => void
  /** Enqueue the same response for every subsequent call. */
  setDefault: (r: MockResponse) => void
  calls: CapturedCall[]
  /** Reset captures and queue. */
  reset: () => void
}

export function createMockFetch(): MockFetch {
  let defaultResponse: MockResponse = { status: 200, body: { data: {} } }
  const queue: MockResponse[] = []
  const calls: CapturedCall[] = []

  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    // NOTE: Only captures string bodies. ReadableStream/FormData bodies captured as undefined.
    // If the SDK ever sends non-string bodies, extend this helper to handle them.
    const bodyStr = typeof init?.body === 'string' ? init.body : undefined
    calls.push({
      url,
      method: init?.method ?? 'GET',
      headers: new Headers(init?.headers),
      body: bodyStr,
    })

    const next = queue.shift() ?? defaultResponse

    if (next.networkError) {
      throw next.networkError
    }

    const headers = new Headers(next.headers ?? { 'content-type': 'application/json' })
    const bodyPayload = next.body === undefined ? null : JSON.stringify(next.body)

    return new Response(bodyPayload, {
      status: next.status ?? 200,
      headers,
    })
  })

  return {
    fetch,
    queue: (r) => queue.push(r),
    setDefault: (r) => {
      defaultResponse = r
    },
    calls,
    reset: () => {
      queue.length = 0
      calls.length = 0
      defaultResponse = { status: 200, body: { data: {} } }
    },
  }
}
