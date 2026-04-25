import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

const WEBHOOK_WIRE = {
  id: 'wh1',
  url: 'https://example.com/hook',
  events: ['job.completed'],
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
  last_delivery_at: null,
  last_success_at: null,
  last_failure_at: null,
}

const DELIVERY_WIRE = {
  id: 'del1',
  event_id: 'evt1',
  event_type: 'job.completed',
  status: 'delivered',
  attempts: 1,
  last_response_status: 200,
  last_error: null,
  created_at: '2026-01-01T00:00:00.000Z',
  delivered_at: '2026-01-01T00:00:01.000Z',
}

describe('WebhooksResource', () => {
  it('create() maps wire → clean and includes secret', async () => {
    const m = createMockFetch()
    m.queue({ status: 201, body: { data: { ...WEBHOOK_WIRE, secret: 'sec_abc' } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const wh = await nc.webhooks.create({ url: 'https://example.com/hook', events: ['job.completed'] })
    expect(wh.id).toBe('wh1')
    expect(wh.isActive).toBe(true)
    expect(wh.events).toEqual(['job.completed'])
    expect(wh.createdAt).toBeInstanceOf(Date)
    expect(wh.secret).toBe('sec_abc')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks')
    expect(m.calls[0]?.method).toBe('POST')
  })

  it('list() returns webhook array', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { items: [WEBHOOK_WIRE] } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const items = await nc.webhooks.list()
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe('wh1')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks')
    expect(m.calls[0]?.method).toBe('GET')
  })

  it('get() fetches by id', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: WEBHOOK_WIRE } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const wh = await nc.webhooks.get('wh1')
    expect(wh.id).toBe('wh1')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks/wh1')
    expect(m.calls[0]?.method).toBe('GET')
  })

  it('update() sends PATCH and returns updated webhook', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { ...WEBHOOK_WIRE, is_active: false } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const wh = await nc.webhooks.update('wh1', { isActive: false })
    expect(wh.isActive).toBe(false)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks/wh1')
    expect(m.calls[0]?.method).toBe('PATCH')
  })

  it('update() appends rotate_secret=true when requested', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { ...WEBHOOK_WIRE, secret: 'new_secret' } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const wh = await nc.webhooks.update('wh1', { rotateSecret: true })
    expect(m.calls[0]?.url).toContain('rotate_secret=true')
    expect('secret' in wh && wh.secret).toBe('new_secret')
  })

  it('delete() sends DELETE', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { id: 'wh1', deleted: true } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const result = await nc.webhooks.delete('wh1')
    expect(result.id).toBe('wh1')
    expect(result.deleted).toBe(true)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks/wh1')
    expect(m.calls[0]?.method).toBe('DELETE')
  })

  it('listDeliveries() maps wire → clean', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { items: [DELIVERY_WIRE] } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const deliveries = await nc.webhooks.listDeliveries('wh1')
    expect(deliveries).toHaveLength(1)
    expect(deliveries[0]?.id).toBe('del1')
    expect(deliveries[0]?.eventId).toBe('evt1')
    expect(deliveries[0]?.eventType).toBe('job.completed')
    expect(deliveries[0]?.lastResponseStatus).toBe(200)
    expect(deliveries[0]?.deliveredAt).toBeInstanceOf(Date)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks/wh1/deliveries')
  })

  it('test() sends POST to /test', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { delivered: true } } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const result = await nc.webhooks.test('wh1')
    expect(result.delivered).toBe(true)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/webhooks/wh1/test')
    expect(m.calls[0]?.method).toBe('POST')
  })
})
