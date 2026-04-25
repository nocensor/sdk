import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('GenerateResource.create', () => {
  it('POSTs to /generate with camelCase→snake_case body and passes image passthrough', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: null,
          error: null,
        },
      },
    })
    const result = await nc(m).generate.create({
      prompt: 'a fox',
      negativePrompt: 'blurry',
      model: 'realistic',
      seed: 42,
      image: 'https://example.com/x.png',
      denoise: 0.6,
      loras: [{ id: 'lora-1', strength: 0.7 }],
    })
    expect(result.id).toBe('j1')
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      prompt: 'a fox',
      negative_prompt: 'blurry',
      model: 'realistic',
      seed: 42,
      image: 'https://example.com/x.png',
      denoise: 0.6,
      loras: [{ id: 'lora-1', strength: 0.7 }],
    })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/generate')
    expect(m.calls[0]?.method).toBe('POST')
  })

  it('sends seed: 0 (not stripped as falsy)', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).generate.create({ prompt: 'x', seed: 0 })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.seed).toBe(0)
  })
})

describe('GenerateResource.createAndWait', () => {
  it('polls until completion and returns CompletedJob', async () => {
    const m = createMockFetch()
    // Initial create
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 15,
          outputs: null,
          error: null,
        },
      },
    })
    // jobs.get → processing
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
    // jobs.get → completed
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
    const completed = await nc(m).generate.createAndWait({
      prompt: 'a fox',
      pollTimeout: 5000,
      minIntervalMs: 1,
      maxIntervalMs: 5,
    })
    expect(completed.status).toBe('completed')
    expect(completed.outputs[0]?.url).toBe('https://x/y.png')
    expect(m.calls).toHaveLength(3)
  })
})
