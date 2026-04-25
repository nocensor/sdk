// packages/sdk/src/resources/webhooks.ts
import { Resource, type ResourceRequestFn } from './base'
import type { LiteralUnion } from 'type-fest'
import { KNOWN_EVENT_TYPES } from '../webhooks/types'

export type WebhookEventType = LiteralUnion<
  | 'job.completed'
  | 'job.failed'
  | 'job.cancelled'
  | 'payment.completed'
  | 'lora.training_completed'
  | 'lora.training_failed'
  | 'webhook.test'
  | 'pipeline.completed',
  string
>

/** Shared fields returned for all webhook reads (no secret). */
interface WebhookWire {
  id: string
  url: string
  events: WebhookEventType[]
  is_active: boolean
  created_at: string
  last_delivery_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
}

/** Webhook with secret — returned once on creation, or after rotate_secret=true. */
interface WebhookWithSecretWire extends WebhookWire {
  secret: string
}

interface WebhookDeliveryWire {
  id: string
  event_id: string
  event_type: string
  status: string
  attempts: number
  last_response_status: number | null
  last_error: string | null
  created_at: string
  delivered_at: string | null
}

interface WebhooksListWire {
  items?: WebhookWire[]
}

interface DeliveriesListWire {
  items?: WebhookDeliveryWire[]
}

export interface Webhook {
  id: string
  url: string
  events: WebhookEventType[]
  isActive: boolean
  createdAt: Date
  lastDeliveryAt: Date | null
  lastSuccessAt: Date | null
  lastFailureAt: Date | null
}

export interface WebhookWithSecret extends Webhook {
  /** Signing secret — returned once on creation, or after secret rotation. */
  secret: string
}

export interface WebhookDelivery {
  id: string
  eventId: string
  eventType: string
  status: string
  attempts: number
  lastResponseStatus: number | null
  lastError: string | null
  createdAt: Date
  deliveredAt: Date | null
}

export interface CreateWebhookParams {
  url: string
  events: WebhookEventType[]
  signal?: AbortSignal
}

export interface UpdateWebhookParams {
  url?: string
  events?: WebhookEventType[]
  isActive?: boolean
  /** Set to true to rotate the signing secret. Returns the new secret in the response. */
  rotateSecret?: boolean
  signal?: AbortSignal
}

export interface ListDeliveriesParams {
  limit?: number
  status?: LiteralUnion<'pending' | 'in_progress' | 'delivered' | 'failed' | 'dead', string>
  signal?: AbortSignal
}

function fromWireWebhook(w: WebhookWire): Webhook {
  return {
    id: w.id,
    url: w.url,
    events: w.events,
    isActive: w.is_active,
    createdAt: new Date(w.created_at),
    lastDeliveryAt: w.last_delivery_at ? new Date(w.last_delivery_at) : null,
    lastSuccessAt: w.last_success_at ? new Date(w.last_success_at) : null,
    lastFailureAt: w.last_failure_at ? new Date(w.last_failure_at) : null,
  }
}

function fromWireWebhookWithSecret(w: WebhookWithSecretWire): WebhookWithSecret {
  return { ...fromWireWebhook(w), secret: w.secret }
}

function fromWireDelivery(w: WebhookDeliveryWire): WebhookDelivery {
  return {
    id: w.id,
    eventId: w.event_id,
    eventType: w.event_type,
    status: w.status,
    attempts: w.attempts,
    lastResponseStatus: w.last_response_status,
    lastError: w.last_error,
    createdAt: new Date(w.created_at),
    deliveredAt: w.delivered_at ? new Date(w.delivered_at) : null,
  }
}

export { KNOWN_EVENT_TYPES }

function buildQuery(parts: string[]): string {
  return parts.length ? `?${parts.join('&')}` : ''
}

export class WebhooksResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  /** Create a webhook subscription. The signing secret is returned once and not stored. */
  async create(params: CreateWebhookParams): Promise<WebhookWithSecret> {
    const wire = await this._request<WebhookWithSecretWire>(
      'POST',
      '/api/v1/webhooks',
      { url: params.url, events: params.events },
      { signal: params.signal },
    )
    return fromWireWebhookWithSecret(wire)
  }

  /** List all webhook subscriptions for the account. */
  async list(params: { limit?: number; signal?: AbortSignal } = {}): Promise<Webhook[]> {
    const parts: string[] = []
    if (params.limit !== undefined) parts.push(`limit=${params.limit}`)
    const wire = await this._request<WebhooksListWire>('GET', `/api/v1/webhooks${buildQuery(parts)}`, undefined, {
      signal: params.signal,
    })
    return (wire.items ?? []).map(fromWireWebhook)
  }

  /** Get a single webhook by id. */
  async get(id: string, params: { signal?: AbortSignal } = {}): Promise<Webhook> {
    const wire = await this._request<WebhookWire>('GET', `/api/v1/webhooks/${encodeURIComponent(id)}`, undefined, {
      signal: params.signal,
    })
    return fromWireWebhook(wire)
  }

  /**
   * Update a webhook. Pass `rotateSecret: true` to rotate the signing secret —
   * the new secret is returned in the response and not stored server-side.
   */
  async update(id: string, params: UpdateWebhookParams): Promise<Webhook | WebhookWithSecret> {
    const rotateSecret = params.rotateSecret ?? false
    const body: Record<string, unknown> = {}
    if (params.url !== undefined) body['url'] = params.url
    if (params.events !== undefined) body['events'] = params.events
    if (params.isActive !== undefined) body['is_active'] = params.isActive

    const qs = rotateSecret ? '?rotate_secret=true' : ''
    const wire = await this._request<WebhookWire | WebhookWithSecretWire>(
      'PATCH',
      `/api/v1/webhooks/${encodeURIComponent(id)}${qs}`,
      body,
      { signal: params.signal },
    )

    if ('secret' in wire) return fromWireWebhookWithSecret(wire as WebhookWithSecretWire)
    return fromWireWebhook(wire)
  }

  /** Delete a webhook subscription. */
  async delete(id: string, params: { signal?: AbortSignal } = {}): Promise<{ id: string; deleted: true }> {
    return this._request<{ id: string; deleted: true }>(
      'DELETE',
      `/api/v1/webhooks/${encodeURIComponent(id)}`,
      undefined,
      { signal: params.signal },
    )
  }

  /** List recent delivery attempts for a webhook. */
  async listDeliveries(id: string, params: ListDeliveriesParams = {}): Promise<WebhookDelivery[]> {
    const parts: string[] = []
    if (params.limit !== undefined) parts.push(`limit=${params.limit}`)
    if (params.status !== undefined) parts.push(`status=${encodeURIComponent(params.status)}`)
    const wire = await this._request<DeliveriesListWire>(
      'GET',
      `/api/v1/webhooks/${encodeURIComponent(id)}/deliveries${buildQuery(parts)}`,
      undefined,
      { signal: params.signal },
    )
    return (wire.items ?? []).map(fromWireDelivery)
  }

  /** Send a test event to the webhook endpoint. */
  async test(id: string, params: { signal?: AbortSignal } = {}): Promise<{ delivered: boolean }> {
    return this._request<{ delivered: boolean }>(
      'POST',
      `/api/v1/webhooks/${encodeURIComponent(id)}/test`,
      {},
      { signal: params.signal },
    )
  }
}
