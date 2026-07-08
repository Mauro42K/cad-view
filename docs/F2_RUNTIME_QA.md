# CAD View - F2 Runtime QA

Fecha: 2026-07-08

## Entorno probado

- Repo: `/Users/mauro/cad-view`
- Node: `v24.18.0`
- pnpm: `10.17.1`
- Browser: Google Chrome headless local
- URL: `http://127.0.0.1:5173`

## Comandos ejecutados

- `pnpm dev --host 127.0.0.1`
- `pnpm build`
- `pnpm preview --host 127.0.0.1 --port 4174`
- Verificación visual con Google Chrome headless y captura PNG

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

## F2.1 - Performance baseline

- Se añadió un panel de performance visible en la UI para registrar tiempos de carga sin exponer contenido del dibujo.
- En el DWG real de `4.3 MB` el tramo de lectura local fue de decenas de milisegundos.
- El tiempo fuerte sigue estando dentro de `openDocument`, que tardó alrededor de `53 s` en esta corrida.
- El viewer reportó progreso intermedio mientras convertía entidades, y la UI mantuvo mensajes de carga lentos a los `30 s` y `2 min`.
- El estado `ready` ya se marca después de que el render termina de asentarse visualmente.

## Workers y assets

- `assets/dxf-parser-worker.js` responde `200` en dev.
- `assets/libredwg-parser-worker.js` responde `200` en dev.
- `assets/mtext-renderer-worker.js` responde `200` en dev.
- La carga de workers en la app no dejó errores de consola una vez desactivada la carga automática de fuentes externas.

## Consola del navegador

- Antes del ajuste, aparecía un error por intento de cargar `fonts.json` desde un CDN que devolvía `404`.
- La causa probable fue una combinación de `notLoadDefaultFonts: true` y una `baseUrl` sin slash final, que rompía la resolución de `fonts.json` y de assets de fuentes.
- El shell se corrigió reactivando la carga por defecto de fuentes con `baseUrl: 'https://cdn.jsdelivr.net/gh/mlightcad/cad-data/'`.
- La UI ahora aplica un fallback de sesión para algunas fuentes faltantes conocidas y muestra una nota visible cuando entra en modo degradado.
- Si falta una fuente que no tiene fallback, la UI sigue mostrando un aviso visible.
- Después del ajuste, la consola quedó sin errores críticos de app.
- Los abortos `ERR_ABORTED` de workers al arrancar se observaron como parte del flujo de inicialización y no bloquearon la UI.

## Carga DXF/DWG

- Se probó un DWG real de `4.3 MB` desde `/Users/mauro/Downloads/2_Piso de Maquinas_N+20.00_RJ_IDE-H2.dwg`.
- No había un DXF real disponible en el workspace para validar esa ruta.
- El siguiente paso manual es repetir con un `.dxf` real para confirmar que el mismo baseline aplica.

## Estado de UI

- `idle` o pantalla inicial: visible al cargar.
- `loading`: visible durante la inicialización.
- `ready`: visible después de que el viewer termina de inicializar y asentarse visualmente.
- `error`: no se reprodujo con la configuración actual.

## Errores conocidos

- `viewer-runtime.iife.js` no está presente en el paquete instalado y no se usa como requisito obligatorio.
- El build sigue generando un chunk grande; eso no bloquea la apertura local, pero conviene vigilarlo si el shell crece.
- La recuperación tras inactividad reabre el último archivo en memoria, pero sigue siendo una restauración de sesión, no almacenamiento persistente.
- La renderización de textos y cotas depende de que el repositorio de fuentes disponible tenga el font catalog correcto; si no, la UI lo avisará y el dibujo puede verse incompleto.
- Las fuentes propietarias no se commitean en este repo; el apoyo a repositorios privados está preparado pero vacío por diseño.
- El cuello de botella de `openDocument` sigue dentro del motor para este DWG concreto; todavía no se hizo una optimización del parsing.

## Próximos pasos

- Conseguir al menos un DXF y un DWG reales para probar apertura y render.
- Verificar que seleccionar archivo dispara `loading` y luego `ready` o `error`.
- Confirmar que el dropzone acepta solo `.dwg` y `.dxf`.
- Volver a abrir un DWG real y confirmar si los textos y cotas reaparecen con la base de fuentes corregida.
- Simular inactividad o cambio de visibilidad para validar el mensaje de recuperación.
- Si todavía faltan textos o cotas, aislar si el caso depende de SHX, dimensiones, XRefs u objetos proxy.
- Si se van a añadir fuentes privadas, hacerlo en `public/cad-fonts/fonts/` y verificar que desaparece el warning de fuentes.
- Usar [`docs/F2_1_PERFORMANCE_BASELINE.md`](docs/F2_1_PERFORMANCE_BASELINE.md) como referencia para comparar futuros cambios de rendimiento.
