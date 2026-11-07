/*
 * Dibujos de la web: línea negra de manual, trama de puntos y un único color de tinta plana
 * (el verde del gomet). El amarillo es solo para la cápsula.
 * Todos son SVG en línea: pesan casi nada y se ven nítidos a cualquier tamaño.
 */

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

/* ---------- dibujos de los siete pasos del método ---------- */
const FIG = {
  talk: `
    <path d="M86,64 C110,64 124,96 124,118 C124,140 108,152 86,152 C64,152 48,140 48,118 C48,96 62,64 86,64 Z" ${S}/>
    <circle cx="104" cy="92" r="9" class="gomet-fill"/>
    <path d="M136,18 H212 A18,18 0 0 1 212,54 H158 L140,70 L144,54 H136 A18,18 0 0 1 136,18 Z" ${S}/>
    <circle cx="160" cy="36" r="2.6" fill="currentColor"/><circle cx="174" cy="36" r="2.6" fill="currentColor"/><circle cx="188" cy="36" r="2.6" fill="currentColor"/>
    <path d="M22,22 H66 A14,14 0 0 1 66,50 H52 L48,62 L40,50 H22 A14,14 0 0 1 22,22 Z" ${S}/>
    <text x="44" y="42" text-anchor="middle" class="fig-t">?</text>
    <path d="M150,96 q12,-6 24,0 M150,112 q16,-8 32,0 M150,128 q20,-10 40,0" ${S} opacity=".55"/>`,
  parts: `
    <rect x="16" y="16" width="208" height="128" rx="12" ${S}/>
    <path d="M16,80 H224 M120,16 V144" ${S} stroke-width="3"/>
    <circle cx="66" cy="48" r="18" class="paper" ${S}/><text x="66" y="53" text-anchor="middle" class="fig-s">A</text>
    <rect x="150" y="32" width="44" height="32" rx="4" class="paper" ${S}/><text x="172" y="53" text-anchor="middle" class="fig-s">B</text>
    <rect x="40" y="98" width="54" height="26" rx="13" class="paper" ${S}/><text x="67" y="116" text-anchor="middle" class="fig-s">C</text>
    <path d="M172,96 L196,128 H148 Z" class="paper" ${S}/><text x="172" y="123" text-anchor="middle" class="fig-s">D</text>
    <path d="M66,66 V80 M172,64 V80 M67,98 V80 M172,96 V80" ${S}/>`,
  thread: `
    <path d="M22,128 C44,60 70,140 96,92 S130,26 150,64 S188,128 214,40" ${S} stroke-dasharray="2 7"/>
    <circle cx="22" cy="128" r="5" class="paper" ${S}/><circle cx="58" cy="104" r="5" class="paper" ${S}/>
    <circle cx="96" cy="92" r="5" class="paper" ${S}/><circle cx="126" cy="40" r="5" class="paper" ${S}/>
    <circle cx="150" cy="64" r="5" class="paper" ${S}/><circle cx="184" cy="104" r="5" class="paper" ${S}/>
    <circle cx="214" cy="40" r="13" class="gomet-fill"/><circle cx="214" cy="40" r="13" ${S} stroke-width="1.5"/>
    <path d="M200,140 H226 M213,128 V152" ${S} opacity=".4"/>`,
  play: `
    <path d="M120,40 L160,60 L160,104 L120,124 L80,104 L80,60 Z M80,60 L120,80 L160,60 M120,80 V124" ${S}/>
    <path d="M120,80 L160,60 L160,104 L120,124 Z" fill="url(#ftone)" stroke="none"/>
    <path d="M60,40 C78,16 112,8 140,16" ${S} marker-end="url(#fah)"/>
    <path d="M184,124 C170,148 134,156 106,148" ${S} marker-end="url(#fah)"/>
    <circle cx="206" cy="52" r="12" class="gomet-fill"/><circle cx="206" cy="52" r="12" ${S} stroke-width="1.5"/>
    <path d="M186,40 l-8,-6 M184,58 l-10,2 M196,72 l-6,8" ${S} opacity=".6"/>
    <path d="M30,96 L48,128 H12 Z" ${S}/>
    <text x="40" y="78" class="fig-t">?!</text>`,
  build: `
    <rect x="124" y="36" width="92" height="92" ${S}/>
    <path d="M170,36 V128 M124,82 H216" ${S}/>
    <rect x="124" y="36" width="46" height="46" fill="url(#ftone)" stroke="none"/>
    <rect x="170" y="82" width="46" height="46" fill="url(#ftone)" stroke="none"/>
    <rect x="124" y="82" width="46" height="46" class="gomet-fill" opacity=".9"/>
    <rect x="124" y="82" width="46" height="46" ${S}/>
    <rect x="22" y="22" width="46" height="46" rx="2" ${S} transform="rotate(-12 45 45)"/>
    <path d="M62,64 C96,70 118,40 188,50" ${S} stroke-dasharray="5 5" marker-end="url(#fah)"/>
    <path d="M20,120 H96 M20,134 H72" ${S} opacity=".4"/>`,
  click: `
    <path d="M24,56 H104 V72 A10,10 0 0 1 104,92 V108 H24 Z" class="paper" ${S}/>
    <path d="M216,56 H122 V72 A10,10 0 0 0 122,92 V108 H216 Z" ${S}/>
    <path d="M122,56 H216 V108 H122 V92 A10,10 0 0 0 122,72 Z" fill="url(#ftone)" stroke="none"/>
    <path d="M113,40 V24 M96,44 L86,30 M130,44 L140,30 M113,124 V140 M96,120 L86,134 M130,120 L140,134" ${S}/>
    <text x="164" y="30" class="fig-k">カチッ</text>`,
  gomet: `
    <rect x="70" y="20" width="110" height="128" rx="3" ${S} transform="rotate(4 125 84)"/>
    <path d="M90,52 H150 M90,70 H160 M90,88 H140" ${S} opacity=".45" transform="rotate(4 125 84)"/>
    <circle cx="150" cy="118" r="17" class="gomet-fill"/><circle cx="150" cy="118" r="17" ${S} stroke-width="1.5"/>
    <path d="M142,118 l6,6 l11,-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M28,30 C40,70 90,110 126,116" ${S} stroke-dasharray="5 5" marker-end="url(#fah)"/>
    <circle cx="26" cy="24" r="9" ${S}/><circle cx="46" cy="16" r="6" ${S} opacity=".5"/>
    <path d="M196,96 l10,-6 M198,116 h12 M194,136 l9,7" ${S}/>`
};
export function stepFigure(key, label) {
  return `<svg class="fig" viewBox="0 0 240 160" role="img" aria-label="${label}">${FIG[key]}</svg>`;
}
/* Trama y punta de flecha que comparten los dibujos de los pasos: una sola vez por página. */
export const FIG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <pattern id="ftone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="#151515"/></pattern>
  <marker id="fah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#151515"/></marker>
</defs></svg>`;

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
