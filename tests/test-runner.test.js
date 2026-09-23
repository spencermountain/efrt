import test from 'tape'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('both test commands preserve a nonzero exit after passing TAP', function (t) {
  const work = mkdtempSync(join(tmpdir(), 'efrt-test-exit-'))
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    mkdirSync(join(work, 'tests'))
    mkdirSync(join(work, 'scripts'))
    writeFileSync(join(work, 'package.json'), JSON.stringify({
      type: 'module', scripts: { test: pkg.scripts.test, testb: pkg.scripts.testb }
    }))
    symlinkSync(fileURLToPath(new URL('../node_modules', import.meta.url)), join(work, 'node_modules'), 'junction')
    copyFileSync(new URL('../scripts/test.js', import.meta.url), join(work, 'scripts/test.js'))
    writeFileSync(join(work, 'tests/exit.test.js'), [
      "import { writeSync } from 'node:fs'",
      "writeSync(1, 'TAP version 13\\nok 1 - passing assertion\\n1..1\\n# pass  1\\n')",
      'process.exit(7)'
    ].join('\n'))
    for (const script of ['test', 'testb']) {
      const result = spawnSync('npm', ['run', script], { cwd: work, encoding: 'utf8' })
      t.equal(result.status, 7, script + ' preserves child exit status')
      const raw = spawnSync('npm', ['run', script, '--', '--raw'], { cwd: work, encoding: 'utf8' })
      t.equal(raw.status, 7, script + ' preserves child exit status in raw mode')
      t.ok(raw.stdout.includes('# pass  1'), script + ' emitted passing TAP before failure')
    }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
  t.end()
})
