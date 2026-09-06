# Mantenimiento downstream

CAD View es una copia downstream del repositorio `mlightcad/cad-viewer`.

- Upstream posee el código de producto, las dependencias, las versiones y la dirección técnica; su árbol limpio es la línea base para validar cada sincronización.
- Los cambios locales se limitan a gobernanza privada, validación, configuración Vercel y metadatos estrictamente necesarios.
- `.github/workflows/upstream-sync.yml` comprueba upstream automáticamente cada día y también admite ejecución manual.
- Un nuevo commit upstream no actualiza `main`: sólo un candidato saludable produce o actualiza una PR de sincronización.
- Cada candidato se reconstruye desde el `origin/main` actual; `chore/upstream-sync` es una rama descartable de automatización, no una segunda rama de producto de larga duración.
- La salud upstream (sus propios gates limpios) es distinta de la sincronizabilidad (integración con downstream). Antes de la primera paridad las historias pueden no tener ancestry común; un upstream saludable se reporta para una reconciliación manual deliberada. Después de establecer ancestry común, las actualizaciones saludables normalmente producen PRs automáticas.
- Las PR de sincronización usan **merge normal**, nunca squash ni rebase, para conservar la ancestry real de upstream.
- La protección de `main` y sus required checks siguen siendo la barrera final. Una PR saludable puede registrar auto-merge normal y GitHub sólo la integra cuando los gates obligatorios quedan satisfechos.
- Si el upstream limpio falla su propia validación relevante, la sincronización se detiene y no se abre una PR que atribuya la falla al downstream.
- Las actualizaciones rutinarias de versiones de Dependabot se evitan. Las alertas de seguridad de GitHub permanecen disponibles; una excepción urgente puede divergir temporalmente, debe documentarse y eliminarse cuando upstream se ponga al día.
- Findings de seguridad ubicados exclusivamente en archivos propiedad de upstream se heredan mientras exista paridad exacta; no se parchean downstream sólo para satisfacer un comentario de PR.

La delta local vigente debe permanecer pequeña, explícita y fácil de reconciliar en el siguiente PR upstream.

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

La comparación de paridad contra `upstream/main` debe mostrar únicamente estos
seis archivos locales:

- `.github/workflows/ci.yml`: controles CI downstream con permisos mínimos, pins
  inmutables y verificaciones de ancestry.
- `.github/workflows/upstream-sync.yml`: validación y creación de candidatos de
  sincronización.
- `AGENTS.md`: control plane y límites operativos de este mirror.
- `docs/DEPENDENCY_POLICY.md`: política downstream de dependencias.
- `docs/DOWNSTREAM_MAINTENANCE.md`: procedimiento y allowlist de mantenimiento.
- `vercel.json`: configuración downstream de build y salida de Vercel.

Cualquier otro archivo divergente frente al upstream requiere una decisión y
documentación explícitas antes de aceptarse.
