# CAD View — downstream de mlightcad/cad-viewer

CAD View es un downstream del repositorio [`mlightcad/cad-viewer`](https://github.com/mlightcad/cad-viewer). Upstream es la fuente de verdad para el producto, la arquitectura, las dependencias, tooling, funcionalidades y ejemplos; su árbol limpio es también la línea base para validar sincronizaciones.

Si el upstream limpio falla su propia validación relevante, la sincronización downstream debe detenerse de forma segura. No se debe reparar automáticamente esa falla downstream salvo un requisito urgente y documentado.

## Límites locales

- Mantener sólo deltas downstream mínimos y justificados.
- No modernizar dependencias upstream de forma independiente.
- La aplicación visible es `packages/cad-viewer-example`.
- Node.js requerido: 24+; pnpm fijado: `10.33.4`.
- Los DWG/DXF locales pertenecen en `local-test-files/`; nunca deben versionarse ni colocarse en `public/`.
- `vercel.json`, este archivo, la política de dependencias y los controles CI son configuración downstream; no deben modificar el código de producto upstream sin justificación documentada.

## Validación

Usar primero los scripts soportados por upstream:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
```

`.github/workflows/upstream-sync.yml` comprueba upstream automáticamente cada día y mediante ejecución manual. Primero valida upstream limpio; sólo después intenta sincronizar. Un nuevo commit upstream no actualiza `main`: sólo un candidato que pase la línea base y sea integrable produce o actualiza una PR. La salud upstream es distinta de la sincronizabilidad; antes de la primera paridad las historias pueden no tener ancestry común y requieren una reconciliación manual deliberada. Cada candidato se reconstruye desde el `origin/main` actual; `chore/upstream-sync` es una rama descartable de automatización, no una segunda rama de producto de larga duración. Los conflictos deben resolverse manualmente; nunca se fuerza `main` ni se reparan dependencias upstream automáticamente.

## Dependencias y seguridad

La dirección de versiones de dependencias upstream pertenece a upstream. Las alertas de seguridad se revisan manualmente y pueden justificar una excepción documentada. Las dependencias MLightCAD acopladas deben validarse como conjunto.

## Deploy

Vercel ejecuta `pnpm build` y publica `packages/cad-viewer-example/dist`, según `vercel.json`.
