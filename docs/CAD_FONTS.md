# CAD Fonts

CAD View can load CAD fonts from a public static folder or from the default CDN.

## Current behavior

- Default font assets come from `https://cdn.jsdelivr.net/gh/mlightcad/cad-data/`.
- The app keeps a small in-memory fallback map for a few known missing fonts:
  - `dutcheb` -> `hztxt`
  - `isocteur` -> `hztxt`
  - `owens_brwy_std` -> `hztxt`
- If a real matching font is added locally later, the fallback is not needed for that font name.
- No fonts are committed in this repository.

## Local font repository

If you want to host your own CAD fonts locally, set:

```bash
VITE_CAD_FONTS_BASE_URL=/cad-fonts/
```

Then mirror the package layout under `public/cad-fonts/`:

```text
public/
  cad-fonts/
    fonts/
      fonts.json
      <font files such as .shx, .ttf, .otf, .woff>
```

The viewer requests:

- `GET /cad-fonts/fonts/fonts.json`
- `GET /cad-fonts/fonts/<file>`

## `fonts.json` format

The official font catalog is an array of objects like:

```json
[
  {
    "file": "amgdt.shx",
    "name": ["amgdt"],
    "type": "shx"
  },
  {
    "file": "arial.woff",
    "name": ["arial"],
    "type": "mesh"
  }
]
```

Supported fields observed in the package catalog:

- `file`: relative filename of the font asset
- `name`: array of font names or aliases
- `type`: usually `shx` or `mesh`
- `encoding`: optional, used by some SHX bigfonts

## How to add private fonts safely

1. Place the font files under `public/cad-fonts/fonts/`.
2. Add matching catalog entries to `public/cad-fonts/fonts/fonts.json`.
3. Keep those files out of Git if they are proprietary or licensed for internal use only.
4. Run `pnpm build`.
5. Open a DWG that needs the font.
6. If the warning disappears, the viewer is finding the font catalog correctly.

## What should not be committed

- Proprietary SHX, TTF, OTF, WOFF, or WOFF2 files
- Private CAD font catalogs from customer drawings
- Source DWG/DXF files

## If a warning remains

If the app still shows a font warning, the drawing references a font that is not in the active catalog. Add the missing font locally or extend the fallback map in `src/App.vue` only if an approximate substitute is acceptable.
