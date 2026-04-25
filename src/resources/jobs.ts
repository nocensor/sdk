// packages/sdk/src/resources/jobs.ts
import { Resource, type ResourceRequestFn, type ResourceRequestWithMetaFn } from './base'
import { pollJob, type PollOptions, type JobStatus } from '../polling'
import { pagePaginate } from '../pagination'

import type { LiteralUnion } from 'type-fest'

export interface OutputWire {
  url: string
  media_type: 'image' | 'video'
  size_bytes: number
}

export interface Output {
  url: string
  mediaType: 'image' | 'video'
  sizeBytes: number
}

interface JobWire {
  id: string
  status: JobStatus
  created_at: string
  credits_charged: number
  outputs: OutputWire[] | null
  error: { message: string } | null
  progress_percent?: number | null
  refunded_credits?: number
  cancelled_via?: 'api' | 'user' | string | null
}

export interface Job {
  id: string
  status: JobStatus
  createdAt: Date
  creditsCharged: number
  outputs: Output[] | null
  error: { message: string } | null
  progressPercent: number | null
}

export type CompletedJob = Job & {
  status: 'completed'
  outputs: [Output, ...Output[]]
}

export type CancelledJob = Job & {
  status: 'cancelled'
  refundedCredits: number
  cancelledVia: string
}

export interface JobListParams {
  status?: LiteralUnion<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled', string>
  createdAfter?: Date | string
  createdBefore?: Date | string
  pageSize?: number
  signal?: AbortSignal
}

interface JobsListPageWire {
  items: JobWire[]
}

function fromWireOutput(w: OutputWire): Output {
  return { url: w.url, mediaType: w.media_type, sizeBytes: w.size_bytes }
}

function fromWireJob(w: JobWire): Job {
  return {
    id: w.id,
    status: w.status,
    createdAt: new Date(w.created_at),
    creditsCharged: w.credits_charged,
    outputs: w.outputs ? w.outputs.map(fromWireOutput) : null,
    error: w.error,
    progressPercent: w.progress_percent ?? null,
  }
}

function toQuery(params: JobListParams & { page?: number }): string {
  const parts: string[] = []
  if (params.page !== undefined) parts.push(`page=${params.page}`)
  if (params.pageSize !== undefined) parts.push(`page_size=${params.pageSize}`)
  if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`)
  if (params.createdAfter) {
    const v = params.createdAfter instanceof Date ? params.createdAfter.toISOString() : params.createdAfter
    parts.push(`created_after=${encodeURIComponent(v)}`)
  }
  if (params.createdBefore) {
    const v = params.createdBefore instanceof Date ? params.createdBefore.toISOString() : params.createdBefore
    parts.push(`created_before=${encodeURIComponent(v)}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

export class JobsResource extends Resource {
  readonly #requestWithMeta: ResourceRequestWithMetaFn

  constructor(request: ResourceRequestFn, requestWithMeta: ResourceRequestWithMetaFn) {
    super(request)
    this.#requestWithMeta = requestWithMeta
  }

  async get(id: string): Promise<Job> {
    const wire = await this._request<JobWire>('GET', `/api/v1/jobs/${encodeURIComponent(id)}`)
    return fromWireJob(wire)
  }

  async cancel(id: string): Promise<CancelledJob> {
    const wire = await this._request<JobWire>('DELETE', `/api/v1/jobs/${encodeURIComponent(id)}`)
    const base = fromWireJob(wire)
    return {
      ...base,
      status: 'cancelled',
      refundedCredits: wire.refunded_credits ?? 0,
      cancelledVia: wire.cancelled_via ?? 'api',
    } as CancelledJob
  }

  async listPage(
    params: JobListParams & { page?: number } = {},
  ): Promise<{ items: Job[]; page: number; pageSize: number; totalPages: number }> {
    const query = toQuery(params)
    const { data, meta } = await this.#requestWithMeta<JobsListPageWire>('GET', `/api/v1/jobs${query}`)
    return {
      items: (data.items ?? []).map(fromWireJob),
      page: typeof meta['page'] === 'number' ? meta['page'] : (params.page ?? 1),
      pageSize: typeof meta['page_size'] === 'number' ? meta['page_size'] : (params.pageSize ?? 20),
      totalPages: typeof meta['total_pages'] === 'number' ? meta['total_pages'] : 1,
    }
  }

  list(params: JobListParams = {}): AsyncIterable<Job> {
    return pagePaginate<Job>(async (page) => {
      const { items, page: p, totalPages } = await this.listPage({ ...params, page })
      return { items, hasMore: p < totalPages }
    })
  }

  poll(jobId: string, opts: PollOptions<Job> = {}): AsyncIterable<Job> {
    return pollJob<Job>(async (id) => ({ job: await this.get(id), retryAfterMs: null }), jobId, opts)
  }

  async waitForCompletion(jobId: string, opts: PollOptions<Job> = {}): Promise<CompletedJob> {
    let last: Job | undefined
    for await (const update of this.poll(jobId, opts)) last = update
    // The generator only returns when status === 'completed'; pollJob throws on failed/cancelled.
    return last as CompletedJob
  }
}
