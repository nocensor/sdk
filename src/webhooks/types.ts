// packages/sdk/src/webhooks/types.ts
export interface JobCompletedPayload {
  jobId: string
  workflow: string
  outputs: Array<{ url: string; mediaType: 'image' | 'video'; sizeBytes: number }>
  creditsCharged: number
}
export interface JobFailedPayload {
  jobId: string
  workflow: string
  error: { message: string }
}
export interface JobCancelledPayload {
  jobId: string
  workflow: string
  cancelledVia: string
}
export interface PaymentCompletedPayload {
  paymentId: string
  gateway: string
  amountUsd: number
  creditsAdded: number
}
export interface LoraTrainingCompletedPayload {
  loraId: string
  name: string
  baseModel: string
}
export interface LoraTrainingFailedPayload {
  loraId: string
  name: string
  error: { message: string }
}
export interface WebhookTestPayload {
  webhookId: string
  message: string
  emittedAt: string
}
export interface WebhookEventMeta {
  id: string
  deliveredAt: Date
  attempt: number
  deliveryId: string
}

export type WebhookEvent =
  | ({ type: 'job.completed'; data: JobCompletedPayload } & WebhookEventMeta)
  | ({ type: 'job.failed'; data: JobFailedPayload } & WebhookEventMeta)
  | ({ type: 'job.cancelled'; data: JobCancelledPayload } & WebhookEventMeta)
  | ({ type: 'payment.completed'; data: PaymentCompletedPayload } & WebhookEventMeta)
  | ({ type: 'lora.training_completed'; data: LoraTrainingCompletedPayload } & WebhookEventMeta)
  | ({ type: 'lora.training_failed'; data: LoraTrainingFailedPayload } & WebhookEventMeta)
  | ({ type: 'webhook.test'; data: WebhookTestPayload } & WebhookEventMeta)
  | ({ type: string; data: Record<string, unknown>; unknown: true } & WebhookEventMeta)

export const KNOWN_EVENT_TYPES = new Set([
  'job.completed',
  'job.failed',
  'job.cancelled',
  'payment.completed',
  'lora.training_completed',
  'lora.training_failed',
  'webhook.test',
])
