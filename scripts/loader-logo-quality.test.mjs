import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('el logo de la primera animación usa la fuente lossless de alta resolución', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const loaderLogo = index.match(
    /<img class="rh-start-mark"[^>]*>/
  )?.[0];

  assert.ok(loaderLogo, 'no se encontró el logo del loader');
  assert.match(loaderLogo, /src="assets\/img\/logo-mark\.png\?v=2"/);
  assert.match(loaderLogo, /width="1261"/);
  assert.match(loaderLogo, /height="652"/);
});
