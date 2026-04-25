// packages/sdk/src/resources/account.ts
import { Resource, type ResourceRequestFn } from './base'

interface AccountWire {
  user_id: string
  credits_remaining: number
  scopes: string[]
  rate_limits: { generation_rpm: number; mgmt_rpm: number; webhook_mgmt_rpm: number }
}

export interface Account {
  userId: string
  creditsRemaining: number
  scopes: string[]
  rateLimits: { generationRpm: number; mgmtRpm: number; webhookMgmtRpm: number }
}

function fromWireAccount(w: AccountWire): Account {
  return {
    userId: w.user_id,
    creditsRemaining: w.credits_remaining,
    scopes: w.scopes,
    rateLimits: {
      generationRpm: w.rate_limits.generation_rpm,
      mgmtRpm: w.rate_limits.mgmt_rpm,
      webhookMgmtRpm: w.rate_limits.webhook_mgmt_rpm,
    },
  }
}

export class AccountResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }
  async get(): Promise<Account> {
    return fromWireAccount(await this._request<AccountWire>('GET', '/api/v1/account'))
  }
}
