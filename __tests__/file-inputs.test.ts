// packages/sdk/__tests__/file-inputs.test.ts
import { describe, it, expect } from 'vitest'
import { toDataUri, MAX_DATA_URI_BYTES } from '../src/file-inputs'
import { NoCensorValidationError } from '../src/errors'

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
])
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
const WEBP_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])

describe('toDataUri', () => {
  describe('passthrough strings', () => {
    it('passes through data: URIs', async () => {
      const s = 'data:image/png;base64,iVBORw=='
      expect(await toDataUri(s)).toBe(s)
    })

    it('passes through https:// URLs', async () => {
      const s = 'https://example.com/img.png'
      expect(await toDataUri(s)).toBe(s)
    })

    it('passes through http:// URLs', async () => {
      const s = 'http://example.com/img.png'
      expect(await toDataUri(s)).toBe(s)
    })

    it('passes through job_<uuid>', async () => {
      const s = 'job_550e8400-e29b-41d4-a716-446655440000'
      expect(await toDataUri(s)).toBe(s)
    })

    it('rejects unknown strings', async () => {
      await expect(toDataUri('garbage')).rejects.toBeInstanceOf(NoCensorValidationError)
    })
  })

  describe('Uint8Array MIME detection', () => {
    it('detects PNG magic bytes', async () => {
      const result = await toDataUri(PNG_BYTES)
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })

    it('detects JPEG magic bytes', async () => {
      const result = await toDataUri(JPEG_BYTES)
      expect(result.startsWith('data:image/jpeg;base64,')).toBe(true)
    })

    it('detects WebP magic bytes', async () => {
      const result = await toDataUri(WEBP_BYTES)
      expect(result.startsWith('data:image/webp;base64,')).toBe(true)
    })

    it('rejects unknown bytes', async () => {
      const unknown = new Uint8Array([0x01, 0x02, 0x03, 0x04])
      await expect(toDataUri(unknown)).rejects.toBeInstanceOf(NoCensorValidationError)
    })

    it('accepts ArrayBuffer', async () => {
      const buf = PNG_BYTES.buffer.slice(PNG_BYTES.byteOffset, PNG_BYTES.byteOffset + PNG_BYTES.byteLength)
      const result = await toDataUri(buf)
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })

    it('handles large buffers without stack overflow', async () => {
      const big = new Uint8Array(2 * 1024 * 1024)
      big.set(PNG_BYTES, 0)
      const result = await toDataUri(big)
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })
  })

  describe('Blob support', () => {
    it('reads Blob bytes and infers MIME from type', async () => {
      const blob = new Blob([PNG_BYTES], { type: 'image/png' })
      const result = await toDataUri(blob)
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })

    it('falls back to magic-byte detection if Blob type is missing', async () => {
      const blob = new Blob([PNG_BYTES])
      const result = await toDataUri(blob)
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })
  })

  describe('size guard', () => {
    it('rejects data URIs exceeding the Vercel payload limit', async () => {
      const oversized = 'data:image/png;base64,' + 'A'.repeat(MAX_DATA_URI_BYTES + 100)
      await expect(toDataUri(oversized)).rejects.toBeInstanceOf(NoCensorValidationError)
    })
  })
})
