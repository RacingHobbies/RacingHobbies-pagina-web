# Guía de Estilo y Sistema de Diseño — Racing Hobbies Ecuador

Esta guía documenta en detalle los componentes, patrones estéticos, convenciones técnicas y criterios de consistencia para el sitio web oficial de **Racing Hobbies Ecuador** (`racinghobbies.net`).

---

## 1. Identidad Visual ("Black Racing")

La estética del sitio se inspira en el ambiente de paddock y automovilismo deportivo de alto nivel (estilo F1 / GT3):
- **Lienzo oscuro absoluto:** La base es negro puro `#000000`, evitando fondos grises planos y priorizando fondos profundos con iluminación ambiental tenue y calculada.
- **Acento Verde de Marca:** El verde `#3dfe40` (extraído del óvalo original del logotipo de Racing Hobbies) es el único acento de energía para botones principales, indicadores activos, selecciones de texto y detalles cinéticos.
- **Minimalismo y Restraint:** Líneas ultra finas (*hairlines*) de 1px semitransparentes, bordes suaves, desenfoque de fondo (*backdrop-filter: blur*), sin ruidos ni saturación excesiva de glows.
- **Contraste de Accesibilidad:** Textos y elementos interactivos cumplen o superan la relación de contraste WCAG 2.1 AA (4.5:1 para texto normal, 3:1 para componentes y textos grandes).

---

## 2. Paleta de Colores y Variables CSS

Las variables maestras se definen en `css/styles.css` (con overrides al final en el bloque **MODO CARRERA**):

### Colores Base y Superficies
```css
--bg: #000000;         /* Fondo negro puro principal */
--bg2: #0a0a0a;        /* Fondo alternativo / gradientes de sección */
--surface: #141414;    /* Tarjetas y módulos nivel 1 */
--surface-2: #1d1d1d;  /* Módulos elevados, popups y cajones */
```

### Colores de Marca y Estados
```css
--volt: #3dfe40;       /* Verde de marca exacto (CTAs, acentos, tags activos) */
--volt-deep: #0a7a12;  /* Verde oscuro para fondos claros (accesibilidad AA) */
--orange: #3dfe40;     /* Alias histórico para compatibilidad con código v1 */
--blue-el: #4dff50;    /* Variante luminosa para iconos o trazos finos */
--danger: #f5544a;     /* Rojo de error / advertencia (AA sobre fondo oscuro) */
```

### Tipografía y Líneas
```css
--txt: #f4f4f4;                      /* Texto primario de alto contraste */
--txt-dim: #b2b2b2;                  /* Texto secundario, subtítulos */
--txt-dim2: #929292;                 /* Metadatos, etiquetas pequeñas (AA >= 4.5:1) */
--hair: rgba(255, 255, 255, 0.07);   /* Borde sutil de tarjetas y divisores */
--hair2: rgba(255, 255, 255, 0.14);  /* Borde interactivo / hover */
```

### Easing y Tiempos de Transición
```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
```

---

## 3. Tipografía y Jerarquía

El sitio combina dos familias tipográficas servidas localmente en formato WOFF2:

1. **Titulares e Impacto:** `Anton` (`anton-400.woff2`)
   - Peso: `400` únicamente.
   - Usado en: `h1`, `h2`, `h3`, `.sec-title`, `.statement`, `.page-hero h1`, `.feature-name`.
   - Propiedades recomendadas:
     ```css
     font-family: "Anton", Impact, sans-serif !important;
     font-weight: 400 !important;
     letter-spacing: 0.01em !important;
     line-height: 0.92 a 0.98 !important;
     text-wrap: balance;
     ```

2. **Cuerpo, UI y Metadatos:** `Archivo` (`archivo-var.woff2`)
   - Peso variable (100 a 900).
   - Usado en: Párrafos, botones, inputs, navegación, footer, precios, etiquetas.
   - Párrafos: `font-size: 1rem; line-height: 1.55 to 1.6; color: var(--txt-dim);`

### Jerarquía de Escala
- **Page Hero Titles (`h1`):** `clamp(3.7rem, 8vw, 8rem)` (en móvil: `clamp(3rem, 16vw, 5.3rem)`)
- **Títulos de Sección (`.sec-title`):** `clamp(2.8rem, 6vw, 5.6rem)`
- **Kickers (`.kicker`):** `0.75rem`, `letter-spacing: 0.18em`, `font-weight: 700`, texto descriptivo sobre el titular.
- **Precios (`.price`, `.prod-price`):** `font-weight: 800`, destacado, formato `$XX` o `$XX.XX`.
- **Botones (`.btn`):** `0.76rem`, `letter-spacing: 0.14em`, `text-transform: uppercase` implícito en contexto.

---

## 4. Estructura de Documento HTML

