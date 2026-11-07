/*
 * Dibujos de la web: línea negra de manual, trama de puntos y un único color de tinta plana
 * (el verde del gomet). El amarillo es solo para la cápsula.
 * Todos son SVG en línea: pesan casi nada y se ven nítidos a cualquier tamaño.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/* ---------- el huevo de la portada (lo anima assets/js/gve.js al hacer scroll) ---------- */
function zig(x0, x1, y, amp, step) {
  const pts = [];
  for (let x = x0, i = 0; x <= x1; x += step, i++) pts.push([x, y + (i % 2 ? amp : -amp)]);
  return pts;
}
export function eggHero() {
  const EGG = 'M300,70 C392,70 452,192 452,312 C452,414 386,474 300,474 C214,474 148,414 148,312 C148,192 208,70 300,70 Z';
  const z = zig(130, 470, 292, 11, 20);
  const zPath = z.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const topClip = `M100,0 H500 V${z[z.length - 1][1] + 3} ${[...z].reverse().map(([x, y]) => `L${x},${y + 3}`).join(' ')} L100,${z[0][1] + 3} Z`;
  const botClip = `M100,${z[0][1]} ${z.map(([x, y]) => `L${x},${y}`).join(' ')} L500,${z[z.length - 1][1]} V560 H100 Z`;
  const CAP_T = 'M222,332 V312 A78,78 0 0 1 378,312 V332 Z';
  const CAP_B = 'M222,332 V352 A78,78 0 0 0 378,352 V332 Z';
  const panels = [0, 1, 2, 3].map((i) => `<g class="lf-panel" data-i="${i}"><rect x="${i * 62}" y="0" width="62" height="86" class="${i % 2 ? 'lf-b' : 'lf-a'}"/></g>`).join('');
  return `<svg class="egg" viewBox="40 -40 520 560" role="img" aria-labelledby="egg-t">
  <title id="egg-t">Dibujo de montaje: un huevo sorpresa se abre, sale una cápsula y de la cápsula, estas instrucciones</title>
  <defs>
    <pattern id="tone" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.15" fill="currentColor"/></pattern>
    <mask id="tone-m"><rect x="40" y="-40" width="520" height="560" fill="#fff"/><ellipse cx="276" cy="276" rx="150" ry="186" fill="#000"/></mask>
    <clipPath id="clip-top"><path d="${topClip}"/></clipPath>
    <clipPath id="clip-bot"><path d="${botClip}"/></clipPath>
    <clipPath id="clip-egg"><path d="${EGG}"/></clipPath>
    <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <ellipse id="egg-shadow" class="egg-shadow" cx="300" cy="484" rx="140" ry="14" fill="url(#tone)" opacity=".55"/>
  <g id="leaflet" class="leaflet" transform="translate(340,230) scale(0.001)">
    <g class="lf-inner">${panels}
      <text x="124" y="42" text-anchor="middle" class="lf-jp">組立説明書</text>
      <text x="124" y="62" text-anchor="middle" class="lf-es">INSTRUCCIONES · GVE</text>
      <g class="lf-deco"><circle cx="16" cy="16" r="8" fill="currentColor"/><text x="16" y="19.5" text-anchor="middle" class="lf-n">1</text>
        <path d="M31,30 C40,30 46,46 46,56 C46,66 40,72 31,72 C22,72 16,66 16,56 C16,46 22,30 31,30 Z" ${S} stroke-width="1.4"/>
        <path d="M14,54 l5,-3 l5,3 l5,-3 l5,3 l5,-3 l5,3 l5,-3" ${S} stroke-width="1.1" stroke-dasharray="2 2"/>
        <circle cx="226" cy="20" r="9" class="gomet-fill"/>
        <path d="M200,44 H236 M200,54 H230 M200,64 H236 M200,74 H222" ${S} stroke-width="1.2" opacity=".55"/></g>
    </g>
  </g>
  <g id="capsule" class="capsule">
    <path d="${CAP_B}" class="cap"/>
    <path d="M222,346 H378" ${S} opacity=".5"/>
    <g id="cap-top"><path d="${CAP_T}" class="cap"/><path d="M216,326 H384 V340 H216 Z" class="cap-lip"/><path d="M246,268 Q262,252 282,248" ${S} opacity=".55"/></g>
  </g>
  <g id="egg-bot">
    <g clip-path="url(#clip-bot)">
      <path d="${EGG}" class="shell"/>
      <path d="${EGG}" fill="url(#tone)" mask="url(#tone-m)" stroke="none"/>
      <path d="${EGG}" ${S} stroke-width="2.4"/>
    </g>
  </g>
  <g id="egg-top">
    <g clip-path="url(#clip-top)">
      <path d="${EGG}" class="shell"/>
      <path d="${EGG}" fill="url(#tone)" mask="url(#tone-m)" stroke="none"/>
      <path d="${EGG}" ${S} stroke-width="2.4"/>
    </g>
    <g class="egg-gomet"><circle cx="362" cy="196" r="27" class="gomet-fill"/><circle cx="362" cy="196" r="27" ${S} stroke-width="1.6"/><path d="M349,184 A16,16 0 0 1 366,178" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><text x="362" y="201" text-anchor="middle" class="gomet-txt">GVE</text></g>
  </g>
  <path id="split" d="${zPath}" ${S} stroke-dasharray="6 6" class="split" clip-path="url(#clip-egg)"/>
  <g id="arrows" class="egg-arrows">
    <path class="a1" d="M236,58 C128,36 62,196 96,372" ${S} stroke-dasharray="7 7" marker-end="url(#ah)"/>
    <path class="a2" d="M340,190 C340,160 340,130 340,104" ${S} stroke-dasharray="7 7" marker-end="url(#ah)"/>
  </g>
</svg>`;
}

