import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html')).sort();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const expectedWhatsApp = '593989019836';
const expectedDisplay = '098 901 9836';
const deprecatedWhatsApp = ['593', '9980', '19836'].join('');
const deprecatedDisplay = new RegExp(['099', '801', '9836'].join('(?:&nbsp;|\\s)+'));

test('todas las secciones usan el WhatsApp vigente', () => {
  assert.match(read('js/config.js'), new RegExp(`phoneDisplay: "${expectedDisplay}"`));
  assert.match(read('js/config.js'), new RegExp(`phoneIntl: "\\+${expectedWhatsApp}"`));
  assert.match(read('js/config.js'), new RegExp(`whatsapp: "${expectedWhatsApp}"`));
  assert.match(read('js/config.min.js'), new RegExp(`phoneDisplay:"${expectedDisplay}"`));
  assert.match(read('js/config.min.js'), new RegExp(`phoneIntl:"\\+${expectedWhatsApp}"`));
  assert.match(read('js/config.min.js'), new RegExp(`whatsapp:"${expectedWhatsApp}"`));

  for (const file of pages) {
    const html = read(file);
    const links = [...html.matchAll(/href="https:\/\/wa\.me\/([^"?]+)/g)].map(match => match[1]);
    assert.ok(links.length > 0, `${file} debe tener al menos un enlace de WhatsApp`);
    assert.deepEqual([...new Set(links)], [expectedWhatsApp], file);
    assert.doesNotMatch(html, new RegExp(`${deprecatedWhatsApp}|${deprecatedDisplay.source}`), file);
  }
});
