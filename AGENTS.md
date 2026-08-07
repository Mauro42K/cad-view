# CAD View — instrucciones del repositorio

Estas instrucciones adaptan [Mauro Engineering Standard v1.0.1](https://github.com/Mauro42K/engineering-standard/blob/v1.0.1/STANDARD.md) a este repositorio. El estándar canónico define el proceso común; este archivo conserva únicamente el contexto y las reglas específicas de CAD View.

## Contexto y límites

- CAD View es una copia independiente basada en [`mlightcad/cad-viewer`](https://github.com/mlightcad/cad-viewer); no existe sincronización automática con upstream.
- Una sincronización upstream es una tarea separada y deliberada, con fuente explícita, diff y validación propios. Dependabot solo actualiza dependencias.
- La aplicación visible vive en `packages/cad-viewer-example`.
- Requiere Node.js 24+ y pnpm 10+.
- Los DWG locales pertenecen en `local-test-files/`, que está ignorado por Git. Nunca deben colocarse en `public/` ni confirmarse en Git.

## Comandos y validación

Usa los comandos reales del workspace:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Para reproducir CI cuando corresponda, usa `pnpm typecheck:ci` y `pnpm test:ci`; el workflow también ejecuta `pnpm lint` y `pnpm build` tras `pnpm install --frozen-lockfile`. No inventes scripts ni checks. Para cambios en la aplicación visible, considera además la validación E2E existente de `packages/cad-viewer-example` cuando el alcance y el entorno lo permitan.

Antes de presentar cambios, revisa el diff completo, ejecuta `git diff --check` y haz una segunda pasada breve de coherencia documental y alcance. Las afirmaciones de éxito requieren comandos ejecutados y evidencia de su resultado.

## Dependencias y deuda existente

- La política Dependabot vigente es manual: no hay auto-merge activo. No habilites `ENABLE_DEPENDABOT_AUTOMERGE` ni interpretes el workflow futuro como autorización.
- `pdfjs-dist` requiere revisión dedicada, revisión de API/worker y smoke test con PDF representativo.
- Las dependencias MLightCAD acopladas deben validarse como conjunto. No modifiques código funcional únicamente para acomodar un conjunto de dependencias incompatible.
- Preserva las fases S0–S3, las alertas y la deuda existentes según `docs/DEPENDENCY_POLICY.md`; no las reinterpretes como resueltas ni cierres remediation sin evidencia actual y alcance autorizado.

## Forma de trabajo

- Para trabajo técnico no trivial que involucre arquitectura, impacto, varios módulos, símbolos compartidos o flujos entre superficies, usa Codebase Intelligence cuando esté disponible; confirma sus resultados leyendo directamente archivos, configuración, tests y diff. Declara `USED`, `NOT APPLICABLE`, `UNAVAILABLE` o `STALE / REINDEXED` según corresponda.
- Mantén un solo agente principal. Los subagentes internos, si se necesitan, permanecen dentro del mismo hilo y se limitan a análisis, validaciones o revisiones acotadas; el agente principal integra y verifica el resultado.
- Ajusta la revisión al riesgo y a la superficie afectada. La Definition of Done incluye alcance explícito, diff revisado, documentación coherente, checks pertinentes ejecutados y evidencia reportable.
- Detente al alcanzar `PASS` o `PASS WITH NOTES`, al llegar al límite de ciclos, o ante un bloqueo que requiera decisión humana o evidencia inaccesible. No amplíes el alcance ni conviertas deuda, alertas o gaps de validación en éxito por conveniencia.
