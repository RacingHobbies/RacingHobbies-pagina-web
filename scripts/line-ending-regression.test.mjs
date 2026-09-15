import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('los archivos de producción mantienen LF para que SRI sea reproducible', () => {
  const attributes = fs.readFileSync('.gitattributes', 'utf8');
  assert.match(attributes, /^\* text=auto eol=lf$/m);

  for (const file of ['index.html', 'css/typography.css']) {
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.includes(Buffer.from('\r\n')), false, `${file} contiene CRLF`);
  }
});
