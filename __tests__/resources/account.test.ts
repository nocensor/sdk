import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

describe('AccountResource', () => {
  it('get() unwraps data and camelCases fields', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          user_id: 'u1',
          credits_remaining: 142,
          scopes: ['generation', 'mgmt'],
          rate_limits: { generation_rpm: 10, mgmt_rpm: 60, webhook_mgmt_rpm: 10 },
        },
      },
    })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const account = await nc.account.get()
    expect(account.userId).toBe('u1')
    expect(account.creditsRemaining).toBe(142)
    expect(account.scopes).toEqual(['generation', 'mgmt'])
    expect(account.rateLimits.generationRpm).toBe(10)
    expect(account.rateLimits.mgmtRpm).toBe(60)
    expect(account.rateLimits.webhookMgmtRpm).toBe(10)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/account')
  })
})
