# Historia móvil de Nosotros

## Objetivo

En `nosotros.html`, la sección «Cómo empezamos» debe mostrar el título, ambos párrafos y la imagen completa dentro de un único viewport móvil visible, sin recorte ni desplazamiento interno.

## Diseño aprobado

Se aplicará la composición equilibrada B:

- La sección se limita al alto disponible del viewport móvil (`100svh`) y conserva el ritmo visual de las demás secciones.
- La tarjeta de texto mantiene las tipografías, pesos, bordes y colores existentes. Sólo se reduce el espacio vertical sobrante y se ajustan tamaños mediante límites responsivos ya compatibles con el sistema de diseño.
- La imagen conserva proporción completa con `object-fit: contain`, dentro de un área flexible que recibe el alto restante. No se recorta ni se deforma.
- El contenido no tendrá `overflow` oculto ni scroll interno. En pantallas excepcionalmente cortas, la tipografía se compacta dentro de los límites establecidos, antes de sacrificar contenido.

## Alcance técnico

- Ajustar únicamente las reglas móviles de la sección de historia en `css/format-parity.css`.
- Mantener intactos el HTML, el contenido, la imagen y los estilos de escritorio.
- Regenerar los archivos de producción si el flujo del repositorio lo requiere.

## Validación

- Verificar visualmente el viewport de iPhone de 390 × 844 px y una pantalla corta de 375 × 667 px.
- Confirmar que título, dos párrafos e imagen son totalmente visibles, que no existe recorte y que la sección no excede `100svh`.
- Ejecutar las comprobaciones de regresión disponibles del repositorio.
