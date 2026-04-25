import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('VideoResource.create', () => {
  it('POSTs t2v body when no image', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 80,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).video.create({
      prompt: 'a fox running',
      negativePrompt: 'blurry',
      duration: 'long+',
      resolution: 'hd',
      seed: 7,
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      prompt: 'a fox running',
      negative_prompt: 'blurry',
      duration: 'long+',
      resolution: 'hd',
      seed: 7,
    })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/video')
  })

  it('POSTs i2v body when image is present', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 120,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).video.create({
      prompt: 'camera pans left',
      image: 'https://example.com/src.png',
      biometricConsent: true,
      loras: [{ id: 'lora-1', strength: 0.7 }],
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.image).toBe('https://example.com/src.png')
    expect(body.biometric_consent).toBe(true)
    expect(body.loras).toEqual([{ id: 'lora-1', strength: 0.7 }])
  })

  it('createAndWait polls until completion with video default timeout', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 80,
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
          credits_charged: 80,
          outputs: [{ url: 'https://x/out.mp4', media_type: 'video', size_bytes: 99 }],
          error: null,
        },
      },
    })
    const result = await nc(m).video.createAndWait({
      prompt: 'x',
      pollTimeout: 5000,
      minIntervalMs: 1,
      maxIntervalMs: 5,
    })
    expect(result.outputs[0]?.mediaType).toBe('video')
  })
})
