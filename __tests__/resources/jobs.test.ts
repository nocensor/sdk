import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'
import { NoCensorJobNotCancellableError } from '../../src/errors'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('JobsResource.get', () => {
  it('returns camelCased Job with Date fields', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          id: 'j1',
          status: 'completed',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: [{ url: 'https://x/y.png', media_type: 'image', size_bytes: 1234 }],
          error: null,
          progress_percent: 100,
        },
      },
    })
    const job = await nc(m).jobs.get('j1')
    expect(job.id).toBe('j1')
    expect(job.status).toBe('completed')
    expect(job.createdAt).toBeInstanceOf(Date)
    expect(job.creditsCharged).toBe(15)
    expect(job.outputs?.[0]?.mediaType).toBe('image')
    expect(job.outputs?.[0]?.sizeBytes).toBe(1234)
    expect(job.progressPercent).toBe(100)
  })
})

describe('JobsResource.cancel', () => {
  it('returns CancelledJob with refundedCredits', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          id: 'j1',
          status: 'cancelled',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          refunded_credits: 15,
          cancelled_via: 'api',
          outputs: null,
          error: null,
        },
      },
    })
    const cancelled = await nc(m).jobs.cancel('j1')
    expect(cancelled.status).toBe('cancelled')
    expect(cancelled.refundedCredits).toBe(15)
    expect(cancelled.cancelledVia).toBe('api')
    expect(m.calls[0]?.method).toBe('DELETE')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/jobs/j1')
  })

  it('409 maps to NoCensorJobNotCancellableError', async () => {
    const m = createMockFetch()
    m.queue({
      status: 409,
      body: { error: { code: 'JOB_NOT_CANCELLABLE', message: 'terminal', status: 409, request_id: 'r' } },
    })
    await expect(nc(m).jobs.cancel('j1')).rejects.toBeInstanceOf(NoCensorJobNotCancellableError)
  })
})

describe('JobsResource.listPage', () => {
  it('passes page and status query params', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: { data: { items: [] }, meta: { request_id: 'r', page: 2, page_size: 20, total_pages: 5 } },
    })
    await nc(m).jobs.listPage({ page: 2, status: 'completed' })
    expect(m.calls[0]?.url).toContain('page=2')
    expect(m.calls[0]?.url).toContain('status=completed')
  })
})

describe('JobsResource.waitForCompletion', () => {
  it('resolves to CompletedJob when terminal', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          id: 'j1',
          status: 'processing',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: null,
          error: null,
        },
      },
    })
    m.queue({
      status: 200,
      body: {
        data: {
          id: 'j1',
          status: 'completed',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: [{ url: 'https://x/y.png', media_type: 'image', size_bytes: 1 }],
          error: null,
        },
      },
    })
    const job = await nc(m).jobs.waitForCompletion('j1', { minIntervalMs: 1, maxIntervalMs: 5 })
    expect(job.status).toBe('completed')
    expect(job.outputs).toHaveLength(1)
  })
})