/* ---------- láminas del método (dibujos exportados de la presentación «Método» en Figma) ----------
 * Los SVG de assets/figma/ son los dibujos tal cual salen de Figma. Aquí solo se recortan, se rotulan
 * y cada círculo de validación se convierte en un gomet verde. */
const FIGDIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/figma');
const readFig = (f) => fs.readFileSync(path.join(FIGDIR, f), 'utf8');
const pathsOf = (svg) => svg.match(/<path [^>]*\/>/g);
/* círculo blanco con check → gomet verde (clases .val y .val-k en gve.css) */
const gomets = (svg) => svg.replace(/(<path d="[^"]+" fill="white" stroke="#1B1B1B")(\/>\s*<path )(d="[^"]+" stroke="#1B1B1B" stroke-width="1.4")/g, '$1 class="val"$2class="val-k" $3');
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const t = (x, y, cls, s, anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${s}</text>`;

/* El logotipo del estudio (casco incluido), en el color del texto. */
export const LOGO = readFig('logo-gve.svg').replace('<svg ', '<svg class="logo" role="img" aria-label="Gomet Verd Estudi · ALWAYS WIPing [Working In Play]" ');

/* La línea de fases se dibuja una vez por página y se reutiliza (<use>) para cada icono. */
export const FASES_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><g id="fig-fases" fill="none">${gomets(pathsOf(readFig('fases.svg')).join(''))}</g></defs></svg>`;
const PHASE_X = [150, 381.4, 612.9, 844.3, 1075.7, 1307.2, 1538.6, 1770];
export function phaseIcon(i, label) {
  return `<svg class="ph-icon" fill="none" viewBox="${PHASE_X[i] - 112} 594 224 172" role="img" aria-label="${label}"><use href="#fig-fases"/></svg>`;
}
/* Fases y validaciones: la obra entera en una línea. */
export function timeline(phases, acts) {
  const actX = [[50, 481.4], [512.9, 944.3], [975.7, 1638.6], [1670, 1870]];
  const a = acts.map((x, k) => t((actX[k][0] + actX[k][1]) / 2, 556, 'svg-k', x.k.toUpperCase(), 'middle')).join('');
  const p = phases.map((x, k) => t(PHASE_X[k], 906, 'svg-p', `${x.n} ${x.key}`, 'middle') + t(PHASE_X[k], 932, 'svg-s', `[${x.layer}]`, 'middle')).join('');
  return `<svg class="timeline" fill="none" viewBox="30 520 1860 430" role="img" aria-label="Las ocho fases en cuatro actos, con una validación entre cada fase y la siguiente"><use href="#fig-fases"/>${a}${p}</svg>`;
}

/* El edificio explotado: se monta capa a capa (assets/js/gve.js). Índices = orden de los trazos en edificio.svg. */
export function edificio(layers) {
  const p = gomets(pathsOf(readFig('edificio.svg')).join('\n')).split('\n');
  const pick = (idx) => idx.map((i) => p[i]).join('');
  const parts = [
    { art: range(1, 5), lead: [71, 72] }, { art: range(6, 9), lead: [73, 74] }, { art: range(10, 22), lead: [75, 76] },
    { art: range(23, 34), lead: [77, 78] }, { art: range(35, 46), lead: [79, 80] }, { art: range(47, 56), lead: [81, 82] }
  ];
  const lab = [...layers].reverse(); // de abajo arriba, como se construye
  const g = parts.map((x, k) => `<g class="ed-layer" data-k="${k}"><g class="ed-art">${pick(x.art)}</g>${pick(x.lead)}${t(1376, lab[k].y + 7, 'svg-k', `[${lab[k].k.toUpperCase()}]`)}${t(1376, lab[k].y + 33, 'svg-p', lab[k].ph)}</g>`).join('');
  const v = [[57, 58], [59, 60], [61, 62], [63, 64], [65, 66]].map((x, k) => `<g class="ed-val" data-k="${k}">${pick(x)}</g>`).join('');
  const acts = pick(range(67, 70)) + t(826, 453, 'svg-k', 'CONSTRUIR', 'end') + t(826, 756, 'svg-k', 'DEFINIR', 'end') + t(826, 966, 'svg-k', 'ENTENDER', 'end') + t(666, 654, 'svg-k', 'MANTENER', 'end') + t(666, 680, 'svg-p', '08 Mantenimiento', 'end');
  return `<svg class="edificio" fill="none" viewBox="470 286 1400 760" data-vb-narrow="880 286 380 760" role="img" aria-labelledby="ed-t"><title id="ed-t">El edificio de una marca, de abajo arriba: solar, cimientos, estructura, plantas, instalaciones y remates, y llaves. Entre cada capa, un gomet verde: una validación conjunta.</title>${pick([0])}<g class="ed-acts">${acts}</g>${g}${v}</svg>`;
}

/* Lo que suele pasar: la fachada primero, sin cimientos. */
export function fachada(labels) {
  const p = pathsOf(readFig('fachada.svg')).join('');
  const ys = [563, 667, 841];
  return `<svg class="fachada" fill="none" viewBox="580 370 1340 700" role="img" aria-label="Una marca que empieza por la fachada: plantas que no encajan y sin cimientos">${p}${labels.map((l, k) => t(1612, ys[k], 'svg-k', `[${l.toUpperCase()}]`)).join('')}</svg>`;
}

/* Viga de celosía: técnica arriba, creatividad abajo, unidas por triángulos; un gomet en cada vertical validada. */
export function truss(n = 8) {
  const W = 1600, H = 120, bw = W / n, y0 = 20, y1 = 100;
  let s = `<path d="M0 ${y0}H${W}M0 ${y1}H${W}" stroke="#1B1B1B" stroke-width="1.6"/><path d="M0 ${y0 - 10}H${W}M0 ${y1 + 10}H${W}" stroke="#D4D4D1" stroke-width="1"/>`;
  for (let k = 0; k < n; k++) {
    const x = k * bw;
    s += `<path d="M${x} ${k % 2 ? y0 : y1}L${x + bw} ${k % 2 ? y1 : y0}" stroke="#1B1B1B" stroke-width="1.1"/>`;
    s += `<path d="M${x} ${y0}L${x + bw / 2} ${y1}L${x + bw} ${y0}" stroke="#B3B3B1" stroke-width=".8"/>`;
  }
  for (let k = 0; k <= n; k++) s += `<path d="M${k * bw} ${y0}V${y1}" stroke="#1B1B1B" stroke-width="${k >= 2 && k <= 6 ? 2.2 : 1.1}"/>`;
  for (let k = 2; k <= 6; k++) s += `<circle cx="${k * bw}" cy="${(y0 + y1) / 2}" r="11" class="val"/><path d="M${k * bw - 4.6} ${(y0 + y1) / 2 + .3}L${k * bw - 1.4} ${(y0 + y1) / 2 + 3.7}L${k * bw + 4.8} ${(y0 + y1) / 2 - 3.7}" class="val-k" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  return `<svg class="truss" fill="none" viewBox="-2 0 ${W + 4} ${H}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

/* ---------- pictogramas ---------- */
export const ICON = {
  warn: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12,2.5 L22.5,21 H1.5 Z" fill="currentColor"/><path d="M12,9 V14.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="#fff"/></svg>`,
  scissors: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3" ${S}/><circle cx="6" cy="18" r="3" ${S}/><path d="M8.6,7.6 L21,18 M8.6,16.4 L21,6" ${S}/></svg>`,
  arrow: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3,12 H20 M14,6 L20,12 L14,18" ${S}/></svg>`,
  back: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21,12 H4 M10,6 L4,12 L10,18" ${S}/></svg>`,
  /* «No apto para marcas sin ganas de jugar»: una cara aburrida, tachada */
  bored: `<svg class="ico ico-lg" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" ${S} stroke-width="3"/><circle cx="17" cy="21" r="2" fill="currentColor"/><circle cx="31" cy="21" r="2" fill="currentColor"/><path d="M16,31 H32" ${S} stroke-width="2.4"/><path d="M9,9 L39,39" ${S} stroke-width="3.4"/></svg>`,
  play: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7,4 L20,12 L7,20 Z" fill="currentColor"/></svg>`
};

/* Código de barras decorativo de la contraportada (el patrón sale del texto). */
export function barcode(text) {
  let h = 2166136261;
  const bars = [];
  for (let i = 0; i < 46; i++) {
    h ^= text.charCodeAt(i % text.length) + i; h = Math.imul(h, 16777619) >>> 0;
    bars.push(1 + (h % 3));
  }
  let x = 0, out = '';
  bars.forEach((w, i) => { if (i % 2 === 0 || i < 3 || i > 42) out += `<rect x="${x}" y="0" width="${w}" height="${i < 3 || i > 42 || i === 22 ? 46 : 40}"/>`; x += w + 1; });
  return `<svg class="barcode" viewBox="0 0 ${x} 46" preserveAspectRatio="none" aria-hidden="true"><g fill="currentColor">${out}</g></svg>`;
}
