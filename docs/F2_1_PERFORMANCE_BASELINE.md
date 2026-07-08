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
- `viewer ready`

## Resultados observados

- `file selected -> arrayBuffer ready`: ~`70 ms`
- `file selected -> openDocument started`: ~`76 ms`
- `openDocument started -> viewer ready`: ~`53 s`
- `file selected -> viewer ready`: ~`53 s`

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

## Conclusión

- La lectura del archivo local es rápida.
- El tiempo fuerte está dentro de `openDocument`, que incluye parsing/conversión/render del engine.
- No se observó una espera artificial en la app.
- El estado visual ya muestra progreso lento después de 30 s y mantiene el usuario informado.
- La UI quedó alineada para considerar `ready` solo cuando el viewer termina de asentarse visualmente.

## Limitaciones

- No se cambió el engine ni la arquitectura.
- No se concluyó una optimización de parsing porque no hay evidencia suficiente para modificar el motor.
- El cuello de botella principal sigue estando dentro del pipeline del viewer para este DWG concreto.

## Próximo paso si se quiere optimizar

Antes de tocar el motor, validar si el mismo archivo:

- abre más rápido en otros navegadores
- tarda similar en otros DWG de tamaño parecido
- reduce tiempo si se eliminan capas, XRefs u objetos complejos

