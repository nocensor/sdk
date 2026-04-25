// packages/sdk/__tests__/openapi-contract.test.ts
// Enforces that every resource file uses *Wire types for the wire layer.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RESOURCES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/resources')
// health.ts is a simple pass-through with no wire transformation (API response === public type)
const RESOURCE_FILES_EXEMPT = new Set<string>(['base.ts', 'health.ts'])

describe('OpenAPI contract — resources must use wire types', () => {
  const files = readdirSync(RESOURCES_DIR).filter((f) => f.endsWith('.ts') && !RESOURCE_FILES_EXEMPT.has(f))

  for (const file of files) {
    it(`${file} declares wire types that trace back to OpenAPI shapes`, () => {
      const content = readFileSync(join(RESOURCES_DIR, file), 'utf-8')
      const hasWireType = /\b\w+Wire\b/.test(content)
      expect(hasWireType, `${file}: expected at least one *Wire type`).toBe(true)
      const importsGenerated =
        /import\s+(?:type\s+)?\{?\s*(?:components|paths)\b/.test(content) &&
        /from\s+['"]\.\.\/generated\/openapi-types['"]/.test(content)
      const hasLocalWireInterfaces = /(interface|type)\s+\w+Wire\b/.test(content)
      expect(
        importsGenerated || hasLocalWireInterfaces,
        `${file}: wire types must either be imported from ../generated/openapi-types or declared as local interfaces`,
      ).toBe(true)
    })
  }

  it('generated/openapi-types.ts exists and exports components', () => {
    const path = join(dirname(fileURLToPath(import.meta.url)), '../src/generated/openapi-types.ts')
    const content = readFileSync(path, 'utf-8')
    expect(content).toMatch(/export interface components/)
    expect(content).toMatch(/AUTO-GENERATED/)
  })
})
