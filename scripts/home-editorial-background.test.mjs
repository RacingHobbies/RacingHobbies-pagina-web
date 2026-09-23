import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexSource = fs.readFileSync('index.html', 'utf8');
const stylesSource = fs.readFileSync('css/styles.css', 'utf8');

test('la imagen editorial de pista conserva el fondo blanco', () => {
  assert.match(indexSource, /data-product="golf-gti"[\s\S]*?golf-gti-480\.webp/);
  assert.match(
    stylesSource,
    /\.page-home \.editorial-garage \.collage-item\[data-product="golf-gti"\] img[\s\S]*?background:\s*#fff/
  );
});
