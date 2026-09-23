import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function productsFromData() {
  const context = {};
  vm.runInNewContext(`${read('js/data.js')}\nthis.products = RH_PRODUCTS;`, context);
  return context.products;
}

test('el inventario conserva todos los productos agotados que muestra la tienda', () => {
  const expectedSoldOut = [
    'k5-blazer',
    'lc80-v2',
    'mercedes-190e',
    'subaru-impreza',
    'mercedes-c11',
    'ranger-v2',
    'stryker-180',
    'blade-150fx',
  ];
  const actualSoldOut = productsFromData()
    .filter((product) => product.availability === 'agotado')
    .map((product) => product.id);

  assert.deepEqual(Array.from(actualSoldOut), expectedSoldOut);
});

test('cualquier producto agotado recibe el estado visual y de interacción completo', () => {
  const source = read('js/main.js');

  assert.match(source, /function isSoldOut\(p\)\s*\{[\s\S]*?availability === "agotado"/);
  assert.match(source, /element\.classList\.toggle\("is-sold-out", soldOut\)/);
  assert.match(source, /(?:watermark|soldOutWatermark)\.className = "sold-out-watermark"/);
  assert.match(source, /add\.disabled = soldOut/);
  assert.match(source, /syncEditorialProductStates\(\)/);
});

test('el oscurecido ocupa la ficha completa y no sólo los píxeles de la foto', () => {
  const styles = read('css/styles.css');

  assert.match(
    styles,
    /\.prod-card\.is-sold-out::after,[\s\S]*?\.tile\.is-sold-out::after,[\s\S]*?\.feature-visual\.is-sold-out::after,[\s\S]*?\.collage-item\.is-sold-out::after/
  );
  assert.match(styles, /\.is-sold-out::after\s*\{[\s\S]*?inset:\s*0;[\s\S]*?pointer-events:\s*none;/);
  assert.match(styles, /\.is-sold-out \.sold-out-watermark\s*\{[\s\S]*?z-index:\s*\d+/);
});
