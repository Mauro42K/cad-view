# Política downstream de dependencias

CAD View no es un mantenedor independiente del producto ni de las dependencias que upstream usa para construir el viewer. `mlightcad/cad-viewer` es la fuente de verdad de producto y dirección de dependencias; su árbol limpio es también la línea base para validar sincronizaciones.

Si el upstream limpio falla su propia validación relevante, la sincronización debe detenerse. No se debe introducir una reparación downstream automática o independiente salvo una necesidad downstream urgente y documentada.

## Dependabot

La configuración downstream de Dependabot fue retirada para evitar que este repositorio abra una corriente propia de actualizaciones rutinarias de dependencias. Esto no desactiva la responsabilidad de seguridad: las alertas disponibles en GitHub deben permanecer activas y revisarse manualmente. Una vulnerabilidad urgente puede justificar una excepción temporal documentada, que debe retirarse cuando upstream incorpore la corrección.

No existe auto-merge de Dependabot. Ningún workflow downstream debe conceder permisos de escritura para fusionar actualizaciones automáticamente.

## Excepciones

Una actualización local sólo se conserva cuando existe una necesidad demostrable de despliegue, una corrección de seguridad urgente o una incompatibilidad downstream documentada. Debe incluir evidencia de impacto, compatibilidad y validación.

Las dependencias MLightCAD acopladas se actualizan como conjunto. No se deben introducir overrides parciales ni cambios funcionales para hacer compilar una matriz incompatible.

## Validación

Antes de aceptar una excepción, ejecutar los gates que el upstream actual soporte:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
```

Los cambios que afecten al viewer visible deben añadir la validación E2E de upstream cuando esa suite y sus fixtures estén presentes en el downstream, además de una prueba representativa de carga CAD cuando los fixtures estén disponibles. `pdfjs-dist` requiere además revisión específica de API/worker y smoke test PDF.

## Sincronización

Sólo se adoptan releases oficiales estables y publicadas de `mlightcad/cad-viewer`, con un tag final SemVer y su SHA real verificado. Se excluyen drafts, previews, prereleases y commits de `upstream/main` que todavía no estén en una release elegible. No se actualizan versiones, overrides o lockfile de forma independiente.

La release debe contener todos los commits upstream ya integrados y no reducir la versión del producto. Si la última estable es anterior al baseline integrado, el espejo espera la siguiente publicación sin hacer downgrade. La paridad se mide contra la release adoptada; la diferencia con upstream/main es un retraso deliberado y visible.

La automatización valida primero el árbol limpio de la release y después el candidato. Sólo publica una PR si pasan instalación congelada, lint, build, tests, ascendencia y paridad fuera de las seis excepciones locales. Se preservan las dependencias y el lockfile exactos de upstream. Los gates de CI, E2E, CodeQL, procedencia de release y Vercel deben aprobar antes del merge normal. Las alertas bloqueantes nunca se ignoran ni se descartan para acelerar la sincronización.

Las vulnerabilidades heredadas se mantienen visibles y se remiten a upstream. Si una release elegible contiene una alerta que bloquea el merge, se espera una release estable corregida. Una excepción urgente requiere una decisión explícita y documentada fuera del mantenimiento automático; no forma parte de este espejo estable. Véase `DOWNSTREAM_MAINTENANCE.md` para el procedimiento ante una release defectuosa.
