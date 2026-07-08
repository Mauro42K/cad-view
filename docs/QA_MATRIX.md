# CAD View - QA Matrix

## Build and setup

- [x] `pnpm install` completes successfully
- [x] `pnpm build` completes successfully
- [ ] `pnpm preview` starts and serves the built app
- [x] Node version is `>= 24`
- [x] pnpm version is `>= 10`

## Viewer initialization

- [x] App shell loads without console errors
- [x] Viewer host mounts successfully
- [x] `@mlightcad/cad-simple-viewer` initializes
- [x] `@mlightcad/cad-simple-ui-plugin` toolbar renders
- [x] Worker readiness check passes before file open

## File opening

- [ ] Open a local `.dxf` - no CAD fixtures were available in this environment
- [ ] Open a local `.dwg` - no CAD fixtures were available in this environment
- [ ] Status changes to ready after a successful open
- [ ] Error state appears when a file cannot be parsed
- [x] No file is uploaded to a server

## Workers and assets

- [x] `assets/dxf-parser-worker.js` is present in `dist/`
- [x] `assets/libredwg-parser-worker.js` is present in `dist/`
- [x] `assets/mtext-renderer-worker.js` is present in `dist/`
- [ ] `assets/viewer-runtime.iife.js` is present in `dist/` only if the installed package exposes that runtime asset
- [x] Worker URLs resolve correctly in dev and build

## UI checks

- [x] Title reads `CAD View`
- [x] Subtitle reads `Private DWG/DXF Browser Viewer`
- [x] Note about local-only files is visible
- [x] Viewer area is visible and usable
- [x] Layout remains readable on a narrow viewport
