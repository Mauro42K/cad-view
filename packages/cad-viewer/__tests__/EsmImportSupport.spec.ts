import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

describe('cad-viewer ESM import support', () => {
  const repoRoot = path.resolve(__dirname, '../../..')
  const cadViewerRoot = path.join(repoRoot, 'packages', 'cad-viewer')

  it('uses explicit dot subpath in exports map', () => {
    const pkgJsonPath = path.join(cadViewerRoot, 'package.json')
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

    expect(pkgJson.exports).toBeDefined()
    expect(pkgJson.exports['.']).toEqual({
      types: './dist/cad-viewer.d.ts',
      import: './dist/cad-viewer.js'
    })
  })

  it('resolves from an ESM consumer through package exports', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cad-viewer-esm-'))

    try {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'esm-consumer-fixture',
          private: true,
          type: 'module'
        })
      )

      const scopeDir = path.join(tempDir, 'node_modules', '@mlightcad')
      fs.mkdirSync(scopeDir, { recursive: true })

      const linkPath = path.join(scopeDir, 'cad-viewer')
      const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
      fs.symlinkSync(cadViewerRoot, linkPath, symlinkType)

      const output = execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          "console.log(import.meta.resolve('@mlightcad/cad-viewer'))"
        ],
        {
          cwd: tempDir,
          encoding: 'utf8'
        }
      ).trim()

      const resolvedPath = fileURLToPath(output)
      const resolvedToBuiltPackage = path.relative(cadViewerRoot, resolvedPath)
      const resolvedToConsumer = path.relative(tempDir, resolvedPath)

      expect(fs.existsSync(resolvedPath)).toBe(true)
      expect(path.basename(resolvedPath)).toBe('cad-viewer.js')
      expect(path.basename(path.dirname(resolvedPath))).toBe('dist')
      expect(
        resolvedToBuiltPackage === path.join('dist', 'cad-viewer.js') ||
          resolvedToConsumer ===
            path.join(
              'node_modules',
              '@mlightcad',
              'cad-viewer',
              'dist',
              'cad-viewer.js'
            )
      ).toBe(true)
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
