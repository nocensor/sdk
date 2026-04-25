import { describe, it, expect } from 'vitest'
import { hmacSha256Hex, timingSafeEqualHex } from '../../src/webhooks/hmac'

describe('hmacSha256Hex', () => {
  it('produces a known-good signature for a fixed input', async () => {
    const secret = 'whsec_test_12345'
    const payload = '1744156800.{"type":"webhook.test","id":"evt_abc"}'
    const sig = await hmacSha256Hex(secret, payload)
    expect(sig).toBe('66691568f780b19792eebfb2c646428e7531eb7ec2fd8cfb5aa15b8dbb468844')
  })

  it('is deterministic across multiple calls', async () => {
    const a = await hmacSha256Hex('s', 'x')
    const b = await hmacSha256Hex('s', 'x')
    expect(a).toBe(b)
  })

  it('different payloads produce different signatures', async () => {
    const a = await hmacSha256Hex('s', 'one')
    const b = await hmacSha256Hex('s', 'two')
    expect(a).not.toBe(b)
  })
})

describe('timingSafeEqualHex', () => {
  it('returns true for equal hex strings', () => {
    expect(timingSafeEqualHex('abcdef', 'abcdef')).toBe(true)
  })

  it('returns false for different-content same-length hex strings', () => {
    expect(timingSafeEqualHex('abcdef', 'abcde0')).toBe(false)
  })

  it('returns false for different-length strings', () => {
    expect(timingSafeEqualHex('abc', 'abcdef')).toBe(false)
  })

  it('does not short-circuit on first-char mismatch', () => {
    const a = 'a'.repeat(64)
    const b = 'a'.repeat(63) + 'b'
    expect(timingSafeEqualHex(a, b)).toBe(false)
  })
})
