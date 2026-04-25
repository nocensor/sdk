// packages/sdk/src/resources/undress.ts
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'

export interface UndressCreateParams {
  source: ImageInput
  biometricConsent: true
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface UndressCreateAndWaitParams extends UndressCreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface UndressRequestWire {
  source: string
  biometric_consent: true
}

async function toWireUndress(p: UndressCreateParams): Promise<UndressRequestWire> {
  return {
    source: await toDataUri(p.source),
    biometric_consent: true,
  }
}

export class UndressResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: UndressCreateParams): Promise<Job> {
    const wire = await toWireUndress(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/undress', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: UndressCreateAndWaitParams): Promise<CompletedJob> {
    const job = await this.create(params)
    let last: Job = job
    for await (const update of this.poll(job.id, {
      timeout: params.pollTimeout ?? 300_000,
      signal: params.pollSignal,
      onProgress: params.onProgress,
      minIntervalMs: params.minIntervalMs,
      maxIntervalMs: params.maxIntervalMs,
    })) {
      last = update
    }
    return last as CompletedJob
  }

  poll(jobId: string, opts: PollOptions<Job> = {}): AsyncIterable<Job> {
    return pollJob<Job>(
      async (id) => {
        const wire = await this._request<ContentJobWire>('GET', `/api/v1/jobs/${encodeURIComponent(id)}`)
        return { job: fromWireJobShared(wire), retryAfterMs: null }
      },
      jobId,
      opts,
    )
  }
}
