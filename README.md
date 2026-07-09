# CAD View

Clean CAD View reset based on the official full viewer from `https://github.com/mlightcad/cad-viewer`.

## Development

Requirements:

- Node.js 24 or newer
- pnpm 10 or newer

Commands:

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

The visible app is the official full viewer example in `packages/cad-viewer-example`.

## Local files

Local DWG files belong in `local-test-files/` and are ignored by Git. Do not put DWG files in `public/`.

## Dependabot

Dependabot checks for dependency updates weekly and opens pull requests automatically.
There is no auto-merge.
Each PR should be reviewed with a build and a DWG test before merging.
