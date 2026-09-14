import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mainSource = () => fs.readFileSync(path.join(project, 'js/main.js'), 'utf8');

test('el carril móvil termina en la última tarjeta sin un hueco añadido', () => {
  assert.match(
    mainSource(),
    /const tailGap = \(\) =>\s*\n\s*window\.innerWidth <= 899 \? 0 : Math\.min\(120, Math\.round\(window\.innerWidth \* 0\.1\)\);/
  );
});

test('las fichas de los carriles móviles reciben un progreso de revelado completo', () => {
  assert.match(
    mainSource(),
    /item\.classList\.add\("in"\);\s*\n\s*item\.style\.setProperty\("--rv", "1"\);/
  );
});
