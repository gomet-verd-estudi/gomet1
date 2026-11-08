/*
 * Generador estático de gometverdestudi.com
 * -----------------------------------------
 * Una marca se construye como un edificio. La portada lo enseña: el edificio se levanta capa a capa
 * mientras se hace scroll, una fase del método en cada capa y un gomet verde en cada validación.
 *
 *   index.html               portada: el edificio en obra, obras, criterio, estudio y contacto
 *   metodo/index.html        el método completo en láminas (estética de la presentación «Método» de Figma)
 *   obras/index.html         todos los proyectos
 *   obras/<slug>/index.html  la ficha de cada obra
 *   estudio/index.html       quiénes somos
 *   contacto/index.html      el primer paso: el formulario
 *   404.html, sitemap.xml, robots.txt
 *
 * Contenido: data/site.mjs (textos) y data/projects.json (proyectos y medios).
 * Uso:  node tools/build.mjs   — sin dependencias.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STUDIO, SERVICES, ACTS, INTRO, PHASES, LAYERS, CRITERIA, FILTERS, CREW, SPECS, FAQ, START, ORDER, CLIENTS, VEREIS, SYNTH, PARTS, ROWS_SHORT, PROBLEM_SHORT, SEE_LABEL, FAQ_SHORT, TIPS } from '../data/site.mjs';
import { LOGO, edificio, FASES_DEFS, phaseIcon, timeline, fachada, truss, ICON, piece } from './figures.mjs';
const CAPATAZ = fs.readFileSync(new URL('../data/capataz-path.txt', import.meta.url), 'utf8').trim();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const N = PROJECTS.length;
const VERSION = Date.now().toString(36);
const pad = (n) => String(n).padStart(2, '0');
PROJECTS.forEach((p, i) => { p.n = pad(i + 1); p.i = i; });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

/* ---------- piezas comunes con la estética de la presentación ---------- */
const head = (title, no, tag, pill = '') => `<header class="pl-head"><div class="pl-tags"><span class="pl-no">${no}</span><span class="pl-tag">${esc(tag)}</span>${pill ? `<span class="pl-pill">${esc(pill)}</span>` : ''}</div><p class="pl-title">[${esc(title)}]</p></header>`;
/* separador de sección a sangre, en el gris de la marca, como en las presentaciones */
const tags = (no, tag, pill = '') => `<div class="pl-tags sec-tags"><span class="pl-no">${no}</span><span class="pl-tag">${esc(tag)}</span>${pill ? `<span class="pl-pill">${esc(pill)}</span>` : ''}</div>`;
const divider = () => ''; // la web minimal separa las secciones con aire y un filete, sin bandas
/* Una sola trama, la de las vallas de obra a rayas, en la tinta verde */
const RISO_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><pattern id="tora" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3.2" height="3.2" fill="#FFFFFF"/><rect width="1.6" height="3.2" fill="#44D62C"/></pattern></defs></svg>`;
/* el color de cada capa del edificio (y de cada fase) */
const PHASE_COLOR = ['blue', 'blue', 'red', 'yellow', 'red', 'yellow', 'red', 'blue'];
const gve = '';
const gomet = '<span class="pl-gomet" aria-hidden="true"></span>';
const rows = (list) => `<dl class="pl-rows">${list.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
const valNote = (v) => typeof v === 'number' ? `${gomet}Validación ${pad(v)}` : v ? esc(v) : 'El punto de partida';
const plate = ({ id = '', title, no, tag, body, foot = '', cls = '' }) => `
  <article${id ? ` id="${id}"` : ''} class="plate ${cls}">
    ${gve}
    ${head(title, no, tag)}
    ${body}
    ${foot ? `<footer class="pl-foot">${foot}</footer>` : ''}
  </article>`;

function header(r, current) {
  const a = (href, label, key) => `<a href="${r}${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<a class="skip" href="#main">Saltar al contenido</a>
<header class="hd">
  <a class="hd-logo" href="${r || './'}" aria-label="${STUDIO.name}, inicio">${LOGO}</a>
  <button class="hd-menu" type="button" aria-expanded="false" aria-controls="nav">${ICON.menu}<span>Menú</span></button>
  <nav class="hd-nav" id="nav" aria-label="Principal">
    <a href="${r || './'}#obra">Método</a>
    ${a('obras/', 'Obras', 'obras')}
    ${a('estudio/', 'Estudio', 'estudio')}
    <a class="hd-cta" href="${r}contacto/"${current === 'contacto' ? ' aria-current="page"' : ''}>Empezar un proyecto</a>
  </nav>
</header>`;
}

function footer(r, current) {
  return `<footer class="ft">
  ${current === 'contacto' ? '' : `<div class="ft-cta wrap">
    <p class="lbl">Empezamos</p>
    <p class="ft-big">[${esc(START.head)}.]</p>
    <a class="btn" href="${r}contacto/">Empezar un proyecto ${ICON.arrow}</a>
  </div>`}
  <div class="ft-grid wrap">
    <div class="ft-logo">${LOGO}</div>
    <div><p class="lbl">Contacto</p><ul>
      <li><a href="mailto:${STUDIO.email}">${STUDIO.email}</a></li>
      <li><a href="tel:${STUDIO.phoneHref}">${STUDIO.phone}</a></li>
      <li><a href="${STUDIO.instagram}" rel="me noopener" target="_blank">Instagram ${STUDIO.instagramLabel}</a></li>
    </ul></div>
    <div><p class="lbl">Estudio</p><ul>
      <li>${STUDIO.cities}</li>
      <li>Branding y dirección de arte</li>
      <li>${STUDIO.motto} [${STUDIO.mottoLong}]</li>
    </ul></div>
    <div><p class="lbl">Web</p><ul>
      <li><a href="${r || './'}#obra">Método</a></li>
      <li><a href="${r}obras/">Obras</a></li>
      <li><a href="${r}estudio/">Estudio</a></li>
      <li><a href="${r}contacto/">Contacto</a></li>
    </ul></div>
  </div>
  <div class="ft-bottom wrap"><span>© 2026 ${STUDIO.name}</span><span>${gomet}Cada gomet verde es una validación con vosotros</span></div>
