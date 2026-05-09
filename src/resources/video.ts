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

/**
 * Audio mode for the post-processing audio module.
 *
 * - `'none'` (default) — silent video
 * - `'sfx'` — diegetic sound effects matched to motion
 * - `'music'` — music track from `audioPrompt`
 * - `'voice'` — voiced narration from `audioPrompt`
 *
 * `'v2a'` (MMAudio) is intentionally excluded — that mode is `cc-by-nc-4.0`
 * and rejected server-side for commercial use.
 */
export type VideoAudioMode = 'none' | 'sfx' | 'music' | 'voice'

export interface VideoCreateParams {
  prompt: string
  negativePrompt?: string
  /**
   * Public model identifier. Server enum (2026-05-09):
   * `'wan-remix' | 'phr00t-v10' | 'wan-21'`. Other values 422.
   */
  model?: LiteralUnion<'wan-remix' | 'phr00t-v10' | 'wan-21', string>
  seed?: number
  /**
   * Explicit mode. Defaults to `'t2v'` server-side when omitted.
   * If `'i2v'`, `image` and `biometricConsent: true` are required.
   */
  mode?: 't2v' | 'i2v'
  /** Optional — present → image-to-video, absent → text-to-video. */
  image?: ImageInput
  /** Duration preset. Defaults to `'short'` if omitted. */
  duration?: 'short' | 'medium' | 'long' | 'long+'
  /** Output resolution. Defaults to `'standard'` if omitted. */
  resolution?: 'standard' | 'hd'
  /**
   * AR-preserving width override for i2v. Multiple of 16, range 256-1280.
   * Spec falls back to default 960×544 (standard) / 1280×720 (hd) when omitted.
   */
  width?: number
  /** AR-preserving height override for i2v. Multiple of 16, range 256-1280. */
  height?: number
  /**
   * I2V noise-augmentation strength, range `0-10`. Higher → more
   * deviation from the source image. Defaults to spec value when omitted.
   */
  noiseAugStrength?: number
  /** Required when `image` is provided (i2v mode). */
  biometricConsent?: boolean
  loras?: VideoLoraRef[]
  /**
   * Audio post-processing mode. When `audioMode !== 'none'`, an `audioPrompt`
   * may steer the generated track.
   */
  audioMode?: VideoAudioMode
  /** Free-text steer for the audio module. Max 500 chars. Server-side ignored when `audioMode === 'none'`. */
  audioPrompt?: string
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

/**
 * Wire shape for `POST /api/v1/video`. Casing matches what the server's zod
 * schema parses verbatim (`apps/web/src/app/api/v1/video/route.ts:58-74`):
 * `audioMode`, `audioPrompt`, `noiseAugStrength`, `mode`, `width`, `height`,
 * `model`, `seed`, `image`, `duration`, `resolution`, `loras` are camelCase;
 * only `negative_prompt` and `biometric_consent` are snake_case (legacy).
 * Do NOT normalize the camelCase fields to snake_case — the server will 422.
 */
interface VideoRequestWire {
  prompt: string
  negative_prompt?: string
  model?: string
  seed?: number
  mode?: 't2v' | 'i2v'
  image?: string
  duration?: 'short' | 'medium' | 'long' | 'long+'
  resolution?: 'standard' | 'hd'
  width?: number
  height?: number
  noiseAugStrength?: number
  biometric_consent?: boolean
  loras?: VideoLoraRef[]
  audioMode?: VideoAudioMode
  audioPrompt?: string
}

async function toWireVideo(p: VideoCreateParams): Promise<VideoRequestWire> {
  const wire: VideoRequestWire = { prompt: p.prompt }
  if (p.negativePrompt !== undefined) wire.negative_prompt = p.negativePrompt
  if (p.model !== undefined) wire.model = p.model
  if (p.seed !== undefined) wire.seed = p.seed
  if (p.mode !== undefined) wire.mode = p.mode
  if (p.image !== undefined) wire.image = await toDataUri(p.image)
  if (p.duration !== undefined) wire.duration = p.duration
  if (p.resolution !== undefined) wire.resolution = p.resolution
  if (p.width !== undefined) wire.width = p.width
  if (p.height !== undefined) wire.height = p.height
  if (p.noiseAugStrength !== undefined) wire.noiseAugStrength = p.noiseAugStrength
  if (p.biometricConsent !== undefined) wire.biometric_consent = p.biometricConsent
  if (p.loras !== undefined) wire.loras = p.loras
  if (p.audioMode !== undefined) wire.audioMode = p.audioMode
  if (p.audioPrompt !== undefined) wire.audioPrompt = p.audioPrompt
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
