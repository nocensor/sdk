// packages/sdk/src/resources/base.ts
// Abstract Resource class. Each resource closes over a shared request function.

import type { HttpMethod, RequestOverrides, RequestResultWithMeta } from '../request'

export type ResourceRequestFn = <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  init?: RequestOverrides,
) => Promise<T>

export type ResourceRequestWithMetaFn = <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  init?: RequestOverrides,
) => Promise<RequestResultWithMeta<T>>

export abstract class Resource {
  protected constructor(protected readonly _request: ResourceRequestFn) {}
}
