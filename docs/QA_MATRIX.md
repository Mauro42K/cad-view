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
- [x] Default CAD fonts are allowed to load from `https://cdn.jsdelivr.net/gh/mlightcad/cad-data/`
- [x] Missing-font situations surface a visible warning instead of failing silently

## File opening

- [ ] Open a local `.dxf` - pending a real fixture after API wiring fix
- [ ] Open a local `.dwg` - pending a real fixture after API wiring fix
- [x] Button opens the file picker
- [x] Selecting a file shows name, size, and `loading`
- [x] Button and drag & drop use the same `openDocument` flow
- [x] Status changes to ready after a successful open or error on failure
- [x] Error state appears when a file cannot be parsed or file type is unsupported
- [x] No file is uploaded to a server

## Viewer reset

- [x] File picker falls back from `showPicker()` to `click()`
- [x] UI shows a clear message if the viewer resets after inactivity
- [x] Last file metadata stays in memory only for the current session
- [x] No `localStorage` or server persistence is used

## Workers and assets

- [x] `assets/dxf-parser-worker.js` is present in `dist/`
- [x] `assets/libredwg-parser-worker.js` is present in `dist/`
- [x] `assets/mtext-renderer-worker.js` is present in `dist/`
- [ ] `assets/viewer-runtime.iife.js` is present in `dist/` only if the installed package exposes that runtime asset
- [x] Worker URLs resolve correctly in dev and build
- [x] Font assets are resolved from the configured `baseUrl` instead of a broken `fonts.json` path

## UI checks

- [x] Title reads `CAD View`
- [x] Subtitle reads `Private DWG/DXF Browser Viewer`
- [x] Note about local-only files is visible
- [x] Viewer area is visible and usable
- [x] Layout remains readable on a narrow viewport
- [x] Font warning copy is visible when the viewer cannot resolve fonts
