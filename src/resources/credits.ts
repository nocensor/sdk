// packages/sdk/src/resources/credits.ts
import { Resource, type ResourceRequestFn } from './base'

interface CreditsWire {
  balance: number
  lifetime_purchased: number
  lifetime_consumed: number
}

export interface Credits {
  balance: number
  lifetimePurchased: number
  lifetimeConsumed: number
}

function fromWireCredits(w: CreditsWire): Credits {
  return {
    balance: w.balance,
    lifetimePurchased: w.lifetime_purchased,
    lifetimeConsumed: w.lifetime_consumed,
  }
}

export class CreditsResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }

  async get(): Promise<Credits> {
    return fromWireCredits(await this._request<CreditsWire>('GET', '/api/v1/credits'))
  }
}
