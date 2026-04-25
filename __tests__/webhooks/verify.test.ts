import { describe, it, expect } from 'vitest'
import { verifyWebhook } from '../../src/webhooks/verify'
import { hmacSha256Hex } from '../../src/webhooks/hmac'
import { NoCensorWebhookError } from '../../src/errors'

const SECRET = 'whsec_test_12345'
const OLD_SECRET = 'whsec_test_OLD'
const NOW_SECONDS = 1744156800
const NOW_MS = NOW_SECONDS * 1000

function buildPayload(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: 'job.completed',
    data: {
      jobId: 'j1',
      workflow: 'generate',
      outputs: [{ url: 'https://x/y.png', mediaType: 'image', sizeBytes: 123 }],
      creditsCharged: 15,
    },
    ...overrides,
  })
}

async function buildHeaders(
  body: string,
  secret: string,
  opts: {
    timestamp?: number
    eventType?: string
    eventId?: string
    deliveryId?: string
    attempt?: number
  } = {},
): Promise<Record<string, string>> {
  const t = opts.timestamp ?? NOW_SECONDS
  const sig = await hmacSha256Hex(secret, `${t}.${body}`)
  return {
    'x-nocensor-signature': `t=${t},v1=${sig}`,
    'x-nocensor-timestamp': String(t),
    'x-nocensor-event': opts.eventType ?? 'job.completed',
    'x-nocensor-event-id': opts.eventId ?? 'evt_abc',
    'x-nocensor-delivery-id': opts.deliveryId ?? 'dlv_abc',
    'x-nocensor-attempt': String(opts.attempt ?? 1),
  }
}

describe('verifyWebhook happy path', () => {
  it('returns a typed event for a valid signature', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    const event = await verifyWebhook(body, headers, {
      secret: SECRET,
      now: () => NOW_MS,
    })
    expect(event.type).toBe('job.completed')
    expect(event.id).toBe('evt_abc')
    expect(event.deliveryId).toBe('dlv_abc')
    expect(event.attempt).toBe(1)
    expect(event.deliveredAt.getTime()).toBe(NOW_MS)
    if (event.type === 'job.completed') {
      expect(event.data.jobId).toBe('j1')
    }
  })

  it('accepts Uint8Array body', async () => {
    const bodyStr = buildPayload()
    const body = new TextEncoder().encode(bodyStr)
    const headers = await buildHeaders(bodyStr, SECRET)
    const event = await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
    expect(event.type).toBe('job.completed')
  })

  it('accepts a Headers instance', async () => {
    const body = buildPayload()
    const raw = await buildHeaders(body, SECRET)
    const h = new Headers(raw)
    const event = await verifyWebhook(body, h, { secret: SECRET, now: () => NOW_MS })
    expect(event.type).toBe('job.completed')
  })
})

describe('verifyWebhook failure modes', () => {
  it('forged payload → bad_signature', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    const tampered = body.replace('j1', 'j2')
    try {
      await verifyWebhook(tampered, headers, { secret: SECRET, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorWebhookError)
      expect((e as NoCensorWebhookError).reason).toBe('bad_signature')
    }
  })

  it('stale timestamp (> toleranceMs) → stale_timestamp', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET, { timestamp: NOW_SECONDS - 3600 })
    try {
      await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS, toleranceMs: 300_000 })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('stale_timestamp')
    }
  })

  it('missing header → missing_header', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    delete headers['x-nocensor-signature']
    try {
      await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('missing_header')
    }
  })

  it('malformed signature → malformed_signature', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    headers['x-nocensor-signature'] = 'garbage'
    try {
      await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('malformed_signature')
    }
  })

  it('timestamp_mismatch between signature and header', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    headers['x-nocensor-timestamp'] = String(NOW_SECONDS + 100) // mismatch
    try {
      await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('timestamp_mismatch')
    }
  })

  it('toleranceMs > 3_600_000 (1h) is rejected at runtime', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    await expect(
      verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS, toleranceMs: 3_600_001 }),
    ).rejects.toThrow(/toleranceMs/)
  })

  it('toleranceMs < 1000 is rejected at runtime', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, SECRET)
    await expect(verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS, toleranceMs: 500 })).rejects.toThrow(
      /toleranceMs/,
    )
  })
})

describe('verifyWebhook secret rotation', () => {
  it('accepts signature from previousSecret during rotation grace window', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, OLD_SECRET)
    const event = await verifyWebhook(body, headers, {
      secret: SECRET, // new
      previousSecret: OLD_SECRET, // old
      now: () => NOW_MS,
    })
    expect(event.type).toBe('job.completed')
  })

  it('rejects old signature when previousSecret is not provided', async () => {
    const body = buildPayload()
    const headers = await buildHeaders(body, OLD_SECRET)
    try {
      await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('bad_signature')
    }
  })
})

describe('verifyWebhook unknown event forward-compat', () => {
  it('returns event with unknown: true in non-strict mode', async () => {
    const body = buildPayload({ type: 'pipeline.completed' })
    const headers = await buildHeaders(body, SECRET, { eventType: 'pipeline.completed' })
    const event = await verifyWebhook(body, headers, { secret: SECRET, now: () => NOW_MS })
    expect(event.type).toBe('pipeline.completed')
    expect('unknown' in event && event.unknown).toBe(true)
  })

  it('throws unknown_event in strict mode', async () => {
    const body = buildPayload({ type: 'pipeline.completed' })
    const headers = await buildHeaders(body, SECRET, { eventType: 'pipeline.completed' })
    try {
      await verifyWebhook(body, headers, { secret: SECRET, strictEvents: true, now: () => NOW_MS })
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as NoCensorWebhookError).reason).toBe('unknown_event')
    }
  })
})
