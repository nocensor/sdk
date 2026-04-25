// packages/sdk/src/resources/face-swap.ts
import type { RequireExactlyOne } from 'type-fest'
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'

type FaceXor = RequireExactlyOne<{ faceModelId: string; face: ImageInput }, 'faceModelId' | 'face'>

export type FaceSwapCreateParams = {
  source: ImageInput
  biometricConsent: true
  idempotencyKey?: string
  signal?: AbortSignal
} & FaceXor

export type FaceSwapCreateAndWaitParams = FaceSwapCreateParams & {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface FaceSwapRequestWire {
  source: string
  biometric_consent: true
  face_model_id?: string
  face?: string
}

async function toWireFaceSwap(p: FaceSwapCreateParams): Promise<FaceSwapRequestWire> {
  const wire: FaceSwapRequestWire = {
    source: await toDataUri(p.source),
    biometric_consent: true,
  }
  if ('faceModelId' in p && p.faceModelId) {
    wire.face_model_id = p.faceModelId
  } else if ('face' in p && p.face) {
    wire.face = await toDataUri(p.face)
  }
  return wire
}

export class FaceSwapResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: FaceSwapCreateParams): Promise<Job> {
    const wire = await toWireFaceSwap(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/face-swap', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: FaceSwapCreateAndWaitParams): Promise<CompletedJob> {
    const job = await this.create(params as FaceSwapCreateParams)
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
