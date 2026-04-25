// packages/sdk/scripts/extract-release-notes.mjs
// Extracts the top ## [x.y.z] section from CHANGELOG.md for GH Actions release body.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const changelogPath = resolve(here, '../CHANGELOG.md')
const outPath = resolve(here, '../.release-notes.md')

const content = readFileSync(changelogPath, 'utf-8')
const lines = content.split(/\r?\n/)

let startIdx = -1
for (let i = 0; i < lines.length; i++) {
  if (/^##\s+\[\d+\.\d+\.\d+\]/.test(lines[i])) {
    startIdx = i
    break
  }
}

if (startIdx === -1) {
  console.error('✗ No versioned section found in CHANGELOG.md')
  process.exit(1)
}

let endIdx = lines.length
for (let i = startIdx + 1; i < lines.length; i++) {
  if (/^##\s+\[/.test(lines[i])) {
    endIdx = i
    break
  }
}

const section = lines.slice(startIdx, endIdx).join('\n').trim() + '\n'
writeFileSync(outPath, section, 'utf-8')
console.log(`✓ Wrote ${outPath} (${section.split('\n').length} lines)`)
