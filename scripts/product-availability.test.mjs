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
  assert.match(mainSource, /syncFeaturedProductState/);
  assert.match(mainSource, /syncEditorialProductStates/);
  assert.match(
    mainSource,
    /p\.availability !== "agotado"[\s\S]*?p\.tag === "top" \|\| p\.tag === "nuevo"/
  );
  assert.match(stylesSource, /\.sold-out-watermark[\s\S]*?color:\s*#e53935/);
  assert.match(stylesSource, /\.is-sold-out \.feature-img[\s\S]*?brightness\(0\.7\)/);
  assert.match(stylesSource, /\.is-sold-out > img[\s\S]*?brightness\(0\.7\)/);
});
