# Directrices para Agentes de IA (AGENTS.md)

Este documento es de lectura **obligatoria** para cualquier agente de IA (Claude, Copilot, Cursor, ChatGPT, Antigravity, etc.) que trabaje en el repositorio de **Racing Hobbies Ecuador**.

---

## 1. Principio Fundamental y Regla de Oro

> **REGLA ZERO: NO ALTERAR LA ESTÉTICA NI EL CONTENIDO SIN INSTRUCCIÓN EXPLÍCITA.**
> El sitio web posee una dirección de arte y experiencia editorial sumamente calibrada ("Black Racing", minimalismo automotriz F1/paddock, fondo negro absoluto, acento verde `#3dfe40`, tipografías Anton y Archivo, animaciones cinéticas controladas).
> **Cualquier cambio no solicitado en diseño, tipografía, paleta de colores, espaciados o contenidos viola los objetivos del proyecto.**

---

## 2. Pila Tecnológica y Arquitectura

- **Arquitectura:** Sitio web estático puro (Vanilla HTML5, CSS3 moderno, JavaScript ES6+ sin frameworks ni bundlers pesados de runtime).
- **Páginas (8 HTML):**
  - `index.html` (Portada / Hero cinético / Showcase / Manifiesto / Ubicación)
  - `catalogo.html` (Catálogo con 51+ productos, filtros, búsqueda, URL params)
  - `servicio-tecnico.html` (Taller y soporte técnico)
  - `nosotros.html` (Historia, misión y valores de la marca)
  - `contacto.html` (Formulario que valida y envía a WhatsApp)
  - `garantia.html` (Políticas de garantía)
  - `privacidad.html` (Política de privacidad y cookies)
  - `404.html` (Página de error)
- **CSS:**
  - `css/styles.css`: Estilos principales. Variables base al inicio (`:root`), componentes y al final la capa de override **MODO CARRERA**.
  - `css/typography.css`: Jerarquía y fuentes tipográficas globales.
  - Hojas de soporte: `home-responsive.css`, `community-fix.css`, `format-parity.css`, `cta-cards.css`.
  - **PROHIBIDO:** Editar directamente `css/styles.min.css`.
- **JavaScript:**
  - Módulos en `js/*.js` encapsulados en IIFEs `(function () { "use strict"; ... })();`.
  - Utilidades expuestas en el namespace global `window.RH` cuando es necesario.
  - **PROHIBIDO:** Editar directamente archivos `js/*.min.js`.
- **Compilación / Build:**
  - `scripts/build-production.sh` ejecuta `lightningcss-cli` y `terser` en versiones fijas.
  - Recalcula hashes SRI (`update-sri.sh`) y hashes de JSON-LD para CSP (`update-csp-hashes.sh`).

---

## 3. Seguridad Estricta (CSP, SRI y Sanitización)

1. **Content Security Policy (CSP):**
   - **`style-src-attr 'none'` y `style-src 'self'`:** Está **estrictamente prohibido** agregar atributos `style="..."` inline o etiquetas `<style>` dentro del HTML. Todos los estilos deben residir en las hojas de estilo externas.
   - **`script-src-attr 'none'`:** Está **estrictamente prohibido** agregar manejadores de eventos inline en HTML (como `onclick="..."`, `onsubmit="..."`, `onload="..."`). Todo evento debe adjuntarse mediante `addEventListener` en archivos `.js`.
   - **JSON-LD autorizado por Hash:** Los scripts `<script type="application/ld+json">` en el `<head>` requieren hashes SHA-256 autorizados en la CSP. Si modificas un bloque JSON-LD, debes ejecutar `scripts/update-csp-hashes.sh`.
   - **`frame-src https://www.google.com`:** Solo el mapa interactivo (bajo consentimiento) puede cargar un iframe.
2. **Subresource Integrity (SRI):**
   - Toda etiqueta `<link rel="stylesheet">` y `<script>` en HTML lleva un atributo `integrity="sha256-..."` y parámetro `?v=...`.
   - Tras modificar cualquier archivo en `css/` o `js/`, es obligatorio correr `bash scripts/build-production.sh` para actualizar los `.min.*`, la versión de caché `?v=` y los hashes SRI.
