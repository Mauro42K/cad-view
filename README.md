# CAD View

Private browser viewer for local DWG/DXF files.

## Repository

- Private GitHub repo: `git@github.com:Mauro42K/cad-view.git`
- Main branch: `main`
- Scope: local-only viewer, no backend, no auth, no deploy

## Stack

- Vite
- Vue 3
- TypeScript
- `@mlightcad/cad-simple-viewer`
- `@mlightcad/cad-simple-ui-plugin`

## Requirements

- Node.js `>= 24`
- pnpm `>= 10`

## Local setup

```bash
pnpm install
pnpm dev
```

## Common commands

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## Dependabot

Dependabot checks npm/pnpm dependencies weekly on `main`.

- No automatic merges
- No runtime changes without review
- PRs should be validated with `pnpm build` before merging

If `@mlightcad/*` updates land, review:

- release notes upstream
- worker/runtime asset changes
- any required build or path updates

## Updating `@mlightcad`

When bumping `@mlightcad/cad-simple-viewer` or `@mlightcad/cad-simple-ui-plugin`:

1. Read the changelog or release notes.
2. Install the new versions locally.
3. Run `pnpm build`.
4. Test at least one local DWG and one local DXF.
5. Confirm worker and asset paths still resolve.

## Notes

- Files are opened locally in the browser.
- No backend is used.
- No CAD files are uploaded to a server.
- Do not commit private CAD files or proprietary source files.
- Viewer workers are copied to `dist/assets/` during build.
- Keep private sample drawings outside the repo or covered by `.gitignore`.

## Runtime assets

The viewer expects these files to be available:

- `assets/dxf-parser-worker.js`
- `assets/libredwg-parser-worker.js`
- `assets/mtext-renderer-worker.js`

## Fonts

The app loads CAD fonts from the public CDN by default:

- `https://cdn.jsdelivr.net/gh/mlightcad/cad-data/`

If you need private or custom fonts, mirror the expected layout under
`public/cad-fonts/` and set:

```bash
VITE_CAD_FONTS_BASE_URL=/cad-fonts/
```

See [`docs/CAD_FONTS.md`](docs/CAD_FONTS.md) for the exact
`fonts.json` format and safe handling rules.

## Current status

This repository contains the minimal local shell for the CAD viewer. It is intentionally small so the next step can focus on loading real files and validating the viewer behavior.
