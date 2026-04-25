// packages/sdk/src/webhooks/verify.ts
// Framework-agnostic webhook signature verification for @nocensor/sdk.

import { NoCensorWebhookError } from '../errors'
import { normalizeHeaders, type HeadersLike } from '../headers'
import { hmacSha256Hex, timingSafeEqualHex } from './hmac'
import { KNOWN_EVENT_TYPES, type WebhookEvent } from './types'

export interface VerifyOptions {
  secret: string
  previousSecret?: string
  toleranceMs?: number
  strictEvents?: boolean
  now?: () => number
}

const DEFAULT_TOLERANCE_MS = 300_000 // 5 min
const MIN_TOLERANCE_MS = 1_000
const MAX_TOLERANCE_MS = 3_600_000 // 1 hour

const SIGNATURE_RE = /^t=(\d+),v1=([0-9a-f]{64})$/i

export async function verifyWebhook(
  rawBody: string | Uint8Array,
  headersLike: HeadersLike,
  options: VerifyOptions,
): Promise<WebhookEvent> {
  const toleranceMs = options.toleranceMs ?? DEFAULT_TOLERANCE_MS
  if (toleranceMs < MIN_TOLERANCE_MS || toleranceMs > MAX_TOLERANCE_MS) {
    throw new NoCensorWebhookError(
      `toleranceMs must be between ${MIN_TOLERANCE_MS} and ${MAX_TOLERANCE_MS} (got ${toleranceMs})`,
      { code: 'VALIDATION_ERROR', reason: 'invalid_headers', status: null },
    )
  }

  const now = options.now ? options.now() : Date.now()

  let headers: Headers
  try {
    headers = normalizeHeaders(headersLike)
  } catch (err) {
    throw new NoCensorWebhookError('invalid headers object', {
      code: 'WEBHOOK_INVALID_HEADERS',
      reason: 'invalid_headers',
      status: null,
      cause: err,
    })
  }

  // Required headers
  const required = [
    'x-nocensor-signature',
    'x-nocensor-timestamp',
    'x-nocensor-event',
    'x-nocensor-event-id',
    'x-nocensor-delivery-id',
    'x-nocensor-attempt',
  ] as const

  for (const name of required) {
    if (!headers.get(name)) {
      throw new NoCensorWebhookError(`Missing required header: ${name}`, {
        code: 'WEBHOOK_MISSING_HEADER',
        reason: 'missing_header',
        status: null,
        header: name,
      })
    }
  }

  const sigHeader = headers.get('x-nocensor-signature')!
  const match = SIGNATURE_RE.exec(sigHeader.trim())
  if (!match) {
    throw new NoCensorWebhookError(`Malformed signature header: ${sigHeader}`, {
      code: 'WEBHOOK_MALFORMED_SIGNATURE',
      reason: 'malformed_signature',
      status: null,
    })
  }

  const sigTimestamp = parseInt(match[1]!, 10)
  const sigHex = match[2]!.toLowerCase()

  const headerTimestamp = parseInt(headers.get('x-nocensor-timestamp')!, 10)
  if (!Number.isFinite(headerTimestamp) || headerTimestamp !== sigTimestamp) {
    throw new NoCensorWebhookError('Signature timestamp does not match X-NoCensor-Timestamp header', {
      code: 'WEBHOOK_TIMESTAMP_MISMATCH',
      reason: 'timestamp_mismatch',
      status: null,
    })
  }

  // Staleness check (in ms)
  const skewMs = Math.abs(now - sigTimestamp * 1000)
  if (skewMs > toleranceMs) {
    throw new NoCensorWebhookError(`Webhook timestamp is stale (skew ${skewMs}ms > tolerance ${toleranceMs}ms)`, {
      code: 'WEBHOOK_STALE_TIMESTAMP',
      reason: 'stale_timestamp',
      status: null,
      skewMs,
    })
  }

  // HMAC verification
  const bodyStr = typeof rawBody === 'string' ? rawBody : new TextDecoder('utf-8').decode(rawBody)
  const toSign = `${sigTimestamp}.${bodyStr}`

  const primaryHex = await hmacSha256Hex(options.secret, toSign)
  let verified = timingSafeEqualHex(primaryHex, sigHex)

  if (!verified && options.previousSecret) {
    const previousHex = await hmacSha256Hex(options.previousSecret, toSign)
    verified = timingSafeEqualHex(previousHex, sigHex)
  }

  if (!verified) {
    throw new NoCensorWebhookError('Signature does not match payload', {
      code: 'WEBHOOK_BAD_SIGNATURE',
      reason: 'bad_signature',
      status: null,
    })
  }

  // Parse body JSON
  let bodyJson: { type?: string; data?: unknown }
  try {
    bodyJson = JSON.parse(bodyStr)
  } catch (err) {
    throw new NoCensorWebhookError('Webhook body is not valid JSON', {
      code: 'WEBHOOK_INVALID_BODY',
      reason: 'invalid_body',
      status: null,
      cause: err,
    })
  }

  const eventType = headers.get('x-nocensor-event')!
  const isKnown = KNOWN_EVENT_TYPES.has(eventType)

  if (!isKnown && options.strictEvents) {
    throw new NoCensorWebhookError(`Unknown event type: ${eventType}`, {
      code: 'WEBHOOK_UNKNOWN_EVENT',
      reason: 'unknown_event',
      status: null,
    })
  }

  const meta = {
    id: headers.get('x-nocensor-event-id')!,
    deliveredAt: new Date(sigTimestamp * 1000),
    attempt: parseInt(headers.get('x-nocensor-attempt')!, 10),
    deliveryId: headers.get('x-nocensor-delivery-id')!,
  }

  if (isKnown) {
    return { type: eventType, data: bodyJson.data as never, ...meta } as WebhookEvent
  }

  // Forward-compat unknown branch
  return {
    type: eventType,
    data: (bodyJson.data ?? {}) as Record<string, unknown>,
    unknown: true,
    ...meta,
  } as WebhookEvent
}
