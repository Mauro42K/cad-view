# CAD View — downstream de mlightcad/cad-viewer

Este archivo es el control plane local y autosuficiente de CAD View: no requiere
un estándar remoto, tag, URL ni metadatos de procedencia.

CAD View es un downstream del repositorio [`mlightcad/cad-viewer`](https://github.com/mlightcad/cad-viewer). Upstream es la fuente de verdad para el producto, la arquitectura, las dependencias, tooling, funcionalidades y ejemplos; su árbol limpio es también la línea base para validar sincronizaciones.

Si el upstream limpio falla su propia validación relevante, la sincronización downstream debe detenerse de forma segura. No se debe reparar automáticamente esa falla downstream salvo un requisito urgente y documentado.

## Límites locales

- Mantener sólo deltas downstream mínimos y justificados.
- Basar el cierre en evidencia actual; nunca incluir secretos, credenciales o
  datos sensibles en archivos, diffs, logs o fixtures versionables.
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

Son los gates base reales: no inventar scripts ni convertir una suite ausente
en aprobación. Los cambios del viewer añaden E2E y carga CAD cuando existen
suite y fixtures; para documentación pequeña bastan diff, `git diff --check` y
referencias.

La revisión independiente es proporcional, usa evidencia primaria y, si se
materializa, el revisor es distinto del implementador. Codebase Intelligence/
Memory es contexto opcional, no autoridad ni dependencia; reportar `USED`,
`NOT APPLICABLE`, `UNAVAILABLE` o `STALE / REINDEXED`.

Antes de limpiar archivos, branches o refs, clasificar conocimiento como
`preserve`, `consolidate` u `obsolete` y estado como `material / valuable`,
`generated / regenerable` o `ambiguous`; preservar lo ambiguo y versionar una
consolidación antes de eliminar. Tras cerrar una branch, reconciliar commits,
contenido y refs, y exigir autorización y comprobación post-cierre antes de
eliminarla; si queda pendiente, registrar owner, motivo, fecha y salida.

Cerrar cada tarea con `PASS`, `PASS WITH NOTES`, `NEEDS REVISION`, `BLOCKED` o
`INCOMPLETE`, declarando archivos, validaciones y pendientes. `PASS WITH NOTES`
requiere notas no bloqueantes y responsable; `BLOCKED` requiere falta real de
evidencia, autorización o decisión, incompatibilidad no recalibrable, o
preflight obsoleto/estado inseguro; `INCOMPLETE` indica que no terminó. No
repetir indefinidamente ni presentar historia como estado actual. `PASS` exige
gates obligatorios satisfechos, documentación consistente y ningún hallazgo
relevante; `NEEDS REVISION` indica un hallazgo corregible dentro del alcance.

`.github/workflows/upstream-sync.yml` comprueba upstream automáticamente cada día y mediante ejecución manual. Primero valida upstream limpio; sólo después intenta sincronizar. Un nuevo commit upstream no actualiza `main`: sólo un candidato que pase la línea base y sea integrable produce o actualiza una PR. La salud upstream es distinta de la sincronizabilidad; antes de la primera paridad las historias pueden no tener ancestry común y requieren una reconciliación manual deliberada. Cada candidato se reconstruye desde el `origin/main` actual; `chore/upstream-sync` es una rama descartable de automatización, no una segunda rama de producto de larga duración. Los conflictos deben resolverse manualmente; nunca se fuerza `main` ni se reparan dependencias upstream automáticamente.

## Dependencias y seguridad

La dirección de versiones de dependencias upstream pertenece a upstream. Las alertas de seguridad se revisan manualmente y pueden justificar una excepción documentada. Las dependencias MLightCAD acopladas deben validarse como conjunto.

## Deploy

Vercel ejecuta `pnpm build` y publica `packages/cad-viewer-example/dist`, según `vercel.json`.
