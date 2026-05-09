// packages/sdk/src/resources/pose-extract.ts
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'
import { NoCensorJobFailedError } from '../errors'

export interface PoseExtractCreateParams {
  source: ImageInput
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface PoseExtractCreateAndWaitParams extends PoseExtractCreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface PoseExtractRequestWire {
  source: string
}

async function toWirePoseExtract(p: PoseExtractCreateParams): Promise<PoseExtractRequestWire> {
  return { source: await toDataUri(p.source) }
}

/**
 * Pose extraction (admin-only). Extracts pose keypoints from a source image
 * for downstream pose-conditioned generation. Costs 0 credits today.
 *
 * Non-admin API keys receive 403 FORBIDDEN.
 */
export class PoseExtractResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: PoseExtractCreateParams): Promise<Job> {
    const wire = await toWirePoseExtract(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/pose-extract', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: PoseExtractCreateAndWaitParams): Promise<CompletedJob> {
    const job = await this.create(params)
    let last: Job = job
    for await (const update of this.poll(job.id, {
      timeout: params.pollTimeout ?? 60_000,
      signal: params.pollSignal,
      onProgress: params.onProgress,
      minIntervalMs: params.minIntervalMs,
      maxIntervalMs: params.maxIntervalMs,
    })) {
      last = update
    }
    if (last.status !== 'completed') {
      throw new NoCensorJobFailedError(`pose extraction terminated with status: ${last.status}`, {
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
