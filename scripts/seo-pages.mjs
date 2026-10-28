import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const origin = 'https://racinghobbies.net';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const priced = product => Number.isFinite(product.price) && product.price > 0;
const money = value => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
const productPath = product => '/productos/' + product.id;
const categoryPath = category => '/categorias/' + category.slug;

// Descripciones de ayuda sobre las categorías reales; no crean inventario,
// sucursales, garantías, edades recomendadas ni prestaciones de producto.
const introductions = {
  crawlers: ['Carros crawler RC 4x4 en Ecuador', 'Explora crawlers a control remoto para rutas y obstáculos. Compara escalas, precios y especificaciones del catálogo de Racing Hobbies en Quito; consulta la disponibilidad y los repuestos de tu modelo antes de elegir.'],
  pista: ['Autos de pista a control remoto en Ecuador', 'Descubre autos RC de pista y modelos a escala. Revisa si cada referencia es un kit o un modelo listo para correr y qué componentes necesita; nuestro equipo en Quito puede ayudarte a elegir la configuración.'],
  monster: ['Monster trucks y carros RC off-road en Ecuador', 'Compara carros a control remoto para off-road y monster trucks. Cada ficha muestra la escala, la motorización y los datos disponibles del modelo para que elijas según el terreno donde quieres rodar.'],
  camiones: ['Camiones y trailers a control remoto en Ecuador', 'Explora camiones y maquinaria RC a escala en Racing Hobbies. Consulta los detalles de cada referencia, su precio y disponibilidad con la tienda de Quito.'],
  aviones: ['Aviones a control remoto en Ecuador', 'Encuentra aviones RC y consulta las especificaciones de cada modelo. Antes de comprar, verifica la experiencia de vuelo necesaria y los componentes incluidos; podemos orientarte desde nuestra tienda en Quito.'],
  helis: ['Helicópteros a control remoto en Ecuador', 'Consulta helicópteros RC, escalas y configuraciones del catálogo. Revisa los componentes incluidos y pide asesoría para elegir un modelo acorde con tu experiencia.'],
  energia: ['Baterías para carros y modelos RC en Ecuador', 'Compara baterías del catálogo de Racing Hobbies. Confirma voltaje, capacidad, dimensiones y conector con las especificaciones de tu vehículo y cargador antes de comprar.'],
  cargadores: ['Cargadores de baterías RC en Ecuador', 'Explora cargadores para modelismo RC. Consulta la compatibilidad de química, voltaje y conectores con tu batería; sigue siempre las instrucciones del fabricante para la carga.'],
  radios: ['Radios y emisoras para autos RC en Ecuador', 'Descubre radios y emisoras para modelos a control remoto. Verifica número de canales, receptor y compatibilidad con tu equipo; consulta las referencias disponibles en Quito.'],
  nitro: ['Nitro y repuestos para carros RC en Ecuador', 'Consulta combustible nitro y repuestos del catálogo. Identifica el modelo y la referencia exacta de la pieza para verificar compatibilidad con nuestro equipo de servicio técnico en Quito.'],
  louis: ['Repuestos y modelos Monomarca Louis en Ecuador', 'Encuentra modelos, carrocerías, transmisión, suspensión y accesorios Monomarca Louis por código de referencia. Cada ficha conserva las especificaciones publicadas en el catálogo; confirma la compatibilidad con tu chasis antes de pedir.'],
};

export function catalogData(root) {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(root + '/js/data.js', 'utf8') + '\nthis.catalog = { products: RH_PRODUCTS, categories: RH_CATEGORIES };', context, { timeout: 2000 });
  const data = JSON.parse(JSON.stringify(context.catalog));
  const ids = new Set();
  for (const category of data.categories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug) || !introductions[category.slug]) throw Error('Categoría no configurada: ' + category.slug);
  }
  for (const product of data.products) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id) || ids.has(product.id)) throw Error('Identificador de producto inválido: ' + product.id);
    if (!data.categories.some(category => category.slug === product.cat)) throw Error('Categoría desconocida: ' + product.id);
    if (!/^assets\/img\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)$/.test(product.img) || product.img.includes('..') || !fs.existsSync(root + '/' + product.img)) throw Error('Imagen inválida: ' + product.id);
    ids.add(product.id);
  }
  return data;
}

