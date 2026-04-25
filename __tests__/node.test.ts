import { describe, it, expect } from 'vitest'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { fromFilePath } from '../src/node'

const PNG_BYTES = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082',
  'hex',
)

describe('fromFilePath', () => {
  it('reads a PNG file and returns a Blob with image/png MIME', async () => {
    const path = join(tmpdir(), `sdk-test-${randomBytes(4).toString('hex')}.png`)
    await writeFile(path, PNG_BYTES)
    try {
      const blob = await fromFilePath(path)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
      expect(blob.size).toBe(PNG_BYTES.length)
    } finally {
      await unlink(path)
    }
  })

  it('throws a friendly error if the file does not exist', async () => {
    await expect(fromFilePath('/nonexistent/path/that/should/not/exist.png')).rejects.toThrow()
  })
})
