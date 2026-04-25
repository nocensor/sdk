import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

describe('ModelsResource', () => {
  it('list() returns the models catalog', async () => {
    const m = createMockFetch()
    m.queue({
      status: 200,
      body: {
        data: {
          checkpoints: [{ id: 'realistic', name: 'Realistic', base_model: 'sdxl' }],
          system_loras: [],
          operations: ['generate', 'face-swap', 'video'],
        },
      },
    })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const catalog = await nc.models.list()
    expect(catalog.checkpoints).toHaveLength(1)
    expect(catalog.checkpoints[0]?.baseModel).toBe('sdxl')
    expect(catalog.operations).toContain('generate')
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/models')
  })
})
