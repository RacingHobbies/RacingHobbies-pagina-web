import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(project, file), 'utf8');

test('las etiquetas de las secciones se describen por su contenido, no por un número', () => {
  assert.match(read('css/styles.css'), /content:\s*attr\(data-race-label\)/);
  assert.match(read('css/styles.min.css'), /content:attr\(data-race-label\)/);

  const expectedLabels = {
    'catalogo.html': ['CATEGORÍAS RC', 'PEDIDOS ESPECIALES'],
    'servicio-tecnico.html': ['TALLER RC', 'REPARACIÓN RC', 'AGENDA TU SERVICIO'],
    'nosotros.html': ['PASIÓN POR EL RC', 'VALORES DE RACING HOBBIES', 'RACING HOBBIES EN QUITO'],
    'contacto.html': ['HABLEMOS DE TU RC'],
    'garantia.html': ['GARANTÍA DEL FABRICANTE'],
    'privacidad.html': ['TUS DATOS CON NOSOTROS'],
    '404.html': ['VUELVE A LA PISTA'],
  };

  Object.entries(expectedLabels).forEach(([file, labels]) => {
    const source = read(file);
    labels.forEach((label) => {
      assert.match(source, new RegExp(`data-race-label="${label}"`), `${file}: ${label}`);
    });
  });
});

test('los textos públicos no usan el separador decorativo', () => {
  ['index.html', 'catalogo.html', 'contacto.html', 'nosotros.html', 'servicio-tecnico.html', 'garantia.html', 'privacidad.html', '404.html'].forEach((file) => {
    assert.doesNotMatch(read(file), /·/, file);
  });
});
