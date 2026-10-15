# CAD View — downstream de mlightcad/cad-viewer

Este archivo es el control plane local y autosuficiente de CAD View: no requiere
un estándar remoto, tag, URL ni metadatos de procedencia.

CAD View es un downstream del repositorio [`mlightcad/cad-viewer`](https://github.com/mlightcad/cad-viewer). Upstream es la fuente de verdad para el producto, la arquitectura, las dependencias, tooling, funcionalidades y ejemplos; el árbol limpio de la release estable oficial elegible es la línea base para validar sincronizaciones.

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

`.github/workflows/upstream-sync.yml` consulta diariamente y mediante ejecución manual las releases oficiales de `mlightcad/cad-viewer`. Sólo admite releases publicadas, estables, sin draft ni prerelease y con tag SemVer final `vX.Y.Z` o `X.Y.Z`; previews, RC y tags sin release quedan excluidos. `upstream/main` se consulta sólo para comprobar ascendencia: nunca es la fuente de una sincronización.

El tag se resuelve hasta su commit real, incluidos tags anotados, y se verifica contra el objeto descargado. La versión debe coincidir con el paquete upstream y no ser menor que la versión integrada. El commit debe pertenecer al historial de `upstream/main` y contener el último baseline upstream ya integrado; si ninguna release contiene todos esos commits, se espera sin retroceder ni publicar una PR. La falta de una release elegible es un estado normal, aunque upstream/main haya avanzado.

Cada candidato se reconstruye desde el `origin/main` actual y fusiona exclusivamente el SHA verificado de la release, mediante merge normal. Los únicos conflictos que se resuelven automáticamente son los seis archivos de infraestructura autorizados, conservando su contenido downstream; un conflicto funcional bloquea el ciclo. Se exige paridad fuera de esos seis archivos, validación del upstream limpio y del candidato, y una segunda verificación de la release, el tag y la base antes del push. `chore/upstream-sync` es una rama descartable de automatización, no una rama de producto.

El auto-merge nativo sólo registra el método MERGE; no omite las protecciones de GitHub. Antes de integrar se requieren `release-policy`, `build`, ambos análisis CodeQL y Vercel, más la protección nativa de resultados CodeQL (errores y alertas de seguridad altas/críticas, sin bypass). La CI verifica además la procedencia y paridad de las PR de sincronización. No se descartan alertas ni se cambian umbrales para lograr un merge. La política operativa completa y el manejo de releases defectuosas están en `docs/DOWNSTREAM_MAINTENANCE.md`.

## Dependencias y seguridad

La dirección de versiones de dependencias upstream pertenece a upstream. Las alertas de seguridad se revisan manualmente y pueden justificar una excepción documentada. Las dependencias MLightCAD acopladas deben validarse como conjunto.

## Deploy

Vercel ejecuta `pnpm build` y publica `packages/cad-viewer-example/dist`, según `vercel.json`.
