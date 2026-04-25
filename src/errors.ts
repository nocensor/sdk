// packages/sdk/src/errors.ts
// Self-contained error hierarchy for @nocensor/sdk.
// No @nocensor/core dependency — this file must remain standalone.
// When adding new error classes, define them here directly (do not re-export from @nocensor/core).

export interface ErrorInit {
  code: string
  status?: number | null
  requestId?: string | null
  cause?: unknown
}

export class NoCensorError extends Error {
  readonly code: string
  readonly status: number | null
  readonly requestId: string | null
  override readonly cause?: unknown

  constructor(message: string, opts: ErrorInit) {
    super(message)
    this.name = 'NoCensorError'
    this.code = opts.code
    this.status = opts.status ?? null
    this.requestId = opts.requestId ?? null
    this.cause = opts.cause
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorAuthenticationError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorAuthenticationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorPermissionError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorPermissionError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorValidationError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorValidationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorNotFoundError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorConflictError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorConflictError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorInsufficientCreditsError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorInsufficientCreditsError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorPurchaseRequiredError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorPurchaseRequiredError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorPromptBlockedError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorPromptBlockedError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorServerError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorServerError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorNetworkError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorNetworkError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorTimeoutError extends NoCensorError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorTimeoutError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// Conflict subclasses — still instanceof NoCensorConflictError
export class NoCensorJobNotCancellableError extends NoCensorConflictError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorJobNotCancellableError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorLoraNotReadyError extends NoCensorConflictError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorLoraNotReadyError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorWebhookLimitReachedError extends NoCensorConflictError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorWebhookLimitReachedError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorWebhookInactiveError extends NoCensorConflictError {
  constructor(message: string, opts: ErrorInit) {
    super(message, opts)
    this.name = 'NoCensorWebhookInactiveError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface RateLimitInfo {
  limit: number | null
  remaining: number | null
  resetAt: Date | null
  rateClass: 'generation' | 'mgmt' | 'webhook-mgmt' | null
}

export class NoCensorRateLimitError extends NoCensorError {
  readonly retryAfterMs: number
  readonly rateLimit: RateLimitInfo | null

  constructor(message: string, opts: ErrorInit & { retryAfterMs?: number; rateLimit?: RateLimitInfo | null }) {
    super(message, opts)
    this.name = 'NoCensorRateLimitError'
    this.retryAfterMs = opts.retryAfterMs ?? 0
    this.rateLimit = opts.rateLimit ?? null
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoCensorJobFailedError extends NoCensorError {
  readonly jobId: string
  readonly job: unknown

  constructor(message: string, opts: ErrorInit & { jobId: string; job: unknown }) {
    super(message, opts)
    this.name = 'NoCensorJobFailedError'
    this.jobId = opts.jobId
    this.job = opts.job
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export type WebhookErrorReason =
  | 'invalid_headers'
  | 'missing_header'
  | 'malformed_signature'
  | 'timestamp_mismatch'
  | 'stale_timestamp'
  | 'bad_signature'
  | 'invalid_body'
  | 'unknown_event'

export class NoCensorWebhookError extends NoCensorError {
  readonly reason: WebhookErrorReason
  readonly header: string | undefined
  readonly skewMs: number | undefined

  constructor(message: string, opts: ErrorInit & { reason: WebhookErrorReason; header?: string; skewMs?: number }) {
    super(message, opts)
    this.name = 'NoCensorWebhookError'
    this.reason = opts.reason
    this.header = opts.header
    this.skewMs = opts.skewMs
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function mapErrorCodeToClass(code: string, _status: number): typeof NoCensorError {
  switch (code) {
    case 'UNAUTHORIZED':
      return NoCensorAuthenticationError
    case 'FORBIDDEN':
    case 'INSUFFICIENT_SCOPE':
    case 'LORA_NOT_OWNED':
      return NoCensorPermissionError
    case 'INSUFFICIENT_CREDITS':
      return NoCensorInsufficientCreditsError
    case 'PURCHASE_REQUIRED':
      return NoCensorPurchaseRequiredError
    case 'PROMPT_BLOCKED':
      return NoCensorPromptBlockedError
    case 'VALIDATION_ERROR':
    case 'INVALID_REQUEST':
    case 'WEBHOOK_URL_INVALID':
    case 'LORA_INCOMPATIBLE':
    case 'TOO_MANY_LORAS':
    case 'PIPELINE_INVALID_STAGE_ORDER':
    case 'PIPELINE_TOO_MANY_STAGES':
      return NoCensorValidationError
    case 'NOT_FOUND':
    case 'JOB_NOT_FOUND':
    case 'SOURCE_NOT_FOUND':
    case 'PIPELINE_NOT_FOUND':
    case 'LORA_NOT_FOUND':
      return NoCensorNotFoundError
    case 'JOB_NOT_CANCELLABLE':
      return NoCensorJobNotCancellableError
    case 'LORA_NOT_READY':
      return NoCensorLoraNotReadyError
    case 'WEBHOOK_LIMIT_REACHED':
      return NoCensorWebhookLimitReachedError
    case 'WEBHOOK_INACTIVE':
      return NoCensorWebhookInactiveError
    case 'RATE_LIMITED':
      return NoCensorRateLimitError
    case 'DB_ERROR':
    case 'STORAGE_ERROR':
    case 'GPU_UNAVAILABLE':
      return NoCensorServerError
    default:
      return NoCensorError
  }
}
