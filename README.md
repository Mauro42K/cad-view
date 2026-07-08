# CAD View

Private browser viewer for local DWG/DXF files.

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

## Production check

```bash
pnpm build
pnpm preview
```

## Notes

- Files are opened locally in the browser.
- No backend is used.
- No CAD files are uploaded to a server.
- Viewer workers are copied to `dist/assets/` during build.

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
