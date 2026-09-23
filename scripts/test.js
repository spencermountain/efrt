/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const raw = process.argv.includes('--raw')
const tapePath = join(dirname(require.resolve('tape/package.json')), 'bin/tape')
// Resolve the local reporter before starting tests; never use a global binary.
const reporterPath = raw ? null : require.resolve('tap-dancer')
const completed = function (child) {
  return new Promise((resolve) => {
    child.on('error', (error) => {
      console.error(error.message)
      resolve(1)
    })
    child.on('close', (code) => resolve(code === null ? 1 : code))
  })
}

const tape = spawn(process.execPath, [tapePath, './tests/*.test.js'], {
  env: { ...process.env, TESTENV: process.argv.includes('--prod') ? 'prod' : 'src' },
  stdio: ['inherit', raw ? 'inherit' : 'pipe', 'inherit']
})
const tapeDone = completed(tape)
let reporterDone = Promise.resolve(0)
if (!raw) {
  const reporter = spawn(process.execPath, [reporterPath], { stdio: ['pipe', 'inherit', 'inherit'] })
  reporterDone = completed(reporter)
  reporter.stdin.on('error', (error) => {
    // A failed reporter may close its input while tests are still writing.
    if (error.code !== 'EPIPE') {
      console.error(error.message)
      process.exitCode = 1
    }
  })
  reporter.on('close', () => {
    tape.stdout.unpipe(reporter.stdin)
    tape.stdout.resume()
  })
  tape.stdout.pipe(reporter.stdin)
}
Promise.all([tapeDone, reporterDone]).then(([testCode, reporterCode]) => {
  process.exitCode = testCode || reporterCode || process.exitCode || 0
})
