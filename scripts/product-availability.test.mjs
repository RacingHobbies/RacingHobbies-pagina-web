import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dataSource = fs.readFileSync('js/data.js', 'utf8');
const mainSource = fs.readFileSync('js/main.js', 'utf8');
const stylesSource = fs.readFileSync('css/styles.css', 'utf8');

test('FMS Ranger V2 RTF aparece agotado y no se puede añadir al carrito', () => {
  assert.match(
    dataSource,
    /id: "ranger-v2"[\s\S]*?availability: "agotado"/,
  );
  assert.match(mainSource, /p\.availability === "agotado"/);
  assert.match(mainSource, /add\.disabled = soldOut/);
  assert.match(mainSource, /soldOutWatermark/);
  assert.match(stylesSource, /\.sold-out-watermark[\s\S]*?color:\s*#e53935/);
});
