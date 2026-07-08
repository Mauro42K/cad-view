# CAD View - QA Matrix

## Build and setup

- [ ] `pnpm install` completes successfully
- [ ] `pnpm build` completes successfully
- [ ] `pnpm preview` starts and serves the built app
- [ ] Node version is `>= 24`
- [ ] pnpm version is `>= 10`

## Viewer initialization

- [ ] App shell loads without console errors
- [ ] Viewer host mounts successfully
- [ ] `@mlightcad/cad-simple-viewer` initializes
- [ ] `@mlightcad/cad-simple-ui-plugin` toolbar renders
- [ ] Worker readiness check passes before file open

## File opening

- [ ] Open a local `.dxf`
- [ ] Open a local `.dwg`
- [ ] Status changes to ready after a successful open
- [ ] Error state appears when a file cannot be parsed
- [ ] No file is uploaded to a server

## Workers and assets

- [ ] `assets/dxf-parser-worker.js` is present in `dist/`
- [ ] `assets/libredwg-parser-worker.js` is present in `dist/`
- [ ] `assets/mtext-renderer-worker.js` is present in `dist/`
- [ ] `assets/viewer-runtime.iife.js` is present in `dist/` only if the installed package exposes that runtime asset
- [ ] Worker URLs resolve correctly in dev and build

## UI checks

- [ ] Title reads `CAD View`
- [ ] Subtitle reads `Private DWG/DXF Browser Viewer`
- [ ] Note about local-only files is visible
- [ ] Viewer area is visible and usable
- [ ] Layout remains readable on a narrow viewport
