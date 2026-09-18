import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = fs.readFileSync(path.join(root, 'js/consent.js'), 'utf8');

function boot(storedValue) {
  const listeners = {};
  const storage = new Map(storedValue ? [['rh-analytics-consent', storedValue]] : []);
  let cookie = '_ga=visitor; _ga_ABC123=session; keep=1';
  const document = {
    readyState: 'loading',
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector() { return null; },
    createElement() { return { className: '', innerHTML: '', setAttribute() {}, append() {}, addEventListener() {} }; },
    body: { append() {} },
  };
  Object.defineProperty(document, 'cookie', {
    get() { return cookie; },
    set(value) {
      const name = value.split('=')[0];
      if (/Max-Age=0/.test(value)) {
        cookie = cookie.split('; ').filter((entry) => !entry.startsWith(`${name}=`)).join('; ');
      }
    },
  });
  const window = {
    dataLayer: [],
    localStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, value); },
      removeItem(key) { storage.delete(key); },
    },
    location: { hostname: 'racinghobbies.net' },
    document,
    dispatchEvent() {},
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } },
  };
  vm.runInNewContext(source, { window, document, console });
  return { window, listeners, storage, getCookie: () => cookie };
}

function consentCommand(entry) {
  return Array.isArray(entry) ? entry : Array.from(entry || []);
}

test('el consentimiento inicial deniega analítica y publicidad', () => {
  const { window } = boot();
  const command = consentCommand(window.dataLayer[0]);
  assert.equal(command[0], 'consent');
  assert.equal(command[1], 'default');
  assert.equal(command[2].analytics_storage, 'denied');
  assert.equal(command[2].ad_storage, 'denied');
  assert.equal(command[2].ad_user_data, 'denied');
  assert.equal(command[2].ad_personalization, 'denied');
});

test('aceptar y rechazar actualizan el estado persistido sin capturar PII', () => {
  const granted = boot();
  assert.equal(granted.window.RH_CONSENT.get(), null);
  granted.window.RH_CONSENT.set('granted');
  const grantedCommand = consentCommand(granted.window.dataLayer.at(-1));
  assert.equal(grantedCommand[1], 'update');
  assert.equal(grantedCommand[2].analytics_storage, 'granted');
  assert.equal(granted.storage.get('rh-analytics-consent'), 'granted');

  const rejected = boot('rejected');
  rejected.window.RH_CONSENT.set('granted');
  rejected.window.RH_CONSENT.set('rejected');
  assert.equal(rejected.window.RH_CONSENT.get(), 'rejected');
  assert.equal(rejected.storage.get('rh-analytics-consent'), 'rejected');
  assert.doesNotMatch(rejected.getCookie(), /(?:^|; )_ga(?:_|=)/);
  assert.match(rejected.getCookie(), /keep=1/);
  assert.doesNotMatch(JSON.stringify(rejected.window.dataLayer), /nombre|tel[eé]fono|mensaje|email/i);
});

test('una decisión rechazada también limpia cookies analíticas al volver', () => {
  const rejected = boot('rejected');
  assert.doesNotMatch(rejected.getCookie(), /(?:^|; )_ga(?:_|=)/);
  assert.match(rejected.getCookie(), /keep=1/);
});
