# CAD View - F2 Runtime QA

Fecha: 2026-07-08

## Entorno probado

- Repo: `/Users/mauro/cad-view`
- Node: `v24.18.0`
- pnpm: `10.17.1`
- Browser: Playwright Chromium dentro de la sesión de Codex
- URL: `http://127.0.0.1:5173`

## Comandos ejecutados

- `pnpm dev --host 127.0.0.1`
- `pnpm build`
- Verificación en navegador con Playwright

## Resultado de shell

- La shell carga correctamente.
- El título de la página es `CAD View`.
- El contenido visible coincide con la shell mínima esperada.

## Workers y assets

- `assets/dxf-parser-worker.js` responde `200` en dev.
- `assets/libredwg-parser-worker.js` responde `200` en dev.
- `assets/mtext-renderer-worker.js` responde `200` en dev.
- La carga de workers en la app no dejó errores de consola una vez desactivada la carga automática de fuentes externas.

## Consola del navegador

- Antes del ajuste, aparecía un error por intento de cargar `fonts.json` desde un CDN que devolvía `404`.
- Se corrigió desactivando la carga automática de fuentes por defecto con `notLoadDefaultFonts: true`.
- Después del ajuste, la consola quedó sin errores críticos de app.
- Los abortos `ERR_ABORTED` de workers al arrancar se observaron como parte del flujo de inicialización y no bloquearon la UI.

## Carga DXF/DWG

- No se probaron archivos DXF/DWG reales en este entorno.
- No había fixtures CAD locales disponibles para cargar desde el navegador.

## Estado de UI

- `idle` o pantalla inicial: visible al cargar.
- `loading`: visible durante la inicialización.
- `ready`: visible después de que el viewer termina de inicializar.
- `error`: no se reprodujo con la configuración actual.

## Errores conocidos

- No se validó apertura de archivos reales por falta de fixtures locales.
- `viewer-runtime.iife.js` no está presente en el paquete instalado y no se usa como requisito obligatorio.

## Próximos pasos

- Conseguir al menos un DXF y un DWG reales para probar apertura y render.
- Verificar si un archivo problemático dispara un estado `error` útil en la UI.
- Si se necesitan fuentes específicas para renderización, definir una estrategia explícita de assets en lugar de usar la descarga automática por defecto.
