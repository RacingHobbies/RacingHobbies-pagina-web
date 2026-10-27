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
  assert.equal(site.alternateName, 'Racing Hobbies');
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
