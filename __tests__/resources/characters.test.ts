import { describe, it, expect } from 'vitest'
import { NoCensor } from '../../src/client'
import { createMockFetch } from '../_helpers/mock-fetch'

const CHARACTER_WIRE = {
  id: 'char1',
  displayName: 'Aria',
  description: 'A friendly AI companion.',
  tags: ['casual', 'friendly'],
  isUnlocked: true,
  unlockThreshold: 0,
  unlockProgress: 5,
  isPremium: false,
}

describe('CharactersResource', () => {
  it('list() returns character array with correct fields', async () => {
    const m = createMockFetch()
    m.queue({ status: 200, body: { data: [CHARACTER_WIRE] } })
    const nc = new NoCensor({ apiKey: 'k', fetch: m.fetch as unknown as typeof globalThis.fetch })
    const chars = await nc.characters.list()
    expect(chars).toHaveLength(1)
    expect(chars[0]?.id).toBe('char1')
    expect(chars[0]?.displayName).toBe('Aria')
    expect(chars[0]?.isUnlocked).toBe(true)
    expect(chars[0]?.isPremium).toBe(false)
    expect(m.calls[0]?.url).toBe('https://nocensor.ai/api/v1/characters')
    expect(m.calls[0]?.method).toBe('GET')
  })
})
