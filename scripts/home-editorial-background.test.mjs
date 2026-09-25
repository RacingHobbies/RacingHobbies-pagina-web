import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexSource = fs.readFileSync('index.html', 'utf8');
const stylesSource = fs.readFileSync('css/styles.css', 'utf8');

test('la tarjeta editorial de pista conserva el marco y panel del resto', () => {
  assert.match(indexSource, /data-product="golf-gti"[\s\S]*?golf-gti-480\.webp/);
  assert.match(
    stylesSource,
    /\.page-home \.editorial-garage \.collage-item\[data-product="golf-gti"\] img[\s\S]*?background:\s*transparent/
  );
  assert.match(
    stylesSource,
    /\.collage-item\[data-product="golf-gti"\] \.rh-card::after[\s\S]*?top:\s*14\.5%[\s\S]*?width:\s*82%[\s\S]*?aspect-ratio:\s*1[\s\S]*?background:\s*#fff/
  );
});
