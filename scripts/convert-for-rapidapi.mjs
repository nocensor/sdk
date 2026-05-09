/**
 * Converts packages/sdk/openapi.yaml from OpenAPI 3.1.0 → 3.0.3 for RapidAPI Hub.
 *
 * RapidAPI only accepts 3.0.x. Three 3.1 features require conversion:
 *   1. openapi version string
 *   2. type: ['string','null'] arrays → nullable: true
 *   3. root-level `webhooks` key (not in 3.0)
 *
 * Output: packages/sdk/openapi-rapidapi.yaml
 */
import { parse, stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const specPath = resolve(__dirname, '../openapi.yaml')
const outPath = resolve(__dirname, '../openapi-rapidapi.yaml')

const spec = parse(readFileSync(specPath, 'utf8'))

spec.openapi = '3.0.3'
delete spec.webhooks

function fixNullable(obj) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj.type) && obj.type.includes('null')) {
    obj.type = obj.type.find((t) => t !== 'null')
    obj.nullable = true
  }
  for (const v of Object.values(obj)) fixNullable(v)
}
fixNullable(spec)

writeFileSync(outPath, stringify(spec), 'utf8')

const out = readFileSync(outPath, 'utf8')
const nullableCount = (out.match(/nullable: true/g) ?? []).length
console.log(`✓ converted to OpenAPI 3.0.3 (${nullableCount} nullable fields)`)
console.log(`  output: ${outPath}`)