</footer>`;
}

function page({ title, desc, rel, r, body, cls = '', current = '', image = 'og.jpg', jsonld = null, defs = '', scripts = '' }) {
  const url = `${STUDIO.site}/${rel}`;
  const ld = jsonld || {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${STUDIO.site}/#studio`,
    name: STUDIO.name, url: `${STUDIO.site}/`, email: STUDIO.email, telephone: STUDIO.phone,
    description: STUDIO.desc, sameAs: [STUDIO.instagram], slogan: `${STUDIO.motto} (${STUDIO.mottoLong})`,
    areaServed: [{ '@type': 'City', name: 'Valencia' }, { '@type': 'City', name: 'Barcelona' }],
    knowsAbout: ['Branding', 'Identidad corporativa', 'Dirección de arte', 'Packaging', 'Diseño editorial', 'Lettering', 'Cartelería'],
    member: { '@type': 'Person', name: 'Manel Vila', url: 'https://manelvila.com/' }
  };
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>document.documentElement.classList.add('js')</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#FFFFFF">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${STUDIO.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${STUDIO.site}/${image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${r}favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${r}apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&display=swap">
<link rel="stylesheet" href="${r}assets/css/gve.css?v=${VERSION}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="${cls}">
${defs}
${RISO_DEFS}
${header(r, current)}
<main id="main">
${body}
</main>
${footer(r, current)}
<dialog class="lb" id="lb" aria-label="Imagen ampliada">
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-x" type="button" aria-label="Cerrar">×</button>
  <button class="lb-p" type="button" aria-label="Anterior">${ICON.back}</button>
  <button class="lb-n" type="button" aria-label="Siguiente">${ICON.arrow}</button>
</dialog>
${scripts}<script src="${r}assets/js/gve.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

