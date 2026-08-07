# CAD View — adaptación local de Mauro Engineering Standard v1.0.2

Este archivo adapta [Mauro Engineering Standard v1.0.2](https://github.com/Mauro42K/engineering-standard/blob/v1.0.2/STANDARD.md) a este repositorio. El estándar canónico define el proceso común; aquí sólo se mantienen el contexto, los comandos, los riesgos y las reglas operativas específicas de CAD View.

## Contexto y límites

- CAD View es una copia independiente basada en [`mlightcad/cad-viewer`](https://github.com/mlightcad/cad-viewer); no existe sincronización automática con upstream. Una sincronización upstream es una tarea separada y deliberada, con fuente explícita, diff y validación propios.
- Dependabot sólo actualiza dependencias; no sincroniza código ni historial con upstream.
- La aplicación visible vive en `packages/cad-viewer-example`.
- El workspace requiere Node.js 24+ y pnpm 10+; el gestor fijado es pnpm `10.33.4`.
- Los DWG locales pertenecen en `local-test-files/`, que está ignorado por Git. Nunca deben colocarse en `public/` ni confirmarse en Git.

## Comandos y gates reales

Checks locales del workspace:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Para reproducir los gates de CI, usar `pnpm install --frozen-lockfile` y:

```sh
pnpm typecheck:ci
pnpm test:ci
pnpm lint
pnpm build
```

Los cambios que afecten la aplicación visible pueden requerir además el E2E existente:

```sh
pnpm --filter @mlightcad/cad-viewer-example test:e2e
```

## Dependencias, seguridad y deuda

- La política Dependabot vigente es manual: el repositorio es privado, `main` no está protegido y `ENABLE_DEPENDABOT_AUTOMERGE` debe permanecer ausente o deshabilitado. El workflow de auto-merge es sólo un mecanismo futuro condicionado por esa variable; no constituye autorización para habilitarlo.
- `pdfjs-dist` requiere una revisión dedicada de API/worker y smoke test con un PDF representativo. Deben preservarse las fases S0–S3, las alertas y la deuda de `docs/DEPENDENCY_POLICY.md`; no se debe declarar remediation cerrada sin evidencia actual.
- Las dependencias MLightCAD acopladas deben validarse como conjunto. No se debe modificar código funcional únicamente para acomodar un conjunto de dependencias incompatible.

## Deploy y operación

- El deploy configurado en `vercel.json` usa `pnpm build` y publica `packages/cad-viewer-example/dist`.
