# Mantenimiento del espejo estable

CAD View es un espejo de mantenimiento de `mlightcad/cad-viewer`, con seis excepciones locales de infraestructura. Upstream es la única fuente de código funcional, dependencias, versiones, arquitectura y ejemplos. No se desarrolla una variante del producto ni se aplican parches funcionales propios.

## Fuente y selección de versiones

El workflow `upstream-sync.yml` consulta diariamente y mediante ejecución manual todas las páginas de releases oficiales del repositorio upstream. Selecciona la mayor versión elegible por orden SemVer numérico, no por fecha de publicación:

- Release publicada (`published_at` presente), sin `draft` ni `prerelease`.
- Tag final `vX.Y.Z` o `X.Y.Z`, sin sufijos, previews, RC ni metadatos de versión.
- Tag resuelto recursivamente hasta un commit real; el objeto del tag y el SHA descargados deben coincidir con GitHub. La versión de `packages/cad-viewer/package.json` debe coincidir con el tag.
- Commit contenido en el historial de `upstream/main` y descendiente del último baseline upstream integrado.
- Versión no inferior a la del paquete integrado y commit todavía no integrado.

`upstream/main` sólo sirve para comprobar ascendencia; nunca se fusiona directamente. Los tags sin release oficial tampoco son elegibles. La ausencia de una release elegible termina correctamente el ciclo sin cambios ni PR: no es una avería de la automatización.

## Paridad y transición sin retrocesos

El baseline se obtiene del ancestro común de `origin/main` y `upstream/main`. Antes de seleccionar se comprueba que el producto actual coincide con ese baseline fuera de las seis excepciones. Después de una adopción, el baseline es el commit publicado de la release integrada. El SHA del merge downstream será diferente porque conserva su historial e infraestructura.

Al introducir esta política, el baseline integrado es `aff4c22423818e53d82cc731d195b62570af1fb8`: contiene `v1.7.5` y commits posteriores a esa release. El paquete indica `1.7.5`, pero el árbol todavía no corresponde exactamente al tag `v1.7.5`. No se retrocede a ese tag: se espera una release estable que incluya todo el baseline. Este dato describe la transición inicial, no requiere editar documentación en cada publicación; los resúmenes de Actions y las PR registran la release y el SHA seleccionados.

La paridad funcional se mide contra la release adoptada, no contra el último commit de upstream/main. Estar detrás de main durante el desarrollo de una versión es intencionado. La PR upstream #766 no se copia ni se aplica directamente: sólo se recibe cuando una release estable elegible incluya su corrección aceptada.

## Ciclo de sincronización y auto-merge

1. Seleccionar y verificar una release elegible, su versión, tag y ascendencia.
2. Validar el upstream limpio con instalación congelada, lint, build y tests. Si falla, detenerse sin reparar upstream downstream.
3. Reconstruir `chore/upstream-sync` desde el main downstream actual y fusionar sólo el SHA verificado mediante merge normal, sin squash ni rebase.
4. Conservar los seis archivos locales autorizados. Resolver automáticamente sólo sus conflictos; cualquier conflicto funcional detiene el ciclo. Exigir paridad exacta del resto del árbol y validar el candidato.
5. Reconsultar la release, resolver de nuevo el tag y verificar que main no cambió durante la validación. Si cambió la base o desapareció/cambió la publicación, no publicar el candidato.
6. Crear o actualizar una única PR. El auto-merge nativo usa exclusivamente MERGE y queda sujeto a todas las protecciones de GitHub.

Checks obligatorios de main: `release-policy`, `build`, `Analyze (javascript-typescript)`, `Analyze (actions)` y `Vercel`. La CI mantiene E2E y comprueba además que una PR de `chore/upstream-sync` fusiona una release actualmente elegible desde la base vigente y conserva paridad funcional. La protección nativa de resultados CodeQL debe estar activa en main, sin actores de bypass, bloqueando errores y alertas de seguridad altas/críticas; que el job de análisis termine correctamente no basta si detectó una alerta bloqueante.

El workflow valida la política de selección en CI mediante escenarios positivos y negativos, incluidos versiones inferiores, previews, drafts, tags movidos y la preservación de commits postrelease. La protección de main exige esos resultados también al bot. No se fuerza main ni se debilitan controles para completar un ciclo.

## Vulnerabilidades heredadas y releases defectuosas

Las alertas heredadas de upstream permanecen abiertas y visibles. No se descartan, silencian ni se reducen umbrales para integrar una release. Se informa a upstream y se espera una release estable corregida cuando un hallazgo bloquea la sincronización. Una corrección pendiente en main upstream todavía no autoriza su aplicación downstream.

Si una release falla instalación, lint, build, tests, E2E, CodeQL, Vercel, procedencia o paridad, no se integra; se conserva el despliegue anterior. Se documenta la evidencia y se espera una nueva release oficial. No se retoca el código, las dependencias, el lockfile o los tests upstream para convertir el fallo en verde.

Si un defecto se descubre después de integrar una release, desactivar su auto-merge pendiente y pausar el workflow mientras se diagnostica. Registrar el tag/SHA, informar a upstream y esperar una release estable posterior que conserve la ascendencia. Una restauración excepcional de Vercel o cualquier rollback requiere decisión explícita y validación; el sincronizador nunca hace downgrades automáticos ni modifica la historia de main. Después de corregir la causa y comprobar los controles, reactivar el workflow. Cerrar con motivo las PR obsoletas y conservar sus ramas hasta evaluar su contenido y autorizar su limpieza.

## Despliegue

Vercel conserva `pnpm build` y `packages/cad-viewer-example/dist`. Esta política no cambia el código ni los parámetros de despliegue. Cada PR debe aprobar Vercel y el despliegue de main debe verificarse después de integrar infraestructura o una release.

## Autenticación de la sincronización

La automatización usa un GitHub App instalado únicamente en `Mauro42K/cad-view`. Cada ejecución obtiene un installation token de corta duración mediante `actions/create-github-app-token`, fijado a un SHA inmutable.

Permisos mínimos del GitHub App:

- `Contents`: Read and write.
- `Pull requests`: Read and write.
- `Workflows`: Read and write.
- `Metadata`: Read-only/implícito.

No se necesitan webhooks para este flujo.

Configuración del repositorio:

- Variable Actions `UPSTREAM_SYNC_APP_CLIENT_ID`: Client ID del GitHub App.
- Secret Actions `UPSTREAM_SYNC_APP_PRIVATE_KEY`: contenido completo de la private key PEM del GitHub App.

El antiguo secret `UPSTREAM_SYNC_TOKEN` basado en PAT es legado y debe eliminarse después de verificar un ciclo end-to-end exitoso con el GitHub App.

## Allowlist de infraestructura downstream

Sólo estos seis archivos pueden diferir del upstream adoptado:

- `.github/workflows/ci.yml`: CI, pruebas de política y procedencia de releases.
- `.github/workflows/upstream-sync.yml`: selección, validación y sincronización.
- `AGENTS.md`: límites operativos locales.
- `docs/DEPENDENCY_POLICY.md`: política de dependencias heredadas.
- `docs/DOWNSTREAM_MAINTENANCE.md`: procedimiento de mantenimiento.
- `vercel.json`: configuración de build y salida de Vercel.

Cualquier diferencia fuera de esta lista bloquea la automatización. El código funcional, manifiestos de paquetes y lockfile pertenecen exclusivamente a upstream.
