import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

function nc(m: ReturnType<typeof createMockFetch>) {
  return new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
}

describe('PipelinesResource', () => {
  it('create() POSTs stages and returns { id, stages }', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: {
          id: 'pipeline_abc',
          status: 'pending',
          stages: [
            { op: 'generate', job_id: 'j1', status: 'pending', stage_index: 0 },
            { op: 'upscale', job_id: null, status: 'pending', stage_index: 1 },
          ],
        },
        meta: {
          credits_remaining: 85,
          credits_charged: 25,
          poll_url: '/api/v1/pipelines/pipeline_abc',
        },
      },
    })
    const result = await nc(m).pipelines.create({
      stages: [
        { op: 'generate', prompt: 'a fox' },
        { op: 'upscale', scale: 2 },
      ],
    })
    expect(result.id).toBe('pipeline_abc')
    expect(result.stages).toHaveLength(2)
    expect(result.stages[0]?.op).toBe('generate')
    expect(result.stages[0]?.jobId).toBe('j1')
    expect(result.stages[1]?.jobId).toBeNull()
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages).toEqual([
      { op: 'generate', prompt: 'a fox' },
      { op: 'upscale', scale: 2 },
    ])
  })

  it('dryRun() appends ?dry_run=true and returns cost breakdown', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          stages: [
            { op: 'generate', credit_cost: 15, stage_index: 0 },
            { op: 'upscale', credit_cost: 10, stage_index: 1 },
          ],
          total_cost: 25,
          projected_balance: 85,
        },
      },
    })
    const breakdown = await nc(m).pipelines.dryRun({
      stages: [{ op: 'generate', prompt: 'a fox' }, { op: 'upscale' }],
    })
    expect(m.calls[0]?.url).toContain('?dry_run=true')
    expect(breakdown.totalCost).toBe(25)
    expect(breakdown.projectedBalance).toBe(85)
    expect(breakdown.stages[0]?.creditCost).toBe(15)
  })

  it('get() returns aggregated pipeline status', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          id: 'pipeline_abc',
          status: 'processing',
          stages: [
            { op: 'generate', job_id: 'j1', status: 'completed', stage_index: 0 },
            { op: 'upscale', job_id: 'j2', status: 'processing', stage_index: 1 },
          ],
        },
      },
    })
    const result = await nc(m).pipelines.get('pipeline_abc')
    expect(result.status).toBe('processing')
    expect(result.stages[1]?.status).toBe('processing')
  })

  it('emits undress-v2 stage with biometric_consent', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'undress-v2', job_id: null, status: 'pending', stage_index: 0 }] },
      },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'undress-v2', biometricConsent: true }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'undress-v2', biometric_consent: true })
  })

  it('emits undress-v3 stage with biometric_consent', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'undress-v3', job_id: null, status: 'pending', stage_index: 0 }] },
      },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'undress-v3', biometricConsent: true }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'undress-v3', biometric_consent: true })
  })

  it('emits attach-object-v2 with object_prompt + mask', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: {
        data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'attach-object-v2', job_id: null, status: 'pending', stage_index: 0 }] },
      },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'attach-object-v2', objectPrompt: 'a hat', mask: 'data:image/png;base64,AAAA' }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'attach-object-v2', object_prompt: 'a hat', mask: 'data:image/png;base64,AAAA' })
  })

  it('emits redress-v2 with biometric_consent + clothing_prompt', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: { data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'redress-v2', job_id: null, status: 'pending', stage_index: 0 }] } },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'redress-v2', biometricConsent: true, clothingPrompt: 'red dress' }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'redress-v2', biometric_consent: true, clothing_prompt: 'red dress' })
  })

  it('emits redress-vton with biometric_consent + garment data URI', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: { data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'redress-vton', job_id: null, status: 'pending', stage_index: 0 }] } },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'redress-vton', biometricConsent: true, garment: 'data:image/png;base64,BBBB' }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'redress-vton', biometric_consent: true, garment: 'data:image/png;base64,BBBB' })
  })

  it('emits fix-hand stage with op only', async () => {
    const m = createMockFetch()
    m.queue({
      status: 202,
      body: { data: { id: 'pipeline_x', status: 'pending', stages: [{ op: 'fix-hand', job_id: null, status: 'pending', stage_index: 0 }] } },
    })
    await nc(m).pipelines.create({
      stages: [{ op: 'fix-hand' }],
      source: 'https://example.com/src.png',
    })
    const body = JSON.parse(m.calls[0]?.body ?? '{}')
    expect(body.stages[0]).toEqual({ op: 'fix-hand' })
  })
})
