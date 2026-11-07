/*
 * Generador estático de gometverdestudi.com
 * -----------------------------------------
 * La web entera es un manual de montaje: el de la cápsula de un huevo sorpresa, dibujado a la japonesa.
 *
 *   index.html                 la tapa (el huevo se abre), los modelos, las piezas, el método, los gomets y la hoja de pedido
 *   about/index.html           el manual del estudio: quiénes somos y el método Gomet paso a paso
 *   modelos/<slug>/index.html  la hoja de montaje de cada proyecto
 *   404.html, sitemap.xml, robots.txt
 *
 * Contenido: data/site.mjs (textos) y data/projects.json (proyectos y medios).
 * Uso:  node tools/build.mjs   — sin dependencias.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STUDIO, PARTS, WARNINGS, METHOD, RULES, SPECS, TROUBLE, ORDER, CLIENTS, STICKERS } from '../data/site.mjs';
import { eggHero, stepFigure, FIG_DEFS, ICON, barcode } from './figures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const N = PROJECTS.length;
const VERSION = Date.now().toString(36);
const pad = (n) => String(n).padStart(2, '0');
PROJECTS.forEach((p, i) => { p.code = `GV-${pad(i + 1)}`; p.i = i; });

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const circled = (n) => '①②③④⑤⑥⑦⑧⑨⑩'[n - 1] || n;

/* ---------- piezas comunes ---------- */
const bar = (no, jp, es, extra = '') => `<div class="bar"><span class="bar-no">${no}</span><span class="bar-jp" lang="ja">${jp}</span><span class="bar-es">${es}</span>${extra}</div>`;
const fold = (label = 'Doblar por aquí', jp = '山折り') => `<div class="fold" aria-hidden="true"><span><b lang="ja">${jp}</b> ${label}</span></div>`;

