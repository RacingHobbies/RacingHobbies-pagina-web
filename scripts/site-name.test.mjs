import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const home = read('index.html');
const blocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const nodes = blocks.flatMap(([, source]) => {
  const data = JSON.parse(source);
  return data['@graph'] || [data];
});

test('la portada identifica un solo sitio con el nombre de marca y la URL canónica', () => {
  const sites = nodes.filter(node => node['@type'] === 'WebSite');
  assert.equal(sites.length, 1);
  const [site] = sites;
  assert.equal(site.name, 'Racing Hobbies Ecuador');
  assert.equal(site.url, 'https://racinghobbies.net/');
  assert.equal(site['@id'], site.url + '#website');
  const alternates = Array.isArray(site.alternateName) ? site.alternateName : [site.alternateName];
  assert.ok(alternates.includes('Racing Hobbies'));
  assert.ok(!alternates.includes('racinghobbies.net'), 'el dominio no debe proponerse como nombre alternativo de marca');
  assert.match(home, /<link rel="canonical" href="https:\/\/racinghobbies\.net\/">/);
  assert.match(home, /<meta property="og:site_name" content="Racing Hobbies Ecuador">/);
  assert.match(home, /<title>Racing Hobbies Ecuador/);
  assert.match(home, /aria-label="Racing Hobbies Ecuador — Inicio"/);
  const publisher = nodes.find(node => node['@id'] === site.publisher['@id']);
  assert.equal(publisher?.['@type'], 'Store');
  assert.equal(publisher?.name, site.name);
  assert.equal(publisher?.url, site.url);
});

test('los datos del nombre del sitio están autorizados en ambas directivas CSP de cada hosting', () => {
  const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  const carriers = [...pages, '_headers', '.htaccess', 'nginx-security-headers.conf.example'];
  for (const [, source] of blocks) {
    const hash = "'sha256-" + createHash('sha256').update(source).digest('base64') + "'";
    for (const file of carriers) {
      const policies = [...read(file).matchAll(/script-src(?:-elem)?\s+[^;]+/g)];
      assert.ok(policies.length >= 2, file);
      for (const [policy] of policies) assert.ok(policy.includes(hash), file + ': ' + policy);
    }
  }
});

test('todas las páginas públicas declaran og:site_name y application-name consistentes', () => {
  const pages = [
    'index.html',
    'catalogo.html',
    'servicio-tecnico.html',
    'nosotros.html',
    'contacto.html',
    'garantia.html',
    'privacidad.html'
  ];

  for (const page of pages) {
    const html = read(page);
    assert.match(
      html,
      /<meta property="og:site_name" content="Racing Hobbies Ecuador">/,
      `${page} debe declarar og:site_name = Racing Hobbies Ecuador`
    );
    assert.match(
      html,
      /<meta name="application-name" content="Racing Hobbies Ecuador">/,
      `${page} debe declarar application-name = Racing Hobbies Ecuador`
    );
    assert.match(
      html,
      /<meta name="apple-mobile-web-app-title" content="Racing Hobbies Ecuador">/,
      `${page} debe declarar apple-mobile-web-app-title = Racing Hobbies Ecuador`
    );
  }
});

test('el manifiesto web declara el nombre de sitio esperado', () => {
  const manifest = JSON.parse(read('site.webmanifest'));
  assert.equal(manifest.name, 'Racing Hobbies Ecuador');
  assert.equal(manifest.short_name, 'Racing Hobbies');
});

// Un logo apaisado puede terminar con franjas al entrar en una miniatura
// cuadrada; verificar los archivos reales y cada página que los declara.
test('las vistas de Google usan imágenes cuadradas reales y un favicon PNG rastreable', () => {
  const dimensions = file => {
    const data = fs.readFileSync(new URL(file, root));
    assert.equal(data.subarray(1, 4).toString(), 'PNG', file);
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
  };
  const logo = 'assets/img/racing-hobbies-ecuador-square.png';
  assert.deepEqual(dimensions(logo), [1024, 1024]);
  assert.deepEqual(dimensions('assets/favicon.png'), [96, 96]);
  assert.deepEqual(dimensions('assets/apple-touch-icon.png'), [180, 180]);
  for (const page of fs.readdirSync(root).filter(file => file.endsWith('.html'))) {
    const html = read(page);
    assert.match(html, /rel="icon" href="\/assets\/favicon\.png" type="image\/png" sizes="96x96"/, page);
    assert.ok(!html.includes('assets/favicon.svg?v='), page);
    if (page === '404.html') continue;
    assert.ok(html.includes('property="og:image" content="https://racinghobbies.net/' + logo + '"'), page);
    assert.ok(!html.includes('logo-oficial.png?v='), page);
  }
  const publisher = nodes.find(node => node['@type'] === 'Store');
  const image = nodes.find(node => node['@id'] === publisher.logo['@id']);
  assert.equal(image?.['@type'], 'ImageObject');
  assert.equal(image?.contentUrl, 'https://racinghobbies.net/' + logo);
  assert.equal(image?.width, image?.height);
});
