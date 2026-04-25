// packages/sdk/src/resources/video.ts
import type { LiteralUnion } from 'type-fest'
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'

export interface VideoLoraRef {
  id: string
  strength?: number
}

export interface VideoCreateParams {
  prompt: string
  negativePrompt?: string
  model?: LiteralUnion<'wan-2.2', string>
  seed?: number
  /** Optional — present → image-to-video, absent → text-to-video. */
  image?: ImageInput
  /** Duration preset. Defaults to `'short'` if omitted. */
  duration?: 'short' | 'medium' | 'long' | 'long+'
  /** Output resolution. Defaults to `'standard'` if omitted. */
  resolution?: 'standard' | 'hd'
  /** Required when `image` is provided (i2v mode). */
  biometricConsent?: boolean
  loras?: VideoLoraRef[]
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface VideoCreateAndWaitParams extends VideoCreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface VideoRequestWire {
  prompt: string
  negative_prompt?: string
  model?: string
  seed?: number
  image?: string
  duration?: 'short' | 'medium' | 'long' | 'long+'
  resolution?: 'standard' | 'hd'
  biometric_consent?: boolean
  loras?: VideoLoraRef[]
}

async function toWireVideo(p: VideoCreateParams): Promise<VideoRequestWire> {
  const wire: VideoRequestWire = { prompt: p.prompt }
  if (p.negativePrompt !== undefined) wire.negative_prompt = p.negativePrompt
  if (p.model !== undefined) wire.model = p.model
  if (p.seed !== undefined) wire.seed = p.seed
  if (p.image !== undefined) wire.image = await toDataUri(p.image)
  if (p.duration !== undefined) wire.duration = p.duration
  if (p.resolution !== undefined) wire.resolution = p.resolution
  if (p.biometricConsent !== undefined) wire.biometric_consent = p.biometricConsent
  if (p.loras !== undefined) wire.loras = p.loras
  return wire
}

export class VideoResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: VideoCreateParams): Promise<Job> {
    const wire = await toWireVideo(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/video', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: VideoCreateAndWaitParams): Promise<CompletedJob> {
    const job = await this.create(params)
    let last: Job = job
    for await (const update of this.poll(job.id, {
      timeout: params.pollTimeout ?? 600_000, // video default: 10 min
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
      { timeout: 600_000, ...opts }, // video default
    )
  }
}
