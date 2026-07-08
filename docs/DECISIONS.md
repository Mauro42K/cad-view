# CAD View - Decisions F0

Fecha de decisión: 2026-07-07

## Decisión principal

Para el MVP conviene usar `@mlightcad/cad-simple-viewer`.

## Por qué

- El objetivo del producto es una app privada e interna con personalización mínima.
- No hace falta adoptar hoy la UI completa de `@mlightcad/cad-viewer`.
- El ejemplo simple está pensado para integrarse en apps propias.
- Reduce el peso inicial y deja más control sobre nombre, colores y logo.
- Facilita mantener la app desacoplada del código interno de `mlightcad`.
- Evita un fork pesado y mejora la probabilidad de seguir upstream sin fricción.

## Opción descartada para este MVP

### `@mlightcad/cad-viewer`

- Es más completo, pero también más acoplado a la UI upstream.
- Tiene sentido si el objetivo fuera clonar la experiencia oficial con menos trabajo de integración.
- No es la mejor opción cuando la app final quiere ser propia y simple.

## Fork completo

- No se recomienda como estrategia inicial.
- Aumenta costo de mantenimiento.
- Complica absorción de cambios upstream.
- Va contra el objetivo declarado de evitar un fork pesado.

## Arquitectura recomendada

1. Crear una app propia.
2. Consumir `@mlightcad/cad-simple-viewer` como dependencia npm.
3. Añadir solo la UI mínima necesaria.
4. Si se necesita chrome listo, sumar `@mlightcad/cad-simple-ui-plugin`.
5. Servir workers y runtime como assets estáticos en Vite.
6. Mantener el engine de `mlightcad` intacto.

## Requisitos operativos

- Node.js objetivo: `>= 24`
- pnpm objetivo: `>= 10`
- Build: Vite + TypeScript, con copia explícita de workers y runtime

## Assets que hay que preparar

- `dxf-parser-worker.js`
- `libredwg-parser-worker.js`
- `mtext-renderer-worker.js`
- `viewer-runtime.iife.js`

## Riesgos a asumir desde el MVP

- DWG grandes pueden romperse por memoria.
- Los workers deben estar accesibles en producción.
- El soporte DWG depende de WASM y de la compatibilidad del navegador.
- Cambios upstream pueden requerir ajustes de rutas o configuración.

## Criterio de éxito para F1

- Abrir un DWG y un DXF locales desde el navegador.
- Confirmar que los workers cargan bien en dev y build.
- Confirmar que el layout base permite renombrar y tematizar la app sin tocar el engine.
- Dejar una base de proyecto lista para iterar sobre UI mínima.
