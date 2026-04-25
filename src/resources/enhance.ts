// packages/sdk/src/resources/enhance.ts
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'

export type EnhanceCreateParams =
  | {
      operation: 'upscale'
      source: ImageInput
      scale?: 2 | 3 | 4
      idempotencyKey?: string
      signal?: AbortSignal
    }
  | {
      operation: 'face-restore'
      source: ImageInput
      idempotencyKey?: string
      signal?: AbortSignal
    }
  | {
      operation: 'bg-replace'
      source: ImageInput
      backgroundPrompt: string
      idempotencyKey?: string
      signal?: AbortSignal
    }
  | {
      operation: 'attach-object'
      source: ImageInput
      objectPrompt: string
      mask: ImageInput
      idempotencyKey?: string
      signal?: AbortSignal
    }

export interface EnhanceCreateAndWaitExtras {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

export type EnhanceCreateAndWaitParams = EnhanceCreateParams & EnhanceCreateAndWaitExtras

interface EnhanceWireBase {
  operation: string
  source: string
}

async function toWireEnhance(p: EnhanceCreateParams): Promise<EnhanceWireBase & Record<string, unknown>> {
  const source = await toDataUri(p.source)
  switch (p.operation) {
    case 'upscale':
      return { operation: 'upscale', source, ...(p.scale !== undefined && { scale: p.scale }) }
    case 'face-restore':
      return { operation: 'face-restore', source }
    case 'bg-replace':
      return { operation: 'bg-replace', source, background_prompt: p.backgroundPrompt }
    case 'attach-object':
      return {
        operation: 'attach-object',
        source,
        object_prompt: p.objectPrompt,
        mask: await toDataUri(p.mask),
      }
  }
}

export class EnhanceResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: EnhanceCreateParams): Promise<Job> {
    const wire = await toWireEnhance(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/enhance', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: EnhanceCreateAndWaitParams): Promise<CompletedJob> {
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
