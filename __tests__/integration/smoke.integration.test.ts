// packages/sdk/__tests__/integration/smoke.integration.test.ts
// ⚠️ Burns real credits (~15 per run). Run manually before release.
// Guard: NOCENSOR_TEST_API_KEY env var must be set.

import { describe, it, expect, beforeAll } from 'vitest'
import { NoCensor } from '../../src/index'
import { verifyWebhook } from '../../src/webhooks/verify'
import { hmacSha256Hex } from '../../src/webhooks/hmac'

const API_KEY = process.env['NOCENSOR_TEST_API_KEY']
const BASE_URL = process.env['NOCENSOR_TEST_BASE_URL'] ?? 'https://nocensor.ai'

describe.skipIf(!API_KEY)('integration smoke', () => {
  let nc: NoCensor
  beforeAll(() => {
    nc = new NoCensor({ apiKey: API_KEY!, baseUrl: BASE_URL })
  })

  it('health.get() returns a status', async () => {
    const h = await nc.health.get()
    expect(h.status).toBeTruthy()
  })

  it('account.get() returns credits_remaining as a number', async () => {
    const a = await nc.account.get()
    expect(typeof a.creditsRemaining).toBe('number')
    expect(a.userId).toBeTruthy()
  })

  it('generate.createAndWait() completes end-to-end (burns ~15 credits)', async () => {
    const job = await nc.generate.createAndWait({
      prompt: 'a test image',
      seed: 42,
      pollTimeout: 180_000,
    })
    expect(job.status).toBe('completed')
    expect(job.outputs.length).toBeGreaterThan(0)
    expect(job.outputs[0]?.url).toMatch(/^https?:\/\//)
  }, 240_000)

  it('jobs.get(id) on a recently-completed job is idempotent', async () => {
    const page = await nc.jobs.listPage({ status: 'completed', page: 1, pageSize: 1 })
    if (page.items.length === 0) {
      console.warn('no completed jobs — skipping')
      return
    }
    const latest = page.items[0]!
    const fetched = await nc.jobs.get(latest.id)
    expect(fetched.id).toBe(latest.id)
  })

  it('verifyWebhook roundtrip works', async () => {
    const secret = 'whsec_integration_test'
    const body = JSON.stringify({
      type: 'webhook.test',
      data: { webhookId: 'wh_int', message: 'ok', emittedAt: new Date().toISOString() },
    })
    const ts = Math.floor(Date.now() / 1000)
    const sig = await hmacSha256Hex(secret, `${ts}.${body}`)
    const headers = {
      'x-nocensor-signature': `t=${ts},v1=${sig}`,
      'x-nocensor-timestamp': String(ts),
      'x-nocensor-event': 'webhook.test',
      'x-nocensor-event-id': 'evt_int',
      'x-nocensor-delivery-id': 'dlv_int',
      'x-nocensor-attempt': '1',
    }
    const event = await verifyWebhook(body, headers, { secret })
    expect(event.type).toBe('webhook.test')
  })
})
