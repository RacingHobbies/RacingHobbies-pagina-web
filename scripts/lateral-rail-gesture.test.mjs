import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/* El gesto lateral no anima el carril: lo lleva a la posición de scroll que ya
   le corresponde, así que estas pruebas vigilan justo los puntos donde esa
   equivalencia se puede romper en silencio. */

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mainSource = () => fs.readFileSync(path.join(project, 'js/main.js'), 'utf8');
const mainBundle = () => fs.readFileSync(path.join(project, 'js/main.min.js'), 'utf8');
const pages = ['index.html', 'nosotros.html', 'servicio-tecnico.html'];
const cacheVersion = file => createHash('sha256').update(fs.readFileSync(path.join(project, file))).digest('hex').slice(0, 16);

test('todos los carriles reciben el gesto lateral, no sólo algunos', () => {
  const source = mainSource();
  // Una única llamada dentro del constructor del carril: si alguien añade un
  // segundo camino para construirlos, esta prueba deja de cuadrar.
  const llamadas = source.match(/attachLateralGesture\(/g) || [];
  assert.equal(llamadas.length, 2, 'definición y una sola llamada');
  assert.match(
    source,
    /attachLateralGesture\(sec, scrollTween\.scrollTrigger, travelFactor\)/
  );
});

test('un píxel de dedo vale un píxel de carril en cualquier formato', () => {
  // La escena reparte `distance()` px de fichas sobre `distance() *
  // travelFactor()` px de scroll. Sin ese factor el carril adelanta o se queda
  // corto respecto al dedo, y cambia según el formato.
  assert.match(mainSource(), /const toScroll = \(dx\) => dx \* travelFactor\(\);/);
});

test('el gesto no puede empujar el scroll fuera del carril', () => {
  // Ni un píxel antes ni después del tramo fijado: un barrido largo o su
  // inercia no pueden llevarse la escena a la sección vecina.
  assert.match(
    mainSource(),
    /Math\.min\(st\.end, Math\.max\(st\.start, value\)\)/
  );
});

test('el gesto lateral sólo se captura mientras el carril está fijado', () => {
  // Fuera del pin el scroll pertenece a la sección vecina; no debe haber una
  // zona extendida que permita sobrepasar el cierre del carril.
  const source = mainSource();
  assert.match(source, /const inRange = \(\) => st\.isActive;/);
  assert.doesNotMatch(source, /st\.end \+ margin\(\)/);
  // Las dos entradas del gesto, dedo y rueda, comparten ese límite.
  assert.equal((source.match(/inRange\(\)/g) || []).length, 2, "las dos entradas del gesto");
});

test('el listener táctil puede cancelar el gesto y adelantarse a Lenis', () => {
  // Lenis escucha en `window` en fase de burbuja. Sin `capture` el evento le
  // llega antes que a nosotros, y sin `passive: false` el navegador ignora el
  // `preventDefault` y el barrido arrastra también la página.
  const source = mainSource();
  assert.match(source, /"touchmove",\s*onTouchMove,\s*\{ passive: false, capture: true \}/);
  assert.match(source, /"wheel",\s*onWheel,\s*\{ passive: false, capture: true \}/);
});

test('el gesto vertical sigue siendo de Lenis', () => {
  // El bloqueo de eje decide una vez por gesto; si se resuelve a vertical el
  // carril no toca el evento.
  assert.match(mainSource(), /if \(axis !== "x"\) return;/);
});

test('el paquete publicado lleva el gesto, no sólo el fuente', () => {
  // Editar `main.js` sin recompilar no cambia nada de lo que sirve el sitio.
  // Las marcas son literales que sobreviven al minificador y que ANTES del
  // gesto no estaban en el paquete: `touchmove` sí estaba —lo usa el
  // marcador de intención de scroll—, así que no vale como prueba.
  const bundle = mainBundle();
  assert.match(bundle, /touchcancel/);
  assert.match(bundle, /deltaX/);
  assert.match(bundle, /passive:!1,capture:!0/);
});

test('las páginas publicadas piden la versión ligada al contenido del paquete', () => {
  const version = cacheVersion('js/main.min.js');
  pages.forEach((page) => {
    const source = fs.readFileSync(path.join(project, page), 'utf8');
    assert.match(source, new RegExp(`main\\.min\\.js\\?v=${version}`), page);
  });
});
