// packages/sdk/src/resources/undress-v2.ts
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'
import { NoCensorJobFailedError } from '../errors'

export interface UndressV2CreateParams {
  source: ImageInput
  biometricConsent: true
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface UndressV2CreateAndWaitParams extends UndressV2CreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface UndressV2RequestWire {
  source: string
  biometric_consent: true
}

async function toWireUndressV2(p: UndressV2CreateParams): Promise<UndressV2RequestWire> {
  return {
    source: await toDataUri(p.source),
    biometric_consent: true,
  }
}

/**
 * Second-generation undress pipeline (admin + premium gated as of 2026-05-09).
 * Non-admin keys receive 503 FEATURE_UNAVAILABLE while the gate is active.
 * Free-tier users with admin access still get 402 PURCHASE_REQUIRED until they top up.
 */
export class UndressV2Resource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: UndressV2CreateParams): Promise<Job> {
    const wire = await toWireUndressV2(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/undress-v2', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: UndressV2CreateAndWaitParams): Promise<CompletedJob> {
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
    if (last.status !== 'completed') {
      throw new NoCensorJobFailedError(`undress-v2 terminated with status: ${last.status}`, {
        code: 'JOB_FAILED',
        status: null,
        jobId: last.id,
        job: last,
      })
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
