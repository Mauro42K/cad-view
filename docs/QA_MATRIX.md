# CAD View - QA Matrix

## Build and setup

- [x] `pnpm install` completes successfully
- [x] `pnpm build` completes successfully
- [x] `pnpm preview` starts and serves the built app
- [x] Node version is `>= 24`
- [x] pnpm version is `>= 10`

## Viewer initialization

- [x] App shell loads without console errors
- [x] Viewer host mounts successfully
- [x] `@mlightcad/cad-simple-viewer` initializes
- [x] `@mlightcad/cad-simple-ui-plugin` toolbar renders
- [x] Worker readiness check passes before file open
- [x] Default CAD fonts are allowed to load from `https://cdn.jsdelivr.net/gh/mlightcad/cad-data/`
- [x] Known missing fonts can fall back to an in-memory substitute
- [x] Missing-font situations surface a visible warning or fallback note instead of failing silently

## File opening

- [ ] Open a local `.dxf` - pending a real fixture for this baseline
- [x] Open a local `.dwg`
- [x] Button opens the file picker
- [x] Selecting a file shows name, size, and `loading`
- [x] Button and drag & drop use the same `openDocument` flow
- [x] Status changes to ready after a successful open or error on failure
- [x] Error state appears when a file cannot be parsed or file type is unsupported
- [x] No file is uploaded to a server
- [x] Real DWG baseline shows `openDocument` reaching `100%` around `41 s` and `visual ready` around `2m 03s` for the `4.3 MB` test file

## Performance baseline

- [x] File selection is timestamped in the UI baseline panel
- [x] `arrayBuffer` read start and ready are timestamped
- [x] `openDocument` start and viewer-ready are timestamped
- [x] `openDocument` resolved and `visual ready` are separated in the UI
- [x] A small `Mark visually ready` control is available in the MVP performance panel
- [x] Slow parsing hints appear after 30 seconds and 2 minutes
- [x] The viewer stays responsive while a large DWG is parsing
- [x] Baseline timings are recorded in `docs/F2_1_PERFORMANCE_BASELINE.md`
- [x] The main bottleneck is documented as the viewer's parsing/render pipeline, not local file reading
- [x] `entity 100%` is not treated as final; finalization continues through `Parsing named dictionaries...` and `END`
- [x] The app stays in a non-final loading state until visual readiness is confirmed manually

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
- [x] `public/cad-fonts/` is prepared as a safe placeholder for private fonts

## UI checks

- [x] Title reads `CAD View`
- [x] Subtitle reads `Private DWG/DXF Browser Viewer`
- [x] Note about local-only files is visible
- [x] Viewer area is visible and usable
- [x] Layout remains readable on a narrow viewport
- [x] Font warning or fallback note is visible when the viewer cannot resolve fonts
- [x] Performance baseline panel is visible for development/MVP use
