// packages/sdk/__tests__/client.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { NoCensor } from '../src/client'
import { NoCensorAuthenticationError, NoCensorValidationError } from '../src/errors'
import { createMockFetch } from './_helpers/mock-fetch'

describe('NoCensor ctor', () => {
  afterEach(() => {
    delete process.env['NOCENSOR_API_KEY']
  })

  it('accepts explicit apiKey', () => {
    const nc = new NoCensor({ apiKey: 'nc_live_abc' })
    expect(nc).toBeInstanceOf(NoCensor)
  })

  it('falls back to NOCENSOR_API_KEY env var', () => {
    process.env['NOCENSOR_API_KEY'] = 'nc_live_env'
    const nc = new NoCensor()
    expect(nc).toBeInstanceOf(NoCensor)
  })

  it('throws NoCensorAuthenticationError with exact message when no key', () => {
    try {
      new NoCensor()
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorAuthenticationError)
      expect((e as Error).message).toContain('No API key provided')
      expect((e as Error).message).toContain('NOCENSOR_API_KEY')
    }
  })

  it('does not expose apiKey on instance', () => {
    const nc = new NoCensor({ apiKey: 'nc_live_secret_xyz' })
    const serialized = JSON.stringify(nc)
    expect(serialized).not.toContain('nc_live_secret_xyz')
    expect(Object.keys(nc)).not.toContain('apiKey')
  })

  it('normalizes trailing slash on baseUrl', () => {
    const nc = new NoCensor({ apiKey: 'k', baseUrl: 'https://nocensor.ai/' })
    expect(nc).toBeInstanceOf(NoCensor)
  })

  it('rejects baseUrl ending in /api', () => {
    expect(() => new NoCensor({ apiKey: 'k', baseUrl: 'https://nocensor.ai/api' })).toThrow(NoCensorValidationError)
  })

  it('rejects baseUrl ending in /api/v1', () => {
    expect(() => new NoCensor({ apiKey: 'k', baseUrl: 'https://nocensor.ai/api/v1' })).toThrow(NoCensorValidationError)
  })

  it('rejects baseUrl containing /api/v1/', () => {
    expect(() => new NoCensor({ apiKey: 'k', baseUrl: 'https://nocensor.ai/api/v1/sub' })).toThrow(
      NoCensorValidationError,
    )
  })
})

describe('NoCensor.request escape hatch', () => {
  it('can make a low-level request using the shared request layer', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { status: 'ok' } } })
    const nc = new NoCensor({
      apiKey: 'nc_live_x',
      fetch: m.fetch as unknown as typeof globalThis.fetch,
    })
    const result = await nc.request<{ status: string }>('GET', '/api/v1/health')
    expect(result.status).toBe('ok')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/health')
  })
})
