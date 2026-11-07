/*
 * Dibujos de la web.
 * Las axonometrías y el logotipo salen tal cual de la presentación «Método» de Figma (assets/figma/*.svg).
 * Aquí solo se recortan, se rotulan, se agrupan por capas para animarlas y cada círculo de
 * validación se convierte en un gomet verde.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIGDIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/figma');
const readFig = (f) => fs.readFileSync(path.join(FIGDIR, f), 'utf8');
const pathsOf = (svg) => svg.match(/<path [^>]*\/>/g);
/* círculo blanco con check → gomet verde (clases .val y .val-k en gve.css) */
const gomets = (svg) => svg.replace(/(<path d="[^"]+" fill="white" stroke="#1B1B1B")(\/>\s*<path )(d="[^"]+" stroke="#1B1B1B" stroke-width="1.4")/g, '$1 class="val"$2class="val-k" $3');
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const t = (x, y, cls, s, anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${s}</text>`;
const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/* ---------- color de catálogo: cada cara de cada volumen se pinta por CSS ----------
 * ft = tapa, fl = lateral izquierdo, fr = lateral derecho · a = cara gris en Figma (toma el color de su capa),
 * w = cara blanca (se sombrea en crema) · L-xxx / P0–P7 = capa o fase, que fija el color (gve.css) */
const PAINT_ALL = new Set(['cim', 'pa', 'pc', 'book', 'P4']);
function face(p, layer) {
  if (/class=/.test(p) || /stroke-dasharray/.test(p)) return p;
  const fill = (p.match(/fill="([^"]+)"/) || [])[1];
  if (!fill || fill === 'none' || !/Z"/.test(p)) return layer ? p.replace('<path ', `<path class="L-${layer}" `) : p;
  const d = p.match(/d="([^"]+)"/)[1];
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  let kind = 'ft';
  if (/V/.test(d)) kind = nums[3] > nums[1] ? 'fl' : 'fr';
  const tone = fill === 'white' && !PAINT_ALL.has(layer) ? 'w' : 'a';
  const cls = layer && layer[0] === 'P' ? layer : `L-${layer}`;
  return p.replace('<path ', `<path class="f ${kind} ${tone} ${cls}" `);
}

/* ---------- logotipo (casco incluido), en el color del texto ---------- */
export const LOGO = readFig('logo-gve.svg').replace('<svg ', '<svg class="logo" role="img" aria-label="Gomet Verd Estudi · ALWAYS WIPing [Working In Play]" ');

/* ---------- el edificio, capa a capa ----------
 * Índices = orden de los trazos en edificio.svg:
 *   0 guías · 1–5 solar (1, 3, 4: el terreno estudiado; 2, 5: el solar elegido) · 6–9 cimientos
 *   10–22 estructura · 23–34 plantas · 35–46 instalaciones y remates · 47–56 llaves
 *   57–66 validaciones · 67–70 corchetes de los actos · 71–82 líneas de rótulo */
const LAYER_OF = (i) => i === 3 ? 'grid' : i <= 5 ? 'sol' : i <= 9 ? 'cim' : i <= 22 ? 'est' : i <= 26 ? 'pa' : i <= 30 ? 'pb' : i <= 34 ? 'pc' : i <= 46 ? 'ins' : i <= 52 ? 'book' : i <= 56 ? 'key' : '';
const ED = pathsOf(gomets(readFig('edificio.svg'))).map((p, i) => (i >= 1 && i <= 56 ? face(p, LAYER_OF(i)) : p));
const pick = (idx) => idx.map((i) => ED[i]).join('');
const LEAD = { solar: [71, 72], cimientos: [73, 74], estructura: [75, 76], plantas: [77, 78], instalaciones: [79, 80], llaves: [81, 82] };
const VALS = [[57, 58], [59, 60], [61, 62], [63, 64], [65, 66]];
const ACT_LABELS = t(826, 453, 'svg-k act-c', 'CONSTRUIR', 'end') + t(826, 756, 'svg-k act-d', 'DEFINIR', 'end') + t(826, 966, 'svg-k act-e', 'ENTENDER', 'end') + t(666, 654, 'svg-k act-m', 'MANTENER', 'end') + t(666, 680, 'svg-p act-m', '08 Mantenimiento', 'end');
/* Ampliación (fase 08): un volumen en discontinua sobre el edificio terminado, dibujado con la misma axonometría. */
const AMPLIACION = '<path d="M952.7 272L1080 229.6L1207.3 272L1080 314.4Z" stroke="#1B1B1B" stroke-width="0.9" stroke-linejoin="round" stroke-dasharray="4 4"/><path d="M952.7 352V272M1207.3 352V272M1080 394.4V314.4" stroke="#1B1B1B" stroke-width="0.9" stroke-dasharray="4 4"/><path d="M1060 272H1100M1080 262V282" stroke="#1B1B1B" stroke-width="1.2"/><path d="M1207.3 272H1360" stroke="#A3A3A1"/><circle cx="1207.3" cy="272" r="2.6" fill="#1B1B1B"/>';

/* Para la portada: el plano en fantasma y, encima, cada fase en su grupo (assets/js/gve.js las monta con el scroll). */
export function obraSVG(layers) {
  const lab = Object.fromEntries(layers.map((l) => [l.k, l]));
  const label = (k, y, name, ph) => `${t(1376, y + 7, 'svg-k', `[${name.toUpperCase()}]`)}${t(1376, y + 33, 'svg-p', ph)}`;
  const ghost = `<g class="ghost" aria-hidden="true">${pick(range(1, 56))}</g>`;
  const ph = (n, art, extra = '') => `<g class="ph" data-ph="${n}">${art}${extra}</g>`;
  const L = (k, n) => pick(LEAD[k]) + label(k, lab[n].y, lab[n].k, lab[n].ph);
  const groups = [
    ph(1, pick([1, 3, 4]), pick(LEAD.solar) + label('solar', 960, 'Terreno', '01 Workshop')),
    ph(2, pick([2, 5]), `<g class="relabel">${label('solar', 1010, 'Solar', '02 Estrategia')}</g>`),
    ph(3, pick(range(6, 9)), L('cimientos', 'Cimientos')),
    ph(4, pick(range(10, 22)), L('estructura', 'Estructura')),
    ph(5, pick(range(23, 34)), L('plantas', 'Plantas')),
    ph(6, pick(range(35, 46)), L('instalaciones', 'Instalaciones y remates')),
    ph(7, pick(range(47, 56)), L('llaves', 'Llaves')),
    ph(8, AMPLIACION, label('ampliaciones', 272, 'Ampliaciones', '08 Mantenimiento'))
  ].join('');
  const vals = VALS.map((x, k) => `<g class="v" data-v="${k + 1}">${pick(x)}</g>`).join('');
  return `<svg class="obra-svg" fill="none" viewBox="505 196 1260 850" data-vb-narrow="890 196 360 850" role="img" aria-labelledby="obra-t">
  <title id="obra-t">El edificio de una marca se levanta de abajo arriba: terreno y solar, cimientos, estructura, plantas, instalaciones y remates, llaves y, por último, las ampliaciones. Entre capa y capa, un gomet verde: una validación con vosotros.</title>
  ${pick([0])}${ghost}<g class="acts">${pick(range(67, 70))}${ACT_LABELS}</g>${groups}${vals}</svg>`;
}

/* El edificio entero (página Método): se monta solo al entrar en pantalla. */
export function edificio(layers) {
  const parts = [range(1, 5), range(6, 9), range(10, 22), range(23, 34), range(35, 46), range(47, 56)];
  const leads = [LEAD.solar, LEAD.cimientos, LEAD.estructura, LEAD.plantas, LEAD.instalaciones, LEAD.llaves];
  const lab = [...layers].reverse(); // de abajo arriba, como se construye
  const g = parts.map((x, k) => `<g class="ed-layer" data-k="${k}">${pick(x)}${pick(leads[k])}${t(1376, lab[k].y + 7, 'svg-k', `[${lab[k].k.toUpperCase()}]`)}${t(1376, lab[k].y + 33, 'svg-p', lab[k].ph)}</g>`).join('');
  const v = VALS.map((x, k) => `<g class="ed-val" data-k="${k}">${pick(x)}</g>`).join('');
  return `<svg class="edificio" fill="none" viewBox="470 286 1400 760" data-vb-narrow="880 286 380 760" role="img" aria-label="El edificio de una marca, de abajo arriba: solar, cimientos, estructura, plantas, instalaciones y remates, y llaves. Entre cada capa, un gomet verde.">${pick([0])}<g class="ed-acts">${pick(range(67, 70))}${ACT_LABELS}</g>${g}${v}</svg>`;
}

/* ---------- la línea de fases (una vez por página; cada icono es un <use> recortado) ---------- */
const PHASE_X = [150, 381.4, 612.9, 844.3, 1075.7, 1307.2, 1538.6, 1770];
const phaseOf = (p) => { const x = +p.match(/d="M(-?[\d.]+)/)[1]; let k = 0; PHASE_X.forEach((c, i) => { if (Math.abs(x - c) < Math.abs(x - PHASE_X[k])) k = i; }); return k; };
export const FASES_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><g id="fig-fases" fill="none">${pathsOf(gomets(readFig('fases.svg'))).map((p) => face(p, 'P' + phaseOf(p))).join('')}</g></defs></svg>`;
export function phaseIcon(i, label) {
  return `<svg class="ph-icon" fill="none" viewBox="${PHASE_X[i] - 112} 594 224 172" role="img" aria-label="${label}"><use href="#fig-fases"/></svg>`;
}
export function timeline(phases, acts) {
  const actX = [[50, 481.4], [512.9, 944.3], [975.7, 1638.6], [1670, 1870]];
  const a = acts.map((x, k) => t((actX[k][0] + actX[k][1]) / 2, 556, 'svg-k', x.k.toUpperCase(), 'middle')).join('');
  const p = phases.map((x, k) => t(PHASE_X[k], 906, 'svg-p', `${x.n} ${x.key}`, 'middle') + t(PHASE_X[k], 932, 'svg-s', `[${x.layer}]`, 'middle')).join('');
  return `<svg class="timeline" fill="none" viewBox="30 520 1860 430" role="img" aria-label="Las ocho fases en cuatro actos, con una validación entre cada fase y la siguiente"><use href="#fig-fases"/>${a}${p}</svg>`;
}

/* ---------- lo que suele pasar: la fachada primero, sin cimientos ---------- */
export function fachada(labels) {
  const p = pathsOf(readFig('fachada.svg')).join('');
  const ys = [563, 667, 841];
  return `<svg class="fachada" fill="none" viewBox="580 370 1340 700" role="img" aria-label="Una marca que empieza por la fachada: plantas que no encajan y sin cimientos">${p}${labels.map((l, k) => t(1612, ys[k], 'svg-k', `[${l.toUpperCase()}]`)).join('')}</svg>`;
}

/* ---------- viga de celosía: técnica arriba, creatividad abajo; un gomet en cada vertical validada ---------- */
export function truss(n = 8) {
  const W = 1600, H = 120, bw = W / n, y0 = 20, y1 = 100;
  let s = `<path d="M0 ${y0}H${W}M0 ${y1}H${W}" stroke="#1B1B1B" stroke-width="1.6"/><path d="M0 ${y0 - 10}H${W}M0 ${y1 + 10}H${W}" stroke="#D4D4D1" stroke-width="1"/>`;
  for (let k = 0; k < n; k++) {
    const x = k * bw;
    s += `<path class="tr-d" d="M${x} ${k % 2 ? y0 : y1}L${x + bw} ${k % 2 ? y1 : y0}" stroke="#1B1B1B" stroke-width="1.1" pathLength="1"/>`;
    s += `<path d="M${x} ${y0}L${x + bw / 2} ${y1}L${x + bw} ${y0}" stroke="#B3B3B1" stroke-width=".8"/>`;
  }
  for (let k = 0; k <= n; k++) s += `<path d="M${k * bw} ${y0}V${y1}" stroke="#1B1B1B" stroke-width="${k >= 2 && k <= 6 ? 2.2 : 1.1}"/>`;
  for (let k = 2; k <= 6; k++) s += `<g class="tr-v" style="--i:${k - 2}"><circle cx="${k * bw}" cy="${(y0 + y1) / 2}" r="11" class="val"/><path d="M${k * bw - 4.6} ${(y0 + y1) / 2 + .3}L${k * bw - 1.4} ${(y0 + y1) / 2 + 3.7}L${k * bw + 4.8} ${(y0 + y1) / 2 - 3.7}" class="val-k" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  return `<svg class="truss" fill="none" viewBox="-2 0 ${W + 4} ${H}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

/* ---------- el obrero del casco, recortado del logotipo, con el casco pintado ---------- */
const HEAD = readFig('logo-gve.svg').match(/<path d="M1(?:240\.74|231\.25|339\.99|180\.14)[^>]*\/>/g).join('');
export const WORKER = `<svg class="worker" viewBox="1166 14 196 206" aria-hidden="true"><path d="M1203 92 C1210 52 1240 30 1274 30 C1310 30 1338 54 1344 92 Z" class="helmet"/><g fill="currentColor">${HEAD}</g></svg>`;

/* ---------- catálogo de piezas: volúmenes isométricos dibujados con código ----------
 * box(x, y, z, ancho, fondo, alto, color) → tapa y dos laterales; se pintan de atrás adelante. */
const C30 = Math.cos(Math.PI / 6);
const iso = (x, y, z) => [(x - y) * C30 * 20, (x + y) * 0.5 * 20 - z * 20];
const poly = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
const box = (x, y, z, w, d, h, c) => ({ x, y, z, w, d, h, c });
function drawBoxes(list) {
  const faces = [], all = [];
  [...list].sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z)).forEach(({ x, y, z, w, d, h, c }) => {
    const P = (a, b, cc) => { const q = iso(a, b, cc); all.push(q); return q; };
    const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
    const cls = (k) => `class="f ${k} ${c === 'white' ? 'w' : 'a'} c-${c}"`;
    faces.push(`<path ${cls('fl')} d="${poly(left)}"/><path ${cls('fr')} d="${poly(right)}"/><path ${cls('ft')} d="${poly(top)}"/>`);
  });
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 6, Math.max(...xs) + 6, Math.min(...ys) - 6, Math.max(...ys) + 6];
  return { svg: faces.join(''), vb: `${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}` };
}
const PIECES = {
  'Identidad corporativa': [box(0, 0, 0, 2, 2, 4, 'red'), box(0.5, 0.5, 4, 1, 1, 1, 'yellow')],
  'Dirección de arte': [box(0, 0, 0, 4, 2, 1, 'blue'), box(0.5, 0, 1, 3, 2, 1, 'red'), box(1, 0, 2, 2, 2, 1, 'yellow')],
  'Packaging': [box(0, 0, 0, 3, 3, 2, 'yellow'), box(-0.15, -0.15, 2.7, 3.3, 3.3, 0.5, 'red')],
  'Diseño editorial': [box(0, 0, 0, 3, 2, 0.45, 'white'), box(0, 0, 0.45, 3, 2, 0.45, 'blue'), box(0.2, 0, 0.9, 3, 2, 0.45, 'red'), box(0, 0, 1.35, 3, 2, 0.45, 'white')],
  'Lettering': [box(0, 0, 0, 3, 1, 1, 'red'), box(0, 0, 1, 1, 1, 3, 'red')],
  'Cartelería': [box(0, 0, 0, 3.4, 1.2, 0.35, 'blue'), box(0.2, 0.4, 0.35, 3, 0.3, 3.2, 'white')],
  'Redes sociales': [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => box(i * 1.25, j * 1.25, 0, 1, 1, [1, 0.6, 1.4][(i + j) % 3], ['red', 'yellow', 'blue'][(i * 2 + j) % 3]))),
  '3D': [box(0, 0, 0, 2.4, 2.4, 2.4, 'blue'), box(2.9, 0.7, 0, 1, 1, 1, 'yellow')],
  'Títulos y créditos': [box(0, 0, 0, 5, 1, 1, 'yellow'), box(0.6, 0, 1, 3.2, 1, 1, 'red')],
  'Web': [box(0, 0, 0, 3, 3, 0.4, 'white'), box(0, 0, 0.4, 2, 3, 0.8, 'blue'), box(0, 0, 1.2, 1, 3, 0.8, 'yellow')]
};
export const PIECE_COLORS = Object.fromEntries(Object.entries(PIECES).map(([k, v]) => [k, [...new Set(v.map((b) => b.c))]]));
export function piece(name) {
  const { svg, vb } = drawBoxes(PIECES[name]);
  return `<svg class="piece" viewBox="${vb}" role="img" aria-label="${name}"><g stroke="#1B1B1B" stroke-width="1.3" stroke-linejoin="round">${svg}</g></svg>`;
}

/* ---------- pictogramas ---------- */
export const ICON = {
  arrow: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3,12 H20 M14,6 L20,12 L14,18" ${S}/></svg>`,
  back: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21,12 H4 M10,6 L4,12 L10,18" ${S}/></svg>`,
  down: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12,3 V20 M6,14 L12,20 L18,14" ${S}/></svg>`,
  menu: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3,7 H21 M3,12 H21 M3,17 H21" ${S}/></svg>`
};
