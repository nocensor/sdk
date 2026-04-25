// packages/sdk/src/file-inputs.ts
// Image input normalization: Blob | File | Uint8Array | ArrayBuffer | string → data URI / URL / job_id.
// Universal runtime — no node:* imports.

import { NoCensorValidationError } from './errors'

/**
 * Character-count ceiling for data URI strings.
 * Base64 data URIs contain only ASCII so char count == byte count.
 * Matches Vercel's 4.5 MB body limit with headroom for JSON overhead.
 */
export const MAX_DATA_URI_BYTES = 4 * 1024 * 1024 // 4 MB (chars ≡ bytes for ASCII base64)

export type ImageInput = Blob | ArrayBuffer | Uint8Array | string

const JOB_ID_RE = /^job_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function toDataUri(input: ImageInput): Promise<string> {
  if (typeof input === 'string') {
    return handleString(input)
  }
  if (input instanceof ArrayBuffer) {
    return bytesToDataUri(new Uint8Array(input))
  }
  if (ArrayBuffer.isView(input) && input instanceof Uint8Array) {
    return bytesToDataUri(input)
  }
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return blobToDataUri(input)
  }
  throw new NoCensorValidationError(
    'Unrecognized image input. Pass a Blob/File, Uint8Array, ArrayBuffer, data URI string, https URL, or job_<uuid>.',
    { code: 'VALIDATION_ERROR', status: 400 },
  )
}

function handleString(s: string): string {
  if (s.startsWith('data:')) {
    assertSize(s.length)
    return s
  }
  if (s.startsWith('https://') || s.startsWith('http://')) return s
  if (JOB_ID_RE.test(s)) return s
  throw new NoCensorValidationError(
    `Unrecognized image input string: "${s.slice(0, 40)}...". Expected data:, https://, http://, or job_<uuid>.`,
    { code: 'VALIDATION_ERROR', status: 400 },
  )
}

async function blobToDataUri(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  if (blob.type && blob.type.startsWith('image/')) {
    return bytesToDataUriWithMime(buf, blob.type)
  }
  return bytesToDataUri(buf)
}

function bytesToDataUri(bytes: Uint8Array): string {
  const mime = detectMime(bytes)
  if (!mime) {
    throw new NoCensorValidationError('Unknown image format. Pass a Blob with an explicit type, or a data URI.', {
      code: 'VALIDATION_ERROR',
      status: 400,
    })
  }
  return bytesToDataUriWithMime(bytes, mime)
}

function bytesToDataUriWithMime(bytes: Uint8Array, mime: string): string {
  const base64 = toBase64(bytes)
  const uri = `data:${mime};base64,${base64}`
  assertSize(uri.length)
  return uri
}

function assertSize(length: number): void {
  if (length > MAX_DATA_URI_BYTES) {
    const mb = (length / 1024 / 1024).toFixed(2)
    throw new NoCensorValidationError(
      `Image too large (${mb} MB). Compress before uploading — max ~4 MB data URI (Vercel payload limit).`,
      { code: 'VALIDATION_ERROR', status: 400 },
    )
  }
}

function detectMime(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

/** Base64 encode. Node fast path via Buffer if available; browser/edge via chunked btoa. */
function toBase64(bytes: Uint8Array): string {
  const BufferGlobal = (
    globalThis as unknown as { Buffer?: { from(b: Uint8Array): { toString(enc: string): string } } }
  ).Buffer
  if (BufferGlobal) {
    return BufferGlobal.from(bytes).toString('base64')
  }
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}
