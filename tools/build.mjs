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
import { STUDIO, SERVICES, ACTS, INTRO, PHASES, LAYERS, CRITERIA, FILTERS, CREW, SPECS, FAQ, START, ORDER, CLIENTS } from '../data/site.mjs';
import { LOGO, obraSVG, edificio, FASES_DEFS, phaseIcon, timeline, fachada, truss, ICON } from './figures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const N = PROJECTS.length;
const VERSION = Date.now().toString(36);
const pad = (n) => String(n).padStart(2, '0');
PROJECTS.forEach((p, i) => { p.n = pad(i + 1); p.i = i; });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

/* ---------- piezas comunes con la estética de la presentación ---------- */
const head = (title, no, tag) => `<header class="pl-head"><p class="pl-title">[${esc(title)}]</p><span class="pl-no">${no}</span><span class="pl-tag">${esc(tag)}</span></header>`;
const gve = '<div class="gve" aria-hidden="true"><i>G</i><i>V</i><i>E</i></div>';
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
    ${a('metodo/', 'Método', 'metodo')}
    ${a('obras/', 'Obras', 'obras')}
    ${a('estudio/', 'Estudio', 'estudio')}
    <a class="hd-cta" href="${r}contacto/"${current === 'contacto' ? ' aria-current="page"' : ''}>Empezar un proyecto</a>
  </nav>
</header>`;
}

function footer(r, current) {
  return `<footer class="ft">
  ${current === 'contacto' ? '' : `<div class="ft-cta wrap">
    ${head('Empezamos', '01', 'El primer paso')}
    <div class="ft-cta-row">
      <p class="ft-big">${esc(START.head)}</p>
      <a class="btn" href="${r}contacto/">Empezar un proyecto ${ICON.arrow}</a>
    </div>
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
      <li><a href="${r}metodo/">Método</a></li>
      <li><a href="${r}obras/">Obras</a></li>
      <li><a href="${r}estudio/">Estudio</a></li>
      <li><a href="${r}contacto/">Contacto</a></li>
    </ul></div>
  </div>
  <div class="ft-bottom wrap"><span>© 2026 ${STUDIO.name}</span><span>${gomet}Cada gomet verde es una validación con vosotros</span></div>
</footer>`;
}

