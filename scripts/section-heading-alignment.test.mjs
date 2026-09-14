import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const styles = () => fs.readFileSync(path.join(root, 'css/format-parity.css'), 'utf8');

test('los titulares editoriales comparten una segunda línea de acento alineada', () => {
  const css = styles();

  assert.match(css, /V127 — RETÍCULA ÚNICA PARA TITULARES EDITORIALES/);
  assert.match(
    css,
    /\.editorial-garage \.sec-title \.accent,[\s\S]*?\.home-showcase \.sec-title \.accent,[\s\S]*?\.home-location \.sec-title \.accent,[\s\S]*?\.service-catalog-section \.sec-title \.accent,[\s\S]*?\.service-process-section \.sec-title \.accent,[\s\S]*?\.about-values-section \.sec-title \.accent/
  );
  assert.match(css, /display: block !important;/);
});

test('la ceja, el titular y su subrayado usan el mismo borde editorial', () => {
  const css = styles();

  assert.match(css, /--rh-editorial-heading-width: min\(100%, 42rem\);/);
  assert.match(css, /inline-size: var\(--rh-editorial-heading-width\) !important;/);
  assert.match(css, /margin-inline: 0 !important;/);
  assert.match(css, /\.sec-title \.accent::after,[\s\S]*?left: 0 !important;/);
});
