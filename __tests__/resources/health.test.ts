import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

describe('HealthResource', () => {
  it('GET /api/v1/health returns { status }', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { status: 'ok' } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const result = await nc.health.get()
    expect(result.status).toBe('ok')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/health')
    expect(m.calls[0]?.method).toBe('GET')
  })
})
