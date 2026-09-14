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

test('las páginas publicadas solicitan la versión ligada al contenido de la corrección móvil', () => {
  const version = cacheVersion('css/format-parity.css');
  pages.forEach((page) => {
    const source = fs.readFileSync(path.join(project, page), 'utf8');
    assert.match(source, new RegExp(`format-parity\\.css\\?v=${version}`), page);
  });
});
