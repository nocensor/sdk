import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'
import { NoCensorPermissionError } from '../../src/errors'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('PoseExtractResource.create', () => {
  it('POSTs body with source', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-05-09T00:00:00Z',
          credits_charged: 0,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).poseExtract.create({ source: 'https://example.com/src.png' })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({ source: 'https://example.com/src.png' })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/pose-extract')
  })

  it('converts Uint8Array source to data URI', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: { id: 'j2', status: 'pending', created_at: '2026-05-09T00:00:00Z', credits_charged: 0, outputs: null, error: null },
      },
    })
    // PNG signature = 0x89,0x50,0x4e,0x47
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    await nc(m).poseExtract.create({ source: png })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.source.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('403 FORBIDDEN → NoCensorPermissionError', async () => {
    const m = createMockFetch()
    m.queue({
      status: 403,
      body: { error: { code: 'FORBIDDEN', message: 'This endpoint requires an admin API key', request_id: 'r1' } },
    })
    await expect(nc(m).poseExtract.create({ source: 'https://example.com/x.png' })).rejects.toBeInstanceOf(
      NoCensorPermissionError,
    )
  })

  it('createAndWait polls until completion', async () => {
    const m = createMockFetch()
    // First call: create → 202 pending
    m.queue({
      status: 202,
      body: { data: { id: 'j3', status: 'pending', created_at: '2026-05-09T00:00:00Z', credits_charged: 0, outputs: null, error: null } },
    })
    // Second call: poll → 200 completed
    m.queue({
      status: 200,
      body: { data: { id: 'j3', status: 'completed', created_at: '2026-05-09T00:00:00Z', credits_charged: 0, outputs: [{ url: 'https://example.com/pose.png', media_type: 'image' }], error: null } },
    })
    const result = await nc(m).poseExtract.createAndWait({
      source: 'https://example.com/src.png',
      pollTimeout: 5_000,
      minIntervalMs: 1,
      maxIntervalMs: 5,
    })
    expect(result.status).toBe('completed')
  })
})
