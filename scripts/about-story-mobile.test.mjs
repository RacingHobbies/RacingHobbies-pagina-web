import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('css/format-parity.css', 'utf8');

test('la historia móvil cabe en el viewport y conserva la foto completa', () => {
  assert.match(
    css,
    /html body\.page-about main > section\.about-story-section\s*\{[^}]*\n\s*height: 100svh !important;/
  );
  assert.match(
    css,
    /\.page-about \.about-story-section \.static-story-visual\s*\{[^}]*display: flex !important;/
  );
  assert.match(
    css,
    /\.page-about \.about-story-section \.static-story-visual img\s*\{[^}]*object-fit: contain !important;/
  );
});
