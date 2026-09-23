import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const css = fs.readFileSync('css/styles.css', 'utf8');
const js = fs.readFileSync('js/main.js', 'utf8');
const pages = [
  'index.html',
  'catalogo.html',
  'servicio-tecnico.html',
  'nosotros.html',
  'contacto.html',
  'garantia.html',
  'privacidad.html',
  '404.html',
];

test('the visual layer exposes shared motion and surface tokens', () => {
  assert.match(css, /--rh-motion-fast:/);
  assert.match(css, /--rh-motion-smooth:/);
  assert.match(css, /--rh-surface-glass:/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('floating consent UI reserves a desktop-safe footprint', () => {
  assert.match(css, /\.consent-banner[\s\S]*?max-width:\s*560px/);
  assert.match(css, /\.consent-banner[\s\S]*?env\(safe-area-inset-bottom\)/);
});

test('the motion layer has a reduced-motion escape hatch', () => {
  assert.match(js, /const REDUCED = window\.matchMedia/);
  assert.match(css, /\.js \.reveal[\s\S]*?transition/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*?\.js \.reveal/);
});

test('every public page keeps the shared published stylesheet', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /css\/styles\.min\.css\?v=[a-f0-9]{16}/i, page);
    assert.match(html, /integrity="sha256-[A-Za-z0-9+/=]+"/, page);
  }
});
