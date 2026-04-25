# Changelog

All notable changes to `@nocensor/sdk` are documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [0.3.1] — 2026-04-25

### Changed

- README: updated description to include "uncensored AI" and NSFW content context for better discoverability
- `package.json` keywords: added `nsfw`, `uncensored`, `adult`, `text-to-image`, `stable-diffusion`, `pipelines`, `webhooks`

## [0.3.0] — 2026-04-25

### Added

- `CONTRIBUTING.md` on the public GitHub mirror explaining the read-only mirror model and how to file issues

## [0.2.0] — 2026-04-25

### Added

- `width`, `height` (64–1280 px) and `characterId` (character LoRA unlock) params for `generate.create`
- `duration` enum preset (`'short'|'medium'|'long'|'long+'`), `resolution` (`'standard'|'hd'`), and `biometricConsent` for `video.create`
- `pipeline.completed` event type to `WebhookEvent` discriminated union, `KNOWN_EVENT_TYPES`, and `WebhookEventType`
- `PipelineCompletedPayload` webhook payload type
- Missing resource type exports: `Character`, `Credits`, `Payment`, `PaymentListParams`, `Webhook`, `WebhookWithSecret`, `WebhookDelivery`, `CreateWebhookParams`, `UpdateWebhookParams`, `ListDeliveriesParams`, `WebhookEventType`

### Fixed

- `VideoCreateParams` previously exposed `durationSeconds` (unmapped field) — all calls silently had no effect; replaced with correct `duration` enum and `resolution` preset params
- `openapi.yaml`: corrected `VideoRequest.duration` enum value `long-plus` → `long+`; added `model`, `resolution`, `mode`, `biometricConsent`, `loras` to `VideoRequest`; added `width`, `height`, `characterId` to `GenerateRequest`; updated `Credits` schema to actual response shape (`balance`, `lifetime_purchased`, `lifetime_consumed`)

## [0.1.0] — 2026-04-15

### Added

- Initial public release of `@nocensor/sdk`
- `NoCensor` client with content-creation endpoints: `generate`, `faceSwap`, `video`, `undress`, `enhance`, `pipelines`
- Jobs API: `get`, `list` (async iterator + `listPage`), `cancel` (with `refundedCredits`), `poll`, `waitForCompletion`
- Management resources: `account.get`, `models.list`, `health.get`
- Three-layer polling DX: `createAndWait()` one-liner, `poll()` async iterator, primitive `get()`
- Per-resource default poll timeouts (image 5 min, video 10 min, pipelines 15 min)
- Discriminated union for `enhance.create` covering upscale, face-restore, bg-replace, attach-object
- XOR-enforced `faceSwap.create` params via `type-fest` `RequireExactlyOne`
- `pipelines.dryRun()` for cost estimation without dispatch
- Tree-shakable webhook signature verification at `@nocensor/sdk/webhooks`
- Secret rotation support via `previousSecret` option
- Discriminated `WebhookEvent` union with forward-compat unknown branch for new event types
- Node-only helpers at `@nocensor/sdk/node` (`fromFilePath`)
- Universal runtime: Node 20+, modern browsers, Deno, Bun, Cloudflare Workers, Vercel Edge
- Zero runtime dependencies
- Full type hierarchy derived from `openapi-typescript` generation, with drift enforcement in CI
- 17+ typed error subclasses including dedicated `NoCensorJobNotCancellableError`, `NoCensorLoraNotReadyError`, `NoCensorInsufficientCreditsError`
- Customizable `baseUrl`, `timeout`, `maxRetries`, `fetch`, `userAgentSuffix`, `onRateLimit` options
- MIT license

### Security

- npm publish uses provenance attestation via GitHub Actions (`--provenance` flag)
- Zero runtime dependencies minimizes supply-chain surface
- No postinstall scripts
- No telemetry
- Webhook HMAC verification uses constant-time comparison to defeat timing attacks
