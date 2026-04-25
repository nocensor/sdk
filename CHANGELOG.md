# Changelog

All notable changes to `@nocensor/sdk` are documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

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
