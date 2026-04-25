// packages/sdk/src/resources/models.ts
import { Resource, type ResourceRequestFn } from './base'

interface ModelWire {
  id: string
  name: string
  base_model: string
}
interface ModelsCatalogWire {
  checkpoints: ModelWire[]
  system_loras: ModelWire[]
  operations: string[]
}
export interface ModelEntry {
  id: string
  name: string
  baseModel: string
}
export interface ModelsCatalog {
  checkpoints: ModelEntry[]
  systemLoras: ModelEntry[]
  operations: string[]
}

function fromWireModel(w: ModelWire): ModelEntry {
  return { id: w.id, name: w.name, baseModel: w.base_model }
}
function fromWireCatalog(w: ModelsCatalogWire): ModelsCatalog {
  return {
    checkpoints: w.checkpoints.map(fromWireModel),
    systemLoras: w.system_loras.map(fromWireModel),
    operations: w.operations,
  }
}

export class ModelsResource extends Resource {
  constructor(request: ResourceRequestFn) {
    super(request)
  }
  async list(): Promise<ModelsCatalog> {
    return fromWireCatalog(await this._request<ModelsCatalogWire>('GET', '/api/v1/models'))
  }
}
