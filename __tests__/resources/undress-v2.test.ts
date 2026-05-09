import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'
import { NoCensorPurchaseRequiredError, NoCensorServerError } from '../../src/errors'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('UndressV2Resource.create', () => {
  it('POSTs body with source and biometric_consent', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-05-09T00:00:00Z',
          credits_charged: 80,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).undressV2.create({
      source: 'https://example.com/src.png',
      biometricConsent: true,
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      source: 'https://example.com/src.png',
      biometric_consent: true,
    })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/undress-v2')
  })

  it('402 PURCHASE_REQUIRED → NoCensorPurchaseRequiredError', async () => {
    const m = createMockFetch()
    m.queue({
      status: 402,
      body: { error: { code: 'PURCHASE_REQUIRED', message: 'undress-v2 requires a credit purchase', request_id: 'r1' } },
    })
    await expect(
      nc(m).undressV2.create({ source: 'https://example.com/x.png', biometricConsent: true }),
    ).rejects.toBeInstanceOf(NoCensorPurchaseRequiredError)
  })

  it('503 FEATURE_UNAVAILABLE (admin gate) → NoCensorServerError', async () => {
    const m = createMockFetch()
    m.setDefault({
      status: 503,
      body: { error: { code: 'FEATURE_UNAVAILABLE', message: 'This feature is temporarily unavailable.', request_id: 'r1' } },
    })
    await expect(
      nc(m).undressV2.create({ source: 'https://example.com/x.png', biometricConsent: true }),
    ).rejects.toBeInstanceOf(NoCensorServerError)
  })

  it('createAndWait polls until completion', async () => {
    const m = createMockFetch()
    // First call: create → 202 pending
    m.queue({
      status: 202,
      body: { data: { id: 'j4', status: 'pending', created_at: '2026-05-09T00:00:00Z', credits_charged: 80, outputs: null, error: null } },
    })
    // Second call: poll → 200 completed
    m.queue({
      status: 200,
      body: { data: { id: 'j4', status: 'completed', created_at: '2026-05-09T00:00:00Z', credits_charged: 80, outputs: [{ url: 'https://example.com/out.png', media_type: 'image' }], error: null } },
    })
    const result = await nc(m).undressV2.createAndWait({
      source: 'https://example.com/src.png',
      biometricConsent: true,
      pollTimeout: 5_000,
      minIntervalMs: 1,
      maxIntervalMs: 5,
    })
    expect(result.status).toBe('completed')
  })
})
