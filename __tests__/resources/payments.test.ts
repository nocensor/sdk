import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

const PAYMENT_WIRE = {
  id: 'pay1',
  gateway: 'btcpay',
  amount_usd: 9.99,
  credits: 500,
  status: 'completed',
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('PaymentsResource', () => {
  it('listPage() camelCases fields and extracts nextCursor from meta', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: { items: [PAYMENT_WIRE] },
        meta: { next_cursor: '2026-01-01T00:00:00.000Z,pay1' },
      },
    })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const page = await nc.payments.listPage({ limit: 1 })
    expect(page.items).toHaveLength(1)
    expect(page.items[0]?.id).toBe('pay1')
    expect(page.items[0]?.gateway).toBe('btcpay')
    expect(page.items[0]?.amountUsd).toBe(9.99)
    expect(page.items[0]?.credits).toBe(500)
    expect(page.items[0]?.status).toBe('completed')
    expect(page.items[0]?.createdAt).toBeInstanceOf(Date)
    expect(page.nextCursor).toBe('2026-01-01T00:00:00.000Z,pay1')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/payments?limit=1')
  })

  it('listPage() returns null nextCursor when meta.next_cursor absent', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { items: [PAYMENT_WIRE] }, meta: {} } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const page = await nc.payments.listPage()
    expect(page.nextCursor).toBeNull()
  })

  it('listPage() passes cursor in query string', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: { items: [] }, meta: {} } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    await nc.payments.listPage({ cursor: '2026-01-01T00:00:00.000Z,pay1' })
    expect(m.calls[0]?.url).toContain('cursor=2026-01-01T00%3A00%3A00.000Z%2Cpay1')
    expect(m.calls[0]?.method).toBe('GET')
  })

  it('list() iterates all pages until no nextCursor', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: { data: { items: [PAYMENT_WIRE] }, meta: { next_cursor: 'cursor2' } },
    })
    m.queue({
      status: 200,
      body: { data: { items: [{ ...PAYMENT_WIRE, id: 'pay2' }] }, meta: {} },
    })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const ids: string[] = []
    for await (const p of nc.payments.list()) ids.push(p.id)
    expect(ids).toEqual(['pay1', 'pay2'])
    expect(m.calls).toHaveLength(2)
  })
})