function header(r, current) {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<a class="skip" href="#main">Saltar al contenido</a>
<header class="top">
  <a class="brand" href="${r || './'}" aria-label="${STUDIO.name}, inicio"><span class="dot" aria-hidden="true"></span><span class="brand-name">Gomet Verd Estudi</span></a>
  <span class="top-jp" aria-hidden="true"><span lang="ja">組立説明書</span> · Instrucciones de montaje</span>
  <nav class="top-nav" aria-label="Principal">
    ${link(`${r}#modelos`, 'Modelos', 'models')}
    ${link(`${r}about/#metodo`, 'Método', 'method')}
    ${link(`${r}about/`, 'Estudio', 'about')}
    <a class="top-cta" href="${r}#pedido">Pedido</a>
  </nav>
</header>`;
}

function footer(r) {
  const langs = [
    ['ES', 'Contiene piezas pequeñas de gran carácter.'],
    ['CA', 'Conté peces petites de gran caràcter.'],
    ['EN', 'Contains small parts with a big personality.'],
    ['FR', 'Contient de petites pièces pleines de caractère.'],
    ['IT', 'Contiene piccole parti dal grande carattere.'],
    ['JA', '小さな部品に、大きな個性。']
  ];
  return `${fold('Contraportada', '谷折り')}
<footer class="back" id="contacto">
  <div class="back-grid">
    <div class="back-brand">
      <span class="dot dot-xl" aria-hidden="true"></span>
      <p class="back-name">Gomet Verd Estudi</p>
      <p class="back-jp" lang="ja">${STUDIO.jp}</p>
      <p class="back-tag">${STUDIO.tagline}</p>
    </div>
    <div class="back-col">
      <p class="lbl">お問い合わせ · Atención al cliente</p>
      <ul>
        <li><a href="mailto:${STUDIO.email}">${STUDIO.email}</a></li>
        <li><a href="tel:${STUDIO.phoneHref}">${STUDIO.phone}</a></li>
        <li><a href="${STUDIO.instagram}" rel="me noopener" target="_blank">Instagram ${STUDIO.instagramLabel}</a></li>
        <li>${STUDIO.cities}</li>
      </ul>
    </div>
    <div class="back-col">
      <p class="lbl">目次 · Índice</p>
      <ul>
        <li><a href="${r}#modelos">Serie completa · ${N} modelos</a></li>
        <li><a href="${r}#piezas">Piezas sueltas</a></li>
        <li><a href="${r}about/#metodo">El método Gomet</a></li>
        <li><a href="${r}about/">Manual del estudio</a></li>
        <li><a href="${r}#pedido">Hoja de pedido</a></li>
      </ul>
    </div>
    <div class="back-code">
      ${barcode('GVE-2026-VLC-BCN')}
      <p class="mono">8 4 3 5 2 6 · GVE · 0 0 1</p>
      <div class="swatches" aria-hidden="true"><i class="sw-c"></i><i class="sw-m"></i><i class="sw-y"></i><i class="sw-k"></i><i class="sw-g"></i></div>
    </div>
  </div>
  <ul class="langs">${langs.map(([l, t]) => `<li><b>${l}</b> ${ICON.warn} <span${l === 'JA' ? ' lang="ja"' : l === 'ES' ? '' : ` lang="${l.toLowerCase()}"`}>${t}</span></li>`).join('')}</ul>
  <div class="colophon">
    <span>© 2026 Gomet Verd Estudi</span>
    <span>Fabricado en Valencia y Barcelona</span>
    <span>${STUDIO.motto} — ${STUDIO.mottoLong}</span>
    <span class="reg" aria-hidden="true">⊕</span>
  </div>
</footer>`;
}

function page({ title, desc, rel, r, body, cls = '', current = '', image = 'og.jpg', jsonld = null }) {
  const url = `${STUDIO.site}/${rel}`;
  const ld = jsonld || {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${STUDIO.site}/#studio`,
    name: STUDIO.name, url: `${STUDIO.site}/`, email: STUDIO.email, telephone: STUDIO.phone,
    description: STUDIO.desc, sameAs: [STUDIO.instagram], slogan: `${STUDIO.motto} (${STUDIO.mottoLong})`,
    areaServed: [{ '@type': 'City', name: 'Valencia' }, { '@type': 'City', name: 'Barcelona' }],
    knowsAbout: ['Branding', 'Identidad corporativa', 'Dirección de arte', 'Packaging', 'Diseño editorial', 'Lettering', 'Cartelería'],
    founder: { '@type': 'Person', name: 'Manel Vila', url: 'https://manelvila.com/' }
  };
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#F2EFE6">
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=IBM+Plex+Mono:wght@400;500&family=Zen+Kaku+Gothic+New:wght@500;700;900&display=swap">
<link rel="stylesheet" href="${r}assets/css/gve.css?v=${VERSION}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="${cls}">
${FIG_DEFS}
${header(r, current)}
<main id="main">
${body}
</main>
${footer(r)}
<div class="stuck" id="stuck" aria-hidden="true"></div>
<dialog class="lb" id="lb" aria-label="Paso ampliado">
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-x" type="button" aria-label="Cerrar">×</button>
  <button class="lb-p" type="button" aria-label="Paso anterior">${ICON.back}</button>
  <button class="lb-n" type="button" aria-label="Paso siguiente">${ICON.arrow}</button>
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
  if (!p.cover.video) return `<div class="media ${cls}">${img}</div>`;
  return `<div class="media ${cls}">${img}<video muted loop playsinline preload="none" poster="${poster}" data-src="${r + p.cover.video}" aria-hidden="true" tabindex="-1"></video></div>`;
}
function stepMedia(g, r, alt) {
  const sizes = g.small ? ` srcset="${r + g.small} 800w, ${r + g.src} ${g.w}w" sizes="(max-width: 760px) 100vw, 50vw"` : '';
  const img = `<img src="${r + g.src}"${sizes} width="${g.w}" height="${g.h}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  if (!g.av1 && !g.mp4) return img;
  const srcs = g.av1
    ? `<source src="${r + g.av1}" type='video/mp4; codecs="av01.0.05M.08"'><source src="${r + g.hevc}" type='video/mp4; codecs="hvc1"'>`
    : `<source src="${r + g.mp4}" type="video/mp4">`;
  return `${img}<video class="step-video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">${srcs}</video>`;
}

/* ========================================================================
   HOME — la tapa y el interior del folleto
   ======================================================================== */
function home() {
  const r = '';
  const cards = PROJECTS.map((p) => `
    <li class="card" data-slug="${p.slug}">
      <a href="modelos/${p.slug}/">
        <span class="card-top"><span class="mono">${p.code}</span><span class="check" aria-hidden="true"></span></span>
        ${coverMedia(p, r, { cls: 'card-media' })}
        <span class="card-n" aria-hidden="true">${p.i + 1}</span>
        <span class="card-name">${esc(p.name)}</span>
        <span class="card-tag">${esc(p.tag)} · ${p.gallery.length} pasos</span>
      </a>
    </li>`).join('');

  const parts = PARTS.map((x) => `<li class="part part-${x.shape}"><button type="button" data-part="${esc(x.name)}" aria-label="Añadir ${esc(x.name)} a la hoja de pedido"><span class="part-code">${x.code}</span><span class="part-name">${esc(x.name)}</span><span class="part-jp" lang="ja">${x.jp}</span></button></li>`).join('');

  const steps = METHOD.map((s) => `
    <li class="mini-step">
      <span class="num">${s.n}</span>
      ${stepFigure(s.fig, `Paso ${s.n}: ${s.title}`)}
      <span class="mini-t">${esc(s.title)}</span>
      <span class="mini-s"><span lang="ja">${s.jp}</span> · ${esc(s.name)}</span>
    </li>`).join('');

  const stickers = STICKERS.map((s, i) => `<li><button type="button" class="gomet gomet-${s.c}" data-i="${i}" aria-label="Despegar el gomet ${esc(s.t)}"><span${/[぀-ヿ一-鿿]/.test(s.t) ? ' lang="ja"' : ''}>${esc(s.t)}</span></button></li>`).join('');

  const chip = (name, value, type = 'radio') => `<label class="chip"><input type="${type}" name="${name}" value="${esc(value)}"><span>${esc(value)}</span></label>`;

  const body = `
<section class="cover" id="tapa" aria-label="Portada">
  <div class="cover-stage">
    <div class="cover-head">
      <p class="kicker mono">No. GVE-26 · ${STUDIO.edition} · ${N} modelos</p>
      <h1 class="cover-h1"><span>Instrucciones</span> <span>de montaje</span></h1>
      <p class="cover-sub">para marcas con algo que contar. Branding y dirección de arte desde ${STUDIO.cities}.</p>
    </div>
    <div class="cover-fig">${eggHero()}</div>
    <ol class="cover-steps" aria-label="Cómo abrir este huevo">
      <li data-s="0"><span class="num">1</span><span>Gira el huevo<small lang="ja">回す</small></span></li>
      <li data-s="1"><span class="num">2</span><span>Ábrelo por la línea<small lang="ja">開ける</small></span></li>
      <li data-s="2"><span class="num">3</span><span>Saca la cápsula<small lang="ja">取り出す</small></span></li>
      <li data-s="3"><span class="num">4</span><span>Abre la cápsula<small lang="ja">開く</small></span></li>
      <li data-s="4"><span class="num">5</span><span>Despliega las instrucciones<small lang="ja">広げる</small></span></li>
    </ol>
    <p class="cover-jp" lang="ja" aria-hidden="true">組立説明書</p>
    <p class="cover-hint mono" aria-hidden="true">Desliza para abrir ↓</p>
  </div>
</section>

<section class="sheet inside" id="gracias">
  ${bar('00', 'はじめに', 'Antes de empezar')}
  <div class="inside-grid">
    <div class="inside-text">
      <h2 class="h-xl">Gracias por abrir este huevo.</h2>
      <p class="lead">${STUDIO.name} es un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Montamos identidades para marcas que tienen algo que contar, sobre todo de moda independiente, música y cultura.</p>
      <p>Cada proyecto empieza con una conversación y acaba siendo un juego compartido con quien nos lo encarga: mezclamos estrategia, narrativa y exploración visual hasta llegar a algo que se pueda ver, tocar o poner en movimiento. <a href="about/#metodo">Así se monta →</a></p>
    </div>
    <aside class="contents" aria-label="Contenido">
      <p class="lbl"><span lang="ja">内容物</span> · Contenido del huevo</p>
      <ul>
        <li><b>${N}</b> modelos montados <span>A</span></li>
        <li><b>${PARTS.length}</b> piezas sueltas <span>B</span></li>
        <li><b>1</b> método en ${METHOD.length} pasos <span>C</span></li>
        <li><b>${STICKERS.length}</b> gomets para pegar <span>D</span></li>
        <li><b>1</b> hoja de pedido <span>E</span></li>
      </ul>
    </aside>
    <aside class="caution" aria-label="Precauciones">
      <p class="caution-h">${ICON.warn}<span lang="ja">注意</span> Atención</p>
      <ul>${WARNINGS.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      <p class="age">${ICON.bored}<span>No apto para marcas sin ganas de jugar.<br><small>Edad recomendada: cualquier marca con algo que contar.</small></span></p>
    </aside>
  </div>
</section>

${fold()}

<section class="sheet series" id="modelos">
  ${bar('A', '作品シリーズ', 'Serie completa', `<span class="bar-r mono" id="tally" aria-live="polite">Abiertos <b>0</b>/${N}</span>`)}
  <div class="sec-head">
    <h2 class="h-xl">¡Colecciónalos todos!</h2>
    <p>${N} modelos montados en ${STUDIO.name}. Cada uno trae su hoja de montaje: la idea, las piezas que lo forman y cada paso hasta el resultado. Los que abras se marcan con un gomet.</p>
  </div>
  <ol class="cards">${cards}
    <li class="card card-you">
      <a href="#pedido">
        <span class="card-top"><span class="mono">GV-${pad(N + 1)}</span><span class="check" aria-hidden="true"></span></span>
        <span class="media card-media card-blank" aria-hidden="true"><span>?</span></span>
        <span class="card-n" aria-hidden="true">${N + 1}</span>
        <span class="card-name">[Tu proyecto]</span>
        <span class="card-tag">Próximo modelo · cuéntanoslo</span>
      </a>
    </li>
  </ol>
</section>

${fold('Cortar por la línea', '切り取り線')}

<section class="sheet" id="piezas">
  ${bar('B', '部品一覧', 'Piezas sueltas')}
  <div class="sec-head">
    <h2 class="h-xl">Piezas sueltas</h2>
    <p>Todos los modelos se montan con estas piezas. Se piden juntas o por separado. Pulsa las que necesites y se añaden a la hoja de pedido.</p>
  </div>
  <div class="sprue">
    <span class="sprue-tag" aria-hidden="true">B</span>
    <ul class="sprue-grid">${parts}</ul>
  </div>
</section>

${fold()}

<section class="sheet" id="como">
  ${bar('C', '組み立て方', 'Cómo se monta')}
  <div class="sec-head">
    <h2 class="h-xl">El método Gomet, en siete pasos</h2>
    <p>Del huevo cerrado al gomet verde. <a href="about/#metodo">Leer el manual completo →</a></p>
  </div>
  <ol class="mini-steps">${steps}</ol>
</section>

${fold()}

<section class="sheet" id="gomets">
  ${bar('D', 'シール', 'Hoja de gomets')}
  <div class="sticker-wrap">
    <div class="sec-head">
      <h2 class="h-xl">Despega y pega</h2>
      <p>La parte del juego. Arrastra un gomet y pégalo donde quieras de esta página, o púlsalo y se pegará solo. Se quedan donde los dejes.</p>
      <button type="button" class="btn btn-ghost" id="unstick">Despegar todos</button>
    </div>
    <div class="sticker-sheet">
      <ul>${stickers}</ul>
      <p class="mono sheet-foot">GVE · シール · 12 uds.</p>
    </div>
  </div>
</section>

${fold('Recortar y enviar', '切り取り線')}

<section class="sheet order" id="pedido">
  ${bar('E', '注文書', 'Hoja de pedido')}
  <form class="coupon" id="order" novalidate>
    <span class="coupon-cut" aria-hidden="true">${ICON.scissors}</span>
    <div class="coupon-head">
      <h2 class="h-xl">Pide tu modelo</h2>
      <p>Rellena lo que tengas claro; el resto lo montamos juntos. Al enviarla se abre tu correo o tu WhatsApp con la hoja ya escrita. ${ORDER.reply}</p>
    </div>
    <fieldset class="f f-parts"><legend><span class="num">1</span> Piezas que necesitas</legend><div class="chips">${PARTS.map((x) => chip('parts', x.name, 'checkbox')).join('')}</div></fieldset>
    <fieldset class="f"><legend><span class="num">2</span> Momento</legend><div class="chips">${ORDER.stage.map((x) => chip('stage', x)).join('')}</div></fieldset>
    <fieldset class="f"><legend><span class="num">3</span> Plazo</legend><div class="chips">${ORDER.when.map((x) => chip('when', x)).join('')}</div></fieldset>
    <fieldset class="f"><legend><span class="num">4</span> Presupuesto orientativo</legend><div class="chips">${ORDER.budgets.map((x) => chip('budget', x)).join('')}</div></fieldset>
    <fieldset class="f f-wide"><legend><span class="num">5</span> El proyecto</legend>
      <label class="field"><span>¿Qué es tu marca o proyecto y qué te gustaría conseguir?</span><textarea name="about" rows="4"></textarea></label>
    </fieldset>
    <fieldset class="f f-wide"><legend><span class="num">6</span> Tus datos</legend>
      <div class="fields">
        <label class="field"><span>Nombre</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Marca (opcional)</span><input name="brand" autocomplete="organization"></label>
        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
        <label class="field"><span>Teléfono (opcional)</span><input name="phone" type="tel" autocomplete="tel"></label>
      </div>
    </fieldset>
    <input type="hidden" name="model">
    <div class="coupon-send">
      <button class="btn" type="submit" data-via="email">Enviar por email ${ICON.arrow}</button>
      <button class="btn btn-ghost" type="submit" data-via="wa">Enviar por WhatsApp</button>
      <p class="mono note" id="order-note" role="status">Solo usamos estos datos para responderte.</p>
    </div>
    <div class="stamp" aria-hidden="true"><span lang="ja">受付</span><b>GVE</b><span>2026</span></div>
  </form>
</section>`;

  return page({
    title: 'Gomet Verd Estudi — Branding y dirección de arte en Valencia y Barcelona',
    desc: STUDIO.desc, rel: '', r, body, cls: 'is-home', current: 'home'
  });
}

/* ========================================================================
   ABOUT — el manual del estudio y el método Gomet
   ======================================================================== */
function about() {
  const r = '../';
  const steps = METHOD.map((s) => `
    <li class="step" id="paso-${s.n}">
      <div class="step-head">
        <span class="num num-xl">${s.n}</span>
        <div>
          <p class="step-jp" lang="ja">${s.jp}</p>
          <h3 class="step-t">${esc(s.title)}</h3>
          <p class="step-name">${esc(s.name)}</p>
        </div>
      </div>
      <div class="step-fig">${stepFigure(s.fig, `Paso ${s.n}: ${s.title}`)}<span class="fig-no mono">図${s.n}</span></div>
      <p class="step-text">${esc(s.text)}</p>
      <dl class="step-io">
        <div><dt>Pones tú</dt><dd>${esc(s.you)}</dd></div>
        <div><dt>Sale de aquí</dt><dd>${esc(s.out)}</dd></div>
      </dl>
    </li>`).join('');

  const body = `
<section class="sheet manual-head">
  ${bar('00', '取扱説明書', 'Manual del estudio')}
  <div class="manual-grid">
    <div>
      <h1 class="h-xxl">Manual del estudio</h1>
      <p class="lead">Gracias por elegir ${STUDIO.name}. Lee este manual antes de empezar y guárdalo: te va a hacer falta.</p>
      <p>Somos un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Nos gustan las marcas que tienen algo que contar: nuestro trabajo consiste en encontrar ese algo y darle forma, en una identidad, un universo visual, un sistema que funcione igual de bien en un cartel que en una pantalla.</p>
      <p>Trabajamos sobre todo para moda independiente, música y cultura: un estudio de moda que desfila en la 080 Barcelona Fashion Week, un taller de azulejos hechos a mano, un estudio creativo, una promotora cultural, un grupo que estrena disco. Acompañamos cada proyecto de principio a fin, de la primera idea a la última aplicación.</p>
    </div>
    <div class="specs">
      <p class="lbl"><span lang="ja">仕様</span> · Especificaciones</p>
      <table>${SPECS.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    </div>
  </div>
  <aside class="caution caution-wide" aria-label="Precauciones">
    <p class="caution-h">${ICON.warn}<span lang="ja">安全上の注意</span> Precauciones de uso</p>
    <ul>${WARNINGS.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
  </aside>
</section>

${fold()}

<section class="sheet method" id="metodo">
  ${bar('C', '組み立て方', 'El método Gomet', `<span class="bar-r mono">${METHOD.length} pasos</span>`)}
  <div class="sec-head sec-head-wide">
    <h2 class="h-xxl">Cómo se monta<br>una marca</h2>
    <div>
      <p class="lead">Siete pasos, del huevo cerrado al gomet verde.</p>
      <p>Un gomet es una pegatina redonda: la que te ponían en el cole cuando algo estaba bien hecho. Nuestro método es eso mismo convertido en proceso. Empieza escuchando, ordena las piezas, encuentra el hilo, juega y monta, y no se da por terminado hasta que cada pieza encaja y se puede pegar el gomet.</p>
      <p>No es una cadena de montaje: los pasos se repiten, se giran y a veces se saltan. Lo que no cambia es que se juega en equipo con quien nos lo encarga.</p>
    </div>
  </div>
  <ol class="steps">${steps}</ol>
</section>

${fold()}

<section class="sheet rules">
  ${bar('C+', '遊びのルール', 'Las reglas del juego')}
  <div class="wip">
    <p class="wip-big"><span>ALWAYS</span> <span class="wip-g">WIP</span><span>ing</span></p>
    <p class="wip-s"><b>W</b>orking <b>I</b>n <b>P</b>lay · <span lang="ja">遊びながら作る</span></p>
  </div>
  <ol class="rules-list">${RULES.map((x, i) => `<li><span class="mono">${pad(i + 1)}</span><b>${esc(x.k)}</b><span>${esc(x.t)}</span></li>`).join('')}</ol>
</section>

${fold()}

<section class="sheet trouble">
  ${bar('?', '故障かな？と思ったら', 'Solución de problemas')}
  <div class="sec-head"><h2 class="h-xl">¿Crees que algo no funciona?</h2><p>Antes de llamar al servicio técnico, revisa esta tabla.</p></div>
  <div class="table-wrap">
    <table class="tt">
      <thead><tr><th scope="col">Síntoma</th><th scope="col">Causa probable</th><th scope="col">Solución</th></tr></thead>
      <tbody>${TROUBLE.map(([a, b, c]) => `<tr><td data-l="Síntoma">${esc(a)}</td><td data-l="Causa probable">${esc(b)}</td><td data-l="Solución">${esc(c)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
</section>

${fold()}

<section class="sheet crew">
  ${bar('F', '製造元', 'Fabricante')}
  <div class="crew-grid">
    <div>
      <p class="lbl">Han confiado en el estudio</p>
      <ul class="tags">${CLIENTS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>
    <div>
      <p class="lbl">Montado con</p>
      <p>Fotografía, 3D y estudios amigos: ${[...new Set(PROJECTS.flatMap((p) => (p.team.match(/@[\w.]+/g) || [])))].map((h) => `<span class="mono">${esc(h.replace(/\.$/, ''))}</span>`).join(', ')}.</p>
      <p class="mono small">Gomet Verd Estudi · <a href="https://manelvila.com/">Manel Vila</a>, diseño gráfico y dirección de arte</p>
    </div>
    <div class="crew-cta">
      <p class="h-l">¿Tienes un modelo en mente?</p>
      <a class="btn" href="../#pedido">Rellenar la hoja de pedido ${ICON.arrow}</a>
    </div>
  </div>
</section>`;

  return page({
    title: 'Manual del estudio y método Gomet · Gomet Verd Estudi',
    desc: 'Quiénes somos y cómo trabajamos: el método Gomet en siete pasos, de la conversación al gomet verde. Branding y dirección de arte en Valencia y Barcelona.',
    rel: 'about/', r, body, cls: 'is-about', current: 'about'
  });
}

/* ========================================================================
   MODELO — la hoja de montaje de cada proyecto
   ======================================================================== */
function model(p) {
  const r = '../../';
  const prev = PROJECTS[(p.i - 1 + N) % N], next = PROJECTS[(p.i + 1) % N];
  const tools = (p.team || '').trim();
  const steps = p.gallery.map((g, k) => {
    const ar = g.w / g.h;
    const span = ar >= 2.3 ? 'x' : ar >= 1.45 ? 'w' : ar <= 0.8 ? 't' : 's';
    const label = `${p.name}, paso ${k + 1} de ${p.gallery.length}`;
    const sfx = k % 5 === 2 ? `<span class="sfx" lang="ja" aria-hidden="true">カチッ</span>` : '';
    return `<li class="pstep pstep-${span}">
        <button type="button" class="pstep-btn" data-k="${k}" aria-label="Ampliar ${esc(label)}">
          <span class="pstep-no"><span class="num">${k + 1}</span><span class="mono" lang="ja">手順${k + 1}</span></span>
          <span class="pstep-media" style="aspect-ratio:${g.w}/${g.h}">${stepMedia(g, r, label)}</span>${sfx}
        </button>
      </li>`;
  }).join('');
  const lb = p.gallery.map((g) => ({ src: r + g.src, w: g.w, h: g.h }));

  const body = `
<section class="sheet pj-head">
  <div class="pj-bar">
    <a href="../../#modelos" class="pj-back">${ICON.back} Serie completa</a>
    <span class="mono">Modelo ${p.code} · ${p.i + 1}/${N}</span>
    <span class="mono" lang="ja">組立説明書</span>
  </div>
  <div class="pj-grid">
    <div class="pj-title">
      <p class="pj-code" aria-hidden="true">${p.code}</p>
      <h1 class="h-xxl">${esc(p.name)}</h1>
      <p class="pj-tag">${esc(p.tag)}${p.year ? ` · ${p.year}` : ''}</p>
      <p class="lead">${esc(p.short)}</p>
    </div>
    <aside class="pj-box">
      <p class="lbl"><span lang="ja">内容物</span> · Contenido de la cápsula</p>
      <ul class="pj-parts">${p.services.map((s, k) => `<li><span class="mono">A${k + 1}</span><span>${esc(s)}</span><span class="mono">×1</span></li>`).join('')}</ul>
      ${tools ? `<p class="lbl"><span lang="ja">必要な道具</span> · Herramientas</p><p class="pj-tools">${esc(tools)}</p>` : ''}
      <p class="lbl"><span lang="ja">製造元</span> · Montado en</p><p class="pj-tools">${STUDIO.name} · ${STUDIO.cities}</p>
    </aside>
  </div>
</section>

<section class="sheet pj-intro">
  <figure class="pj-fig">
    ${coverMedia(p, r, { lazy: false, cls: 'pj-cover' })}
    <figcaption class="mono"><span lang="ja">図1 完成図</span> · Modelo terminado</figcaption>
  </figure>
  <div class="pj-text">
    <p class="lbl"><span lang="ja">はじめに</span> · Antes de empezar</p>
    <p class="pj-long">${esc(p.long || p.short)}</p>
    <p class="pj-hint mono">${ICON.warn} Pulsa cualquier paso para verlo en grande.</p>
  </div>
</section>

${fold()}

<section class="sheet pj-steps">
  ${bar('A', '組み立て方', 'Montaje', `<span class="bar-r mono">${p.gallery.length} pasos</span>`)}
  <ol class="psteps">${steps}</ol>
  <script type="application/json" id="lb-data">${JSON.stringify(lb)}</script>
</section>

<section class="sheet pj-done">
  <div class="done">
    <p class="done-jp" lang="ja">完成!</p>
    <div>
      <p class="h-xl">¡Modelo terminado!</p>
      <p>${esc(p.name)} ya está montado. ¿Montamos el tuyo?</p>
      <a class="btn" href="../../?m=${p.slug}#pedido">Pedir un modelo como este ${ICON.arrow}</a>
    </div>
    <span class="done-gomet" aria-hidden="true"><span>¡Bien<br>hecho!</span></span>
  </div>
  <nav class="pj-nav" aria-label="Otros modelos">
    <a href="../${prev.slug}/"><span class="mono">${ICON.back} Anterior · ${prev.code}</span><b>${esc(prev.name)}</b></a>
    <a href="../${next.slug}/"><span class="mono">Siguiente · ${next.code} ${ICON.arrow}</span><b>${esc(next.name)}</b></a>
  </nav>
</section>`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.name, description: p.long || p.short,
    genre: p.tag, url: `${STUDIO.site}/modelos/${p.slug}/`, image: `${STUDIO.site}/${p.cover.poster}`,
    creator: { '@type': 'Organization', '@id': `${STUDIO.site}/#studio`, name: STUDIO.name }
  };
  return page({
    title: `${p.name} · ${p.tag} · Gomet Verd Estudi`.slice(0, 70),
    desc: `${p.short} ${p.tag} de ${STUDIO.name}, estudio de branding y dirección de arte en Valencia y Barcelona.`,
    rel: `modelos/${p.slug}/`, r, body, cls: 'is-model', image: p.cover.poster, jsonld: ld
  });
}

function notFound() {
  const r = '/';
  const body = `<section class="sheet lost">
  ${bar('404', '部品が足りません', 'Falta una pieza')}
  <div class="lost-in"><p class="h-xxl">Falta una pieza.</p><p class="lead">Esta página no venía en la cápsula. Vuelve a la tapa y empieza por el paso 1.</p><a class="btn" href="/">Volver a la tapa ${ICON.arrow}</a></div>
</section>`;
  return page({ title: 'Falta una pieza · Gomet Verd Estudi', desc: STUDIO.desc, rel: '404', r, body, cls: 'is-404' });
}

/* ---------- escribir ---------- */
function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}
write('index.html', home());
write('about/index.html', about());
PROJECTS.forEach((p) => write(`modelos/${p.slug}/index.html`, model(p)));
write('404.html', notFound());

const today = new Date().toISOString().slice(0, 10);
const urls = ['', 'about/', ...PROJECTS.map((p) => `modelos/${p.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${STUDIO.site}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${STUDIO.site}/sitemap.xml\n`);
console.log(`OK · ${urls.length} páginas`);
