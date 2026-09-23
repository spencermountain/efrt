/* eslint-disable no-console */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const work = mkdtempSync(join(tmpdir(), 'efrt-package-'))
const run = function (command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(command + ' failed:\n' + result.stdout + result.stderr)
  }
  return result.stdout
}

try {
  const cache = join(work, 'cache')
  const packed = JSON.parse(run('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', work, '--cache', cache
  ], root))[0]
  for (const path of ['src/index.js', 'src/unpack/index.js', 'builds/efrt.cjs', 'builds/efrt-unpack.cjs']) {
    assert.ok(packed.files.some((file) => file.path === path), 'Missing package file: ' + path)
  }
  writeFileSync(join(work, 'package.json'), JSON.stringify({ private: true }))
  run('npm', [
    'install', join(work, packed.filename), '--offline', '--ignore-scripts',
    '--no-audit', '--no-fund', '--cache', cache
  ], work)
  const manifest = JSON.parse(readFileSync(join(work, 'node_modules/efrt/package.json'), 'utf8'))
  assert.deepEqual(manifest.dependencies || {}, {}, 'Runtime should remain dependency-free')
  copyFileSync(new URL('../tests/package-smoke.mjs', import.meta.url), join(work, 'smoke.mjs'))
  run(process.execPath, ['smoke.mjs'], work)
  console.log('Packed npm artifact: ESM, CommonJS, standalone unpack, and browser bundles passed.')
} finally {
  rmSync(work, { recursive: true, force: true })
}
