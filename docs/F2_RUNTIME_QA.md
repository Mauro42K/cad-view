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

## F2b - Apertura local

- El flujo de apertura quedó explícito con un botón real que dispara el selector de archivos nativo.
- El selector acepta `.dwg` y `.dxf`.
- La UI muestra nombre, tamaño y estado `loading` antes del intento de apertura.
- El dropzone mínimo propio queda sobre el viewer para arrastrar `.dwg` y `.dxf`.
- Si el usuario suelta un archivo con otra extensión, la UI marca error y no intenta abrirlo.
- El botón usa el mismo flujo que drag & drop: `openDocument(fileName, ArrayBuffer, options)`.

## F2c - Picker y reset del viewer

- El botón `Open Local CAD file` usa `showPicker()` cuando el navegador lo soporta y cae a `click()` como respaldo.
- Si el viewer se pierde tras inactividad o vuelve desde un estado oculto, la UI muestra un mensaje claro de recuperación.
- La app conserva solo metadata de sesión en memoria para poder reabrir el último archivo durante la misma sesión.
- No se usa `localStorage`, no se sube nada al servidor y no se persiste el CAD en disco.

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
- El siguiente paso manual es seleccionar o arrastrar un `.dxf` y un `.dwg` reales para validar el cambio de estado `loading -> ready/error`.

## Estado de UI

- `idle` o pantalla inicial: visible al cargar.
- `loading`: visible durante la inicialización.
- `ready`: visible después de que el viewer termina de inicializar.
- `error`: no se reprodujo con la configuración actual.

## Errores conocidos

- `viewer-runtime.iife.js` no está presente en el paquete instalado y no se usa como requisito obligatorio.
- El build sigue generando un chunk grande; eso no bloquea la apertura local, pero conviene vigilarlo si el shell crece.
- La recuperación tras inactividad reabre el último archivo en memoria, pero sigue siendo una restauración de sesión, no almacenamiento persistente.

## Próximos pasos

- Conseguir al menos un DXF y un DWG reales para probar apertura y render.
- Verificar que seleccionar archivo dispara `loading` y luego `ready` o `error`.
- Confirmar que el dropzone acepta solo `.dwg` y `.dxf`.
- Simular inactividad o cambio de visibilidad para validar el mensaje de recuperación.
- Si se necesitan fuentes específicas para renderización, definir una estrategia explícita de assets en lugar de usar la descarga automática por defecto.
