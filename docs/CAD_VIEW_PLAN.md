# CAD View — Plan MVP y Roadmap Técnico

## 1. Objetivo del proyecto

Crear una Web App privada para visualizar archivos CAD DWG/DXF en navegador, principalmente para revisión rápida de dibujos 2D y eventualmente pruebas 3D.

**Nombre del producto:** CAD View  
**Repositorio recomendado:** `cad-view`  
**Dominio futuro:** `cad.mauro42k.com`  
**Uso:** privado / interno  
**Uso comercial:** no  
**Redistribución:** no  

---

## 2. Decisión técnica principal

No se hará un fork completo del repositorio `mlightcad/cad-viewer`.

En su lugar, se creará un repositorio propio privado llamado:

```text
cad-view
```

La app usará el ecosistema `mlightcad` como dependencia npm:

```text
@mlightcad/cad-viewer
```

O, si el discovery confirma que conviene una integración más simple:

```text
@mlightcad/cad-simple-viewer
```

### Motivo

Esta estrategia permite:

- Mantener la app simple.
- Personalizar solo colores, logo y nombre.
- Recibir mejoras upstream más fácilmente.
- Evitar mantener un fork pesado.
- Gastar menos créditos en Codex.
- Reducir riesgo de romper el engine CAD.
- Separar la app propia del código interno del viewer.

---

## 3. Estrategia de actualizaciones upstream

Se usará Dependabot en GitHub.

Cuando salga una nueva versión de `mlightcad`, GitHub abrirá un Pull Request automático avisando que hay una actualización disponible.

### Decisión

- No habrá merge automático.
- No habrá deploy automático.
- No se actualizará producción sin revisión.
- Dependabot revisará actualizaciones semanalmente.

### Flujo definido

```text
Nueva versión de mlightcad
        ↓
Dependabot abre PR
        ↓
Codex revisa cambio
        ↓
Build + QA con archivos reales
        ↓
Merge manual
        ↓
Deploy manual/controlado
```

---

## 4. Alcance MVP inicial

El MVP se desarrollará primero de forma local, sin VPS.

### Incluye

- App Vite + Vue 3 + TypeScript.
- Integración del viewer CAD.
- Abrir archivos DWG/DXF desde el computador.
- Sin backend.
- Sin auth.
- Sin subir archivos al servidor.
- Sin storage.
- Sin lista pública de archivos.
- UI simple con nombre CAD View.
- Colores básicos.
- Logo opcional.

### Objetivo crítico del MVP

Validar que los archivos CAD reales del usuario abran correctamente y tengan rendimiento aceptable.

---

## 5. Fuera de alcance inicial

Queda fuera del MVP inicial:

- Deploy inmediato al VPS.
- Auth/login.
- Base de datos.
- Upload persistente.
- Carpeta pública de DWG/DXF.
- Autoindex nginx.
- Compartir links públicos.
- Edición de dibujos.
- Anotaciones colaborativas.
- Personalización profunda.

---

## 6. Personalización permitida

La personalización será mínima.

### Permitido

- Nombre: CAD View.
- Colores.
- Logo simple si se decide usar.
- Header básico.
- Texto de privacidad/local file.

### No modificar

- Engine CAD.
- Parser DWG/DXF.
- Workers internos.
- Código fuente interno del paquete `mlightcad`.
- Archivos dentro de `node_modules`.

---

## 7. Seguridad y privacidad

Regla principal del MVP:

```text
Los archivos CAD se abren localmente desde el navegador.
No se suben al servidor.
```

Esto permite probar la app sin exponer dibujos en el VPS.

La autenticación se evaluará después, cuando:

- La app funcione bien localmente.
- Se haya probado con archivos reales.
- Se decida publicar en `cad.mauro42k.com`.

Si luego se requiere auth, la primera opción será:

```text
nginx basic auth
```

No se implementará login propio al inicio.

---

## 8. Repositorio y ubicación recomendada

### Nombre de repositorio recomendado

```text
cad-view
```

Motivos:

- Corto.
- Claro.
- Profesional.
- No amarra el proyecto a una tecnología específica.
- Calza con el dominio `cad.mauro42k.com`.

### Ruta local recomendada

Usar una ruta consistente con otros proyectos propios:

```text
/Users/mauro/cad-view
```

Si se quiere agrupar todos los proyectos personales/dev:

```text
/Users/mauro/Projects/cad-view
```

Recomendación final:

```text
/Users/mauro/cad-view
```

### Ubicación de este plan dentro del repo

Este documento debe guardarse como:

```text
docs/ROADMAP.md
```

Y puede ser acompañado por documentos más específicos:

