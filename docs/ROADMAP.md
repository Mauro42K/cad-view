# CAD View - Roadmap

## Current state

- F0 closed
- F1 closed
- F2 closed
- F2.1 closed
- F2.2 closed

## Confirmed scope

- Vite + Vue 3 + TypeScript
- `@mlightcad/cad-simple-viewer`
- `@mlightcad/cad-simple-ui-plugin`
- Local browser opening for DWG/DXF
- No backend
- No auth
- No deploy
- No persistent storage

## F3

GitHub private repo hygiene:

- Dependabot for npm/pnpm updates
- README and docs aligned with the current private/local setup
- `.gitignore` hardened for CAD and source assets
- Basic package metadata cleaned up

## Next likely steps after F3

1. Validate dependency update flow on a real PR.
2. Keep testing with real local CAD files.
3. Revisit VPS only after the local viewer and documentation stay stable.
