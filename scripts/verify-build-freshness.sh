#!/usr/bin/env bash
set -euo pipefail

# Comprueba que cada artefacto minificado que se publica deriva EXACTAMENTE del
# fuente que audita `scripts/security-audit.sh`.
#
# Existe porque ese hueco es real y ya rompió producción: la auditoría valida la
# sintaxis de `js/main.js` y el SRI de `js/main.min.js`, pero nada demostraba que
# el segundo saliera del primero. Un `.min.js` manipulado —o simplemente
# olvidado tras editar el fuente— pasaba la auditoría entera: el SRI casa con el
# artefacto, no con su origen.
#
# Necesita red la primera vez (npx descarga las herramientas fijadas). Por eso
# va aparte de la auditoría, que debe poder correr sin conexión.

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Las mismas versiones fijadas que usa scripts/build-production.sh.
LIGHTNINGCSS_VERSION="1.33.0"
TERSER_VERSION="5.49.0"

command -v npx >/dev/null 2>&1 || {
  echo "ERROR: npx es necesario para recompilar los artefactos." >&2
  exit 1
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

stale=0

for source in config data main catalog contact analytics frame-guard; do
  npx --yes "terser@${TERSER_VERSION}" "js/${source}.js" \
    --compress --mangle --comments false \
    --output "${work}/${source}.min.js" >/dev/null 2>&1
  if cmp -s "${work}/${source}.min.js" "js/${source}.min.js"; then
    echo "OK        js/${source}.min.js"
  else
    echo "DESFASADO js/${source}.min.js no coincide con js/${source}.js" >&2
    stale=1
  fi
done

npx --yes "lightningcss-cli@${LIGHTNINGCSS_VERSION}" --minify css/styles.css \
  -o "${work}/styles.min.css" >/dev/null 2>&1
if cmp -s "${work}/styles.min.css" css/styles.min.css; then
  echo "OK        css/styles.min.css"
else
  echo "DESFASADO css/styles.min.css no coincide con css/styles.css" >&2
  stale=1
fi

if (( stale )); then
  echo "ERROR: hay artefactos publicados que no derivan de su fuente. Ejecuta ./scripts/build-production.sh" >&2
  exit 1
fi

echo "Artefactos de producción al día: todos derivan de su fuente auditado."
