// packages/sdk/src/index.ts
// Public entry point for @nocensor/sdk

export { NoCensor, type NoCensorOptions } from './client'
export type { ImageInput } from './file-inputs'
export type { HttpMethod, RequestOverrides } from './request'
export type { RateLimitInfo } from './errors'

// Error classes
export {
  NoCensorError,
  NoCensorAuthenticationError,
  NoCensorPermissionError,
  NoCensorValidationError,
  NoCensorNotFoundError,
  NoCensorConflictError,
  NoCensorJobNotCancellableError,
  NoCensorLoraNotReadyError,
  NoCensorWebhookLimitReachedError,
  NoCensorWebhookInactiveError,
  NoCensorRateLimitError,
  NoCensorInsufficientCreditsError,
  NoCensorPurchaseRequiredError,
  NoCensorPromptBlockedError,
  NoCensorServerError,
  NoCensorNetworkError,
  NoCensorTimeoutError,
  NoCensorJobFailedError,
  NoCensorWebhookError,
} from './errors'

// Resources
export { HealthResource, type HealthStatus } from './resources/health'
export { AccountResource, type Account } from './resources/account'
export { ModelsResource, type ModelEntry, type ModelsCatalog } from './resources/models'
export {
  JobsResource,
  type Job,
  type CompletedJob,
  type CancelledJob,
  type Output,
  type JobListParams,
} from './resources/jobs'
export type { PollOptions, JobStatus } from './polling'
export {
  GenerateResource,
  type GenerateCreateParams,
  type GenerateCreateAndWaitParams,
  type LoraRef,
} from './resources/generate'
export { FaceSwapResource, type FaceSwapCreateParams, type FaceSwapCreateAndWaitParams } from './resources/face-swap'
export {
  VideoResource,
  type VideoCreateParams,
  type VideoCreateAndWaitParams,
  type VideoLoraRef,
  type VideoAudioMode,
} from './resources/video'
export { UndressResource, type UndressCreateParams, type UndressCreateAndWaitParams } from './resources/undress'
export {
  UndressV2Resource,
  type UndressV2CreateParams,
  type UndressV2CreateAndWaitParams,
} from './resources/undress-v2'
export { EnhanceResource, type EnhanceCreateParams, type EnhanceCreateAndWaitParams } from './resources/enhance'
export {
  PipelinesResource,
  type Pipeline,
  type CompletedPipeline,
  type PipelineStage,
  type PipelineStageSnapshot,
  type PipelineStageOp,
  type PipelineCreateParams,
  type PipelineCreateAndWaitParams,
  type PipelineCostBreakdown,
  type PipelineCostStage,
} from './resources/pipelines'

export { CharactersResource, type Character } from './resources/characters'
export { CreditsResource, type Credits } from './resources/credits'
export { PaymentsResource, type Payment, type PaymentListParams } from './resources/payments'
export {
  WebhooksResource,
  KNOWN_EVENT_TYPES,
  type Webhook,
  type WebhookWithSecret,
  type WebhookDelivery,
  type CreateWebhookParams,
  type UpdateWebhookParams,
  type ListDeliveriesParams,
  type WebhookEventType,
} from './resources/webhooks'

export {
  PoseExtractResource,
  type PoseExtractCreateParams,
  type PoseExtractCreateAndWaitParams,
} from './resources/pose-extract'

// Webhook verification (also available as @nocensor/sdk/webhooks)
export { verifyWebhook, type VerifyOptions } from './webhooks/verify'
export type {
  WebhookEvent,
  WebhookEventMeta,
  JobCompletedPayload,
  JobFailedPayload,
  JobCancelledPayload,
  PaymentCompletedPayload,
  LoraTrainingCompletedPayload,
  LoraTrainingFailedPayload,
  WebhookTestPayload,
  PipelineCompletedPayload,
} from './webhooks/types'