```text
docs/DISCOVERY.md
docs/DECISIONS.md
docs/QA_MATRIX.md
docs/UPSTREAM_UPDATES.md
docs/DEPLOYMENT.md
docs/LEGAL_NOTES.md
```

---

## 9. Estructura esperada del proyecto

```text
cad-view/
├── src/
│   ├── App.vue
│   ├── viewer/
│   ├── styles/
│   └── config/
├── public/
├── docs/
│   ├── ROADMAP.md
│   ├── DISCOVERY.md
│   ├── DECISIONS.md
│   ├── QA_MATRIX.md
│   ├── UPSTREAM_UPDATES.md
│   ├── DEPLOYMENT.md
│   └── LEGAL_NOTES.md
├── .github/
│   └── dependabot.yml
├── package.json
├── vite.config.ts
└── README.md
```

---

## 10. Fases del proyecto

## F0 — Discovery técnico

### Objetivo

Confirmar la mejor forma de integrar `mlightcad`.

### Entregables

- `docs/DISCOVERY.md`
- `docs/DECISIONS.md`

### Debe confirmar

- Paquete correcto: `cad-viewer` o `cad-simple-viewer`.
- Requisitos reales de Node/pnpm.
- Workers necesarios.
- Configuración Vite.
- Riesgos técnicos.
- Comandos reales de build.

### Modelo Codex sugerido

```text
GPT-5.4 Mini
Razonamiento Low/Medium
```

---

## F1 — App mínima local

### Objetivo

Tener CAD View funcionando localmente.

### Incluye

- Vite + Vue 3 + TypeScript.
- Viewer integrado.
- Abrir DWG/DXF local.
- UI simple.
- Build funcionando.

### Modelo Codex sugerido

```text
GPT-5.4 Mini
Razonamiento Medium
```

---

## F2 — QA con archivos reales

### Objetivo

Probar compatibilidad real.

### Checklist

- DWG pequeño.
- DWG mediano.
- DWG pesado.
- DXF.
- Archivo 2D real.
- Archivo 3D si aplica.
- Chrome.
- Safari.
- Edge.
- Zoom.
- Pan.
- Layers.
- Measure, si está disponible.

### Modelo Codex sugerido

```text
GPT-5.4 Mini para checklist
GPT-5.5 Thinking solo si hay bug complejo
```

---

## F3 — Dependabot + documentación

### Objetivo

Dejar listo el flujo de actualizaciones upstream.

### Incluye

- `.github/dependabot.yml`
- `docs/UPSTREAM_UPDATES.md`
- `docs/LEGAL_NOTES.md`
- `README.md` actualizado

### Modelo Codex sugerido

```text
GPT-5.4 Mini
Razonamiento Low
```

---

## F4 — Deploy VPS

Solo después de que local esté validado.

### Objetivo

Publicar en:

```text
cad.mauro42k.com
```

### Incluye

- Build estático.
- Nginx.
- SSL.
- Sin storage de archivos todavía.
- Posible auth básica si se decide que hace falta.

### Modelo Codex sugerido

```text
GPT-5.4 Mini
Razonamiento Low/Medium
```

---

## F5 — Mejoras futuras

Solo después del MVP estable:

- Auth simple.
- Lista privada de archivos.
- Upload protegido.
- Export PNG/PDF.
- Historial local.
- Medición avanzada.
- Compartir vista con colegas.
- Anotaciones.

---

## 11. Estrategia de créditos Codex

Regla general:

```text
Mini para ejecución.
Thinking solo para decisiones difíciles o bugs complejos.
```

| Tipo de tarea | Modelo recomendado |
|---|---|
| Crear repo/app base | GPT-5.4 Mini |
| Revisar docs y setup | GPT-5.4 Mini |
| Integrar viewer | GPT-5.4 Mini Medium |
| UI simple | GPT-5.4 Mini Low |
| Dependabot/docs | GPT-5.4 Mini Low |
| Deploy nginx | GPT-5.4 Mini Low/Medium |
| Bugs de WASM/workers/build | GPT-5.5 Thinking |
| Decisiones de arquitectura | GPT-5.5 Thinking solo si hace falta |

---

## 12. Decisión final resumida

CAD View será una app wrapper privada, no un fork.

Usará `mlightcad` como dependencia npm.

La personalización será mínima.

Los archivos CAD se abrirán localmente en browser.

No habrá backend ni auth al inicio.

El VPS viene después de validar local.

Dependabot avisará updates con PR automático semanal.

Nada se actualiza ni despliega sin revisión.

Codex ejecutará fases pequeñas usando Mini casi siempre.

