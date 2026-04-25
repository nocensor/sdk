import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'
import { NoCensorPurchaseRequiredError } from '../../src/errors'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('UndressResource.create', () => {
  it('POSTs body with source and biometric_consent', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'j1',
          status: 'pending',
          created_at: '2026-04-08T12:00:00Z',
          credits_charged: 40,
          outputs: null,
          error: null,
        },
      },
    })
    await nc(m).undress.create({
      source: 'https://example.com/src.png',
      biometricConsent: true,
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body).toEqual({
      source: 'https://example.com/src.png',
      biometric_consent: true,
    })
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/undress')
  })

  it('402 PURCHASE_REQUIRED → NoCensorPurchaseRequiredError', async () => {
    const m = createMockFetch()
    m.queue({
      status: 402,
      body: { error: { code: 'PURCHASE_REQUIRED', message: 'premium', status: 402, request_id: 'r' } },
    })
    await expect(nc(m).undress.create({ source: 'https://x.png', biometricConsent: true })).rejects.toBeInstanceOf(
      NoCensorPurchaseRequiredError,
    )
  })
})