/* ---------- medios ---------- */
function coverMedia(p, r, { lazy = true, cls = '' } = {}) {
  const poster = r + p.cover.poster;
  const img = `<img src="${poster}" alt="${esc(p.name)}: ${esc(p.short)}" ${lazy ? 'loading="lazy" ' : ''}decoding="async">`;
  if (!p.cover.video) return `<span class="media ${cls}">${img}</span>`;
  return `<span class="media ${cls}">${img}<video muted loop playsinline preload="none" poster="${poster}" data-src="${r + p.cover.video}" aria-hidden="true" tabindex="-1"></video></span>`;
}
function galleryMedia(g, r, alt) {
  const sizes = g.small ? ` srcset="${r + g.small} 800w, ${r + g.src} ${g.w}w" sizes="(max-width: 760px) 100vw, 50vw"` : '';
  const img = `<img src="${r + g.src}"${sizes} width="${g.w}" height="${g.h}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  if (!g.av1 && !g.mp4) return img;
  const srcs = g.av1
    ? `<source src="${r + g.av1}" type='video/mp4; codecs="av01.0.05M.08"'><source src="${r + g.hevc}" type='video/mp4; codecs="hvc1"'>`
    : `<source src="${r + g.mp4}" type="video/mp4">`;
  return `${img}<video class="g-video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">${srcs}</video>`;
}
const card = (p, r) => `
    <li><a class="card" href="${r}obras/${p.slug}/">
      ${coverMedia(p, r, { cls: 'card-media' })}
      <span class="card-meta"><span class="card-n">${p.n}</span><span class="card-tag">${esc(p.tag)}</span></span>
      <span class="card-name">${esc(p.name)}</span>
      <span class="card-plantas">${p.services.length} ${p.services.length === 1 ? 'planta' : 'plantas'} · ${esc(p.services.slice(0, 3).join(', '))}${p.services.length > 3 ? '…' : ''}</span>
    </a></li>`;

const trussBlock = () => `
  <div class="truss-grid">
    <span class="truss-side">Técnico</span><ol class="truss-row truss-tech">${CRITERIA.truss.tech.map((x, k) => `<li><span class="tn">${pad(k + 1)}</span>${esc(x)}</li>`).join('')}</ol>
    <span></span><div class="truss-svg">${truss(8)}</div>
    <span class="truss-side">Creativo</span><ol class="truss-row truss-crea">${CRITERIA.truss.crea.map((x, k) => `<li><span class="tn">${pad(k + 1)}</span>${esc(x)}</li>`).join('')}</ol>
  </div>`;

/* ========================================================================
   PORTADA — el edificio en obra
   ======================================================================== */
function home() {
  const r = '';
  const rail = PHASES.map((x, k) => `<li class="rail-i" data-k="${k + 1}"><button type="button" data-go="${k + 1}" aria-label="Ir a la fase ${x.n}: ${esc(x.key)}"><span class="rail-n">${x.n}</span><span class="rail-k">${esc(x.key)}</span></button>${typeof x.val === 'number' ? `<span class="rail-v" data-v="${x.val}" aria-hidden="true"></span>` : ''}</li>`).join('');
  // La obra a pantalla completa: el dibujo, centrado y entero; a su izquierda el relato de cada fase
  // y a su derecha la ficha técnica (número, piezas señaladas en el dibujo, lo que recibís, la validación)
  const parts = (list) => `<ol class="op-parts" aria-label="Señalado en el dibujo">${list.map((p, i) => `<li data-i="${i}"><span class="mk-n" aria-hidden="true">${i + 1}</span>${esc(p)}</li>`).join('')}</ol>`;
  const list = (items) => `<ul class="op-list">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
  // Cada lámina, como una página de revista: cabecera corrida, título enorme, folio
  // y un pie a tres columnas (titular · texto · ficha). La plancha verde ocupa el hueco central.
  const run = (a, b, n) => `<header class="op-run" aria-hidden="true"><span>Gomet Verd Estudi · ${a}</span><span>${b}</span><span>${/^\d+$/.test(n) ? `Lámina ${n} / 08` : n}</span></header>`;
  const folio = (n) => `<p class="op-count" aria-hidden="true">${n}<span>/08</span></p>`;
  // Todo el método está en las láminas: arriba el título; en el hueco central, a la izquierda el texto
  // de la fase y lo que veréis, a la derecha el detalle (qué hacemos, qué recibís, vuestro papel);
  // abajo el titular, las piezas señaladas en el dibujo, lo que recibís y la validación.
  const SEE = { 1: ['brief'], 2: ['oportunidad', 'target', 'competencia'], 3: ['idea'], 4: ['pilares'], 5: ['plantas'] };
  const dl = (list) => `<dl class="op-rows">${list.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const see = (n) => SEE[n] ? `<div class="op-see"><p class="op-k">Lo que veréis</p><ul class="op-chips">${SEE[n].map((k) => `<li title="${esc(VEREIS[k].head)}">${esc(SEE_LABEL[k])}</li>`).join('')}</ul></div>` : '';
  const panel = (x, k) => `
      <article class="op" data-p="${k + 1}" id="fase-${x.n}" aria-label="Fase ${x.n}: ${esc(x.key)}" data-tip="${esc(TIPS[k + 1])}">
        ${run(esc(x.act), esc(x.layer), x.n)}
        <h2 class="op-title">[${esc(x.key)}]</h2>
        ${folio(x.n)}
        <p class="op-h">${esc(x.head)}</p>
        <div class="op-mid-l"><p class="op-text">${esc(SYNTH[k].short)}</p>${see(k + 1)}</div>
        <div class="op-mid-r">${dl(ROWS_SHORT[k])}</div>
        <div class="op-spec">${parts(PARTS[k])}</div>
        <div class="op-spec2"><p class="op-get"><span>Recibís</span>${esc(SYNTH[k].get)}</p>${typeof x.val === 'number' ? `<p class="op-val">${gomet}Validación ${pad(x.val)} con vosotros</p>` : '<p class="op-val">Sin validación: es el punto de partida</p>'}</div>
      </article>`;
  const half = Math.ceil(FAQ.length / 2);
  const qa = (list) => `<dl class="op-rows op-faq">${list.map(([q, a]) => `<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('')}</dl>`;

  const body = `
<section class="obra" id="obra" aria-label="El método: cómo se construye una marca" style="--n:11">
    <div class="obra-track" aria-hidden="false"><div class="mascot-wrap"><div class="mascot"><svg class="cp-svg" viewBox="-60 -110 1374 1425" aria-hidden="true" focusable="false"><path class="cp-ink" fill-rule="nonzero" d="${CAPATAZ}"/></svg><p class="m-bubble" aria-live="polite"></p></div></div>
    <svg class="obra-svg" viewBox="-360 -260 720 580" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="obra-t"><title id="obra-t">Un edificio se construye de abajo arriba mientras se recorren las ocho fases del método: terreno, solar, cimientos, pilares, plantas, fachada e instalaciones, entrega de llaves y mantenimiento. Cada validación se marca con un gomet verde.</title><g class="scene"></g><g class="labels"></g></svg></div>
    <div class="obra-panels">
      <article class="op op-intro on" data-p="0" id="metodo" data-tip="${esc(TIPS[0])}">
        ${run('El método', 'Instrucciones de montaje', '00')}
        <h1 class="op-title op-display">[${esc(INTRO.title)}.]</h1>
        ${folio('00')}
        <p class="op-h">${esc(INTRO.building.head)}</p>
        <div class="op-mid-l"><p class="op-k">Lo que suele pasar</p><p class="op-text"><b>${esc(INTRO.problem.head)}.</b> Y luego nada encaja.</p></div>
        <div class="op-mid-r">${dl(PROBLEM_SHORT)}</div>
        <div class="op-spec">${list(ACTS.map((a) => `<b>${esc(a.k)}</b><span>${esc(a.phases)}</span>`))}</div>
        <div class="op-spec2"><p class="op-text">De lo grande a lo pequeño, y ninguna capa sin vuestro visto bueno.</p><p class="op-val">${gomet}Cada gomet verde es una validación con vosotros</p><p class="op-hint">${ICON.down}Desliza para construir</p></div>
      </article>${PHASES.map(panel).join('')}
      <article class="op op-faq-sheet" data-p="9" id="preguntas" data-tip="${esc(TIPS[9])}">
        ${run('Preguntas', 'Antes de empezar', 'Anexo')}
        <h2 class="op-title">[Preguntas]</h2>
        <p class="op-h">Lo que casi todo el mundo nos pregunta</p>
        <div class="op-mid-l">${qa(FAQ_SHORT.slice(0, half))}</div>
        <div class="op-mid-r">${qa(FAQ_SHORT.slice(half))}</div>
      </article>
      <article class="op op-end" data-p="10" data-tip="${esc(TIPS[10])}">
        ${run('Resultado', 'Cada marca, única', 'Fin de obra')}
        <h2 class="op-title">[Llave en mano.]</h2>
        <p class="stamp" aria-hidden="true"><span>Fin</span><small>de obra</small></p>
        <p class="op-h">${esc(FILTERS.result.head)}</p>
        <div class="op-mid-l"><p class="op-k">Criterio</p><p class="op-text"><b>${esc(CRITERIA.head)}:</b> análisis técnico y creatividad, juntos.</p></div>
        <div class="op-mid-r">${dl([[FILTERS.curate.head, 'Abrimos todos los caminos y os explicamos por qué elegimos uno.'], [FILTERS.proof.head, 'Cada propuesta llega con su argumento y sus pruebas.']])}</div>
        <div class="op-spec"><p class="op-text">El mismo orden en cada proyecto, para que el resultado solo pueda ser vuestro.</p><p class="op-val op-vals">${gomet.repeat(5)}<span class="op-vals-t">Una marca que solo podría ser vuestra</span></p></div>
        <div class="op-spec2"><div class="ctas"><a class="btn" href="contacto/">Empezar un proyecto ${ICON.arrow}</a></div></div>
      </article>
    </div>
    <div class="obra-rail">
      <ol class="rail">${rail}</ol>
    </div>
</section>

${divider('Piezas', '01')}
<section class="sec sec-cat" id="piezas">
  <div class="wrap">
    ${tags('01', 'Piezas', 'El programa')}
    <div class="sec-intro"><h2 class="h2">Las piezas con las que construimos</h2><p>Cada marca tiene su programa: las piezas que necesita, dimensionadas desde el principio para que el alcance no cambie a mitad de obra. Combinadlas como queráis.</p></div>
    <ol class="catalog">${SERVICES.map((sv, k) => `<li class="cat"><a href="contacto/?pieza=${encodeURIComponent(sv)}"><span class="cat-n">${pad(k + 1)}</span><span class="cat-fig">${piece(sv)}</span><span class="cat-name">${esc(sv)}</span></a></li>`).join('')}</ol>
  </div>
</section>

${divider('Obras', '02')}
<section class="sec" id="obras">
  <div class="wrap">
    ${tags('02', 'Obras', 'Proyectos construidos')}
    <div class="sec-intro"><h2 class="h2">Marcas que ya están en pie</h2><p>Identidades y universos visuales para moda independiente, música y cultura. Cada obra con su programa de piezas, de los cimientos a las llaves.</p></div>
    <ul class="cards">${PROJECTS.slice(0, 6).map((p) => card(p, r)).join('')}</ul>
    <p class="more"><a class="btn btn-ghost" href="obras/">Ver las ${N} obras ${ICON.arrow}</a></p>
  </div>
</section>



<section class="sec" id="estudio">
  <div class="wrap two">
    <div>
      ${head('Estudio', '04', 'Quién construye')}
      <h2 class="h2">${esc(CREW.head)}</h2>
      <p>${STUDIO.tagline} Trabajamos sobre todo para moda independiente, música y cultura. ${esc(CREW.text)}</p>
      <p><a class="link" href="estudio/">Conocer el estudio ${ICON.arrow}</a></p>
    </div>
    <div class="clients">
      <p class="lbl">Han construido con nosotros</p>
      <ul class="tags">${CLIENTS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;

  return page({ title: `${STUDIO.name} · Branding y dirección de arte en Valencia y Barcelona`, desc: STUDIO.desc, rel: '', r, body, cls: 'is-home', current: 'home', scripts: `<script src="assets/js/obra.js?v=${VERSION}" defer></script>\n<script src="assets/js/capataz.js?v=${VERSION}" defer></script>\n` });
}

/* ========================================================================
   LO QUE VERÉIS — las láminas de entregables de la presentación, con sus diagramas
   ======================================================================== */
const tbl = (headRow, body) => `<div class="tbl-wrap"><table class="tbl"><thead><tr>${headRow.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const vfoot = (v) => `<span>${esc(v.ph)}</span><span>${esc(v.note)}</span>`;
function targetSVG() {
  const e = (rx, ry, cls) => `<ellipse cx="220" cy="104" rx="${rx}" ry="${ry}" class="${cls}"/>`;
  const t = (y, s) => `<text x="220" y="${y}" text-anchor="middle" class="d-k">${s}</text>`;
  return `<svg class="diag target" viewBox="0 0 440 210" role="img" aria-label="Tres círculos: primario, secundario y terciario">${e(208, 92, 'd-dash')}${e(146, 64, 'd-line')}${e(78, 34, 'd-fill')}${t(31, 'TERCIARIO')}${t(61, 'SECUNDARIO')}${t(108, 'PRIMARIO')}</svg>`;
}
function compSVG() {
  const pill = (x, y, s, dark = false) => { const w = s.length * 8.2 + 26; return `<g class="${dark ? 'd-pill dark' : 'd-pill'}"><rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12"/><text x="${x}" y="${y + 4}" text-anchor="middle">${s}</text></g>`; };
  const comp = [[150, 70], [320, 110], [110, 245], [200, 300], [300, 280], [140, 160], [360, 60], [420, 95]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" class="d-dot"/>`).join('');
  const refs = [[430, 40], [330, 140], [465, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" class="d-ref"/>`).join('');
  return `<svg class="diag comp" viewBox="0 0 540 350" role="img" aria-label="Mapa de competencia: el espacio libre, accesible y emocional, es donde construir vuestra marca">
    <rect x="270" y="175" width="240" height="150" class="d-free"/><text x="500" y="314" text-anchor="end" class="d-k">[EL ESPACIO LIBRE]</text>
    <path d="M270 25V325M30 175H510" class="d-axis"/>
    ${comp}${refs}
    <circle cx="38" cy="14" r="5" class="d-dot"/><text x="50" y="18" class="d-s">Competidores</text><circle cx="148" cy="14" r="5" class="d-ref"/><text x="160" y="18" class="d-s">Referentes</text>
    ${pill(270, 25, 'EXCLUSIVO', true)}${pill(270, 325, 'ACCESIBLE', true)}${pill(66, 175, 'FUNCIONAL', true)}${pill(474, 175, 'EMOCIONAL', true)}
    <circle cx="410" cy="262" r="7" class="val"/>${pill(410, 290, 'VUESTRA MARCA', true)}
  </svg>`;
}
function gridSVG() {
  let s = '';
  for (let i = 0; i <= 6; i++) s += `<path d="M${10 + i * 20} 10V130M10 ${10 + i * 20}H130" class="d-line"/>`;
  return `<svg class="diag grid" viewBox="0 0 140 140" aria-hidden="true"><rect x="10" y="10" width="120" height="120" class="d-frame"/><rect x="30" y="30" width="40" height="40" class="d-cell"/>${s}</svg>`;
}
function vereis() {
  const v = VEREIS;
  const pil = v.pilares.items;
  return `
<section class="sec" id="vereis">
  <div class="wrap">
    ${tags('02', 'Lo que veréis', 'Entregables')}
    <div class="sec-intro"><h2 class="h2">Lo que recibís en cada fase</h2><p>Cada fase termina con un documento que podéis ver, discutir y validar. Estas son las láminas de la presentación del método, con lo que encontraréis en cada una.</p></div>
    ${plate({ title: 'Brief', no: '01', tag: 'Lo que veréis', cls: 'plate-grey', body: `<div class="pl-body pl-body-top"><div class="pl-text"><h3 class="pl-h">${esc(v.brief.head)}</h3><p class="pl-p">${esc(v.brief.text)}</p></div>${rows(v.brief.rows)}</div>`, foot: vfoot(v.brief) })}
    ${plate({ title: 'Oportunidad', no: '02', tag: 'Lo que veréis', cls: 'plate-grey', body: `<p class="statement">${esc(v.oportunidad.head)}</p><p class="pl-p pl-p-wide">${esc(v.oportunidad.text)}</p><div class="cols3">${v.oportunidad.cols.map(([k, x]) => `<div><p class="lbl">${esc(k)}</p><p>${esc(x)}</p></div>`).join('')}</div>`, foot: vfoot(v.oportunidad) })}
    <div class="plate-pair">
      ${plate({ title: 'Target', no: '02', tag: 'Lo que veréis', cls: 'plate-grey', body: `<h3 class="pl-h">${esc(v.target.head)}</h3><p class="pl-p">${esc(v.target.text)}</p>${targetSVG()}${tbl(['Círculo', 'Quién suele ser', 'Por qué importa'], v.target.table)}<p class="lbl" style="margin-top:18px">Lo que necesita cada círculo</p><p>${esc(v.target.need)}</p>`, foot: vfoot(v.target) })}
      ${plate({ title: 'Competencia', no: '02', tag: 'Lo que veréis', cls: 'plate-grey', body: `<h3 class="pl-h">${esc(v.competencia.head)}</h3><p class="pl-p">${esc(v.competencia.text)}</p>${compSVG()}<p class="lbl" style="margin-top:18px">Qué os llevaréis</p><p>${esc(v.competencia.take)}</p>`, foot: vfoot(v.competencia) })}
    </div>
    ${plate({ title: 'Concepto', no: '03', tag: 'Lo que veréis', cls: 'plate-grey', body: `<p class="statement">${esc(v.idea.head)}</p><ol class="steps5">${v.idea.steps.map(([k, x], i) => `<li><span class="lbl">${pad(i + 1)}</span><b>${esc(k)}</b><span>${esc(x)}</span></li>`).join('')}</ol><div class="pl-body pl-body-top"><p class="pl-p">${esc(v.idea.text)}</p><div><p class="lbl">Propuesta única</p><p class="pl-h">${esc(v.idea.unique)}</p></div></div>`, foot: vfoot(v.idea) })}
    ${plate({ title: 'Pilares', no: '04', tag: 'Lo que veréis', cls: 'plate-grey', body: `<h3 class="pl-h">${esc(v.pilares.head)}</h3><div class="pillars">
      <div><p class="lbl">${pil[0][0]}</p><p class="aa">Aa</p><p class="pl-h">Principal y secundaria</p><p>${esc(pil[0][1])}</p></div>
      <div><p class="lbl">${pil[1][0]}</p><div class="pil-fig">${gridSVG()}</div><p>${esc(pil[1][1])}</p></div>
      <div><p class="lbl">${pil[2][0]}</p><div class="swatches">${[['Principal', 'sw-ink'], ['Secundario', 'sw-blue'], ['Acento', 'sw-red'], ['Neutro', 'sw-neutral']].map(([n, c]) => `<span><i class="${c}"></i>${n}</span>`).join('')}</div><p>${esc(pil[2][1])}</p></div>
      <div><p class="lbl">${pil[3][0]}</p><div class="pil-fig pil-img">${piece('3D')}</div><p>${esc(pil[3][1])}</p></div>
    </div>`, foot: vfoot(v.pilares) })}
    ${plate({ title: 'Plantas', no: '05', tag: 'Lo que veréis', cls: 'plate-grey', body: `<h3 class="pl-h">${esc(v.plantas.head)}</h3><p class="pl-p">${esc(v.plantas.text)}</p>${tbl(['Pieza', 'Qué tiene que conseguir', 'Para quién', 'Pilares que usa'], v.plantas.table)}`, foot: vfoot(v.plantas) })}
  </div>
</section>`;
}

/* ========================================================================
   MÉTODO — las láminas
   ======================================================================== */
function metodo() {
  const r = '../';
  const legend = (items) => `<ol class="fig-legend">${items.map((x) => `<li>${x}</li>`).join('')}</ol>`;
  const phases = PHASES.map((x) => plate({
    id: slug(x.key), cls: 'plate-phase', title: x.key, no: x.n, tag: x.layer,
    body: `<div class="ph-top"><p class="ph-act">${esc(x.act)}</p>${phaseIcon(x.icon, `${x.layer}: dibujo de la fase ${x.n}`)}</div>
      <h3 class="pl-h">${esc(x.head)}</h3><p class="pl-p">${esc(x.text)}</p>${rows(x.rows)}`,
    foot: `<span>${esc(x.act)}</span><span>${valNote(x.val)}</span>`
  })).join('');

  const body = `
<section class="sec sec-top">
  <div class="wrap">
    ${head('Método', '00', 'Cómo trabajamos')}
    <h1 class="display">${esc(INTRO.title)}</h1>
    <p class="lead">${esc(INTRO.sub)}</p>
    <ol class="toc">${PHASES.map((x) => `<li><a href="#${slug(x.key)}"><span>${x.n}</span>${esc(x.key)}</a></li>`).join('')}</ol>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    ${plate({
      title: 'Método', no: '00', tag: 'Lo que suele pasar', cls: 'plate-wide',
      body: `<div class="pl-body"><div class="pl-text"><h2 class="pl-h">${esc(INTRO.problem.head)}</h2><p class="pl-p">${esc(INTRO.problem.text)}</p>${rows(INTRO.problem.rows)}</div>
        <figure class="pl-fig reveal">${fachada(INTRO.problem.labels)}${legend(INTRO.problem.labels.map((l) => `[${esc(l)}]`))}</figure></div>`,
      foot: '<span></span><span>Empezar por la fachada sale caro</span>'
    })}
    ${plate({
      title: 'Método', no: '00', tag: 'El edificio', cls: 'plate-wide plate-building',
      body: `<div class="pl-body"><div class="pl-text"><h2 class="pl-h">${esc(INTRO.building.head)}</h2><p class="pl-p">${esc(INTRO.building.text)}</p>${rows(ACTS.map((a) => [a.k, a.t]))}</div>
        <figure class="pl-fig">${edificio(LAYERS)}${legend(LAYERS.map((l) => `<b>[${esc(l.k)}]</b> ${esc(l.ph)}`))}</figure></div>`,
      foot: `<span></span><span>${gomet}Cada gomet verde es una validación con vosotros</span>`
    })}
    <div class="phase-grid">${phases}</div>
    ${plate({
      title: 'Método', no: '00', tag: 'Fases y validaciones', cls: 'plate-wide',
      body: `<h2 class="pl-h">Nada avanza sin vuestro visto bueno</h2>
        <p class="pl-p pl-p-wide">Cada fase termina con una validación conjunta y la siguiente se apoya en ella. Así siempre sabéis en qué punto de la obra estamos y nadie tiene que deshacer lo que ya estaba bien.</p>
        <div class="timeline-wrap">${timeline(PHASES, ACTS)}</div>`,
      foot: `<span></span><span>${gomet}Cada gomet verde es una validación con vosotros</span>`
    })}
  </div>
</section>

${divider('Lo que veréis', '02')}
${vereis()}
${divider('Criterio', '03')}

<section class="sec">
  <div class="wrap">
    ${plate({
      title: 'Criterio', no: '00', tag: 'Técnica y creatividad', cls: 'plate-wide',
      body: `<div class="pl-body pl-body-top"><div class="pl-text"><h2 class="pl-h">${esc(CRITERIA.head)}</h2><p class="pl-p">${esc(CRITERIA.text)}</p></div>${rows(CRITERIA.rows)}</div>
        <div class="cruce"><p class="pl-sub">[Cruce] ${esc(CRITERIA.truss.head)}</p><p class="pl-p pl-p-wide">${esc(CRITERIA.truss.text)}</p><div class="truss-wrap reveal">${trussBlock()}</div></div>`,
      foot: `<span></span><span>${gomet}Cada vertical marcada es una validación con vosotros</span>`
    })}
    <div class="plate-pair">
      ${plate({ title: 'Curaduría', no: '00', tag: 'Abrir y elegir', body: `<h3 class="pl-h">${esc(FILTERS.curate.head)}</h3><p class="pl-p">${esc(FILTERS.curate.text)}</p>${rows(FILTERS.curate.rows)}` })}
      ${plate({ title: 'Evidencia', no: '00', tag: 'Nada por impulso', body: `<h3 class="pl-h">${esc(FILTERS.proof.head)}</h3><p class="pl-p">${esc(FILTERS.proof.text)}</p>${rows(FILTERS.proof.rows)}` })}
    </div>
    ${plate({ title: 'Resultado', no: '00', tag: 'Cada marca, única', cls: 'plate-wide',
      body: `<div class="pl-body pl-body-top"><div class="pl-text"><h2 class="pl-h">${esc(FILTERS.result.head)}</h2><p class="pl-p">${esc(FILTERS.result.text)}</p></div>${rows(FILTERS.result.rows)}</div>` })}
  </div>
</section>

${divider('Preguntas', '04')}
<section class="sec" id="preguntas">
  <div class="wrap">
    ${tags('04', 'Preguntas', 'Lo que suele preguntarse')}
    <h2 class="h2">Lo que casi todo el mundo nos pregunta</h2>
    <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>`;

  return page({ defs: FASES_DEFS,
    title: 'Método · Gomet Verd Estudi',
    desc: 'Cómo trabajamos: una marca se construye como un edificio. Ocho fases en cuatro actos, del workshop al mantenimiento, con una validación en cada capa.',
    rel: 'metodo/', r, body, cls: 'is-metodo', current: 'metodo'
  });
}

/* ========================================================================
   OBRAS
   ======================================================================== */
function obras() {
  const r = '../';
  const body = `
<section class="sec sec-top">
  <div class="wrap">
    ${head('Obras', '00', 'Proyectos construidos')}
    <h1 class="display">Obras</h1>
    <p class="lead">${N} marcas construidas en ${STUDIO.name}: identidades, universos visuales y piezas para moda independiente, música y cultura.</p>
    <ul class="cards">${PROJECTS.map((p) => card(p, r)).join('')}</ul>
  </div>
</section>`;
  return page({ title: 'Obras · Gomet Verd Estudi', desc: `Proyectos de branding y dirección de arte de ${STUDIO.name}: ${PROJECTS.map((p) => p.name).join(', ')}.`, rel: 'obras/', r, body, cls: 'is-obras', current: 'obras' });
}

function obra(p) {
  const r = '../../';
  const prev = PROJECTS[(p.i - 1 + N) % N], next = PROJECTS[(p.i + 1) % N];
  const ficha = [['Programa', p.services.join(', ')]];
  if (p.team) ficha.push(['Gremios', p.team]);
  if (p.year) ficha.push(['Año', String(p.year)]);
  ficha.push(['Estudio', `${STUDIO.name} · ${STUDIO.cities}`]);
  const gal = p.gallery.map((g, k) => {
    const ar = g.w / g.h;
    const span = ar >= 2.3 ? 'x' : ar >= 1.45 ? 'w' : ar <= 0.8 ? 't' : 's';
    const label = `${p.name}, imagen ${k + 1} de ${p.gallery.length}`;
    return `<li class="g g-${span}"><button type="button" class="g-btn" data-k="${k}" aria-label="Ampliar ${esc(label)}"><span class="g-media" style="aspect-ratio:${g.w}/${g.h}">${galleryMedia(g, r, label)}</span></button></li>`;
  }).join('');
  const lb = p.gallery.map((g) => ({ src: r + g.src, w: g.w, h: g.h }));

  const body = `
<section class="sec sec-top">
  <div class="wrap">
    <p class="crumb"><a href="../">${ICON.back} Obras</a><span>${p.n} / ${pad(N)}</span></p>
    ${head('Obra', p.n, p.tag)}
    <div class="obra-head">
      <div>
        <h1 class="display">${esc(p.name)}</h1>
        <p class="lead">${esc(p.short)}</p>
        ${p.long ? `<p class="obra-long">${esc(p.long)}</p>` : ''}
      </div>
      ${rows(ficha)}
    </div>
    <figure class="obra-cover"><img src="${r + p.cover.poster}" alt="${esc(p.name)}: ${esc(p.short)}" decoding="async"></figure>
  </div>
</section>
<section class="sec sec-gal">
  <div class="wrap">
    <ol class="gal">${gal}</ol>
    <script type="application/json" id="lb-data">${JSON.stringify(lb)}</script>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="obra-cta">
      <div><p class="lbl">${gomet}Llave en mano</p><p class="h2">¿Construimos la vuestra?</p></div>
      <a class="btn" href="../../contacto/?obra=${p.slug}">Empezar un proyecto como este ${ICON.arrow}</a>
    </div>
    <nav class="obra-nav" aria-label="Otras obras">
      <a href="../${prev.slug}/"><span class="lbl">${ICON.back} Anterior · ${prev.n}</span><b>${esc(prev.name)}</b></a>
      <a href="../${next.slug}/"><span class="lbl">Siguiente · ${next.n} ${ICON.arrow}</span><b>${esc(next.name)}</b></a>
    </nav>
  </div>
</section>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.name, description: p.long || p.short,
    genre: p.tag, url: `${STUDIO.site}/obras/${p.slug}/`, image: `${STUDIO.site}/${p.cover.poster}`,
    creator: { '@type': 'Organization', '@id': `${STUDIO.site}/#studio`, name: STUDIO.name }
  };
  return page({
    title: `${p.name} · ${p.tag} · Gomet Verd Estudi`.slice(0, 70),
    desc: `${p.short} ${p.tag} de ${STUDIO.name}, estudio de branding y dirección de arte en Valencia y Barcelona.`,
    rel: `obras/${p.slug}/`, r, body, cls: 'is-obra', current: 'obras', image: p.cover.poster, jsonld: ld
  });
}

/* ========================================================================
   ESTUDIO
   ======================================================================== */
function estudio() {
  const r = '../';
  const team = [...new Set(PROJECTS.flatMap((p) => (p.team.match(/@[\w.]+/g) || [])))].map((h) => h.replace(/\.$/, ''));
  const body = `
<section class="sec sec-top">
  <div class="wrap two two-top">
    <div>
      ${head('Estudio', '00', 'Quiénes somos')}
      <h1 class="display">${STUDIO.name}</h1>
      <p class="lead">Nos gustan las marcas que tienen algo que contar. Nuestro trabajo consiste en encontrar ese algo y construirlo: una identidad, un universo visual, un sistema que funcione igual de bien en un cartel que en una pantalla.</p>
      <p>Somos un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Trabajamos sobre todo para moda independiente, música y cultura: un estudio de moda que desfila en la 080 Barcelona Fashion Week, un taller de azulejos hechos a mano, un estudio creativo, una promotora cultural, un grupo que estrena disco.</p>
    </div>
    ${rows(SPECS)}
  </div>
</section>
<section class="sec sec-wip">
  <div class="wrap">
    <div class="wip-logo">${LOGO}</div>
    <p class="wip-text">Seguir siendo curiosos, cuestionar lo de siempre y disfrutar del proceso: ${STUDIO.motto}, ${STUDIO.mottoLong}. Se nota en el resultado.</p>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="plate-pair">
      ${plate({ title: 'Ecosistema', no: '00', tag: 'Quién construye', body: `<h2 class="pl-h">${esc(CREW.head)}</h2><p class="pl-p">${esc(CREW.text)}</p>${rows(CREW.rows)}` })}
      ${plate({ title: 'Juntos', no: '00', tag: 'Cómo nos organizamos', body: `<h2 class="pl-h">${esc(CREW.together.head)}</h2><p class="pl-p">${esc(CREW.together.text)}</p>${rows(CREW.together.rows)}` })}
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap two">
    <div><p class="lbl">Han construido con nosotros</p><ul class="tags">${CLIENTS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><p class="lbl">Gremios de confianza</p><p class="gremios">${team.map((h) => `<span>${esc(h)}</span>`).join(' ')}</p>
      <p class="small">${STUDIO.name} · <a href="https://manelvila.com/">Manel Vila</a>, diseño gráfico y dirección de arte</p></div>
  </div>
</section>`;
  return page({ title: 'Estudio · Gomet Verd Estudi', desc: `${STUDIO.tagline} Quiénes somos, cómo nos organizamos y con quién construimos.`, rel: 'estudio/', r, body, cls: 'is-estudio', current: 'estudio' });
}

/* ========================================================================
   CONTACTO — el primer paso
   ======================================================================== */
function contacto() {
  const r = '../';
  const chip = (name, value, type, id) => `<label class="chip" for="${id}"><input type="${type}" name="${name}" value="${esc(value)}" id="${id}"><span>${esc(value)}</span></label>`;
  const group = (name, list, type = 'radio') => list.map((v, k) => chip(name, v, type, `${name}-${k}`)).join('');
  const body = `
<section class="sec sec-top">
  <div class="wrap">
    ${head('Empezamos', '01', 'El primer paso')}
    <h1 class="display">${esc(START.head)}</h1>
    <p class="lead">${esc(START.text)}</p>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap two two-top contact">
    <form class="form plate" id="order" novalidate>
      ${gve}
      <fieldset><legend><span>01</span> Programa: las piezas que necesitáis</legend><div class="chips">${group('parts', SERVICES, 'checkbox')}</div></fieldset>
      <fieldset><legend><span>02</span> Momento</legend><div class="chips">${group('stage', ORDER.stage)}</div></fieldset>
      <fieldset><legend><span>03</span> Plazo</legend><div class="chips">${group('when', ORDER.when)}</div></fieldset>
      <fieldset><legend><span>04</span> Presupuesto orientativo</legend><div class="chips">${group('budget', ORDER.budgets)}</div></fieldset>
      <fieldset><legend><span>05</span> El proyecto</legend>
        <label class="field" for="f-about"><span>¿Qué es vuestra marca o proyecto y qué os gustaría conseguir?</span><textarea id="f-about" name="about" rows="5"></textarea></label>
      </fieldset>
      <fieldset><legend><span>06</span> Vuestros datos</legend>
        <div class="fields">
          <label class="field" for="f-name"><span>Nombre</span><input id="f-name" name="name" autocomplete="name" required></label>
          <label class="field" for="f-brand"><span>Marca (opcional)</span><input id="f-brand" name="brand" autocomplete="organization"></label>
          <label class="field" for="f-email"><span>Email</span><input id="f-email" name="email" type="email" autocomplete="email"></label>
          <label class="field" for="f-phone"><span>Teléfono (opcional)</span><input id="f-phone" name="phone" type="tel" autocomplete="tel"></label>
        </div>
      </fieldset>
      <input type="hidden" name="ref" id="f-ref">
      <div class="send">
        <button class="btn" type="submit" data-via="email">Enviar por email ${ICON.arrow}</button>
        <button class="btn btn-ghost" type="submit" data-via="wa">Enviar por WhatsApp</button>
        <p class="note" id="order-note" role="status">Al enviar se abre vuestro correo o WhatsApp con la ficha ya escrita. Solo usamos estos datos para responderos.</p>
      </div>
    </form>
    <aside class="contact-side">
      ${rows([['Qué necesitamos', START.need], ['Email', STUDIO.email], ['Teléfono y WhatsApp', STUDIO.phone], ['Instagram', STUDIO.instagramLabel], ['Dónde', STUDIO.cities], ['Respuesta', ORDER.reply]])}

    </aside>
  </div>
</section>`;
  return page({ title: 'Contacto · Gomet Verd Estudi', desc: `${START.head}. Contadnos vuestro proyecto: ${STUDIO.email} · ${STUDIO.phone}.`, rel: 'contacto/', r, body, cls: 'is-contacto', current: 'contacto' });
}

function notFound() {
  const r = '/';
  const body = `<section class="sec sec-top"><div class="wrap">
    ${head('404', '00', 'Fuera de plano')}
    <h1 class="display">Esta página no está en el plano.</h1>
    <p class="lead">Puede que la hayamos movido de planta. Vuelve a la portada y empieza por los cimientos.</p>

    <p><a class="btn" href="/">Volver a la portada ${ICON.arrow}</a></p>
  </div></section>`;
  return page({ title: 'Fuera de plano · Gomet Verd Estudi', desc: STUDIO.desc, rel: '404', r, body, cls: 'is-404' });
}

/* ---------- escribir ---------- */
function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}
write('index.html', home());
// la antigua página del método lleva a la portada, donde ahora está todo
write('metodo/index.html', `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><title>Método · ${STUDIO.name}</title><meta name="robots" content="noindex"><link rel="canonical" href="${STUDIO.site}/#metodo"><meta http-equiv="refresh" content="0; url=../#metodo"></head><body><p><a href="../#metodo">El método está ahora en la portada, en las láminas de la obra</a></p></body></html>\n`);
write('obras/index.html', obras());
PROJECTS.forEach((p) => write(`obras/${p.slug}/index.html`, obra(p)));
write('estudio/index.html', estudio());
write('contacto/index.html', contacto());
write('404.html', notFound());

const today = new Date().toISOString().slice(0, 10);
const urls = ['', 'obras/', ...PROJECTS.map((p) => `obras/${p.slug}/`), 'estudio/', 'contacto/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${STUDIO.site}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${STUDIO.site}/sitemap.xml\n`);
console.log(`OK · ${urls.length} páginas`);
