// packages/sdk/src/resources/generate.ts
import type { LiteralUnion } from 'type-fest'
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { pollJob, type PollOptions } from '../polling'
import type { Job, CompletedJob } from './jobs'
import { type ContentJobWire, fromWireJobShared } from './_shared'

export interface LoraRef {
  id: string
  strength?: number
}

export interface GenerateCreateParams {
  prompt: string
  negativePrompt?: string
  model?: LiteralUnion<'realistic' | 'photoreal-plus' | 'anime' | 'hentai' | 'stylized' | 'chroma', string>
  seed?: number
  image?: ImageInput
  denoise?: number
  /** Output width in pixels (64–1280). */
  width?: number
  /** Output height in pixels (64–1280). */
  height?: number
  loras?: LoraRef[]
  /** UUID of an unlocked character LoRA to inject. */
  characterId?: string
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface GenerateCreateAndWaitParams extends GenerateCreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (job: Job) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

interface GenerateRequestWire {
  prompt: string
  negative_prompt?: string
  model?: string
  seed?: number
  image?: string
  denoise?: number
  width?: number
  height?: number
  loras?: LoraRef[]
  characterId?: string
}

async function toWireGenerate(p: GenerateCreateParams): Promise<GenerateRequestWire> {
  const wire: GenerateRequestWire = { prompt: p.prompt }
  if (p.negativePrompt !== undefined) wire.negative_prompt = p.negativePrompt
  if (p.model !== undefined) wire.model = p.model
  if (p.seed !== undefined) wire.seed = p.seed
  if (p.image !== undefined) wire.image = await toDataUri(p.image)
  if (p.denoise !== undefined) wire.denoise = p.denoise
  if (p.width !== undefined) wire.width = p.width
  if (p.height !== undefined) wire.height = p.height
  if (p.loras !== undefined) wire.loras = p.loras
  if (p.characterId !== undefined) wire.characterId = p.characterId
  return wire
}

export class GenerateResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: GenerateCreateParams): Promise<Job> {
    const wire = await toWireGenerate(params)
    const result = await this._request<ContentJobWire>('POST', '/api/v1/generate', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWireJobShared(result)
  }

  async createAndWait(params: GenerateCreateAndWaitParams): Promise<CompletedJob> {
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
