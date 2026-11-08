/*
 * La obra — el edificio de la portada se construye de verdad, de abajo arriba, con el scroll.
 * Sigue la secuencia de la presentación «Método»: el terreno (la ciudad), el solar marcado, la excavación
 * y el hormigonado de los cimientos, los cuatro pilares, las cuatro plantas, la fachada con sus instalaciones,
 * la entrega de las llaves y, por último, el andamio de mantenimiento y la ampliación.
 * Nada aparece de la nada: todo se excava, se vierte, crece desde su base o se extiende desde lo ya construido,
 * y una grúa crece con el edificio y se desmonta al terminar.
 *
 * Geometría isométrica en unidades de obra (1 u ≈ 1 m de maqueta). Cada pieza lee el avance de su fase
 * (0–1) y redibuja su volumen. El color de cada cara lo pone gve.css (.f .ft/.fl/.fr + c-*).
 */
(function () {
  'use strict';
  const svg = document.querySelector('.obra-svg');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const scene = svg.querySelector('.scene'), labelsG = svg.querySelector('.labels');
  const U = 22, C = Math.cos(Math.PI / 6);
  const P = (x, y, z) => [(x - y) * C * U, (x + y) * 0.5 * U - z * U];
  const pts = (a) => a.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1));
  const poly = (a) => 'M' + pts(a).join('L') + 'Z';
  const open = (a) => 'M' + pts(a).join('L');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const eo = (t) => 1 - Math.pow(1 - t, 3); // frena al llegar
  const win = (t, a, b) => clamp((t - a) / (b - a));
  const el = (tag, attrs, parent = scene) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

  /* ---------- medidas de la obra ---------- */
  const W = 8;                 // planta de 8 × 8
  const F = 0.3;               // cimentación sobre rasante
  const D = 1.3;               // profundidad de la excavación
  const S = 1.7, T = 0.3;      // altura de planta y canto del forjado
  const TOP = F + 4 * S;       // cubierta (7.1)
  const L = Array(9).fill(0);  // avance de cada fase 1–8 (L[0] sin uso)
  const items = [];            // piezas en orden de dibujo
  const add = (fn) => items.push(fn);

  /* ---------- primitivas ---------- */
  // Caja: tapa y dos laterales visibles. h y extensión se recalculan cada fotograma.
  function boxNode(cls) {
    const g = el('g', { class: 'bx ' + cls });
    return { g, l: el('path', { class: 'f fl' }, g), r: el('path', { class: 'f fr' }, g), t: el('path', { class: 'f ft' }, g) };
  }
  function drawBox(n, x, y, z, w, d, h) {
    if (h <= 0.002 || w <= 0.002 || d <= 0.002) { n.g.style.display = 'none'; return; }
    n.g.style.display = '';
    n.t.setAttribute('d', poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
    n.l.setAttribute('d', poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
    n.r.setAttribute('d', poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
  }
  // Caja que crece hacia arriba desde su base dentro de la ventana [a, b] de su fase
  function rise(ph, a, b, x, y, z, w, d, h, cls) {
    const n = boxNode(cls);
    add(() => drawBox(n, x, y, z, w, d, h * eo(win(L[ph], a, b))));
  }
  // Losa que se extiende desde su esquina trasera (hormigonado sobre encofrado)
  function spread(ph, a, b, x, y, z, w, d, h, cls) {
    const n = boxNode(cls);
    add(() => { const t = eo(win(L[ph], a, b)); drawBox(n, x, y, z, w * t, d * Math.min(1, t * 1.15), h); });
  }
  // Trazo que se dibuja de principio a fin
  function stroke(ph, a, b, segs, cls) {
    const p = el('path', { class: 'ln ' + cls, d: segs, pathLength: 1 });
    p.style.strokeDasharray = '1 1';
    add(() => { const t = win(L[ph], a, b); p.style.strokeDashoffset = String(1 - t); p.style.opacity = t > 0 ? 1 : 0; });
  }

  /* ---------- 1 · el terreno: la ciudad que estudiamos ---------- */
  const G0 = -3, G1 = 13;     // un terreno justo: la obra y su entorno inmediato, sin nada que se salga
  let grid = '';
  for (let i = G0; i <= G1; i += 1) grid += open([P(i, G0, 0), P(i, G1, 0)]) + open([P(G0, i, 0), P(G1, i, 0)]);
  el('path', { class: 'ground', d: poly([P(G0, G0, 0), P(G1, G0, 0), P(G1, G1, 0), P(G0, G1, 0)]) });
  stroke(1, 0, 0.55, grid, 'grid');
  // plano fantasma del edificio terminado: el proyecto ya existe, la obra aún no
  const ghost = [P(0, 0, 0), P(W, 0, 0), P(W, W, 0), P(0, W, 0)];
  el('path', { class: 'ghost', d: poly(ghost) + poly([P(0, 0, TOP), P(W, 0, TOP), P(W, W, TOP), P(0, W, TOP)]) + open([P(W, 0, 0), P(W, 0, TOP)]) + open([P(W, W, 0), P(W, W, TOP)]) + open([P(0, W, 0), P(0, W, TOP)]) + open([P(0, 0, 0), P(0, 0, TOP)]) });
  // edificios vecinos de fondo (crecen desde el suelo)
  const city = [[-2.8, -2.8, 1.8, 1.8, 3.2], [1.5, -2.9, 2.2, 1.8, 4.6], [5, -2.7, 1.6, 1.6, 2.2], [9.6, -2.6, 2.4, 2, 3.6], [-2.9, 2.5, 1.8, 2.4, 2.2]];
  city.forEach(([x, y, w, d, h], i) => rise(1, 0.2 + i * 0.07, 0.6 + i * 0.07, x, y, 0, w, d, h, 'c-white city'));

  /* ---------- 2 · el solar: el hueco que nadie ocupa ---------- */
  const plot = boxNode('c-blue plot');
  add(() => { const t = eo(win(L[2], 0.15, 0.7)); drawBox(plot, -0.3, -0.3, 0, (W + 0.6) * t, (W + 0.6) * Math.min(1, t * 1.15), 0.04); });
  stroke(2, 0, 0.35, poly([P(-0.6, -0.6, 0), P(W + 0.6, -0.6, 0), P(W + 0.6, W + 0.6, 0), P(-0.6, W + 0.6, 0)]), 'mark');
  [[-0.6, -0.6], [W + 0.4, -0.6], [W + 0.4, W + 0.4], [-0.6, W + 0.4]].forEach(([x, y], i) => rise(2, 0.35 + i * 0.1, 0.65 + i * 0.1, x, y, 0, 0.2, 0.2, 0.9, 'c-red stake'));

  /* ---------- 3 · los cimientos: se excava y se hormigona ---------- */
  const pitFloor = el('path', { class: 'pit-floor' }), pitWallA = el('path', { class: 'pit-wall a' }), pitWallB = el('path', { class: 'pit-wall b' });
  const pour = el('path', { class: 'f ft c-red pour' });
  add(() => {
    const dig = eo(win(L[3], 0, 0.4)), fill = eo(win(L[3], 0.45, 0.85));
    const bottom = -D * dig, top = bottom + (0 - bottom) * fill;
    const show = dig > 0.002 && fill < 0.999;
    [pitFloor, pitWallA, pitWallB, pour].forEach((p) => { p.style.display = show ? '' : 'none'; });
    if (!show) return;
    pitFloor.setAttribute('d', poly([P(0, 0, bottom), P(W, 0, bottom), P(W, W, bottom), P(0, W, bottom)]));
    pitWallA.setAttribute('d', poly([P(0, 0, top), P(W, 0, top), P(W, 0, 0), P(0, 0, 0)])); // pared del fondo (y = 0)
    pitWallB.setAttribute('d', poly([P(0, 0, top), P(0, W, top), P(0, W, 0), P(0, 0, 0)])); // pared del fondo (x = 0)
    pour.style.display = fill > 0.002 ? '' : 'none';
    pour.setAttribute('d', poly([P(0, 0, top), P(W, 0, top), P(W, W, top), P(0, W, top)]));
  });
  rise(3, 0.82, 1, 0, 0, 0, W, W, F, 'c-red found');

  /* ---------- 4 · la estructura: cuatro pilares, por tramos de planta ---------- */
  const PIL = [[0.35, 0.35], [W - 1.05, 0.35], [0.35, W - 1.05], [W - 1.05, W - 1.05]];
  const pillarSeg = (k, j) => { // tramo j (0–3) del pilar k
    const n = boxNode('c-yellow pillar');
    const [x, y] = PIL[k];
    return () => {
      const grown = (4 * S - T) * eo(win(L[4], k * 0.12, 0.55 + k * 0.12)); // altura alcanzada por el pilar
      const z0 = F + j * S, h = clamp(grown - j * S, 0, j === 3 ? S - T : S);
      drawBox(n, x, y, z0, 0.7, 0.7, h);
    };
  };

  /* ---------- 5 · las plantas, 6 · fachada, instalaciones y remates ---------- */
  const SLAB = ['c-red', 'c-blue', 'c-yellow', 'c-red'];
  const slab = (i) => spread(5, i * 0.24, i * 0.24 + 0.3, 0, 0, F + (i + 1) * S - T, W, W, T, SLAB[i] + ' slab');
  const wallLeft = (i) => { // fachada delantera izquierda (y = W) de la planta i, con sus ventanas
    const n = boxNode('c-white wall'), wins = [0, 1, 2].map(() => el('path', { class: 'window' }));
    return () => {
      const z0 = F + i * S, hmax = S - T, t = eo(win(L[6], i * 0.13, i * 0.13 + 0.32)), h = hmax * t;
      drawBox(n, 0, W - 0.16, z0, W, 0.16, h);
      wins.forEach((p, k) => {
        const x0 = 0.7 + k * 2.55, x1 = x0 + 1.75, a = z0 + 0.35, b = Math.min(z0 + 1.1, z0 + h);
        if (b <= a || (i === 0 && k === 2)) { p.style.display = 'none'; return; }
        p.style.display = '';
        p.setAttribute('d', poly([P(x0, W, a), P(x1, W, a), P(x1, W, b), P(x0, W, b)]));
      });
    };
  };
  const wallRight = (i) => { // fachada delantera derecha (x = W)
    const n = boxNode('c-white wall'), wins = [0, 1, 2].map(() => el('path', { class: 'window' }));
    return () => {
      const z0 = F + i * S, hmax = S - T, t = eo(win(L[6], 0.06 + i * 0.13, 0.06 + i * 0.13 + 0.32)), h = hmax * t;
      drawBox(n, W - 0.16, 0, z0, 0.16, W - 0.16, h);
      wins.forEach((p, k) => {
        const y0 = 0.7 + k * 2.55, y1 = y0 + 1.75, a = z0 + 0.35, b = Math.min(z0 + 1.1, z0 + h);
        if (b <= a) { p.style.display = 'none'; return; }
        p.style.display = '';
        p.setAttribute('d', poly([P(W, y0, a), P(W, y1, a), P(W, y1, b), P(W, y0, b)]));
      });
    };
  };
  // orden de dibujo: pilares traseros, luego planta a planta (pilar delantero, fachada, forjado)
  for (let j = 0; j < 4; j++) {
    add(pillarSeg(0, j)); add(pillarSeg(1, j)); add(pillarSeg(2, j));
    add(pillarSeg(3, j));
    add(wallLeft(j)); add(wallRight(j));
    slab(j);
  }
  // remates: el peto de cubierta crece en sus cuatro lados; instalaciones en cubierta
  rise(6, 0.62, 0.85, 0, 0, TOP, W, 0.18, 0.4, 'c-white parapet');
  rise(6, 0.62, 0.85, 0, 0, TOP, 0.18, W, 0.4, 'c-white parapet');
  rise(6, 0.55, 0.8, 4.6, 1.2, TOP, 1.5, 1.5, 0.9, 'c-yellow plant');
  rise(6, 0.66, 0.9, W - 0.18, 0, TOP, 0.18, W, 0.4, 'c-white parapet');
  rise(6, 0.66, 0.9, 0, W - 0.18, TOP, W, 0.18, 0.4, 'c-white parapet');
  // cables a imprenta, pantalla y fabricante
  const CAB = [[11.6, 4.6], [12.2, 8.2], [9.6, 11.4]];
  CAB.forEach(([x, y], i) => stroke(6, 0.7 + i * 0.07, 0.95 + i * 0.03, open([P(W, 6.5, 0.2), P(W + 0.8, 6.5, 0.02), P(x, y, 0.02)]), 'cable'));
  CAB.forEach(([x, y], i) => rise(6, 0.85 + i * 0.04, 1, x - 0.3, y - 0.3, 0, 0.6, 0.6, 0.35, 'c-blue node'));

  /* ---------- 7 · la entrega: puerta, acabados, llaves y libro del edificio ---------- */
  const door = el('path', { class: 'door' });
  add(() => {
    const t = eo(win(L[7], 0, 0.35));
    door.style.display = t > 0.002 ? '' : 'none';
    door.setAttribute('d', poly([P(5.9, W, F), P(7.2, W, F), P(7.2, W, F + 1.2 * t), P(5.9, W, F + 1.2 * t)]));
  });
  let mull = '';
  for (let k = 1; k < 8; k++) mull += open([P(k, W, F), P(k, W, TOP)]) + open([P(W, k, F), P(W, k, TOP)]);
  stroke(7, 0.15, 0.6, mull, 'mullion');
  rise(7, 0.5, 0.75, 9.4, 10.6, 0, 1.3, 0.95, 0.28, 'c-red book');
  stroke(7, 0.65, 0.95, open([P(11.4, 10.2, 0.05), P(12.6, 9.6, 0.05)]) + open([P(12.25, 9.78, 0.05), P(12.45, 10.1, 0.05)]), 'key');

  /* ---------- 8 · el edificio en uso: andamio de revisión y ampliación ---------- */
  [0.9, 3, 5.1, 7.2].forEach((y, i) => rise(8, i * 0.06, 0.4 + i * 0.06, W + 0.55, y, 0, 0.12, 0.12, TOP + 0.4, 'c-yellow scaf'));
  [1.9, 3.6, 5.3, 7].forEach((z, i) => spread(8, 0.3 + i * 0.07, 0.55 + i * 0.07, W + 0.4, 0.8, z, 0.45, 6.6, 0.08, 'c-white plank'));
  const amp = el('path', { class: 'amp' });
  add(() => {
    const t = eo(win(L[8], 0.45, 0.95)), z1 = TOP + 0.4 + 1.9 * t;
    amp.style.display = t > 0.002 ? '' : 'none';
    amp.setAttribute('d', poly([P(0, 0, z1), P(W, 0, z1), P(W, W, z1), P(0, W, z1)]) + open([P(W, 0, TOP + 0.4), P(W, 0, z1)]) + open([P(W, W, TOP + 0.4), P(W, W, z1)]) + open([P(0, W, TOP + 0.4), P(0, W, z1)]));
  });

  /* ---------- figuras a escala (como en la presentación) ---------- */
  [[10.2, 5.4], [3.2, 10.6], [11, 9.8]].forEach(([x, y]) => {
    const b = boxNode('c-white person');
    drawBox(b, x, y, 0, 0.32, 0.32, 0.75);
    const [hx, hy] = P(x + 0.16, y + 0.16, 0.98);
    el('circle', { class: 'head', cx: hx.toFixed(1), cy: hy.toFixed(1), r: 3.6 });
  });
  // vecinos delante de la obra
  [[11.2, 11.4, 1.5, 1.4, 1.1]].forEach(([x, y, w, d, h]) => rise(1, 0.5, 0.85, x, y, 0, w, d, h, 'c-white city'));

  /* ---------- la grúa: crece con el edificio y se desmonta al terminar ---------- */
  const MX = 11.2, MY = 2.2;
  const mast = boxNode('c-yellow crane'), jib = boxNode('c-yellow crane'), cjib = boxNode('c-yellow crane'), cw = boxNode('c-white crane-w');
  const hookLine = el('path', { class: 'hook-line' }), hook = boxNode('c-red hook');
  let lattice = el('path', { class: 'lattice' });
  add(() => {
    const up = eo(win(L[3], 0.05, 0.45)) * 4 + eo(L[4]) * 3.6 + eo(L[5]) * 2.6 + eo(L[6]) * 0.8;
    const down = eo(win(L[7], 0.55, 1));
    const H = up * (1 - down);
    drawBox(mast, MX, MY, 0, 0.6, 0.6, H);
    let lat = '';
    for (let z = 0.6; z < H - 0.3; z += 0.6) lat += open([P(MX + 0.6, MY, z - 0.6), P(MX + 0.6, MY + 0.6, z)]) + open([P(MX, MY + 0.6, z - 0.6), P(MX + 0.6, MY + 0.6, z)]);
    lattice.setAttribute('d', lat || 'M0 0');
    const arm = H > 2.5 ? eo(clamp((H - 2.5) / 1.5)) : 0; // la pluma se despliega cuando el mástil tiene altura
    drawBox(jib, MX + 0.6 - 9.5 * arm, MY + 0.1, H, 9.5 * arm, 0.4, 0.35);
    drawBox(cjib, MX + 0.6, MY + 0.1, H, 3 * arm, 0.4, 0.3);
    drawBox(cw, MX + 0.6 + 2.2 * arm, MY - 0.05, H - 0.6, 0.8 * arm, 0.7, 0.6 * (arm > 0.9 ? 1 : 0));
    // el gancho baja hasta la planta en obra
    const work = F + 0.6 + 4 * S * eo(L[5]) * 0.92;
    const tx = 4 + 0.3, ty = MY + 0.3;
    const show = arm > 0.95 && H > work + 0.8;
    hookLine.style.display = show ? '' : 'none';
    if (show) hookLine.setAttribute('d', open([P(tx, ty, H), P(tx, ty, work + 0.35)]));
    drawBox(hook, tx - 0.15, ty - 0.15, work, 0.3, 0.3, show ? 0.35 : 0);
  });

  /* ---------- gomets de validación ---------- */
  const VAL = [[2, W + 0.5, W + 0.5, 0.9], [3, W, W, F], [4, W - 0.35, W - 0.35, TOP - T], [5, W, W, F + 4 * S - T * 0.5], [6, W, W * 0.5, TOP + 0.4]];
  const gomets = VAL.map(([ph, x, y, z]) => {
    const [cx, cy] = P(x, y, z);
    const g = el('g', { class: 'gomet-v', transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)})` });
    const inner = el('g', { class: 'gv-in' }, g);
    el('circle', { r: 9, class: 'val' }, inner);
    el('path', { d: 'M-4.2 0.3L-1.2 3.4L4.5 -3.4', class: 'val-k', fill: 'none', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, inner);
    return { ph, g };
  });

  /* ---------- cotas: lo que se señala en cada fase, numerado como en la ficha de la derecha ---------- */
  // Mismo orden que PARTS (data/site.mjs): el número n del dibujo es el elemento n de la lista
  const MARKS = {
    1: [[2.6, -2, 4.6], [10.8, -1.6, 3.6], [10.36, 5.56, 1]],                                   // competencia, sector, público
    2: [[W + 0.5, -0.5, 0.9], [W, W * 0.6, 0]],                                                   // programa, espacio en el mercado
    3: [[2, W, F], [W, 3, F]],                                                                    // fundamentos, concepto raíz
    4: [[0.7, 0.7, TOP - T], [W - 0.7, 0.7, TOP - T], [W - 0.35, W - 0.35, 4], [W - 0.35, W - 0.35, 1.2]], // tipografía, retícula, color, imagen
    5: [[W, 4, F + S - T], [W, 4, F + 2 * S - T], [W, 4, F + 3 * S - T], [W, 4, F + 4 * S - T]], // papelería, web, packaging, redes
    6: [[W, 0.1, TOP + 0.4], [5.35, 1.95, TOP + 0.9], [11.6, 4.6, 0.35], [12.2, 8.2, 0.35], [9.6, 11.4, 0.35]], // remates, instalaciones, imprenta, pantalla, fabricante
    7: [[12.2, 9.8, 0.05], [10, 11, 0.28]],                                                       // llaves, libro del edificio
    8: [[W + 0.6, 3, 5], [W + 0.6, 5.1, 2], [W, 0, TOP + 2.3]]                                    // revisiones, ajustes, ampliaciones
  };
  const markGroups = {}, marks = [];
  Object.entries(MARKS).forEach(([ph, list]) => {
    const g = el('g', { class: 'lab', 'data-ph': ph }, labelsG);
    markGroups[ph] = list.map(([x, y, z], i) => {
      const [cx, cy] = P(x, y, z);
      const m = el('g', { class: 'mk', 'data-i': i }, g);
      m.dataset.x = cx; m.dataset.y = cy;
      el('circle', { r: 9 }, m);
      const t = el('text', { y: 3.6, 'text-anchor': 'middle' }, m);
      t.textContent = i + 1;
      marks.push(m);
      return m;
    });
  });
  // Al pasar por un nombre de la ficha, su número se destaca en el dibujo
  document.querySelectorAll('.op[data-p]').forEach((op) => {
    const list = markGroups[op.dataset.p];
    if (!list) return;
    op.querySelectorAll('.op-parts li').forEach((li, i) => {
      const on = (v) => () => { if (list[i]) list[i].classList.toggle('hi', v); li.classList.toggle('hi', v); };
      li.addEventListener('pointerenter', on(true));
      li.addEventListener('pointerleave', on(false));
    });
  });

  /* ---------- encuadre: la obra entera, centrada, sin cortes ---------- */
  const narrow = () => innerWidth <= 900;
  // Caja de la obra en todas sus fases (la grúa sube y se desmonta, el andamio y la ampliación aparecen al final)
  function measure() {
    let b = null;
    for (let s = 0; s <= 9.01; s += 0.25) {
      for (let k = 1; k <= 8; k++) L[k] = clamp((s - k + 0.05) / 0.72);
      items.forEach((fn) => fn());
      const r = scene.getBBox();
      b = b ? { x0: Math.min(b.x0, r.x), y0: Math.min(b.y0, r.y), x1: Math.max(b.x1, r.x + r.width), y1: Math.max(b.y1, r.y + r.height) }
        : { x0: r.x, y0: r.y, x1: r.x + r.width, y1: r.y + r.height };
    }
    for (let k = 1; k <= 8; k++) L[k] = 0;
    const m = 14; // aire para trazos y gomets
    return { x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + m };
  }
  const BOX = measure();
  const stage = svg.closest('.obra-stage');
  // Zona libre para el dibujo: en escritorio, entre la columna del relato y la de la ficha, y por encima
  // de la línea de fases, siempre centrada en la pantalla; en móvil, el hueco superior.
  function frameView() {
    const r = svg.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    let cx = r.width / 2, half = r.width / 2 - 12, y0 = 12, y1 = r.height - 12;
    if (!narrow() && stage) {
      const L1 = stage.querySelector('.op-l'), R1 = stage.querySelector('.op-r'), rail = stage.querySelector('.obra-rail');
      const gap = Math.max(20, r.width * 0.02);
      if (L1 && R1) half = Math.min(cx - (L1.getBoundingClientRect().right - r.left), (R1.getBoundingClientRect().left - r.left) - cx) - gap;
      if (L1) y0 = L1.getBoundingClientRect().top - r.top;
      if (rail) y1 = rail.getBoundingClientRect().top - r.top - 24;
    }
    const bw = BOX.x1 - BOX.x0, bh = BOX.y1 - BOX.y0;
    const k = Math.max(0.05, Math.min((2 * half) / bw, (y1 - y0) / bh));
    const mx = (BOX.x0 + BOX.x1) / 2, my = (BOX.y0 + BOX.y1) / 2, cy = (y0 + y1) / 2;
    const vx = mx - cx / k, vy = my - cy / k;
    svg.setAttribute('viewBox', `${vx.toFixed(1)} ${vy.toFixed(1)} ${(r.width / k).toFixed(1)} ${(r.height / k).toFixed(1)}`);
    // las cotas mantienen su tamaño en pantalla, sea cual sea la escala del dibujo
    const ms = (narrow() ? 0.85 : 1) / k;
    marks.forEach((m) => m.setAttribute('transform', `translate(${(+m.dataset.x).toFixed(1)} ${(+m.dataset.y).toFixed(1)}) scale(${ms.toFixed(3)})`));
    svg.style.setProperty('--k', k.toFixed(3));
  }
  frameView();
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(frameView); ro.observe(svg); if (stage) ro.observe(stage); }
  else addEventListener('resize', frameView);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(frameView);

  /* ---------- pintar ---------- */
  let active = -1;
  function paint() {
    items.forEach((fn) => fn());
    gomets.forEach(({ ph, g }) => g.classList.toggle('on', L[ph] >= 0.97));
  }
  window.GVE_OBRA = {
    set(progress, act) { // progress: avance 0–1 de las fases 1–8; act: fase activa
      for (let k = 1; k <= 8; k++) L[k] = progress[k];
      paint();
      if (act !== active) {
        active = act;
        labelsG.querySelectorAll('.lab').forEach((g) => g.classList.toggle('on', +g.dataset.ph === act));
      }
    }
  };
  paint();
})();
