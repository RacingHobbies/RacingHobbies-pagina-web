import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mainSource = () => fs.readFileSync(path.join(project, 'js/main.js'), 'utf8');
const formatParitySource = () => fs.readFileSync(path.join(project, 'css/format-parity.css'), 'utf8');
const pages = ['index.html', 'catalogo.html', 'contacto.html', 'nosotros.html',
  'servicio-tecnico.html', 'garantia.html', 'privacidad.html', '404.html'];
const cacheVersion = file => createHash('sha256').update(fs.readFileSync(path.join(project, file))).digest('hex').slice(0, 16);

test('el carril móvil termina en la última tarjeta sin un hueco añadido', () => {
  assert.match(
    mainSource(),
    /const tailGap = \(\) =>\s*\n\s*window\.innerWidth <= 899 \? 0 : Math\.min\(120, Math\.round\(window\.innerWidth \* 0\.1\)\);/
  );
});

test('las fichas de los carriles móviles reciben un progreso de revelado completo', () => {
  assert.match(
    mainSource(),
    /item\.classList\.add\("in"\);\s*\n\s*item\.style\.setProperty\("--rv", "1"\);/
  );
});

test('un carril móvil animado no conserva un scroll horizontal que compita con GSAP', () => {
  assert.match(
    formatParitySource(),
    /\.rh-rail-built \[data-lando-htrack\] \{[\s\S]*?overflow: visible !important;[\s\S]*?scroll-snap-type: none !important;/
  );
});

test('el carril de categorías se puede montar antes de crear sus envoltorios en horizontal', () => {
  const css = formatParitySource();
  assert.match(
    css,
    /editorial-garage\[data-lando-horizontal\][\s\S]*?> \.collage-item[\s\S]*?width: max\(220px, min\(40vw, 300px\)\) !important;/
  );
  // Cabecera encima y carril a todo el ancho: con el titular en una columna
  // lateral las fichas pasaban por debajo del texto al desplazarse.
  assert.match(
    css,
    /editorial-garage\.rh-rail-built > \.container,[\s\S]*?display: flex !important;\s*\n\s*flex-direction: column !important;/
  );
});

test('los accesos flotantes no tapan tarjetas durante un carril móvil horizontal', () => {
  assert.match(mainSource(), /document\.body\.classList\.toggle\("rh-rail-active", visible\)/);
  assert.match(
    formatParitySource(),
    /@media \(orientation: landscape\) and \(max-height: 500px\) \{[\s\S]*?body\.rh-rail-active \.wa-float,[\s\S]*?body\.rh-rail-active \.back-top \{[\s\S]*?visibility: hidden !important;[\s\S]*?pointer-events: none !important;/
  );
});

test('el teléfono girado no encierra las páginas internas en un scroll propio', () => {
  const css = formatParitySource();
  // Cada sección interna llegó a medir 100svh con `overflow-y: auto`: el
  // catálogo dejaba 102px de resultados y el formulario de contacto quedaba
  // recortado. Las páginas internas deben correr en flujo natural.
  assert.doesNotMatch(
    css,
    /body:not\(\.page-home\) main > section:not\(\[data-lando-horizontal\]\)[^{]*\{[^}]*max-height: 100svh/
  );
  assert.doesNotMatch(css, /\.page-catalog \.catalog-section \.prod-grid \{[^}]*overflow-y: auto/);
});

test('el manifiesto conserva su escena animada también en apaisado', () => {
  assert.doesNotMatch(
    mainSource(),
    /initMobileManifestoMotion[\s\S]{0,600}orientation: landscape\) and \(max-height: 500px\)"\)\.matches\n\s*\) return;/
  );
  assert.match(
    formatParitySource(),
    /\.ln-manifesto\.rh-mobile-manifesto-motion \{\s*\n\s*min-height: 200svh !important;/
  );
});

test('la cabecera se recoge al bajar sólo en apaisado de teléfono', () => {
  assert.match(mainSource(), /header\.classList\.toggle\("rh-header-tucked", y > lastHeaderY\)/);
  assert.match(
    formatParitySource(),
    /@media \(orientation: landscape\) and \(max-height: 500px\) \{[\s\S]*?\.site-header\.rh-header-tucked \.logo,/
  );
});

test('los iconos de ubicación terminan antes de la pausa sin perder su orden', () => {
  const source = mainSource();
  assert.match(
    source,
    /shape\.closest\(\s*"\.page-home \.home-location \.info-list \.info-item"\s*\)/
  );
  assert.match(
    source,
    /start: locationInfoItem \? "top 140%" : "top 88%"/
  );
});

test('las páginas publicadas solicitan la versión ligada al contenido de la corrección móvil', () => {
  const version = cacheVersion('css/format-parity.css');
  pages.forEach((page) => {
    const source = fs.readFileSync(path.join(project, page), 'utf8');
    assert.match(source, new RegExp(`format-parity\\.css\\?v=${version}`), page);
  });
});
