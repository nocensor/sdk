// packages/sdk/src/resources/characters.ts
import { Resource, type ResourceRequestFn } from './base'

// The /api/v1/characters endpoint returns camelCase directly (no snake_case remapping).
interface CharacterWire {
  id: string
  displayName: string
  description: string | null
  tags: string[]
  isUnlocked: boolean
  unlockThreshold: number
  unlockProgress: number
  isPremium: boolean
}

export interface Character {
  id: string
  displayName: string
  description: string | null
  tags: string[]
  isUnlocked: boolean
  unlockThreshold: number
  unlockProgress: number
  isPremium: boolean
}

function fromWireCharacter(w: CharacterWire): Character {
  return {
    id: w.id,
    displayName: w.displayName,
    description: w.description,
    tags: w.tags,
    isUnlocked: w.isUnlocked,
    unlockThreshold: w.unlockThreshold,
    unlockProgress: w.unlockProgress,
    isPremium: w.isPremium,
  }
}

export class CharactersResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async list(): Promise<Character[]> {
    const items = await this._request<CharacterWire[]>('GET', '/api/v1/characters')
    return items.map(fromWireCharacter)
  }
}
