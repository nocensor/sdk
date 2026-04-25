import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('FaceSwapResource.create', () => {
  it('POSTs with face_model_id path', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 25,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).faceSwap.create({
      source: 'https://example.com/src.png',
      biometricConsent: true,
      faceModelId: 'fm-123',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      source: 'https://example.com/src.png',
      biometric_consent: true,
      face_model_id: 'fm-123',
    })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/face-swap')
  })

  it('POSTs with face data URI path', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 25,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).faceSwap.create({
      source: 'https://example.com/src.png',
      biometricConsent: true,
      face: 'data:image/png;base64,iVBORw==',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.face).toBe('data:image/png;base64,iVBORw==')
    expect(body.face_model_id).toBeUndefined()
  })
})
