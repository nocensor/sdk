// packages/sdk/src/resources/health.ts
import { Resource, type ResourceRequestFn } from './base'

export interface HealthStatus {
  status: string
}

export class HealthResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }
  async get(): Promise<HealthStatus> {
    return this._request<HealthStatus>('GET', '/api/v1/health')
  }
}
