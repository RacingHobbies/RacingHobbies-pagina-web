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
    assert.match(html, /<script src="js\/consent\.min\.js\?v=[0-9a-f]+" integrity="sha256-[^"]+"><\/script>/, file);
    assert.match(html, /<script src="js\/gtm-loader\.min\.js\?v=[0-9a-f]+" integrity="sha256-[^"]+"><\/script>/, file);
  }
  assert.match(read('js/gtm-loader.js'), /GTM-PHWK4J3L/);
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

test('las búsquedas con apariencia de correo o teléfono no salen al dataLayer', () => {
  const listeners = {};
  const window = {
    dataLayer: [],
    location: { origin: 'https://racinghobbies.net', pathname: '/catalogo' },
    document: null,
  };
  const document = {
    title: 'Catálogo',
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  window.document = document;
  vm.runInNewContext(read('js/analytics.js'), { window, document, console, URL });
  window.RH_ANALYTICS.search('motor crawler', 4);
  window.RH_ANALYTICS.search('cliente@example.com', 4);
  window.RH_ANALYTICS.search('+593 099 801 9836', 4);
  const searches = window.dataLayer.filter(item => item.event === 'search');
  assert.equal(searches.length, 1);
  assert.equal(searches[0].search_term, 'motor crawler');
});

test('GTM sólo se carga después de aceptar la medición', () => {
  const source = read('js/gtm-loader.js');
  assert.match(source, /RH_CONSENT\.get\(\) !== ['"]granted['"]/);
  assert.match(source, /addEventListener\(['"]rh:consent['"]/);
  assert.match(source, /event\.detail === ['"]granted['"]/);
  assert.match(source, /send_page_view: false/);
  assert.match(source, /G-15799391904/);
});

test('los eventos aceptados también usan la cola gtag sin duplicar page_view', () => {
  const commands = [];
  const listeners = {};
  const window = {
    dataLayer: [],
    location: { origin: 'https://racinghobbies.net', pathname: '/catalogo' },
    RH_CONSENT: { get: () => 'granted' },
    gtag(...args) { commands.push(args); },
    document: null,
  };
  const document = {
    title: 'Catálogo',
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  window.document = document;
  vm.runInNewContext(read('js/analytics.js'), { window, document, console });
  window.RH_ANALYTICS.pageView();
  window.RH_ANALYTICS.addToCart({ id: 'crawler-1', name: 'Crawler', price: 120 }, 1);
  assert.equal(commands.filter(([type]) => type === 'event').length, 1);
  assert.equal(commands[0][1], 'add_to_cart');
  assert.equal(window.dataLayer.filter(item => item.event === 'page_view').length, 1);
});
