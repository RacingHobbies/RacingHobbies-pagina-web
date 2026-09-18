import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pages = ['index.html', 'catalogo.html', 'contacto.html', 'nosotros.html',
  'servicio-tecnico.html', 'garantia.html', 'privacidad.html'];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('la capa pública usa racinghobbies.net como único origen canónico', () => {
  for (const file of pages) {
    const html = read(file);
    assert.match(html, /<link rel="canonical" href="https:\/\/racinghobbies\.net\//, file);
    assert.match(html, /<meta property="og:url" content="https:\/\/racinghobbies\.net\//, file);
    assert.match(html, /<meta property="og:image:alt" content="Racing Hobbies Ecuador">/, file);
    assert.match(html, /<meta name="twitter:title" content="[^\"]+">/, file);
    assert.match(html, /<meta name="twitter:description" content="[^\"]+">/, file);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/racinghobbies\.net\//, file);
    assert.doesNotMatch(html, /racinghobbiesec\.com/, file);
  }
  assert.match(read('index.html'), /<meta name="google-site-verification" content="[A-Za-z0-9_-]+">/);
  assert.doesNotMatch(read('robots.txt'), /racinghobbiesec\.com/);
  assert.doesNotMatch(read('sitemap.xml'), /racinghobbiesec\.com/);
  assert.match(read('_redirects'), /\/catalogo\.html\s+\/catalogo\s+308/);
});

test('cada página indexable carga el módulo de medición con SRI', () => {
  for (const file of pages) {
    const html = read(file);
    assert.match(html, /<script defer src="js\/analytics\.min\.js\?v=[0-9a-f]+" integrity="sha256-[^"]+"><\/script>/, file);
  }
  assert.match(read('scripts/package-production.mjs'), /'_redirects'/);
});

test('el catálogo conserva la atribución UTM al actualizar sus filtros', () => {
  const source = read('js/catalog.js');
  assert.match(source, /utm_source/);
  assert.match(source, /utm_medium/);
  assert.match(source, /utm_campaign/);
  assert.match(source, /utm_content/);
  assert.match(source, /utm_term/);
  assert.match(source, /attributionParams/);
});

test('la capa dataLayer deduplica page_view y conserva ecommerce real', () => {
  const source = read('js/analytics.js');
  const listeners = {};
  const window = {
    dataLayer: [],
    location: { origin: 'https://racinghobbies.net', href: 'https://racinghobbies.net/catalogo', pathname: '/catalogo', search: '' },
    document: null,
  };
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  window.document = document;
  vm.runInNewContext(source, { window, document, console, URL });

  assert.ok(window.RH_ANALYTICS, 'expone la API central');
  listeners.DOMContentLoaded();
  window.RH_ANALYTICS.pageView();
  window.RH_ANALYTICS.viewItemList('Catálogo', [{
    id: 'tmaxx', name: 'Traxxas T-Maxx Nitro 4WD', price: 800, cat: 'monster', brand: 'Traxxas',
  }]);
  window.RH_ANALYTICS.addToCart({
    id: 'tmaxx', name: 'Traxxas T-Maxx Nitro 4WD', price: 800, cat: 'monster', brand: 'Traxxas',
  }, 2);

  const events = window.dataLayer.filter(item => item && item.event);
  assert.equal(events.filter(item => item.event === 'page_view').length, 1);
  assert.deepEqual(events.map(item => item.event), ['page_view', 'view_item_list', 'add_to_cart']);
  assert.equal(events[1].items[0].item_id, 'tmaxx');
  assert.equal(events[2].items[0].quantity, 2);
  assert.equal(events[2].value, 1600);
  assert.doesNotMatch(JSON.stringify(events), /099|Nombre|Teléfono|message/i);
});