function page({ title, desc, rel, r, body, cls = '', current = '', image = 'og.jpg', jsonld = null, defs = '' }) {
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..700&display=swap">
<link rel="stylesheet" href="${r}assets/css/gve.css?v=${VERSION}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="${cls}">
${defs}
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
<script src="${r}assets/js/gve.js?v=${VERSION}" defer></script>
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
  const steps = PHASES.map((x, k) => `
    <li class="step" data-step="${k + 1}" id="fase-${x.n}">
      <p class="step-act">${esc(x.act)}</p>
      ${head(x.key, x.n, x.layer)}
      <h2 class="step-h">${esc(x.head)}</h2>
      <p class="step-p">${esc(x.text)}</p>
      ${rows(x.rows)}
      <p class="step-val">${valNote(x.val)}</p>
    </li>`).join('');

  const body = `
<section class="obra" id="obra" aria-label="Cómo se construye una marca">
  <div class="obra-stage">
    ${gve}
    <figure class="obra-fig">${obraSVG(LAYERS)}</figure>
    <div class="obra-rail">
      <ol class="rail">${rail}</ol>
      <p class="obra-cap">${gomet}Cada gomet verde es una validación con vosotros</p>
    </div>
  </div>
  <ol class="obra-steps">
    <li class="step step-intro" data-step="0">
      ${head('Método', '00', 'Cómo trabajamos')}
      <h1 class="display">${esc(INTRO.title)}</h1>
      <p class="lead">${esc(INTRO.sub)}</p>
      <p class="step-p">${STUDIO.name} es un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Construimos cada marca de abajo arriba, en ocho fases y cuatro actos, y ninguna capa se levanta sin vuestro visto bueno.</p>
      <div class="ctas"><a class="btn" href="#fase-01">Ver cómo se construye ${ICON.down}</a><a class="btn btn-ghost" href="contacto/">Empezar un proyecto</a></div>
    </li>${steps}
    <li class="step step-end" data-step="9">
      ${head('Resultado', '00', 'Cada marca, única')}
      <h2 class="step-h">${esc(FILTERS.result.head)}</h2>
      <p class="step-p">${esc(FILTERS.result.text)}</p>
      ${rows(FILTERS.result.rows)}
      <div class="ctas"><a class="btn" href="obras/">Ver las obras ${ICON.arrow}</a><a class="btn btn-ghost" href="metodo/">El método, lámina a lámina</a></div>
    </li>
  </ol>
</section>

<section class="sec" id="obras">
  <div class="wrap">
    ${head('Obras', '00', 'Proyectos construidos')}
    <div class="sec-intro"><h2 class="h2">Marcas que ya están en pie</h2><p>Identidades y universos visuales para moda independiente, música y cultura. Cada obra con su programa de piezas, de los cimientos a las llaves.</p></div>
    <ul class="cards">${PROJECTS.slice(0, 6).map((p) => card(p, r)).join('')}</ul>
    <p class="more"><a class="btn btn-ghost" href="obras/">Ver las ${N} obras ${ICON.arrow}</a></p>
  </div>
</section>

<section class="sec sec-alt" id="criterio">
  <div class="wrap">
    ${head('Criterio', '00', 'Técnica y creatividad')}
    <div class="sec-intro"><h2 class="h2">${esc(CRITERIA.head)}</h2><p>${esc(CRITERIA.truss.text)}</p></div>
    <div class="truss-wrap reveal">${trussBlock()}</div>
    <div class="trio">${CRITERIA.rows.map(([k, v]) => `<div><p class="lbl">${esc(k)}</p><p>${esc(v)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="sec" id="estudio">
  <div class="wrap two">
    <div>
      ${head('Estudio', '00', 'Quién construye')}
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

  return page({ title: `${STUDIO.name} · Branding y dirección de arte en Valencia y Barcelona`, desc: STUDIO.desc, rel: '', r, body, cls: 'is-home', current: 'home' });
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

<section class="sec sec-alt" id="preguntas">
  <div class="wrap">
    ${head('Preguntas', '00', 'Lo que suele preguntarse')}
    <h2 class="h2">Lo que casi todo el mundo nos pregunta</h2>
    <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>`;

  return page({
    title: 'Método · Gomet Verd Estudi',
    desc: 'Cómo trabajamos: una marca se construye como un edificio. Ocho fases en cuatro actos, del workshop al mantenimiento, con una validación en cada capa.',
    rel: 'metodo/', r, body, cls: 'is-metodo', current: 'metodo', defs: FASES_DEFS
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
      <div class="contact-ph">${phaseIcon(0, 'El terreno: el workshop es la primera fase')}<p class="lbl">01 Workshop · El terreno</p></div>
    </aside>
  </div>
</section>`;
  return page({ title: 'Contacto · Gomet Verd Estudi', desc: `${START.head}. Contadnos vuestro proyecto: ${STUDIO.email} · ${STUDIO.phone}.`, rel: 'contacto/', r, body, cls: 'is-contacto', current: 'contacto', defs: FASES_DEFS });
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
write('metodo/index.html', metodo());
write('obras/index.html', obras());
PROJECTS.forEach((p) => write(`obras/${p.slug}/index.html`, obra(p)));
write('estudio/index.html', estudio());
write('contacto/index.html', contacto());
write('404.html', notFound());

const today = new Date().toISOString().slice(0, 10);
const urls = ['', 'metodo/', 'obras/', ...PROJECTS.map((p) => `obras/${p.slug}/`), 'estudio/', 'contacto/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${STUDIO.site}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${STUDIO.site}/sitemap.xml\n`);
console.log(`OK · ${urls.length} páginas`);
