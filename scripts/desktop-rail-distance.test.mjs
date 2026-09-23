import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const start = source.indexOf('const tailGap = () =>');
const end = source.indexOf('// Recorrido más largo', start);
const geometry = source.slice(start, end);

// Ejecutar la medida y su decisión de montaje reales con geometría de DOM.
function measure({ width, content, origin = 0, x = 0, viewport = width }) {
  let disabled = false;
  const context = {
    window: { innerWidth: width },
    track: { scrollWidth: content, getBoundingClientRect: () => ({ left: origin + x }) },
    sec: {
      clientWidth: viewport,
      getBoundingClientRect: () => ({ left: 0 }),
      classList: { remove: () => { disabled = true; } },
      removeAttribute: () => {},
    },
    g: { getProperty: () => x },
  };
  const distance = vm.runInNewContext(`(() => { ${geometry}; return distance(); })()`, context);
  return { distance, disabled };
}

test('Full HD mantiene el carril y deja entrar completa la última tarjeta', () => {
  const layout = { width: 1920, viewport: 1905, content: 2060, origin: 292.5 };
  const initial = measure(layout);
  assert.equal(initial.disabled, false);
  assert.ok(layout.origin + layout.content - initial.distance <= layout.viewport);
  assert.deepEqual(measure({ ...layout, x: -200 }), initial,
    'recalcular a mitad del scroll no debe acortar el recorrido');
});

test('un recorrido menor de 300px sigue siendo navegable; sin recorrido no se fija', () => {
  const short = measure({ width: 1920, content: 2060 });
  assert.equal(short.disabled, false);
  assert.equal(short.distance, 260);
  assert.equal(measure({ width: 2560, content: 1800 }).disabled, true);
});

test('el recorrido móvil conserva su distancia sin margen final extra', () => {
  assert.equal(measure({ width: 390, content: 1600 }).distance, 1210);
});
