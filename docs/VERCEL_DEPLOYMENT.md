# CAD View - Vercel Deployment

## Status

Vercel CLI is not available in this environment, so the project cannot be created from here directly.

## Recommended project name

- `cad-view`

If that name is taken, use the first available option from this list:

- `cad-view-app`
- `cad-view-web`
- `cad-view-online`
- `cad-view-private`
- `cad-view-tool`
- `cad-view-workspace`
- `cad-drawing-view`
- `dwg-dxf-view`
- `cad-file-view`
- `cad-review-view`

Preferred fallback:

- `cad-view-web`

## What to configure in Vercel

- Framework preset: `Vite`
- Root directory: repository root
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`
- Node.js version: `24.x`
- Domain: do not configure a custom domain yet
- Backend/API: none
- Auth: none

## GitHub connection

1. Open Vercel.
2. Import the private GitHub repository `Mauro42K/cad-view`.
3. Allow Vercel to read the repo.
4. Select the project name above.
5. Keep the default branch as `main`.

## Deployment flow

1. Push to `main`.
2. Let Vercel build from `main`.
3. Verify that the preview deployment opens local DWG/DXF files in the browser.
4. Only after the frontend is stable should a custom domain be considered.

## Notes

- Do not upload CAD files to the repo.
- Do not upload proprietary font sources to the repo.
- Do not change viewer runtime settings for deployment setup.
- This app remains frontend-only on Vercel.
