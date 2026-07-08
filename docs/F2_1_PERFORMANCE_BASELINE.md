# CAD View - F2.1 Performance Baseline

Fecha: 2026-07-08

## Entorno

- Repo: `/Users/mauro/cad-view`
- Node: `v24.18.0`
- pnpm: `10.17.1`
- Build: `pnpm build`
- Preview: `pnpm preview --host 127.0.0.1 --port 4174`
- Browser verification: Chrome headless local via CDP

## Archivo probado

- `2_Piso de Maquinas_N+20.00_RJ_IDE-H2.dwg`
- Ruta local: `/Users/mauro/Downloads/2_Piso de Maquinas_N+20.00_RJ_IDE-H2.dwg`
- Tamaño observado en UI: `4.3 MB`

## Flujo medido

- `file selected`
- `arrayBuffer read started`
- `arrayBuffer ready`
- `openDocument started`
- `viewer progress`
- `openDocument resolved`
- `awaiting visual ready`
- `visual ready`

## Resultados observados

- `file selected -> arrayBuffer ready`: ~`44 ms`
- `file selected -> openDocument started`: ~`52 ms`
- `openDocument started -> openDocument resolved`: ~`41 s`
- `openDocument resolved -> visual ready`: ~`1m 22s`
- `openDocument started -> visual ready`: ~`2m 03s`
- `file selected -> visual ready`: ~`2m 03s`

## Progreso del viewer observado

El viewer reportó etapas de conversión/render con estos hitos visibles:

- `start 0%`
- `ltype 11%`
- `object 22%`
- `entity 32%`
- `entity 41%`
- `entity 51%`
- `entity 61%`
- `entity 71%`
- `entity 81%`
- `entity 91%`
- `entity 100%`
- `Parsing named dictionaries...`
- `Finalizing CAD document...`
- `END`
- `awaiting visual ready`

## Conclusión

- La lectura del archivo local es rápida.
- El tiempo fuerte está dentro de `openDocument`, que incluye parsing/conversión/render del engine.
- No se observó una espera artificial en la app.
- El estado visual ya muestra progreso lento después de 30 s y mantiene el usuario informado.
- `entity 100%` no es el final real: el pipeline sigue con finalización y el estado correcto termina en `visual ready`.
- La UI ahora separa `openDocument resolved` de `visual ready` y exige confirmación visual manual para cerrar el baseline.

## Limitaciones

- No se cambió el engine ni la arquitectura.
- No se concluyó una optimización de parsing porque no hay evidencia suficiente para modificar el motor.
- El cuello de botella principal sigue estando dentro del pipeline del viewer para este DWG concreto.
- `Parsing named dictionaries...` siguió siendo el tramo largo más visible antes de que el viewer quede listo.
- El baseline sirve para comparar futuras versiones de mlightcad, ajustes de la UI y otros DWG/DXF reales.

## Próximo paso si se quiere optimizar

Antes de tocar el motor, validar si el mismo archivo:

- abre más rápido en otros navegadores
- tarda similar en otros DWG de tamaño parecido
- reduce tiempo si se eliminan capas, XRefs u objetos complejos
