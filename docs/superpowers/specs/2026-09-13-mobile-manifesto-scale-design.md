# Escala B del manifiesto móvil

## Objetivo

Dar al manifiesto móvil el peso visual de la opción B sin alterar su coreografía de scroll ni el comportamiento de escritorio.

## Alcance

- Aumentar la escala de `.ln-manifesto-copy` sólo en móviles verticales.
- Ensanchar el bloque de copia para que las frases principales conserven dos líneas y margen lateral seguro.
- Mantener la escena sticky y la línea de tiempo GSAP existentes.
- Actualizar la versión de caché e integridad del CSS modificado.

## Implementación

Se ajustará la regla móvil específica de `css/format-parity.css` a una escala de aproximadamente `16vw`, limitada por altura de viewport, y se llevará el ancho del bloque al 90% del viewport. Las reglas de escritorio no cambian.

## Validación

Se comprobará en navegador real a 390×844 y 806×1288 que el inicio, la mitad y el final de la escena no desbordan ni recortan texto. Se repetirá una comprobación a 1440×900 para confirmar que escritorio sigue usando la misma coreografía.

## Publicación

Sólo se incluirán el CSS, su versión e integridad asociadas y los archivos generados que correspondan. Los cambios de trabajo ajenos ya presentes se preservarán sin incluirlos.
