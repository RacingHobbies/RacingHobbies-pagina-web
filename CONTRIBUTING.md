# Cómo contribuir a Racing Hobbies Ecuador

Guía de contribución para colaboradores humanos y agentes de IA. Antes de
cualquier cambio, lee esta guía y `AGENTS.md` (para agentes) o
`.github/STYLE_GUIDE.md` (referencia visual y de código completa).

> **Regla cero:** no rompas la estética actual. Este sitio tiene una identidad
> visual muy definida (negro puro, verde de marca, tipografía cinética,
> atmósfera de carreras por restraint). Cualquier cambio debe ser indistinguible
> del trabajo existente.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Markup | HTML5 estático, 8 páginas |
| Estilos | CSS puro (variables, `clamp`, `@media`), sin preprocesadores |
| JavaScript | Vanilla ES6+ en IIFEs con `"use strict"`, sin frameworks |
| Fuentes | Anton (display) + Archivo variable (body), woff2 locales |
| Imágenes | WebP con variantes de ancho (`-480`, `-640`, full), `srcset` |
| Build | `lightningcss-cli` (CSS) + `terser` (JS), versiones fijadas |
| Seguridad | CSP estricta, SRI en todos los assets, hashes JSON-LD |
| Hosting | Cloudflare Pages (auto-deploy desde `main`) |
| CI | GitHub Actions (`quality.yml`): tests, auditoría, build |

## Flujo de trabajo

### 1. Antes de editar

```bash
git checkout main
git pull origin main
git checkout -b feat/descripcion-breve
```

### 2. Editar fuentes (nunca `.min.*`)

- **CSS:** edita `css/styles.css` o los archivos auxiliares (`typography.css`,
  `community-fix.css`, `home-responsive.css`, `format-parity.css`,
  `cta-cards.css`). **Nunca** edites `styles.min.css`.
- **JS:** edita `js/<modulo>.js`. **Nunca** edites `js/<modulo>.min.js`.
- **HTML:** edita las páginas directamente, respetando la estructura del
  `<head>` (ver `.github/STYLE_GUIDE.md`).

### 3. Regenerar producción

```bash
bash scripts/build-production.sh   # minifica CSS/JS + actualiza SRI + CSP
```

Este script ya invoca `update-sri.sh` y `update-csp-hashes.sh`. Solo ejecútalos
por separado si editaste HTML sin tocar CSS ni JS.

### 4. Verificar

```bash
./scripts/security-audit.sh         # debe decir OK
./scripts/verify-build-freshness.sh # comprueba reproducibilidad
node --test scripts/*.test.mjs      # tests de regresión
```

### 5. Commit y push

```bash
git add -A
git commit -m "feat: descripción clara del cambio"
git push origin feat/descripcion-breve
```

Abre un PR a `main`. CI ejecuta las mismas comprobaciones.

## Convenciones de commit

Usa prefijos semánticos:

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad o sección |
| `fix:` | Corrección de errores |
| `style:` | Cambios solo visuales (CSS) |
| `content:` | Actualización de textos o productos |
| `security:` | Cambios de CSP, SRI, cabeceras |
| `docs:` | Solo documentación |
| `chore:` | Scripts, CI, configuración |

## Qué NO hacer

1. **No añadas dependencias de npm** al runtime. El sitio es estático puro.
2. **No uses `<style>` inline** ni atributos `style="…"`. La CSP lo bloquea.
3. **No uses `onclick` ni event handlers en HTML**. `script-src-attr 'none'`.
4. **No añadas scripts externos** sin actualizar la CSP en los 4 sitios que
   la declaran (`_headers`, `<meta>` en cada HTML, `.htaccess`, `nginx-*.conf`).
5. **No edites archivos `.min.*`** directamente; se regeneran con el build.
6. **No cambies colores ni fuentes** sin coordinar con el propietario.
7. **No subas imágenes PNG/JPG** al catálogo; convierte a WebP primero.
8. **No borres comentarios** existentes en el código.

## Estructura de archivos relevantes

```
├── index.html, catalogo.html, …   ← 8 páginas HTML
├── css/
│   ├── styles.css                  ← diseño principal (variables al inicio,
│   │                                  MODO CARRERA al final)
│   ├── styles.min.css              ← generado (no editar)
│   ├── typography.css              ← escala tipográfica global
│   ├── community-fix.css           ← ajustes sección social
│   ├── home-responsive.css         ← responsive portada
│   ├── format-parity.css           ← paridad visual entre páginas
│   └── cta-cards.css               ← tarjetas CTA
├── js/
│   ├── config.js                   ← teléfono/WhatsApp (editar aquí)
│   ├── data.js                     ← catálogo de productos
│   ├── main.js                     ← núcleo: header, carrito, reveals, GSAP
│   ├── catalog.js                  ← filtros, búsqueda, orden
│   ├── contact.js                  ← validación formulario
│   ├── analytics.js                ← dataLayer GA4/GTM
│   ├── consent.js                  ← consentimiento medición
│   ├── gtm-loader.js               ← carga condicional de GTM
│   ├── frame-guard.js              ← anti-clickjacking cliente
│   └── *.min.js                    ← generados (no editar)
├── assets/
│   ├── fonts/                      ← anton-400.woff2, archivo-var.woff2
│   ├── img/                        ← productos, logos, social
│   └── favicon.svg
├── scripts/                        ← build, auditoría, empaquetado
├── _headers                        ← cabeceras Cloudflare Pages
├── _redirects                      ← redirecciones Cloudflare
├── .htaccess                       ← equivalente Apache
└── SECURITY.md                     ← runbook de publicación
```

## Agregar un producto al catálogo

1. Prepara la imagen en WebP con 3 variantes:
   - `nombre-producto-480.webp` (480px ancho)
   - `nombre-producto-640.webp` (640px ancho)
   - `nombre-producto.webp` (tamaño completo, ≤1200px)
2. Coloca las 3 imágenes en `assets/img/`.
3. Añade la entrada en `RH_PRODUCTS` dentro de `js/data.js`:

```javascript
{
  id: "nombre-producto",         // slug único, kebab-case
  name: "Nombre del Producto",
  cat: "crawlers",               // slug de RH_CATEGORIES
  price: 250,                    // número entero o decimal (USD)
  tag: "nuevo",                  // "top" | "nuevo" | "oferta" | null
  img: "assets/img/nombre-producto.webp",
  desc: "Descripción breve.",
  specs: ["Especificación 1", "Especificación 2"]
}
```

4. Ejecuta `bash scripts/build-production.sh`.
5. Verifica con `./scripts/security-audit.sh`.
