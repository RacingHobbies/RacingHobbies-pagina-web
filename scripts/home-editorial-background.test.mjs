import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexSource = fs.readFileSync('index.html', 'utf8');
const stylesSource = fs.readFileSync('css/styles.css', 'utf8');
const dataSource = fs.readFileSync('js/data.js', 'utf8');
const mainSource = fs.readFileSync('js/main.js', 'utf8');

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

test('los recortes transparentes usan un contrato común en todas las tarjetas', () => {
  const productCount = (dataSource.match(/^    id: "[^"]+",$/gm) || []).length;
  const surfaceCount = (
    dataSource.match(/^    imageSurface: "(?:photo|cutout)",$/gm) || []
  ).length;
  assert.ok(productCount > 0, 'debe haber productos declarados');
  assert.equal(
    surfaceCount,
    productCount,
    'cada producto nuevo debe declarar imageSurface explícitamente'
  );
  assert.match(dataSource, /const RH_IMAGE_SURFACES = Object\.freeze\(\["photo", "cutout"\]\)/);
  assert.match(
    dataSource,
    /debe declarar imageSurface como "photo" o "cutout"/
  );
  for (const id of [
    'lancia-delta',
    'golf-gti',
    'mercedes-190e',
    'subaru-impreza',
    'mercedes-c11',
  ]) {
    assert.match(
      dataSource,
      new RegExp(`id: "${id}"[\\s\\S]*?imageSurface: "cutout"`)
    );
  }
  assert.match(mainSource, /card\.dataset\.imageSurface = p\.imageSurface;/);
  assert.match(mainSource, /media\.dataset\.imageSurface = p\.imageSurface;/);
  assert.match(stylesSource, /\.tile-media\[data-image-surface="cutout"\]::before/);
  assert.match(stylesSource, /\.prod-media\[data-image-surface="cutout"\]::before/);
  assert.match(
    stylesSource,
    /\.tile-media\[data-image-surface="cutout"\]::before[\s\S]*?width:\s*86%[\s\S]*?height:\s*86%/
  );
  assert.match(
    stylesSource,
    /\.tile-media\[data-image-surface="cutout"\] img[\s\S]*?width:\s*82%[\s\S]*?background:\s*transparent/
  );
});
