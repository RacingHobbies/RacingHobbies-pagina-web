# Racing Hobbies Ecuador — Sitio web oficial

Sitio estático para **Racing Hobbies** (Quito, Ecuador): tienda de radio
control, repuestos y servicio técnico. La experiencia editorial se organiza
como una secuencia de escenas a pantalla completa: fondos tipo papel/paddock,
contraste claro/oscuro, naranja de la marca, tipografía cinética, navegación
inmersiva, galerías laterales, producto protagonista y movimiento continuo.

Todo el contenido (productos, precios, fotos, marcas, datos de contacto y
horarios) proviene del sitio actual de la marca (racinghobbies.net).

## Cómo verlo

No necesita dependencias para verse o publicarse: los archivos optimizados de
producción ya están incluidos. Opciones:

```bash
# Opción 1: abrir directamente
open index.html

# Opción 2: servidor local (recomendado)
python3 -m http.server 8080
# → http://localhost:8080
```

## Publicación

### Producción en Cloudflare Pages

El sitio se publica desde Cloudflare Pages y se actualiza automáticamente con
cada cambio enviado a la rama `main` de
[`RacingHobbies/RacingHobbies.github.io`](https://github.com/RacingHobbies/RacingHobbies.github.io).
El proyecto usa `scripts/package-cloudflare.sh` como comando de compilación y
publica exclusivamente `.cloudflare-pages/`; así no se exponen scripts, notas ni
otros archivos de trabajo del repositorio.

Cloudflare aplica las reglas de `_headers`, incluidas CSP estricta, HSTS,
protección anti-clickjacking y políticas de permisos. GitHub Pages queda
deshabilitado para que no haya una segunda copia pública del sitio.

Para actualizar basta con empujar a `main`:

```bash
bash scripts/build-production.sh   # si tocaste css/*.css o js/*.js
bash scripts/update-sri.sh         # recalcula integrity y la URL de caché;
                                   # sin esto el navegador bloquea el recurso
                                   # y el fallo es silencioso
                                   # (build-production.sh ya llama a este y a
                                   # update-csp-hashes.sh; ejecútalos sueltos
                                   # sólo si editaste HTML a mano)
./scripts/security-audit.sh        # debe decir OK antes de publicar
git add -A && git commit -m "…" && git push
```

### Seguridad según el hosting

| Hosting | ¿Lee `_headers`? | Qué protege al usuario |
|---|---|---|
| Netlify / Cloudflare Pages | **Sí** | Todo: CSP, HSTS, `X-Frame-Options`, `Permissions-Policy` |
| **GitHub Pages** (desactivado) | **No, lo ignora** | No se usa como hosting |
| cPanel / Apache | No | Necesitaría un `.htaccess` equivalente |

En Cloudflare Pages las cabeceras de `_headers` se sirven junto con el sitio. Si
alguna vez se activara GitHub Pages de nuevo, no podría enviar esas cabeceras ni
suplirlas desde el HTML, porque `<meta>` ignora `frame-ancestors`:

- **Anti-clickjacking** (`X-Frame-Options` / `frame-ancestors`).
- **HSTS**.
- **`Permissions-Policy`**, **COOP/CORP**.

Comprueba el resultado en <https://securityheaders.com> y con
`scripts/verify-production-security.sh`; el hosting real no debe asumirse por la
documentación del repositorio.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Portada: hero cinético, collage accionable, T-Maxx protagonista, vitrina, marcas, deck social y ubicación real |
| `catalogo.html` | Catálogo con los 51 productos reales: búsqueda, filtros, orden y selección compartible |
| `servicio-tecnico.html` | Taller: piezas, reparación, mantenimiento, diagnóstico |
| `nosotros.html` | Historia, misión y valores (texto real de la marca) |
| `contacto.html` | Formulario (abre WhatsApp) + datos de la tienda |
| `css/styles.css` | Todo el diseño (variables de color al inicio) |
| `css/styles.min.css` | Hoja optimizada que cargan las páginas publicadas |
| `js/config.js` | **Teléfono y número de WhatsApp** (cambiar aquí) |
| `js/data.js` | **Catálogo de productos** (nombres, precios, categorías, fotos) |
| `js/main.js` | Carrito, menú inmersivo, transiciones de página, scroll inercial, modal accesible, horario vivo, mapa bajo demanda, reveals, escenas GSAP, parallax y progreso de lectura |
| `js/catalog.js` | Búsqueda sin acentos, filtros/orden, atajo `/` y selección compartible |
| `js/contact.js` | Validación del formulario |
| `js/analytics.js` | Capa `dataLayer` local y eventos de navegación, ecommerce y contacto |
| `js/*.min.js` | JavaScript optimizado que cargan las páginas publicadas |
| `scripts/security-audit.sh` | Auditoría local de regresión de CSP, cabeceras, scripts y enlaces |
| `scripts/verify-production-security.sh` | Verifica cabeceras y contenido del dominio publicado |
| `SECURITY.md` | Runbook de publicación y verificación de seguridad |
| `nginx-security-headers.conf.example` | Cabeceras listas para Nginx/OpenResty |
| `.htaccess` | HTTPS, cabeceras, 404 y bloqueo de archivos sensibles para Apache/cPanel |
| `VENDOR-SHA256SUMS` | Huellas SHA-256 de los bundles de terceros y del guardia anti-clickjacking |
| `scripts/verify-domain-security.sh` | Comprueba SPF, DMARC, DNSSEC y presencia de CAA; no modifica DNS |
| `scripts/security-regression.test.mjs` | Pruebas del empaquetador, reglas Apache, página 404 y verificador CAA |
| `assets/img/` | Fotos reales de productos y logos de marcas |
| `assets/img/social/` | Pósters de los reels de Instagram que salen en "Lo que pasa en redes" |
| `assets/fonts/` | Anton y Archivo (woff2 locales, licencia OFL) |
| `_headers` | CSP, anti-clickjacking, permisos, HSTS y caché en Cloudflare Pages |
| `js/frame-guard.js` | Defensa adicional de cliente contra clickjacking |
| `.nojekyll` | Conserva compatibilidad si se publica el paquete fuera de Cloudflare Pages |
| `.gitignore` | Evita publicar capturas, logs y rutas locales en un repo público |
| `site.webmanifest` | Metadatos de instalación y color del sitio |
| `robots.txt` / `sitemap.xml` | Descubrimiento e indexación |
| `scripts/build-production.sh` | Regenera CSS/JS minificados tras editar fuentes |
| `scripts/update-sri.sh` | Recalcula SRI y URLs de caché ligadas al contenido para CSS y JavaScript |
| `scripts/update-csp-hashes.sh` | Recalcula los hashes CSP del JSON-LD y los propaga a los cuatro sitios que declaran la política |
| `scripts/package-production.sh` | Genera una carpeta publicable y un comprimido único con manifiesto SHA-256 |
| `scripts/package-cloudflare.sh` | Genera y valida `.cloudflare-pages/` para el despliegue automático, sin archivos exclusivos de Apache |

## Datos reales configurados

- **WhatsApp / celular:** 099 801 9836 (`js/config.js`)
- **Fijo:** 02 334-1561 — **Email:** racinghobbiesquito@gmail.com
- **Dirección:** Av. Eloy Alfaro N40-413 y Granados, frente a Petroecuador
- **Horarios:** Lun 10:00–14:00 — Mar–Vie 9:30–18:30 — Sáb 9:30–16:30
- **Redes:** IG/TikTok @racinghobbies, Facebook (perfil oficial)

## Ediciones frecuentes

- **Agregar/editar productos:** `RH_PRODUCTS` en `js/data.js`. Campos: `id`
  (único), `name`, `cat` (slug de `RH_CATEGORIES`), `price`, `tag`
  (`"top" | "nuevo" | "oferta" | null`), `img` (ruta en `assets/img/`),
  `desc`, `specs`.
- **Cambiar colores:** editar las variables del bloque
  **"LANDONORRIS.COM UX SYSTEM"** al final de `css/styles.css`: `--ln-paper`,
  `--ln-ink`, `--ln-dark`, `--ln-accent` y `--ln-line`.
- **Después de editar CSS o JS:** ejecuta
  `bash scripts/build-production.sh` para actualizar los archivos minificados
  que usa el sitio publicado.
- **Logo oficial:** `assets/img/logo-oficial-t.webp` (completo, fondo
  transparente, usado grande en el hero) y `assets/img/logo-mark.webp` (solo el
  óvalo, usado en header y footer).
- **Cambiar los reels de "Lo que pasa en redes":** las 7 tarjetas viven en
  `index.html` (bloque `.social-fan`). Cada una enlaza a un reel y muestra su
  póster desde `assets/img/social/`. Para reemplazar uno, copia el enlace del
  reel en Instagram y baja su póster —Instagram lo publica en la etiqueta
  `og:image`, sin necesidad de iniciar sesión:

  ```bash
  CODE=DSJDcBdj7EB   # el código que va después de /reel/
  UA="Mozilla/5.0 (compatible; facebookexternalhit/1.1)"
  IMG=$(curl -s -A "$UA" "https://www.instagram.com/reel/$CODE/" \
    | grep -o 'property="og:image" content="[^"]*"' | head -1 \
    | sed 's/.*content="//;s/"$//' | python3 -c 'import sys,html;print(html.unescape(sys.stdin.read().strip()))')
  curl -s -A "$UA" "$IMG" -o /tmp/reel.jpg
  cwebp -q 82 -resize 240 0 /tmp/reel.jpg -o assets/img/social/NOMBRE-240.webp
  cwebp -q 82 /tmp/reel.jpg -o assets/img/social/NOMBRE.webp
  ```

  Luego actualiza en esa tarjeta el `href`, el `src`/`srcset`, el `alt` y el
  `aria-label`. Los pósters llegan a 361×640, así que no conviene mostrarlos
  más anchos que eso.

## Cómo funciona la compra

El carrito se guarda en `localStorage`. Al pulsar **"Pedir por WhatsApp"** se
genera un mensaje con el detalle del pedido y el total hacia el número
configurado; pago y entrega se coordinan por chat (retiro en local o envío
por Servientrega).

## Medición y atribución

`js/analytics.js` centraliza los eventos compatibles con GA4/GTM: vistas de
página y producto, listas, selección, carrito, inicio de checkout, búsqueda,
WhatsApp, llamadas y envío de formulario. La capa conserva ecommerce real,
omite datos personales y mantiene los cinco parámetros UTM estándar al aplicar
filtros del catálogo.

No hay un ID de medición GA4 ni un contenedor GTM autorizado en este repositorio
o en la sesión de trabajo. Por eso la implementación deja `window.dataLayer`
lista para conectarse cuando el propietario facilite esas credenciales, pero no
envía datos a terceros ni inventa una propiedad, conversión o validación externa.

## Seguridad

- Sin dependencias externas ni CDNs: código, fuentes e imágenes son locales.
- `Content-Security-Policy` estricta en cada página; sin estilos ni scripts
  inline ejecutables; los dos bloques JSON-LD están autorizados mediante hash,
  sin abrir `unsafe-inline`; los atributos de evento inline están bloqueados y
  solo la portada autoriza el iframe de Google Maps.
- El mapa de Google se carga únicamente tras una acción explícita del visitante;
  antes de eso no se solicita ningún recurso de Google Maps y el iframe usa
  `sandbox` con permisos mínimos.
- `_headers` añade CSP con `frame-ancestors`, HSTS, anti-MIME-sniffing,
  aislamiento de origen, política de permisos reforzada y protección anti-clickjacking
  **solo si el hosting lee el formato** (Netlify/Cloudflare Pages y similares).
  GitHub Pages no lo hace: ver "Seguridad según el hosting" más arriba.
- Datos dinámicos renderizados con `textContent`/escape HTML; imágenes de
  productos limitadas a rutas locales permitidas; carrito validado, limitado,
  deduplicado y tolerante a datos corruptos al leer `localStorage`; búsquedas
  desde la URL limitadas a 80 caracteres; enlaces externos con
  `rel="noopener noreferrer"`.
- El script de producción fija las versiones del minificador CSS y JavaScript
  para que cada compilación sea reproducible.
- Antes de publicar, ejecuta `./scripts/security-audit.sh`; detecta regresiones
  de CSP, iframes no autorizados, scripts remotos, enlaces `_blank` inseguros,
  hashes JSON-LD desactualizados y errores de sintaxis JavaScript.
- Después de publicar, ejecuta `./scripts/verify-production-security.sh URL`;
  el despliegue debe aplicar realmente `_headers` y servir esta versión del
  sitio.
- Las páginas informativas y los enlaces de contacto siguen siendo útiles sin
  JavaScript; catálogo dinámico, carrito y validación enriquecida requieren JS.

## Rendimiento y accesibilidad

- Imágenes de catálogo en WebP: el conjunto pasa de unos 22 MB en PNG a menos
  de 3 MB, con carga diferida y dimensiones reservadas para evitar saltos.
- Navegación inmersiva responsive con bloqueo de scroll, Escape y ciclo de
  foco; modal y carrito aíslan el fondo con `inert` y devuelven el foco al
  control de origen.
- Animaciones respetan `prefers-reduced-motion`; foco visible, enlace de salto,
  regiones vivas y mensajes de error asociados a cada campo.
- Cada sección se presenta como un sector numerado, separado por una línea de
  meta animada; los barridos ambientales y la iluminación reactiva al puntero
  refuerzan la atmósfera de circuito sin bloquear la interacción.
- El estado “abierto/cerrado” se calcula en la zona horaria de Quito y el
  catálogo permite copiar o compartir la URL exacta de cualquier filtro.
