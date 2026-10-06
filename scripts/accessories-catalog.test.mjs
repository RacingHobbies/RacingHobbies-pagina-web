import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function catalogData() {
  const context = {};
  vm.runInNewContext(`${read('js/data.js')}\nthis.categories = RH_CATEGORIES; this.products = RH_PRODUCTS;`, context);
  return context;
}

test('el catálogo incluye cargadores SkyRC y radios FlySky en categorías propias', () => {
  const { categories, products } = catalogData();
  assert.deepEqual(
    Array.from(categories)
      .filter((category) => ['cargadores', 'radios'].includes(category.slug))
      .map((category) => category.slug),
    ['cargadores', 'radios'],
  );

  const expectedIds = [
    'skyrc-d260',
    'skyrc-t120-pico',
    'skyrc-s65',
    'skyrc-e450',
    'skyrc-en18',
    'flysky-fs-g11p',
    'flysky-noble-nb4-pro',
    'flysky-fs-g7p-plus',
    'flysky-fs-gt3c',
    'flysky-fs-gt3b',
  ];
  const accessories = Array.from(products).filter((product) => expectedIds.includes(product.id));
  assert.deepEqual(accessories.map((product) => product.id), expectedIds);
  accessories.forEach((product) => {
    assert.ok(fs.existsSync(path.join(root, product.img)), product.img);
  });
});

test('los accesorios tienen los precios confirmados por la tienda', () => {
  const { products } = catalogData();
  const prices = Object.fromEntries(
    Array.from(products)
      .filter((product) => [
        'skyrc-d260', 'skyrc-t120-pico', 'skyrc-s65', 'skyrc-e450',
        'skyrc-en18', 'flysky-fs-g11p', 'flysky-noble-nb4-pro',
        'flysky-fs-g7p-plus', 'flysky-fs-gt3c', 'flysky-fs-gt3b',
      ].includes(product.id))
      .map((product) => [product.id, product.price]),
  );
  assert.deepEqual(prices, {
    'skyrc-d260': 270,
    'skyrc-t120-pico': 130,
    'skyrc-s65': 85,
    'skyrc-e450': 60,
    'skyrc-en18': 35,
    'flysky-fs-g11p': 350,
    'flysky-noble-nb4-pro': 850,
    'flysky-fs-g7p-plus': 215,
    'flysky-fs-gt3c': 125,
    'flysky-fs-gt3b': 75,
  });
});

test('las nuevas radios FlySky incluyen una lámina adicional en su galería', () => {
  const { products } = catalogData();
  const expectedGalleries = {
    'flysky-fs-g7p-plus': ['assets/img/flysky-fs-g7p-plus-specs.png'],
    'flysky-fs-gt3c': ['assets/img/flysky-fs-gt3c-specs.png'],
    'flysky-fs-gt3b': ['assets/img/flysky-fs-gt3b-specs.png'],
  };
  const actualGalleries = Object.fromEntries(
    Array.from(products)
      .filter((product) => product.id in expectedGalleries)
      .map((product) => [product.id, Array.from(product.gallery || [])]),
  );
  assert.deepEqual(actualGalleries, expectedGalleries);
  Object.values(expectedGalleries).flat().forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  });
});

test('ordenar por precio deja las consultas después de los productos con precio', () => {
  const source = read('js/catalog.js');
  assert.match(source, /function comparePrice\(a, b, direction\)/);
  assert.match(source, /if \(!aHasPrice\) return 1/);
  assert.match(source, /if \(!bHasPrice\) return -1/);
});

test('los productos sin precio se consultan y no se pueden añadir al carrito', () => {
  const source = read('js/main.js');
  assert.match(source, /function hasPrice\(p\)/);
  assert.match(source, /hasPrice\(getProduct\(it\.id\)\)/);
  assert.match(source, /if \(!p \|\| isSoldOut\(p\) \|\| !hasPrice\(p\)\) return/);
  assert.match(source, /Consultar precio/);
  assert.match(source, /Consultar por WhatsApp/);
});

test('las fotos JPEG suministradas se aceptan sin generar rutas de variantes inexistentes', () => {
  const source = read('js/main.js');
  assert.ok(source.includes('(?:webp|jpe?g|png)'));
  assert.ok(source.includes('if (/\\.webp$/i.test(asset))'));
});
