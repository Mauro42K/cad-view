import { spawnSync } from 'node:child_process'

const checks = [
  ['@mlightcad/cad-html-plugin', 'tsc'],
  ['@mlightcad/cad-pdf-plugin', 'tsc'],
  ['@mlightcad/cad-simple-viewer', 'tsc'],
  ['@mlightcad/cad-svg-plugin', 'tsc'],
  ['@mlightcad/three-renderer', 'tsc'],
  ['@mlightcad/cad-viewer', 'vue-tsc'],
  ['@mlightcad/cad-viewer-example', 'vue-tsc'],
]

for (const [workspace, compiler] of checks) {
  const result = spawnSync('pnpm', [
    '--filter', workspace, 'exec', compiler, '--noEmit', '-p', 'tsconfig.json',
  ], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
