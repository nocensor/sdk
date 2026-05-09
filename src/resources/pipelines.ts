// packages/sdk/src/resources/pipelines.ts
import { Resource, type ResourceRequestFn } from './base'
import { toDataUri, type ImageInput } from '../file-inputs'
import { NoCensorTimeoutError, NoCensorJobFailedError } from '../errors'
import { sleepAbortable } from '../polling'

export type PipelineStageOp =
  | 'generate'
  | 'undress'
  | 'undress-v2'
  | 'undress-v3'
  | 'face-swap'
  | 'upscale'
  | 'face-restore'
  | 'fix-hand'
  | 'bg-replace'
  | 'attach-object'
  | 'attach-object-v2'
  | 'animate'
  | 'redress'
  | 'redress-v2'
  | 'redress-vton'

export type PipelineStage =
  | {
      op: 'generate'
      prompt: string
      negativePrompt?: string
      model?: string
      seed?: number
      width?: number
      height?: number
      loras?: Array<{ id: string; strength?: number }>
    }
  | { op: 'undress'; biometricConsent: true }
  | { op: 'undress-v2'; biometricConsent: true }
  | { op: 'undress-v3'; biometricConsent: true }
  | { op: 'face-swap'; biometricConsent: true; faceModelId?: string; face?: ImageInput }
  | { op: 'upscale'; scale?: 2 | 3 | 4 }
  | { op: 'face-restore' }
  | { op: 'fix-hand'; strength?: number }
  | { op: 'bg-replace'; backgroundPrompt: string }
  | { op: 'attach-object'; objectPrompt: string; mask: ImageInput }
  | { op: 'attach-object-v2'; objectPrompt: string; mask: ImageInput; prompt?: string; seed?: number }
  | { op: 'animate'; motionPrompt: string; frames?: number }
  | { op: 'redress'; clothingPrompt: string; biometricConsent: true }
  | { op: 'redress-v2'; clothingPrompt: string; biometricConsent: true }
  | { op: 'redress-vton'; garment: ImageInput; biometricConsent: true }

export interface PipelineCreateParams {
  stages: PipelineStage[]
  source?: ImageInput
  webhookEventIdPrefix?: string
  idempotencyKey?: string
  signal?: AbortSignal
}

export interface PipelineStageSnapshot {
  op: PipelineStageOp
  jobId: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  stageIndex: number
}

export interface Pipeline {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  stages: PipelineStageSnapshot[]
}

export interface CompletedPipeline extends Pipeline {
  status: 'completed'
}

export interface PipelineCostStage {
  op: PipelineStageOp
  creditCost: number
  stageIndex: number
}

export interface PipelineCostBreakdown {
  stages: PipelineCostStage[]
  totalCost: number
  projectedBalance: number
}

export interface PipelineCreateAndWaitParams extends PipelineCreateParams {
  pollTimeout?: number
  pollSignal?: AbortSignal
  onProgress?: (pipeline: Pipeline) => void
  minIntervalMs?: number
  maxIntervalMs?: number
}

// Wire shapes (snake_case from server)
interface PipelineStageWire {
  op: PipelineStageOp
  job_id: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  stage_index: number
}

interface PipelineWire {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  stages: PipelineStageWire[]
}

interface PipelineCostStageWire {
  op: PipelineStageOp
  credit_cost: number
  stage_index: number
}

interface PipelineCostBreakdownWire {
  stages: PipelineCostStageWire[]
  total_cost: number
  projected_balance: number
}

async function toWireStage(s: PipelineStage): Promise<Record<string, unknown>> {
  const base: Record<string, unknown> = { op: s.op }
  switch (s.op) {
    case 'generate':
      base['prompt'] = s.prompt
      if (s.negativePrompt !== undefined) base['negative_prompt'] = s.negativePrompt
      if (s.model !== undefined) base['model'] = s.model
      if (s.seed !== undefined) base['seed'] = s.seed
      if (s.width !== undefined) base['width'] = s.width
      if (s.height !== undefined) base['height'] = s.height
      if (s.loras !== undefined) base['loras'] = s.loras
      return base
    case 'undress':
      base['biometric_consent'] = true
      return base
    case 'face-swap':
      base['biometric_consent'] = true
      if (s.faceModelId) base['face_model_id'] = s.faceModelId
      if (s.face) base['face'] = await toDataUri(s.face)
      return base
    case 'upscale':
      if (s.scale !== undefined) base['scale'] = s.scale
      return base
    case 'face-restore':
      return base
    case 'bg-replace':
      base['background_prompt'] = s.backgroundPrompt
      return base
    case 'attach-object':
      base['object_prompt'] = s.objectPrompt
      base['mask'] = await toDataUri(s.mask)
      return base
    case 'animate':
      base['motion_prompt'] = s.motionPrompt
      if (s.frames !== undefined) base['frames'] = s.frames
      return base
    case 'redress':
      base['clothing_prompt'] = s.clothingPrompt
      base['biometric_consent'] = true
      return base
    case 'undress-v2':
      base['biometric_consent'] = true
      return base
    case 'undress-v3':
      base['biometric_consent'] = true
      return base
    case 'fix-hand':
      if (s.strength !== undefined) base['strength'] = s.strength
      return base
    case 'attach-object-v2':
      base['object_prompt'] = s.objectPrompt
      base['mask'] = await toDataUri(s.mask)
      if (s.prompt !== undefined) base['prompt'] = s.prompt
      if (s.seed !== undefined) base['seed'] = s.seed
      return base
    case 'redress-v2':
      base['clothing_prompt'] = s.clothingPrompt
      base['biometric_consent'] = true
      return base
    case 'redress-vton':
      base['garment'] = await toDataUri(s.garment)
      base['biometric_consent'] = true
      return base
    default:
      s satisfies never
      return base
  }
}

