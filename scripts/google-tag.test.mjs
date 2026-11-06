import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
function boot(initialConsent = null, hostname = 'racinghobbies.net', search = '') {
  let consent = initialConsent;
  const commands = [];
  const scripts = [];
  const listeners = {};
  const documentListeners = {};
  const product = { id: 'defender', name: 'Defender', cat: 'crawlers', price: 710 };
  const document = {
    readyState: 'loading', title: 'Defender en Ecuador',
    addEventListener(type, handler) { documentListeners[type] = handler; },
    querySelector(selector) {
      if (selector === '[data-product-id]') return { dataset: { productId: product.id } };
      return scripts.find(script => selector.includes(script.dataset.rhGa4)) || null;
    },
    getElementsByTagName() { return [{ parentNode: { insertBefore(script) { scripts.push(script); } } }]; },
    createElement() { return { dataset: {} }; },
  };
  const window = {
    location: { hostname, origin: 'https://' + hostname, pathname: '/productos/defender', search },
    RH_CONSENT: { get: () => consent },
    gtag(...args) { commands.push(args); },
    addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
  };
  const context = vm.createContext({ window, document, RH_PRODUCTS: [product], URL, URLSearchParams, console });
  vm.runInContext(read('js/gtm-loader.js'), context);
  vm.runInContext(read('js/analytics.js'), context);
  return {
    window, commands, scripts,
    ready() { document.readyState = 'complete'; documentListeners.DOMContentLoaded(); },
    consent(state) { consent = state; for (const handler of listeners['rh:consent'] || []) handler({ detail: state }); },
  };
}

test('una aceptación tardía carga una etiqueta y registra una visita y el producto, sin reenviar acciones previas', () => {
  const tracker = boot();
  tracker.ready();
  tracker.window.RH_ANALYTICS.addToCart({ id: 'x', name: 'Producto', price: 10 });
  assert.equal(tracker.scripts.length, 0);
  assert.equal(tracker.commands.length, 0);
  tracker.consent('granted');
  tracker.consent('granted');
  tracker.window.RH_ANALYTICS.pageView();
  assert.deepEqual(tracker.scripts.map(script => script.src), ['https://www.googletagmanager.com/gtag/js?id=G-JB588FWM54']);
  assert.deepEqual(tracker.commands.filter(command => command[0] === 'event').map(command => command[1]), ['page_view', 'view_item']);
  assert.equal(tracker.commands.find(command => command[0] === 'config')[2].send_page_view, false);
  assert.equal(tracker.window.dataLayer.filter(item => item.event === 'page_view').length, 1);
});

test('aceptación recordada y retirada de consentimiento no duplican vistas ni envían acciones rechazadas', () => {
  const tracker = boot('granted');
  tracker.ready();
  const events = () => tracker.commands.filter(command => command[0] === 'event');
  assert.deepEqual(events().map(command => command[1]), ['page_view', 'view_item']);
  tracker.consent('rejected');
  tracker.window.RH_ANALYTICS.whatsappClick('footer');
  assert.equal(events().length, 2);
  assert.equal(tracker.window['ga-disable-G-JB588FWM54'], true);
  tracker.consent('granted');
  assert.equal(events().length, 2);
  assert.equal(tracker.scripts.length, 1);
});

test('las vistas de prueba no cargan Google y las campañas se conservan sin enviar la consulta completa', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.racing-hobbies.pages.dev']) {
    const tracker = boot('granted', host);
    tracker.ready();
    assert.equal(tracker.scripts.length, 0, host);
  }
  const tracker = boot('granted', 'racinghobbies.net', '?utm_source=instagram&utm_medium=social&utm_campaign=rc_ecuador&email=cliente@example.com&message=privado&utm_term=cliente@example.com');
  tracker.ready();
  const config = tracker.commands.find(command => command[0] === 'config');
  assert.equal(config[1], 'G-JB588FWM54');
  assert.equal(config[2].campaign_source, 'instagram');
  assert.equal(config[2].campaign_medium, 'social');
  assert.equal(config[2].campaign_name, 'rc_ecuador');
  assert.equal(config[2].campaign_term, undefined);
  assert.equal(config[2].page_location, 'https://racinghobbies.net/productos/defender');
  assert.doesNotMatch(JSON.stringify(tracker.commands), /cliente@example|privado/);
});

test('un producto sin precio no se registra como un producto gratuito', () => {
  const tracker = boot('granted');
  tracker.ready();
  tracker.window.RH_ANALYTICS.viewItem({ id: 'consultar', name: 'Consultar precio', price: null });
  const event = tracker.commands.at(-1);
  assert.equal(event[1], 'view_item');
  assert.equal(event[2].value, undefined);
  assert.equal(event[2].items[0].price, undefined);
});
