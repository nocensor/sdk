import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

describe('CreditsResource', () => {
  it('get() camelCases fields', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: { data: { balance: 85, lifetime_purchased: 200, lifetime_consumed: 115 } },
    })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const credits = await nc.credits.get()
    expect(credits.balance).toBe(85)
    expect(credits.lifetimePurchased).toBe(200)
    expect(credits.lifetimeConsumed).toBe(115)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/credits')
    expect(m.calls[0]?.method).toBe('GET')
  })
})
