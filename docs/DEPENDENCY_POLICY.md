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

`.github/workflows/upstream-sync.yml` comprueba upstream automáticamente cada día y mediante ejecución manual. Primero valida upstream limpio y separa esa salud de la sincronizabilidad con downstream. Antes de la primera paridad, la ausencia de ancestry común se reporta como adopción inicial saludable pendiente de reconciliación manual; después, un candidato saludable se construye desde el `origin/main` actual y puede producir o actualizar un único PR. `chore/upstream-sync` es una rama descartable; conflictos o fallas de validación detienen el workflow con un resumen y dejan `main` intacto, sin force-push, merge automático ni reparación de dependencias.
