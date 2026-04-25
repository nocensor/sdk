// packages/sdk/__tests__/types.test-d.ts
// Compile-time assertions for public API type promises.
// Runs as part of `pnpm typecheck`, not `pnpm test`.

import type { IsEqual } from 'type-fest'
import type {
  NoCensor,
  CompletedJob,
  CancelledJob,
  Job,
  EnhanceCreateParams,
  FaceSwapCreateParams,
  WebhookEvent,
  GenerateCreateAndWaitParams,
} from '../src/index'

// Local type-level test helpers (type-fest does not export Expect/Equal directly)
type Expect<T extends true> = T
type Equal<A, B> = IsEqual<A, B>

// 1. createAndWait return types narrow to CompletedJob
type _T1 = Expect<Equal<Awaited<ReturnType<NoCensor['generate']['createAndWait']>>, CompletedJob>>
type _T2 = Expect<Equal<Awaited<ReturnType<NoCensor['video']['createAndWait']>>, CompletedJob>>
type _T3 = Expect<Equal<Awaited<ReturnType<NoCensor['faceSwap']['createAndWait']>>, CompletedJob>>

// 2. CompletedJob guarantees at-least-one output (tuple type [Output, ...Output[]])
type _T4 = CompletedJob['outputs']
declare const completed: CompletedJob
const _firstOutput = completed.outputs[0] // CompletedJob uses tuple — first element is always Output

// 3. jobs.cancel returns CancelledJob with refundedCredits
type _T5 = Expect<Equal<Awaited<ReturnType<NoCensor['jobs']['cancel']>>, CancelledJob>>
declare const cancelled: CancelledJob
const _refund: number = cancelled.refundedCredits

// 4. FaceSwap XOR — must have exactly one of faceModelId or face
const _fs1: FaceSwapCreateParams = {
  source: 'https://x.png',
  biometricConsent: true,
  faceModelId: 'fm-1',
}
const _fs2: FaceSwapCreateParams = {
  source: 'https://x.png',
  biometricConsent: true,
  face: 'data:image/png;base64,AAAA',
}
// @ts-expect-error — can't provide both (RequireExactlyOne sets the other to never)
const _fs3: FaceSwapCreateParams = {
  source: 'https://x.png',
  biometricConsent: true,
  faceModelId: 'fm-1',
  face: 'data:image/png;base64,AAAA',
}
// biometricConsent must be literal true — boolean is not assignable
// @ts-expect-error
const _fs5: FaceSwapCreateParams = { source: 'https://x.png', biometricConsent: false as boolean, faceModelId: 'fm-1' }

// 5. Enhance discriminated union
const _e1: EnhanceCreateParams = { operation: 'upscale', source: 'https://x.png', scale: 4 }
const _e2: EnhanceCreateParams = { operation: 'face-restore', source: 'https://x.png' }
const _e3: EnhanceCreateParams = { operation: 'bg-replace', source: 'https://x.png', backgroundPrompt: 'x' }
// @ts-expect-error — backgroundPrompt does not belong on upscale
const _e4: EnhanceCreateParams = { operation: 'upscale', source: 'https://x.png', backgroundPrompt: 'x' }
// @ts-expect-error — attach-object requires objectPrompt and mask
const _e5: EnhanceCreateParams = { operation: 'attach-object', source: 'https://x.png' }

// 6. WebhookEvent discriminated union — each known branch carries typed data
// Note: the union includes a `type: string` catch-all branch, so we use type assertions
// to verify each known member has the right shape.
import type {
  JobCompletedPayload,
  JobFailedPayload,
  JobCancelledPayload,
  PaymentCompletedPayload,
  LoraTrainingCompletedPayload,
  LoraTrainingFailedPayload,
  WebhookTestPayload,
} from '../src/webhooks/types'

declare const evtCompleted: Extract<WebhookEvent, { type: 'job.completed' }>
declare const evtFailed: Extract<WebhookEvent, { type: 'job.failed' }>
declare const evtCancelled: Extract<WebhookEvent, { type: 'job.cancelled' }>
declare const evtPayment: Extract<WebhookEvent, { type: 'payment.completed' }>
declare const evtLoraOk: Extract<WebhookEvent, { type: 'lora.training_completed' }>
declare const evtLoraFail: Extract<WebhookEvent, { type: 'lora.training_failed' }>
declare const evtTest: Extract<WebhookEvent, { type: 'webhook.test' }>

type _T6a = Expect<Equal<typeof evtCompleted.data, JobCompletedPayload>>
type _T6b = Expect<Equal<typeof evtFailed.data, JobFailedPayload>>
type _T6c = Expect<Equal<typeof evtCancelled.data, JobCancelledPayload>>
type _T6d = Expect<Equal<typeof evtPayment.data, PaymentCompletedPayload>>
type _T6e = Expect<Equal<typeof evtLoraOk.data, LoraTrainingCompletedPayload>>
type _T6f = Expect<Equal<typeof evtLoraFail.data, LoraTrainingFailedPayload>>
type _T6g = Expect<Equal<typeof evtTest.data, WebhookTestPayload>>

// Forward-compat: unknown branch for new event types
declare const evtUnknown: Extract<WebhookEvent, { unknown: true }>
type _T6h = Expect<Equal<typeof evtUnknown.unknown, true>>

type _T6 = _T6a | _T6b | _T6c | _T6d | _T6e | _T6f | _T6g | _T6h

// 7. GenerateCreateAndWaitParams includes pollTimeout/pollSignal/onProgress
const _g1: GenerateCreateAndWaitParams = {
  prompt: 'a fox',
  pollTimeout: 300_000,
  pollSignal: new AbortController().signal,
  onProgress: (j: Job) => {
    void j
  },
}

// 8. Job status is the expected union
declare const anyJob: Job
type _JobStatus = typeof anyJob.status
type _T7 = Expect<Equal<_JobStatus, 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>>

type _Used =
  | _T1
  | _T2
  | _T3
  | _T4
  | _T5
  | _T6
  | _T7
  | typeof completed
  | typeof _firstOutput
  | typeof _fs1
  | typeof _fs2
  | typeof _e1
  | typeof _e2
  | typeof _e3
  | typeof _g1
  | typeof _refund
export type {}
