import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const tape = join(dirname(require.resolve('tape/package.json')), 'bin/tape')
const result = spawnSync(process.execPath, [tape, './tests/*.test.js'], {
  env: { ...process.env, TESTENV: 'prod' },
  stdio: 'inherit'
})
if (result.error) {
  throw result.error
}
process.exitCode = result.status === null ? 1 : result.status
