import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

function seedPending(m: ReturnType<typeof createMockFetch>) {
  m.queue({
    status: 202,
    body: {
      data: {
        id: 'j1',
        status: 'pending',
        created_at: '2026-04-08T12:00:00Z',
        credits_charged: 10,
        outputs: null,
        error: null,
      },
    },
  })
}

describe('EnhanceResource.create', () => {
  it('upscale → sends scale in body', async () => {
    const m = createMockFetch()
    seedPending(m)
    await nc(m).enhance.create({ operation: 'upscale', source: 'https://x.png', scale: 4 })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({ operation: 'upscale', source: 'https://x.png', scale: 4 })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/enhance')
  })

  it('face-restore → sends only source', async () => {
    const m = createMockFetch()
    seedPending(m)
    await nc(m).enhance.create({ operation: 'face-restore', source: 'https://x.png' })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({ operation: 'face-restore', source: 'https://x.png' })
  })

  it('bg-replace → sends background_prompt (camel → snake)', async () => {
    const m = createMockFetch()
    seedPending(m)
    await nc(m).enhance.create({
      operation: 'bg-replace',
      source: 'https://x.png',
      backgroundPrompt: 'snowy forest',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      operation: 'bg-replace',
      source: 'https://x.png',
      background_prompt: 'snowy forest',
    })
  })

  it('attach-object → sends object_prompt and mask', async () => {
    const m = createMockFetch()
    seedPending(m)
    await nc(m).enhance.create({
      operation: 'attach-object',
      source: 'https://x.png',
      objectPrompt: 'a red hat',
      mask: 'data:image/png;base64,AAAA',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.operation).toBe('attach-object')
    expect(body.object_prompt).toBe('a red hat')
    expect(body.mask).toBe('data:image/png;base64,AAAA')
  })
})