async function toWireCreate(p: PipelineCreateParams): Promise<Record<string, unknown>> {
  const stages = await Promise.all(p.stages.map(toWireStage))
  const wire: Record<string, unknown> = { stages }
  if (p.source !== undefined) wire['source'] = await toDataUri(p.source)
  if (p.webhookEventIdPrefix !== undefined) wire['webhook_event_id_prefix'] = p.webhookEventIdPrefix
  return wire
}

function fromWireStage(w: PipelineStageWire): PipelineStageSnapshot {
  return { op: w.op, jobId: w.job_id, status: w.status, stageIndex: w.stage_index }
}

function fromWirePipeline(w: PipelineWire): Pipeline {
  return {
    id: w.id,
    status: w.status,
    stages: w.stages.map(fromWireStage),
  }
}

function fromWireCostBreakdown(w: PipelineCostBreakdownWire): PipelineCostBreakdown {
  return {
    stages: w.stages.map((s) => ({ op: s.op, creditCost: s.credit_cost, stageIndex: s.stage_index })),
    totalCost: w.total_cost,
    projectedBalance: w.projected_balance,
  }
}

export class PipelinesResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async create(params: PipelineCreateParams): Promise<Pipeline> {
    const wire = await toWireCreate(params)
    const result = await this._request<PipelineWire>('POST', '/api/v1/pipelines', wire, {
      idempotencyKey: params.idempotencyKey,
      signal: params.signal,
    })
    return fromWirePipeline(result)
  }

  async dryRun(params: PipelineCreateParams): Promise<PipelineCostBreakdown> {
    const wire = await toWireCreate(params)
    const result = await this._request<PipelineCostBreakdownWire>('POST', '/api/v1/pipelines?dry_run=true', wire, {
      signal: params.signal,
    })
    return fromWireCostBreakdown(result)
  }

  async get(id: string): Promise<Pipeline> {
    const wire = await this._request<PipelineWire>('GET', `/api/v1/pipelines/${encodeURIComponent(id)}`)
    return fromWirePipeline(wire)
  }

  async *poll(
    id: string,
    opts: {
      timeout?: number
      signal?: AbortSignal
      onProgress?: (p: Pipeline) => void
      minIntervalMs?: number
      maxIntervalMs?: number
    } = {},
  ): AsyncIterable<Pipeline> {
    const timeout = opts.timeout ?? 900_000 // pipelines default: 15 min
    const deadline = Date.now() + timeout
    const minMs = opts.minIntervalMs ?? 2_000
    const maxMs = opts.maxIntervalMs ?? 30_000
    let attempt = 0

    while (true) {
      if (Date.now() > deadline) {
        throw new NoCensorTimeoutError(`pipeline poll deadline (${timeout}ms) exceeded for ${id}`, {
          code: 'POLL_TIMEOUT',
          status: null,
        })
      }
      opts.signal?.throwIfAborted()

      const p = await this.get(id)
      if (opts.onProgress) {
        try {
          opts.onProgress(p)
        } catch {
          /* swallow */
        }
      }
      yield p

      if (p.status === 'completed' || p.status === 'failed') return

      const backoffMs = Math.min(maxMs, minMs * 2 ** attempt)
      const jitter = backoffMs * 0.2 * (Math.random() * 2 - 1)
      const waitMs = Math.min(Math.max(0, Math.floor(backoffMs + jitter)), Math.max(0, deadline - Date.now()))
      await sleepAbortable(waitMs, opts.signal)
      attempt++
    }
  }

  async createAndWait(params: PipelineCreateAndWaitParams): Promise<CompletedPipeline> {
    const pipeline = await this.create(params)
    let last: Pipeline = pipeline
    for await (const update of this.poll(pipeline.id, {
      timeout: params.pollTimeout,
      signal: params.pollSignal,
      onProgress: params.onProgress,
      minIntervalMs: params.minIntervalMs,
      maxIntervalMs: params.maxIntervalMs,
    })) {
      last = update
    }
    if (last.status !== 'completed') {
      throw new NoCensorJobFailedError(`pipeline terminated with status: ${last.status}`, {
        code: 'JOB_FAILED',
        status: null,
        jobId: last.id,
        job: last,
      })
    }
    return last as CompletedPipeline
  }
}
