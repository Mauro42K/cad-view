# CAD View - Discovery Técnico F0

Fecha de revisión: 2026-07-07

## Alcance revisado

- Repo local: `/Users/mauro/cad-view`
- Repo upstream principal: `mlightcad/cad-viewer`
- Ejemplos oficiales revisados:
  - `mlightcad/cad-viewer-example`
  - `mlightcad/cad-simple-viewer-example`

## Estado del repo local

- El repo local todavía no tiene app implementada.
- A nivel de archivos visibles, solo existe documentación inicial en `docs/CAD_VIEW_PLAN.md`.
- No se detectó un `git` worktree activo en este entorno, así que no pude usar `git status` ni `git diff` sobre este directorio.

## Qué ofrece upstream

### `@mlightcad/cad-viewer`

- Es el contenedor más completo.
- Según el README, es un viewer/editor Vue 3 para DWG/DXF.
- Incluye UI completa, herramientas, exportación y sistema de plugins.
- El repo principal es un monorepo con múltiples paquetes.

### `@mlightcad/cad-simple-viewer`

- Es el core más liviano.
- El ejemplo oficial lo describe como una capa de integración para apps propias.
- El ejemplo `cad-simple-viewer-example` muestra que el simple viewer no trae toda la UI de aplicación y se complementa con `cad-simple-ui-plugin`.
- El README del ejemplo simple indica que parsing y renderizado corren en browser con Web Workers + WebAssembly para DWG.

### Ejemplos oficiales

- `cad-viewer-example` usa `@mlightcad/cad-viewer` con UI Vue completa.
- `cad-simple-viewer-example` usa `@mlightcad/cad-simple-viewer` con una interfaz más pequeña, toolbar simple y carga dinámica de plugins de exportación.

## Requisitos reales

### Node.js y pnpm

- En el repo principal upstream, `package.json` declara:
  - `node >= 24`
  - `pnpm >= 10`
- En `cad-simple-viewer-example` el README menciona `Node.js >= 20` y `pnpm >= 10`.
- El `package.json` del ejemplo simple fija `packageManager: pnpm@10.33.4`.
- Conclusión práctica:
  - Para el stack actual de `mlightcad`, la referencia más segura es `Node.js 24+` y `pnpm 10+`.
  - El entorno local de esta sesión tiene `node v22.20.0` y `pnpm 10.17.1`, así que `pnpm` cumple, pero `node` queda por debajo del mínimo declarado por upstream.

### Build

- En el ejemplo simple:
  - `pnpm install`
  - `pnpm dev`
  - `pnpm build`
  - `pnpm preview`
- En el repo principal:
  - `pnpm dev` lanza el ejemplo Vue completo.
  - `pnpm dev:simple` lanza el ejemplo simple.
  - `pnpm build` ejecuta el build de todo el monorepo.

## Assets, workers y WASM

### Lo que hay que copiar o servir en una app propia

Del ejemplo oficial `cad-viewer-example`:

- `./node_modules/@mlightcad/data-model/dist/dxf-parser-worker.js`
- `./node_modules/@mlightcad/cad-simple-viewer/dist/libredwg-parser-worker.js`
- `./node_modules/@mlightcad/cad-simple-viewer/dist/mtext-renderer-worker.js`

Del ejemplo simple:

- El build copia los parser workers y `viewer-runtime.iife.js` a `dist/assets/`.
- El README indica que los workers deben estar disponibles y que la app debe configurar `webworkerFileUrls` en `AcApDocManager.createInstance()`.
- El readiness check recomendado usa `AcApDocManager.checkWebworkerReadiness(...)`.

### Implicación para Vite

- No conviene importar esos workers como parte del bundle principal.
- Conviene copiarlos como assets estáticos.
- La configuración tiene que garantizar rutas estables en producción.
- Hay que separar claramente:
  - bundle principal de la app
  - worker scripts
  - runtime viewer

## Riesgos técnicos relevantes

### DWG grandes

- El README principal advierte que DWG muy grandes pueden consumir mucha RAM.
- El stack LibreDWG/WASM puede fallar con archivos muy pesados por límites de heap.
- Conclusión: el MVP debe probarse con archivos reales grandes antes de asumir cobertura total.

### Workers

- Si un worker no está servido correctamente, la apertura puede fallar o bloquear la UI.
- Hay que validar que los archivos estén disponibles desde el host final.

### WASM

- El soporte DWG depende de WebAssembly y de la implementación subyacente.
- Esto introduce riesgo de compatibilidad de navegador, caché y despliegue de assets.

### Compatibilidad browser

- La promesa upstream es browser-only.
- Aun así, conviene validar en navegadores modernos de escritorio antes de asumir soporte móvil amplio.

### 2D/3D

- El repo principal menciona enfoque 2D con capacidades de renderizado 3D.
- Para este MVP, el uso real esperado es revisión 2D primero.

### Actualización upstream

- El proyecto upstream está activo y publica releases frecuentes.
- Riesgo principal: cambios de API, workers o rutas de assets al actualizar dependencias.
- Conviene fijar versiones y revisar changelog antes de subir majors/minors.

## Observación sobre el repo local

- La documentación local ya apunta en la dirección correcta:
  - no fork pesado
  - app privada
  - archivos abiertos localmente
  - personalización mínima
- Eso coincide con lo que sugiere el ejemplo simple, no con un fork completo del viewer.

## Validaciones ejecutadas

- `node --version` -> `v22.20.0`
- `pnpm --version` -> `10.17.1`
- `git rev-parse --is-inside-work-tree` -> falló porque este directorio no está inicializado como repo git en este entorno

## Pendientes por validar con código local

- Confirmar la estructura exacta del proyecto cuando exista un `package.json` local.
- Confirmar la configuración final de Vite en el repo nuevo.
- Confirmar qué navegadores se quieren soportar en el MVP.
- Confirmar si se usará `@mlightcad/cad-simple-ui-plugin` desde el día 1 o una UI propia mínima.
