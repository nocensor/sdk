// packages/sdk/src/any-signal.ts
// Combine multiple AbortSignals into one. Uses native AbortSignal.any when available.

type MaybeSignal = AbortSignal | undefined

// Captured at module import time. In ESM environments, this cannot be re-evaluated
// per-call, so the native/polyfill branch is determined once at startup.
const hasNative = typeof AbortSignal !== 'undefined' && 'any' in AbortSignal

export function anySignal(signals: MaybeSignal[]): AbortSignal {
  const filtered = signals.filter((s): s is AbortSignal => s !== undefined)

  if (hasNative) {
    return (AbortSignal as unknown as { any(signals: AbortSignal[]): AbortSignal }).any(filtered)
  }

  const controller = new AbortController()
  if (filtered.length === 0) return controller.signal

  // Check for any pre-aborted signal first
  for (const s of filtered) {
    if (s.aborted) {
      controller.abort(s.reason)
      return controller.signal
    }
  }

  // Register listeners; clean up ALL of them when any one fires
  const handlers: Array<{ signal: AbortSignal; handler: () => void }> = []

  const cleanup = () => {
    for (const { signal, handler } of handlers) {
      signal.removeEventListener('abort', handler)
    }
    handlers.length = 0
  }

  for (const s of filtered) {
    const handler = () => {
      cleanup()
      controller.abort(s.reason)
    }
    handlers.push({ signal: s, handler })
    s.addEventListener('abort', handler, { once: true })
  }

  return controller.signal
}
