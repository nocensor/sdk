import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = resolve(fileURLToPath(import.meta.url), '..')

describe('SDK_VERSION drift guard', () => {
  it('client.ts SDK_VERSION matches package.json version', () => {
    const pkgRaw = readFileSync(resolve(here, '../package.json'), 'utf8')
    const pkgVersion = (JSON.parse(pkgRaw) as { version: string }).version

    const clientRaw = readFileSync(resolve(here, '../src/client.ts'), 'utf8')
    const match = /const SDK_VERSION = '([^']+)'/.exec(clientRaw)

    expect(match, 'SDK_VERSION constant not found in src/client.ts').not.toBeNull()
    expect(match![1]).toBe(pkgVersion)
  })
})
