// packages/sdk/src/client.ts
// Public NoCensor client class. Resources are attached incrementally.

import {
  doRequest,
  doRequestWithMeta,
  type RequestContext,
  type RequestOverrides,
  type HttpMethod,
  type RequestResultWithMeta,
} from './request'
import { NoCensorAuthenticationError, NoCensorValidationError, type RateLimitInfo } from './errors'
import { HealthResource } from './resources/health'
import { AccountResource } from './resources/account'
import { ModelsResource } from './resources/models'
import { JobsResource } from './resources/jobs'
import { GenerateResource } from './resources/generate'
import { FaceSwapResource } from './resources/face-swap'
import { VideoResource } from './resources/video'
import { UndressResource } from './resources/undress'
import { EnhanceResource } from './resources/enhance'
import { PipelinesResource } from './resources/pipelines'
import { WebhooksResource } from './resources/webhooks'
import { CharactersResource } from './resources/characters'
import { CreditsResource } from './resources/credits'
import { PaymentsResource } from './resources/payments'

// Update this on every release to match package.json version.
const SDK_VERSION = '0.2.0'

export interface NoCensorOptions {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  fetch?: typeof globalThis.fetch
  userAgentSuffix?: string
  onRateLimit?: (info: RateLimitInfo) => void
}

export class NoCensor {
  // Private — not exposed on the instance. Captured by closure in `request`.
  readonly #request: <T>(method: HttpMethod, path: string, body?: unknown, init?: RequestOverrides) => Promise<T>

  readonly health: HealthResource
  readonly account: AccountResource
  readonly models: ModelsResource
  readonly jobs: JobsResource
  readonly generate: GenerateResource
  readonly faceSwap: FaceSwapResource
  readonly video: VideoResource
  readonly undress: UndressResource
  readonly enhance: EnhanceResource
  readonly pipelines: PipelinesResource
  readonly webhooks: WebhooksResource
  readonly characters: CharactersResource
  readonly credits: CreditsResource
  readonly payments: PaymentsResource

  constructor(options: NoCensorOptions = {}) {
    const apiKey = resolveApiKey(options.apiKey)
    const baseUrl = normalizeAndValidateBaseUrl(options.baseUrl ?? 'https://nocensor.ai')
    const fetch =
      options.fetch ??
      (typeof globalThis.fetch === 'function'
        ? globalThis.fetch.bind(globalThis)
        : (() => {
            throw new Error('No global fetch available. Pass a custom fetch in options.fetch.')
          })())

    const userAgent = buildUserAgent(options.userAgentSuffix)

    const ctx: RequestContext = {
      baseUrl,
      apiKey,
      userAgent,
      fetch,
      timeout: options.timeout ?? 60_000,
      maxRetries: options.maxRetries ?? 2,
      onRateLimit: options.onRateLimit,
    }

    this.#request = <T>(method: HttpMethod, path: string, body?: unknown, init?: RequestOverrides) =>
      doRequest<T>(ctx, method, path, body, init)

    const requestWithMeta = <T>(
      method: HttpMethod,
      path: string,
      body?: unknown,
      init?: RequestOverrides,
    ): Promise<RequestResultWithMeta<T>> => doRequestWithMeta<T>(ctx, method, path, body, init)

    this.health = new HealthResource(this.#request.bind(this))
    this.account = new AccountResource(this.#request.bind(this))
    this.models = new ModelsResource(this.#request.bind(this))
    this.jobs = new JobsResource(this.#request.bind(this), requestWithMeta)
    this.generate = new GenerateResource(this.#request.bind(this))
    this.faceSwap = new FaceSwapResource(this.#request.bind(this))
    this.video = new VideoResource(this.#request.bind(this))
    this.undress = new UndressResource(this.#request.bind(this))
    this.enhance = new EnhanceResource(this.#request.bind(this))
    this.pipelines = new PipelinesResource(this.#request.bind(this))
    this.webhooks = new WebhooksResource(this.#request.bind(this))
    this.characters = new CharactersResource(this.#request.bind(this))
    this.credits = new CreditsResource(this.#request.bind(this))
    this.payments = new PaymentsResource(this.#request.bind(this), requestWithMeta)
  }

  /** Low-level request escape hatch for endpoints not yet wrapped by a resource. */
  request<T = unknown>(method: HttpMethod, path: string, body?: unknown, init?: RequestOverrides): Promise<T> {
    return this.#request<T>(method, path, body, init)
  }
}

function resolveApiKey(explicit: string | undefined): string {
  if (explicit) return explicit
  const envKey = typeof process !== 'undefined' ? process.env['NOCENSOR_API_KEY'] : undefined
  if (envKey) return envKey
  throw new NoCensorAuthenticationError(
    'No API key provided. Pass { apiKey } to new NoCensor() or set NOCENSOR_API_KEY environment variable.',
    { code: 'UNAUTHORIZED', status: null },
  )
}

function normalizeAndValidateBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '')
  if (trimmed.endsWith('/api') || trimmed.endsWith('/api/v1') || trimmed.includes('/api/v1/')) {
    throw new NoCensorValidationError(
      `baseUrl must be the origin only (e.g. 'https://nocensor.ai'), without a '/api/v1' path. The SDK adds '/api/v1/...' internally. Got: ${raw}`,
      { code: 'VALIDATION_ERROR', status: null },
    )
  }
  return trimmed
}

function buildUserAgent(suffix: string | undefined): string {
  const base = `nocensor-sdk/${SDK_VERSION}`
  return suffix ? `${base} ${suffix}` : base
}
