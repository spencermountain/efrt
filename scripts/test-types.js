/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const work = mkdtempSync(join(tmpdir(), 'efrt-types-'))
const run = function (command, args, cwd = work) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(command + ' failed:\n' + result.stdout + result.stderr)
  return result.stdout
}

try {
  const cache = join(work, 'cache')
  const packed = JSON.parse(run('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', work, '--cache', cache
  ], root))[0]
  writeFileSync(join(work, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  run('npm', [
    'install', join(work, packed.filename), '--offline', '--ignore-scripts',
    '--no-audit', '--no-fund', '--cache', cache
  ])
  for (const name of ['esm.mts', 'commonjs.cts']) {
    copyFileSync(new URL('../tests/types/' + name, import.meta.url), join(work, name))
  }
  const compiler = join(root, 'node_modules/.bin/tsc')
  for (const mode of ['node16', 'nodenext', 'bundler']) {
    run(compiler, [
      '--noEmit', '--strict', '--target', 'es2020', '--types', '',
      '--module', mode === 'bundler' ? 'preserve' : mode,
      '--moduleResolution', mode, 'esm.mts', 'commonjs.cts'
    ])
  }
  console.log('Packed declarations: ESM and CommonJS consumers passed (node16, nodenext, bundler).')
  console.log(run(join(root, 'node_modules/.bin/attw'), [join(work, packed.filename)]))
} finally {
  rmSync(work, { recursive: true, force: true })
}
