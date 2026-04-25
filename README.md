# @nocensor/sdk

Official TypeScript SDK for the [nocensor.ai](https://nocensor.ai) API — image and video generation, face swap, pipelines, and webhooks.

- **Universal runtime** — Node 20+, browsers, Deno, Bun, Cloudflare Workers, Vercel Edge
- **Zero runtime dependencies** — everything built on Web standards
- **End-to-end type safety** — types generated from our OpenAPI spec, never out of sync
- **~15 KB gzipped** — tree-shakable by default

## Install

```sh
npm install @nocensor/sdk
# or
pnpm add @nocensor/sdk
# or
yarn add @nocensor/sdk
```

## Quickstart

```typescript
import { NoCensor } from '@nocensor/sdk'

const nc = new NoCensor({ apiKey: process.env.NOCENSOR_API_KEY })

const job = await nc.generate.createAndWait({
  prompt: 'a red fox in a snowy forest',
})

console.log(job.outputs[0].url)
// → https://nocensor.ai/storage/.../output.png
```

That's it. The SDK handles authentication, polling, retries, rate-limit awareness, and error mapping. `createAndWait()` resolves when the job completes and throws `NoCensorJobFailedError` if it terminates as failed or cancelled.

## Authentication

```typescript
// Pass the key explicitly:
const nc = new NoCensor({ apiKey: 'nc_live_...' })

// Or set NOCENSOR_API_KEY in your environment (Node only):
const nc = new NoCensor()
```

Get your API key from the [Developers dashboard](https://nocensor.ai/developers). **Never commit API keys to your repo or ship them in client-side JavaScript** — a generation key authorizes real money spend on your account.

## Generating images

```typescript
// One-liner: dispatch and wait
const job = await nc.generate.createAndWait({
  prompt: 'a red fox',
  model: 'anime',
  seed: 42,
})

// Stream state updates for a custom UI
const { id } = await nc.generate.create({ prompt: 'a red fox' })
for await (const update of nc.jobs.poll(id)) {
  console.log(update.status) // 'pending' → 'processing' → 'completed'
}

// Manual control
const { id } = await nc.generate.create({ prompt: 'a red fox' })
const result = await nc.jobs.get(id)
```

Image-to-image works by passing `image`:

```typescript
import { fromFilePath } from '@nocensor/sdk/node'

const image = await fromFilePath('./input.png') // returns a Blob
const job = await nc.generate.createAndWait({
  prompt: 'anime style',
  model: 'anime',
  image,
  denoise: 0.6,
})
```

In the browser, pass a `File` or `Blob` directly — no Node helper needed.

## Face swapping

```typescript
const job = await nc.faceSwap.createAndWait({
  source: 'https://example.com/group-photo.png',
  face: 'https://example.com/reference-face.png',
  biometricConsent: true, // required literal
})
```

Or use a saved face model:

```typescript
const job = await nc.faceSwap.createAndWait({
  source: 'https://example.com/group-photo.png',
  faceModelId: 'fm_abc123',
  biometricConsent: true,
})
```

The TypeScript types enforce that exactly one of `face` or `faceModelId` is present — passing both, or neither, is a compile error.

## Videos

```typescript
// Text-to-video
const job = await nc.video.createAndWait({
  prompt: 'a fox running through a snowy forest, cinematic',
  durationSeconds: 5,
})

// Image-to-video
const job = await nc.video.createAndWait({
  prompt: 'camera pans left',
  image: 'https://example.com/first-frame.png',
})
```

Video poll timeouts default to 10 minutes because cold starts can be long. Override with `pollTimeout: 900_000` for 15 minutes.

## Pipelines

Chain multiple operations in one request:

```typescript
const pipeline = await nc.pipelines.createAndWait({
  stages: [
    { op: 'generate', prompt: 'a red fox', model: 'realistic' },
    { op: 'upscale', scale: 4 },
    { op: 'face-restore' },
  ],
})
```

Estimate cost before dispatching:

```typescript
const breakdown = await nc.pipelines.dryRun({
  stages: [
    { op: 'generate', prompt: 'a red fox' },
    { op: 'upscale', scale: 2 },
  ],
})
console.log(`Total: ${breakdown.totalCost} credits`)
console.log(`Projected balance: ${breakdown.projectedBalance}`)
```

## Jobs

List, get, cancel, and wait for jobs:

```typescript
// Iterate all completed jobs (walks pagination automatically)
for await (const job of nc.jobs.list({ status: 'completed' })) {
  console.log(job.id, job.outputs?.[0]?.url)
}

// Single-page access for dashboards
const page = await nc.jobs.listPage({ status: 'completed', page: 1 })

// Wait for an existing job (e.g., one started in another process)
const completed = await nc.jobs.waitForCompletion('job-id')

// Cancel a pending job (returns refunded credit amount)
const cancelled = await nc.jobs.cancel('job-id')
console.log(`Refunded ${cancelled.refundedCredits} credits`)
```

## Webhooks

**🚨 CRITICAL: You MUST pass the raw request body** to `verifyWebhook`, NOT a re-serialized JSON object. Every JSON library on earth serializes with slightly different whitespace, which breaks HMAC verification.

```typescript
import { verifyWebhook, NoCensorWebhookError } from '@nocensor/sdk/webhooks'

// Next.js Route Handler example — pattern applies to any framework
export async function POST(request: Request) {
  const rawBody = await request.text() // ← raw text, NOT request.json() + JSON.stringify()

  try {
    const event = await verifyWebhook(rawBody, request.headers, {
      secret: process.env.NOCENSOR_WEBHOOK_SECRET!,
    })

    switch (event.type) {
      case 'job.completed':
        await handleJobCompleted(event.data) // fully typed
        break
      case 'payment.completed':
        await creditAccount(event.data.amountUsd, event.data.creditsAdded)
        break
      // ... exhaustive switch
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    if (e instanceof NoCensorWebhookError) {
      // e.reason tells you exactly what failed
      return new Response(e.message, { status: 400 })
    }
    throw e
  }
}
```

### Framework-specific raw body patterns

| Framework                | Code                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Next.js Route Handler    | `const rawBody = await request.text()`                                                |
| Hono                     | `const rawBody = await c.req.text()`                                                  |
| Express                  | `app.use(express.raw({ type: 'application/json' }))` then `req.body.toString('utf8')` |
| Cloudflare Workers       | `const rawBody = await request.text()`                                                |
| Vercel Edge              | `const rawBody = await request.text()`                                                |
| AWS Lambda (API Gateway) | `event.body` (already a string; decode if base64-encoded)                             |
| Deno                     | `const rawBody = await request.text()`                                                |
| Bun                      | `const rawBody = await request.text()`                                                |

### Secret rotation

If you rotate a webhook secret, pass both the new and previous secret during the 24-hour grace window:

```typescript
const event = await verifyWebhook(rawBody, request.headers, {
  secret: process.env.NOCENSOR_WEBHOOK_SECRET!,
  previousSecret: process.env.NOCENSOR_WEBHOOK_SECRET_OLD, // unset after grace ends
})
```

The verifier tries the current secret first, then falls back to the previous. If either matches, the delivery is accepted.

### Idempotency

Deduplicate on the event ID:

```typescript
if (await alreadyProcessed(event.id)) {
  return new Response('ok', { status: 200 })
}
await markProcessed(event.id)
```

The event ID is stable across retries, so this is safe.

## Error handling

All errors inherit from `NoCensorError`. Catch specific subclasses for specific responses:

```typescript
import {
  NoCensorError,
  NoCensorAuthenticationError,
  NoCensorRateLimitError,
  NoCensorInsufficientCreditsError,
  NoCensorJobFailedError,
  NoCensorTimeoutError,
} from '@nocensor/sdk'

try {
  const job = await nc.generate.createAndWait({ prompt: 'a red fox' })
} catch (e) {
  if (e instanceof NoCensorAuthenticationError) {
    console.error('Invalid API key')
  } else if (e instanceof NoCensorInsufficientCreditsError) {
    console.error('Need to top up credits')
  } else if (e instanceof NoCensorRateLimitError) {
    console.error(`Rate limited, retry after ${e.retryAfterMs}ms`)
  } else if (e instanceof NoCensorJobFailedError) {
    console.error(`Job ${e.jobId} failed: ${e.message}`)
  } else if (e instanceof NoCensorTimeoutError) {
    console.error('Polling timed out — job may still complete')
  } else if (e instanceof NoCensorError) {
    console.error(`SDK error [${e.code}]: ${e.message} (request_id: ${e.requestId})`)
  }
}
```

Every error carries `.code`, `.status`, and `.requestId` — paste the request ID into support tickets for fast triage.

### `createAndWait` throws vs `jobs.get` returns

This asymmetry is intentional:

- **`createAndWait()`** is a promise-resolution API — it **throws** `NoCensorJobFailedError` when the job terminates as failed or cancelled (rejection is idiomatic for "failure to complete")
- **`jobs.get(id)`** is a data-fetch API — it **returns** a `Job` with `status: 'failed'`. The job record is valid data, not an exception

Handle accordingly:

```typescript
try {
  const job = await nc.generate.createAndWait({ prompt: 'a red fox' })
} catch (e) {
  if (e instanceof NoCensorJobFailedError) {
    // Use e.job (the full terminal snapshot) and e.jobId
  }
}

// vs

const job = await nc.jobs.get('job-id')
if (job.status === 'failed') {
  console.error(job.error?.message)
}
```

## Rate limits

The API enforces per-class rate limits. Each response includes `X-RateLimit-*` headers. Subscribe to a callback to track budget:

```typescript
const nc = new NoCensor({
  apiKey: '...',
  onRateLimit: (info) => {
    console.log(`[${info.rateClass}] ${info.remaining}/${info.limit} remaining`)
  },
})
```

The SDK does NOT implement backpressure scheduling — if you need to queue requests under a rate limit budget, catch `NoCensorRateLimitError` and implement your own scheduler. This keeps the SDK simple and avoids hiding 429s from your application.

## Cancellation and timeouts

All async methods accept an `AbortSignal`:

```typescript
const controller = new AbortController()

setTimeout(() => controller.abort(), 30_000)

const job = await nc.generate.createAndWait({
  prompt: 'a red fox',
  pollSignal: controller.signal,
  pollTimeout: 60_000,
})
```

Per-request timeout (default 60s) bounds each individual HTTP call. Polling timeout (default 5 min, 10 min for video, 15 min for pipelines) bounds the whole `createAndWait` operation.

## Browser and edge usage

The SDK works in any modern browser, Cloudflare Workers, Vercel Edge, Deno, Bun, and Node 20+. There's no bundler-specific configuration required.

**Do not ship API keys to the browser.** Use the SDK from a server-side render function, an Edge route, or a worker — never embed a generation API key in client-side JavaScript. Anyone viewing source can use it to spend your credits.

## Advanced

### Custom fetch

Inject your own fetch for instrumentation or mocking:

```typescript
const nc = new NoCensor({
  apiKey: '...',
  fetch: async (url, init) => {
    console.log('→', init?.method, url)
    return fetch(url, init)
  },
})
```

### Low-level request escape hatch

For endpoints not yet wrapped by a resource method:

```typescript
const data = await nc.request<{ credits: number }>('GET', '/api/v1/credits')
```

This still benefits from authentication, retry, rate-limit parsing, and error mapping.

## License

MIT — see [LICENSE](./LICENSE).
