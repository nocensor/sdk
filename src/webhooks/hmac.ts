// packages/sdk/src/webhooks/hmac.ts
// Web Crypto HMAC-SHA256 + constant-time hex comparison.
// Universal runtime — no node:* imports.

export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return bytesToHex(new Uint8Array(sig))
}

function bytesToHex(bytes: Uint8Array): string {
  const hex: string[] = new Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    hex[i] = bytes[i]!.toString(16).padStart(2, '0')
  }
  return hex.join('')
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