export function generateSeoPages(root) {
  const { products, categories } = catalogData(root);
  const source = fs.readFileSync(root + '/catalogo.html', 'utf8');
  const output = new Map();
  const categoryFor = product => categories.find(category => category.slug === product.cat);
  const stylesheet = fs.readFileSync(root + '/css/seo.css');
  const cssHash = createHash('sha256').update(stylesheet).digest('base64');
  const cssVersion = createHash('sha256').update(stylesheet).digest('hex').slice(0, 16);
  const cssLink = `<link rel="stylesheet" href="/css/seo.css?v=${cssVersion}" integrity="sha256-${cssHash}">`;
  const rootUrls = html => html.replace(/\b(href|src)="(?![a-z]+:|\/|#)([^"?]+\.html)([^"\s]*)"/g, (_, attr, file, tail) => `${attr}="/${file === 'index.html' ? '' : file.slice(0, -5)}${tail}"`)
    .replace(/\b(href|src)="((?:assets|css|js)\/)/g, '$1="/$2')
    .replace(/srcset="([^"]+)"/g, (_, value) => `srcset="${value.replace(/(^|,\s*)(assets\/)/g, '$1/$2')}"`)
    .replace('href="site.webmanifest"', 'href="/site.webmanifest"');
  function page(route, title, description, main, image) {
    let html = rootUrls(source);
    html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${main}</main>`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(")/g, (_, before, after) => before + escape(description) + after)
      .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*(")/g, (_, before, after) => before + escape(title) + after)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${origin}${route}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${origin}${route}$2`)
      .replace(/<script[^>]+src="\/js\/catalog\.min\.js[^>]*><\/script>\s*/, '')
      .replace(/ aria-current="page"/g, '')
      .replace('<body class="page-catalog">', '<body class="page-seo">')
      .replace('</head>', `  ${cssLink}\n</head>`);
    if (image) html = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(")/g, `$1${origin}/${image}$2`)
      .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, (_, before, after) => before + escape(title) + after);
    return html;
  }
  function crumbs(category, product) {
    const items = [{ name: 'Inicio', path: '/' }, { name: 'Catálogo RC', path: '/catalogo' }];
    if (category) items.push({ name: category.label, path: categoryPath(category) });
    if (product) items.push({ name: product.name, path: productPath(product) });
    return `<nav class="seo-breadcrumbs" aria-label="Ruta de navegación"><ol itemscope itemtype="https://schema.org/BreadcrumbList">${items.map((item, index) => `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${item.path}"><span itemprop="name">${escape(item.name)}</span></a><meta itemprop="position" content="${index + 1}"></li>`).join('')}</ol></nav>`;
  }
  function card(product) {
    return `<article class="prod-card" data-image-surface="${escape(product.imageSurface)}"><a class="prod-media" href="${productPath(product)}" aria-label="Ver ${escape(product.name)}"><img src="/${product.img}" alt="${escape(product.name)}" width="640" height="640" loading="lazy" decoding="async"></a><div class="prod-body"><p class="prod-cat">${escape(categoryFor(product).label)}</p><h3 class="prod-name"><a href="${productPath(product)}">${escape(product.name)}</a></h3><p>${escape(product.desc)}</p><div class="prod-foot"><span class="prod-price">${priced(product) ? escape(money(product.price)) + ' USD' : 'Consultar precio'}</span><a class="btn btn-line" href="${productPath(product)}">Ver ficha</a></div>${product.availability === 'agotado' ? '<p>Agotado</p>' : ''}</div></article>`;
  }
  const categoryLinks = `<nav class="seo-categories" aria-label="Explorar categorías RC">${categories.map(category => `<a href="${categoryPath(category)}">${escape(category.label)}</a>`).join('')}</nav>`;
  // El HTML servido contiene inventario real incluso antes de ejecutar JS.
  // El catálogo interactivo reemplaza esta rejilla al iniciar sus filtros.
  output.set('catalogo.html', source.replace('<div class="prod-grid" id="catalog-grid"></div>', `<div class="prod-grid" id="catalog-grid">${products.map(card).join('\n')}</div>`)
    .replace('<div class="toolbar">', `${categoryLinks}\n        <div class="toolbar">`)
    .replace('</head>', `  ${cssLink}\n</head>`));
  for (const category of categories) {
    const items = products.filter(product => product.cat === category.slug);
    if (!items.length) continue;
    const [title, description] = introductions[category.slug];
    const main = `<section class="page-hero"><div class="container">${crumbs(category)}<p class="kicker">Racing Hobbies · Quito, Ecuador</p><h1>${escape(title)}</h1><p>${escape(description)}</p><a class="btn btn-line" href="/catalogo?cat=${category.slug}">Filtrar y comparar</a></div></section><section class="catalog-section"><div class="container"><h2>${escape(category.label)} en el catálogo</h2><div class="prod-grid">${items.map(card).join('\n')}</div>${categoryLinks}</div></section>`;
    output.set('categorias/' + category.slug + '.html', page(categoryPath(category), title + ' | Racing Hobbies', description, main));
  }
  for (const product of products) {
    const category = categoryFor(product);
    const soldOut = product.availability === 'agotado';
    const offer = priced(product) ? `<div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="priceCurrency" content="USD"><meta itemprop="price" content="${product.price}"><link itemprop="url" href="${origin}${productPath(product)}">${soldOut ? '<link itemprop="availability" href="https://schema.org/OutOfStock">' : ''}<p class="seo-price">${escape(money(product.price))} USD</p></div>` : '<p class="seo-price">Consultar precio</p>';
    const message = 'Hola, quisiera consultar ' + product.name + (product.code ? ' (código ' + product.code + ')' : '') + '.';
    const related = products.filter(other => other.cat === product.cat && other.id !== product.id).slice(0, 3);
    const description = `${product.name} en Racing Hobbies, Quito, Ecuador. ${priced(product) ? money(product.price) + ' USD. ' : ''}${product.desc}`.slice(0, 300);
    const main = `<section class="seo-product-section"><div class="container">${crumbs(category, product)}<article class="seo-product" data-product-id="${product.id}" itemscope itemtype="https://schema.org/Product"><div class="seo-product-image" data-image-surface="${escape(product.imageSurface)}"><img itemprop="image" src="/${product.img}" alt="${escape(product.name)}" width="900" height="900" fetchpriority="high" decoding="async"></div><div class="seo-product-copy"><p class="kicker"><a href="${categoryPath(category)}">${escape(category.label)}</a></p><h1 itemprop="name">${escape(product.name)}</h1>${product.code ? `<p>Código: <span itemprop="sku">${escape(product.code)}</span></p>` : ''}<p itemprop="description">${escape(product.desc)}</p>${offer}<p>${soldOut ? 'Producto agotado. Consulta alternativas o disponibilidad futura.' : 'Confirma disponibilidad y entrega con la tienda antes de realizar el pedido.'}</p><h2>Especificaciones</h2><ul>${(product.specs || []).map(spec => `<li>${escape(spec)}</li>`).join('')}</ul><div class="seo-product-actions">${priced(product) && !soldOut ? `<button class="btn btn-volt" type="button" data-add="${product.id}">Agregar al carrito</button>` : ''}<a class="btn btn-line" href="https://wa.me/593989019836?text=${escape(encodeURIComponent(message))}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></div><p>Atención en <a href="/contacto">Av. Eloy Alfaro N40-413 y Granados, Quito</a>. Consulta <a href="/servicio-tecnico">servicio técnico RC</a> y <a href="/garantia">condiciones de garantía</a>.</p></div></article></div></section>${related.length ? `<section class="catalog-section"><div class="container"><h2>También en ${escape(category.label)}</h2><div class="prod-grid">${related.map(card).join('')}</div></div></section>` : ''}`;
    output.set('productos/' + product.id + '.html', page(productPath(product), product.name + ' en Ecuador | Racing Hobbies', description, main, product.img));
  }
  const baseSitemap = fs.readFileSync(root + '/sitemap.xml', 'utf8');
  const extraUrls = [...output.keys()].filter(file => file !== 'catalogo.html').map(file => `  <url><loc>${origin}/${file.slice(0, -5)}</loc></url>`).join('\n');
  output.set('sitemap.xml', baseSitemap.replace('</urlset>', extraUrls + '\n</urlset>'));
  return output;
}