3. **Manejo de Datos y XSS:**
   - Todo renderizado dinámico en JS debe usar `textContent` o escape seguro (`RH.escapeHtml`). **Nunca** inyectar cadenas no confiables directamente con `innerHTML`.
   - Los enlaces a sitios externos deben incluir `rel="noopener noreferrer"`.
   - Los atributos `target="_blank"` deben reservarse para enlaces externos (WhatsApp, redes sociales, Google Maps).

---

## 4. Estándares de Diseño y UI ("Black Racing")

Si alguna tarea requiere agregar o modificar elementos UI, deben respetarse minuciosamente estos criterios:

### Colores Clave
- **Fondo primario:** `#000000` (negro absoluto de lienzo)
- **Superficies / Cards:** `#0a0a0a` (bg2), `#141414` (surface), `#1d1d1d` (surface-2)
- **Acento Verde de Marca:** `#3dfe40` (color exacto del logo, para CTAs, estados activos, selecciones y acentos sobre fondo oscuro)
- **Verde profundo (para fondos claros si aplica):** `#0a7a12` (mínimo contraste AA 4.9:1)
- **Texto principal:** `#f4f4f4`
- **Texto atenuado / secundario:** `#b2b2b2` / `#929292` (mínimo contraste AA)
- **Líneas / Bordes hairlines:** `rgba(255, 255, 255, 0.07)` (`--hair`) y `rgba(255, 255, 255, 0.14)` (`--hair2`)

### Tipografía
- **Titulares e Impacto:** `"Anton", Impact, sans-serif`
  - Uso: `h1`, `h2`, `h3`, `.sec-title`, `.statement`, `.page-hero h1`.
  - Peso único: `400`.
  - Letter-spacing: `0.01em`.
  - Line-height apretado: `0.92` a `0.98`.
- **Cuerpo, UI, Botones y Datos:** `"Archivo", Arial, sans-serif`
  - Uso: párrafos, botones (`.btn`), kickers, navegación, formularios, tablas, precios.
  - Kickers (`.kicker`): `0.75rem`, `letter-spacing: 0.18em`, `text-transform: uppercase` implícito o tipográfico.
  - Botones (`.btn`): `0.76rem`, `letter-spacing: 0.14em`, `font-weight: 700+`.

### Botones y Controles
- `.btn.btn-volt`: Fondo verde `#3dfe40`, texto `#0a0a0a`, hover con leve escala o iluminación.
- `.btn.btn-line`: Borde tenue (`var(--hair2)`), fondo transparente, texto `#f4f4f4`.
- Todo botón interactivo debe tener `:focus-visible` definido con contorno visible (`outline: 2.5px solid var(--orange)` u outline correspondiente).

### Animaciones y Rendimiento
- Respetar siempre `@media (prefers-reduced-motion: reduce)`.
- No forzar repaints ni lecturas de `scrollHeight`/`offsetTop` dentro de ciclos de scroll frecuentes.
- En dispositivos táctiles y pantallas pequeñas, evitar parallax pesado o scrubs complejos.

---

## 5. Estructura y Flujo de Trabajo para Agentes

Al realizar cualquier intervención en el repositorio:

1. **Lectura previa:** Consulta `CONTRIBUTING.md` y `.github/STYLE_GUIDE.md`.
2. **Modificación de archivos fuente:**
   - Modifica `css/styles.css` (o CSS específico), no `.min.css`.
   - Modifica `js/*.js`, no `.min.js`.
   - Modifica los archivos `.html` respetando metaetiquetas, precargas de fuentes y orden de scripts.
3. **Pipeline de compilación y verificación:**
   ```bash
   bash scripts/build-production.sh
   bash scripts/security-audit.sh
   node --test scripts/*.test.mjs
   ```
   - Si la auditoría (`security-audit.sh`) reporta algún fallo (CSP, SRI, enlaces inseguros, etc.), corrígelo antes de considerar el trabajo completado.
4. **Git:**
   - Revisa `git status` y `git diff`.
   - Asegúrate de no incluir archivos basura (`.DS_Store`, carpetas temporales ignoradas).
   - Genera commits concisos y con prefijos claros (`docs:`, `fix:`, etc.).
