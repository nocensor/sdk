// packages/sdk/__tests__/any-signal.test.ts
import { describe, it, expect } from 'vitest'
import { anySignal } from '../src/any-signal'

describe('anySignal', () => {
  it('returns a signal that aborts when the first input aborts', () => {
    const a = new AbortController()
    const b = new AbortController()
    const combined = anySignal([a.signal, b.signal])
    expect(combined.aborted).toBe(false)
    a.abort()
    expect(combined.aborted).toBe(true)
    expect(b.signal.aborted).toBe(false)
  })

  it('is already aborted if any input is pre-aborted', () => {
    const a = new AbortController()
    a.abort()
    const b = new AbortController()
    const combined = anySignal([a.signal, b.signal])
    expect(combined.aborted).toBe(true)
  })

  it('ignores undefined inputs', () => {
    const a = new AbortController()
    const combined = anySignal([undefined, a.signal, undefined])
    expect(combined.aborted).toBe(false)
    a.abort()
    expect(combined.aborted).toBe(true)
  })

  it('returns a non-abortable signal if all inputs are undefined', () => {
    const combined = anySignal([undefined, undefined])
    expect(combined.aborted).toBe(false)
  })
})

describe('polyfill logic (addEventListener pattern)', () => {
  it('polyfill pattern: first abort wins', () => {
    // Test the polyfill logic directly — simulates what anySignal does
    // when AbortSignal.any is unavailable
    const a = new AbortController()
    const b = new AbortController()
    const combined = new AbortController()

    for (const s of [a.signal, b.signal]) {
      if (s.aborted) {
        combined.abort(s.reason)
        break
      }
      s.addEventListener('abort', () => combined.abort(s.reason), { once: true })
    }

    expect(combined.signal.aborted).toBe(false)
    b.abort('b aborted first')
    expect(combined.signal.aborted).toBe(true)
    expect(a.signal.aborted).toBe(false) // a was not aborted
  })

  it('polyfill pattern: pre-aborted signal triggers immediately', () => {
    const a = new AbortController()
    a.abort('pre-aborted')
    const combined = new AbortController()

    for (const s of [a.signal]) {
      if (s.aborted) {
        combined.abort(s.reason)
        break
      }
    }

    expect(combined.signal.aborted).toBe(true)
  })
})
