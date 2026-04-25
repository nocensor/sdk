// packages/sdk/src/resources/payments.ts
import { Resource, type ResourceRequestFn, type ResourceRequestWithMetaFn } from './base'

interface PaymentWire {
  id: string
  gateway: string
  amount_usd: number
  credits: number
  status: string
  created_at: string
}

interface PaymentsListWire {
  items?: PaymentWire[]
}

export interface Payment {
  id: string
  gateway: string
  amountUsd: number
  credits: number
  status: string
  createdAt: Date
}

export interface PaymentListParams {
  limit?: number
  cursor?: string
  signal?: AbortSignal
}

function fromWirePayment(w: PaymentWire): Payment {
  return {
    id: w.id,
    gateway: w.gateway,
    amountUsd: w.amount_usd,
    credits: w.credits,
    status: w.status,
    createdAt: new Date(w.created_at),
  }
}

function toQuery(params: PaymentListParams): string {
  const parts: string[] = []
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`)
  if (params.cursor !== undefined) parts.push(`cursor=${encodeURIComponent(params.cursor)}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

export class PaymentsResource extends Resource {
  readonly #requestWithMeta: ResourceRequestWithMetaFn

  constructor(request: ResourceRequestFn, requestWithMeta: ResourceRequestWithMetaFn) {
    super(request)
    this.#requestWithMeta = requestWithMeta
  }

  async listPage(params: PaymentListParams = {}): Promise<{ items: Payment[]; nextCursor: string | null }> {
    const query = toQuery(params)
    const { data, meta } = await this.#requestWithMeta<PaymentsListWire>('GET', `/api/v1/payments${query}`, undefined, {
      signal: params.signal,
    })
    const nextCursor = typeof meta['next_cursor'] === 'string' ? meta['next_cursor'] : null
    return {
      items: (data.items ?? []).map(fromWirePayment),
      nextCursor,
    }
  }

  async *list(params: Omit<PaymentListParams, 'cursor'> = {}): AsyncIterable<Payment> {
    let cursor: string | undefined
    for (;;) {
      const { items, nextCursor } = await this.listPage({ ...params, cursor })
      for (const item of items) yield item
      if (!nextCursor) return
      cursor = nextCursor
    }
  }
}
