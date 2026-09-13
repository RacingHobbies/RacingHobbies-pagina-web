# Escala B del manifiesto móvil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aumentar la presencia tipográfica del manifiesto móvil a la escala B sin cambiar su coreografía de scroll ni el diseño de escritorio.

**Architecture:** La animación GSAP y el escenario sticky permanecen intactos. Una regla CSS ya específica para móviles verticales ajustará conjuntamente tamaño y ancho del bloque, para que la nueva escala conserve líneas legibles y márgenes seguros.

**Tech Stack:** HTML estático, CSS, GSAP ScrollTrigger y Playwright CLI.

---

### Task 1: Probar el contrato visual antes del cambio

**Files:**
- Modify: `css/format-parity.css:252-261`
- Test: navegador real servido desde la raíz del proyecto

- [ ] **Step 1: Escribir la prueba que expresa la escala B**

Ejecutar a 390×844 una comprobación Playwright que falle mientras `.ln-manifesto-copy` tenga menos de 60 px y su ancho sea menor al 88% del viewport:

```bash
PWCLI=/Users/danilomonge/.codex/skills/playwright/scripts/playwright_cli.sh
"$PWCLI" --session rh-scale-mobile resize 390 844
"$PWCLI" --session rh-scale-mobile reload
"$PWCLI" --session rh-scale-mobile eval "JSON.stringify((() => { const copy = document.querySelector('.ln-manifesto-copy'); const css = getComputedStyle(copy); return { fontSize: parseFloat(css.fontSize), width: copy.getBoundingClientRect().width, viewport: innerWidth }; })())"
```

- [ ] **Step 2: Verificar que falla antes de editar**

El resultado debe mostrar un tamaño menor de 60 px o un ancho menor de 343 px en 390 px de viewport.

- [ ] **Step 3: Implementar el mínimo cambio CSS**

En `css/format-parity.css`, sustituir la escala móvil vertical por:

```css
.ln-manifesto-copy {
  width: min(1240px, 90vw) !important;
  font-size: clamp(38px, min(16vw, 8.7svh), 7.8rem) !important;
  line-height: 0.96 !important;
}
```

Mantener la regla existente que permite saltos normales en `.ln-serif`.

- [ ] **Step 4: Verificar la prueba en verde**

Repetir la comprobación y confirmar un tamaño de al menos 60 px y un ancho de al menos 343 px a 390×844. Capturar los estados de inicio, 25% y final del scroll; no debe haber recortes horizontales ni errores de consola.

- [ ] **Step 5: Confirmar la ausencia de regresión en escritorio**

Abrir la portada a 1440×900, avanzar 25% dentro del manifiesto y confirmar que sus cuatro frases siguen entrando escalonadas y que la consola no contiene errores.

### Task 2: Preparar y publicar sólo el ajuste

**Files:**
- Modify: `css/format-parity.css`
- Modify: `404.html`, `catalogo.html`, `contacto.html`, `garantia.html`, `index.html`, `nosotros.html`, `privacidad.html`, `servicio-tecnico.html` únicamente si el generador de integridad los requiere

- [ ] **Step 1: Generar las firmas de los recursos**

```bash
bash scripts/update-sri.sh
```

- [ ] **Step 2: Inspeccionar el alcance antes de preparar cambios**

```bash
git status -sb
git diff --check
git diff -- css/format-parity.css
```

Preparar sólo el CSS, más las referencias de caché e integridad que correspondan al cambio; no preparar los cambios de mapa u otros archivos no relacionados.

- [ ] **Step 3: Ejecutar la verificación final**

```bash
node --check js/main.js
node --check js/main.min.js
node scripts/security-regression.test.mjs
git diff --check
```

- [ ] **Step 4: Confirmar y publicar**

```bash
git add css/format-parity.css
git commit -m "Increase mobile manifesto scale"
git push
```

Actualizar el PR existente con el nuevo commit y comprobar que la rama remota queda sincronizada.
