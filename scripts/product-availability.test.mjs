import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dataSource = fs.readFileSync('js/data.js', 'utf8');
const mainSource = fs.readFileSync('js/main.js', 'utf8');
const stylesSource = fs.readFileSync('css/styles.css', 'utf8');
const soldOutIds = [
  'stryker-180',
  'blade-150fx',
  'k5-blazer',
  'lc80-v2',
  'mercedes-190e',
  'subaru-impreza',
  'mercedes-c11',
  'ranger-v2',
];

test('los productos agotados aparecen marcados y no se pueden añadir al carrito', () => {
  soldOutIds.forEach((id) => {
    assert.match(
      dataSource,
      new RegExp(`id: "${id}"[\\s\\S]*?availability: "agotado"`),
      id,
    );
  });
  assert.match(mainSource, /p\.availability === "agotado"/);
  assert.match(mainSource, /add\.disabled = soldOut/);
  assert.match(mainSource, /soldOutWatermark/);
  assert.match(stylesSource, /\.sold-out-watermark[\s\S]*?color:\s*#e53935/);
});
