import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(project, file), 'utf8');

test('las secciones no repiten su título en un rótulo flotante', () => {
  assert.doesNotMatch(read('css/styles.css'), /data-race-label/);
  assert.doesNotMatch(read('css/styles.min.css'), /data-race-label/);

  ['catalogo.html', 'servicio-tecnico.html', 'nosotros.html', 'contacto.html', 'garantia.html', 'privacidad.html', '404.html'].forEach((file) => {
    assert.doesNotMatch(read(file), /data-race-label/, file);
  });
});

test('la interfaz no muestra rótulos HUD que no aportan información', () => {
  const styles = read('css/styles.css');
  assert.doesNotMatch(styles, /RACING SYSTEM\s*\/\s*01/);
  assert.doesNotMatch(styles, /RACING HOBBIES\s*\/\/\s*ECUADOR/);
  assert.doesNotMatch(styles, /RACING\s*\/\s*SELECT/);
});

test('los textos públicos no usan el separador decorativo', () => {
  ['index.html', 'catalogo.html', 'contacto.html', 'nosotros.html', 'servicio-tecnico.html', 'garantia.html', 'privacidad.html', '404.html'].forEach((file) => {
    assert.doesNotMatch(read(file), /·/, file);
  });
});
