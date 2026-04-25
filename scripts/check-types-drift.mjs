// packages/sdk/scripts/check-types-drift.mjs
// Regenerates openapi-types.ts and fails if the committed file differs from the
// freshly generated output. Runs in CI and via `pnpm run prepublishOnly`.

import { execSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const file = resolve(here, '../src/generated/openapi-types.ts')
const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim()
const fileRelative = relative(repoRoot, file).replace(/\\/g, '/')

console.log('→ Regenerating types from apps/web/public/openapi.yaml')
const result = spawnSync('node', [resolve(here, 'generate-types.mjs')], {
  stdio: 'inherit',
})
if (result.status !== 0) {
  console.error('✗ generate-types.mjs failed')
  process.exit(result.status ?? 1)
}

const current = readFileSync(file, 'utf-8')
let committed
try {
  committed = execSync(`git show HEAD:"${fileRelative}"`, { encoding: 'utf-8' })
} catch {
  // File not yet committed — treat as drift (happens on first generation)
  committed = ''
}

if (current === committed) {
  console.log('✓ openapi-types.ts is up to date')
} else {
  console.error(`
✗ DRIFT DETECTED in ${file}

The SDK's generated types are out of sync with apps/web/public/openapi.yaml.

To fix:
    pnpm --filter @nocensor/sdk generate
    git add packages/sdk/src/generated/openapi-types.ts
    git commit

Then re-run this command to verify.
`)
  process.exit(1)
}
