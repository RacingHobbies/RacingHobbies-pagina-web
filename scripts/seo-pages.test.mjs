import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { catalogData, generateSeoPages } from './seo-pages.mjs';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const { products, categories } = catalogData(root);
const pages = generateSeoPages(root);

test('cada producto tiene contenido HTML, URL canónica y enlaces sin ejecutar JavaScript', () => {
  const catalog = pages.get('catalogo.html');
  const sitemap = pages.get('sitemap.xml');
  for (const product of products) {
    const route = '/productos/' + product.id;
    const html = pages.get(route.slice(1) + '.html');
    assert.ok(html, product.id);
    assert.ok(html.includes(product.desc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')), product.id);
    assert.ok(html.includes('href="https://racinghobbies.net' + route + '"'), product.id);
    assert.ok(catalog.includes('href="' + route + '"'), product.id);
    assert.ok(sitemap.includes('<loc>https://racinghobbies.net' + route + '</loc>'), product.id);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /itemtype="https:\/\/schema.org\/Product"/);
    assert.match(html, /itemtype="https:\/\/schema.org\/BreadcrumbList"/);
    assert.doesNotMatch(html, /aggregateRating|reviewCount|priceValidUntil/);
    if (product.availability === 'agotado') {
      assert.match(html, /https:\/\/schema.org\/OutOfStock/);
      assert.doesNotMatch(html, new RegExp('data-add="' + product.id + '"'));
    }
    if (product.price == null) assert.doesNotMatch(html, /itemprop="price"/);
    else assert.ok(html.includes('itemprop="price" content="' + product.price + '"'), product.id);
  }
});

test('las categorías enlazan inventario real y todos los recursos de páginas anidadas usan rutas absolutas', () => {
  for (const category of categories) {
    const html = pages.get('categorias/' + category.slug + '.html');
    assert.ok(html, category.slug);
    for (const product of products.filter(product => product.cat === category.slug)) assert.ok(html.includes('href="/productos/' + product.id + '"'));
  }
  for (const [file, html] of pages) {
    if (!file.endsWith('.html') || file === 'catalogo.html') continue;
    assert.doesNotMatch(html, /(?:href|src)="(?:assets|css|js)\//, file);
    assert.doesNotMatch(html, /srcset="assets\//, file);
    assert.doesNotMatch(html, /src="[^\"]*catalog\.min\.js/, file);
    for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
      if (!/\bsrc=|rel="stylesheet"/.test(tag)) continue;
      const asset = tag.match(/(?:src|href)="([^"?]+)/)?.[1];
      assert.ok(asset?.startsWith('/'), tag);
      assert.ok(fs.existsSync(root + asset), file + ': ' + asset);
      assert.match(tag, /integrity="sha256-/);
    }
  }
});

test('el sitemap no tiene filtros, duplicados ni URLs de prueba y la generación es determinista', () => {
  const sitemap = pages.get('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, products.length + categories.length + 7);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every(url => url.startsWith('https://racinghobbies.net/') && !/[?#]/.test(url)));
  assert.deepEqual([...generateSeoPages(root)], [...pages]);
});

test('las imágenes dinámicas se resuelven desde rutas anidadas sin admitir URLs externas ni traversal', () => {
  const source = fs.readFileSync(root + '/js/main.js', 'utf8');
  const helpers = source.slice(source.indexOf('  function isProductAsset('), source.indexOf('  function productGalleryAssets('));
  const context = vm.createContext({});
  vm.runInContext(helpers, context);
  for (const asset of ['assets/img/camel-defender.webp', '/assets/img/louis/LNBA205.webp']) {
    const resolved = new URL(context.safeProductAsset(asset), 'https://racinghobbies.net/productos/camel-defender');
    assert.equal(resolved.pathname, '/' + asset.replace(/^\//, ''));
  }
  for (const unsafe of ['https://example.test/a.png', '//example.test/a.png', 'assets/img/../../private.png']) {
    assert.equal(context.safeProductAsset(unsafe), '/assets/img/logo-mark-180.webp');
  }
});

test('el arte de secciones se resuelve desde la carpeta CSS también dentro de productos', () => {
  const source = fs.readFileSync(root + '/js/main.js', 'utf8');
  const helper = source.slice(source.indexOf('  function sectorArtURL('), source.indexOf('  function initAtmosphereLoading('));
  const context = vm.createContext({
    URL,
    document: { baseURI: 'https://racinghobbies.net/productos/camel-defender' },
    getComputedStyle() { return { getPropertyValue() { return 'url("../assets/img/menu-catalog.webp")'; } }; },
  });
  vm.runInContext(helper, context);
  assert.equal(context.sectorArtURL({}), 'https://racinghobbies.net/assets/img/menu-catalog.webp');
});
