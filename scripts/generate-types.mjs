// packages/sdk/scripts/generate-types.mjs
// AUTO-GENERATOR for src/generated/openapi-types.ts
// Reads apps/web/public/openapi.yaml (the committed OpenAPI 3.1 spec) and emits
// TypeScript types via openapi-typescript. Output is committed to git.

import { writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'

const here = dirname(fileURLToPath(import.meta.url))
const yamlPath = resolve(here, '../../../apps/web/public/openapi.yaml')
const outPath = resolve(here, '../src/generated/openapi-types.ts')

if (!existsSync(yamlPath)) {
  console.error(`✗ OpenAPI spec not found at ${yamlPath}`)
  console.error('  Run apps/web build first to regenerate it.')
  process.exit(1)
}

console.log(`→ Reading ${yamlPath}`)

const ast = await openapiTS(pathToFileURL(yamlPath), {
  arrayLength: true,
  immutableTypes: false,
  enum: false,
  pathParamsAsTypes: false,
  emptyObjectsUnknown: true,
})

const banner = `/**
 * AUTO-GENERATED. Do not edit by hand.
 *
 * Source: apps/web/public/openapi.yaml
 * Generator: openapi-typescript
 * Regenerate: pnpm --filter @nocensor/sdk generate
 */
/* eslint-disable */
// prettier-ignore

`

const content = banner + astToString(ast)
writeFileSync(outPath, content, 'utf-8')
console.log(`✓ Wrote ${outPath}`)

// Post-generation audit: flag unexpected Record<string, unknown> occurrences.
// Known-good empty schemas go in this allowlist.
const ALLOWED_EMPTY_SCHEMAS = new Set([
  // Schemas that are legitimately empty; reviewed each regeneration.
])

const emptyMatches = [...content.matchAll(/(\w+):\s*Record<string, unknown>/g)]
const unexpected = emptyMatches.map((m) => m[1]).filter((name) => !ALLOWED_EMPTY_SCHEMAS.has(name))

if (unexpected.length > 0) {
  console.warn('⚠ Post-generation audit: unexpected Record<string, unknown> schemas:')
  for (const name of unexpected) console.warn(`    - ${name}`)
  console.warn('  Review each and either narrow the Zod schema in apps/web, or add to')
  console.warn('  ALLOWED_EMPTY_SCHEMAS in scripts/generate-types.mjs if legitimate.')
}

console.log('done.')