Cada página debe cumplir una estructura canónica obligatoria para garantizar seguridad y rendimiento:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="...">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  
  <!-- Scripts de guardia y analítica (con SRI y versionado) -->
  <script src="js/frame-guard.min.js?v=..." integrity="sha256-..."></script>
  <script src="js/consent.min.js?v=..." integrity="sha256-..."></script>
  <script src="js/gtm-loader.min.js?v=..." integrity="sha256-..."></script>

  <!-- Metadatos de SEO y Redes -->
  <meta name="description" content="...">
  <meta name="theme-color" content="#000000">
  <meta name="color-scheme" content="dark">
  <title>...</title>
  <link rel="canonical" href="...">
  <link rel="icon" href="assets/favicon.svg?v=2" type="image/svg+xml">
  <link rel="manifest" href="site.webmanifest">
  
  <!-- Open Graph & Twitter Cards -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_EC">
  <meta property="og:site_name" content="Racing Hobbies Ecuador">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:url" content="...">
  <meta property="og:image" content="https://racinghobbies.net/assets/img/logo-oficial.png?v=2">
  <meta property="og:image:alt" content="Racing Hobbies Ecuador">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Precarga de fuentes -->
  <link rel="preload" href="assets/fonts/anton-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Hojas de estilos con SRI -->
  <link rel="stylesheet" href="css/styles.min.css?v=..." integrity="sha256-...">
  <link rel="stylesheet" href="css/typography.css?v=..." integrity="sha256-...">
  ...

  <!-- Schema.org JSON-LD autorizado por hash CSP -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    ...
  }
  </script>
</head>
<body class="page-{slug}">
  <!-- Skip link de accesibilidad -->
  <a class="skip-link" href="#main">Saltar al contenido</a>

  <!-- Header universal -->
  <header class="site-header"> ... </header>

  <!-- Contenido principal -->
  <main id="main">
    ...
  </main>

  <!-- Footer universal -->
  <footer class="site-footer"> ... </footer>

  <!-- Botón flotante WhatsApp -->
  <a class="wa-float" data-wa-link href="..." target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
    ...
  </a>

  <!-- Scripts de pie con defer y SRI -->
  <script defer src="js/config.min.js?v=..." integrity="sha256-..."></script>
  <script defer src="js/data.min.js?v=..." integrity="sha256-..."></script>
  <script defer src="js/analytics.min.js?v=..." integrity="sha256-..."></script>
  <script defer src="js/main.min.js?v=..." integrity="sha256-..."></script>
</body>
</html>
```

---

## 5. Componentes UI Clave

### 5.1. Botones (`.btn`)
- **Primario (`.btn.btn-volt`):**
  - Fondo verde de marca `#3dfe40`, texto oscuro `#0a0a0a`.
  - Para acciones principales (e.g. "Ver catálogo", "Agregar al carrito", "Enviar mensaje").
- **Secundario (`.btn.btn-line`):**
  - Fondo transparente, borde de 1px (`var(--hair2)`), texto blanco/gris claro.
  - Para acciones complementarias (e.g. "Servicio técnico", "Ver ficha").
- **Botón compacto (`.btn-sm`):** Altura reducida para barras laterales o mapas.

### 5.2. Tarjetas de Producto y Módulos (`.card`, `.step-card`, etc.)
- Bordes: `1px solid var(--hair)` o `rgba(255, 255, 255, 0.08)`.
- Radio de borde: `12px` a `18px` según el tamaño del módulo.
- Fondo: Gradientes sutiles oscuros (`linear-gradient(155deg, #1d1d1d, #0d0d0d)`).
- Sombras: Suaves y difusas (`box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`).

### 5.3. Navegación y Menú Móvil
- Desktop: Barra superior traslúcida con desenfoque (`backdrop-filter: blur(14px)`), borde inferior hairline.
- Móvil: Menú colapsable a pantalla completa con navegación por teclado accesible, bloqueo de scroll en el body, soporte para tecla `Escape` y ciclo de foco (*focus trap*).

### 5.4. Carrito de Compras Drawer
- Desplegable lateral con `inert` en el resto del documento al estar abierto.
- Estado sincronizado con `localStorage` usando identificadores `id` limpios y enteros de cantidad.
- Salida final: Generación de enlace con texto formateado hacia WhatsApp oficial (`js/config.js`).

---

## 6. Tratamiento de Imágenes y Recursos

- **Formato:** Todas las imágenes de catálogo, héroes y fondos deben estar en formato **WebP**.
- **Dimensiones y variantes:**
  - Miniatura / tarjeta: `-480.webp` (ancho 480px).
  - Mediana / tablet: `-640.webp` (ancho 640px).
  - Completa: `.webp` (sin sufijo, ancho máximo recomendado 1200px a 1400px).
- **Etiquetas `img` obligatorias:**
  - Especificar siempre `width` y `height` nativos para prevenir Cumulative Layout Shift (CLS).
  - Usar `decoding="async"`.
  - Usar `loading="lazy"` para imágenes debajo del pliegue (*below the fold*).
  - Usar `fetchpriority="high"` únicamente en la imagen visual principal del hero.
  - Textos alternativos descriptivos en `alt="..."` (o `alt=""` con `aria-hidden="true"` si es netamente decorativa).

---

## 7. Accesibilidad (A11y) y Rendimiento

1. **Movimiento reducido:** Toda animación interactiva o decorativa debe estar subordinada a:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
2. **Visibilidad de Foco:** Nunca remover `outline: none` sin proveer `:focus-visible` de alto contraste:
   ```css
   :focus-visible {
     outline: 2.5px solid var(--volt);
     outline-offset: 3px;
   }
   ```
3. **Enlaces accesibles:** Enlaces de llamada y WhatsApp deben llevar `aria-label` cuando el texto visual no sea autodescriptivo.
4. **Semántica:** Uso estricto de elementos semánticos: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<aside>`, `<button type="button">`.
