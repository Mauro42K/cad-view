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

## F4

Vercel frontend deployment setup:

- Create a Vercel project for the private GitHub repo
- Use Vite build settings with `pnpm install` and `pnpm build`
- Keep output directory as `dist`
- Use Node.js `24.x` on Vercel if available
- Do not configure a custom domain yet
- Keep the app frontend-only

## Next likely steps after F3

1. Validate dependency update flow on a real PR.
2. Keep testing with real local CAD files.
3. Revisit VPS only after the local viewer and documentation stay stable.
