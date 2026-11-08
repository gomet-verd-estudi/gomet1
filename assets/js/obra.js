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
  const F = -0.3;              // cimentación hundida: su cara de arriba queda bajo la rasante
  const D = 1.3;               // profundidad de la excavación
  const S = 1.7, T = 0.3;      // altura de planta y canto del forjado
  const TOP = F + 4 * S;       // cubierta (7.1)
  const L = Array(9).fill(0);  // avance de cada fase 1–8 (L[0] sin uso)
  // Piezas en orden de dibujo. Cada una declara de qué fases depende y solo se redibuja cuando
  // alguna de ellas cambia: al hacer scroll se tocan unas pocas piezas, no la obra entera.
  const items = [];
  const add = (fn, deps) => items.push({ fn, deps, last: null });
  function runItems(force) {
    for (const it of items) {
      if (!force && it.deps) {
        let key = '';
        for (const d of it.deps) key += L[d].toFixed(4) + ',';
        if (key === it.last) continue;
        it.last = key;
      }
      it.fn();
    }
  }

  /* ---------- primitivas ---------- */
  // Caja: tapa y dos laterales visibles. h y extensión se recalculan cada fotograma.
  // Dibujo a línea, a una tinta: cada caja son tres caras con el fondo del papel (o una tinta muy clara) y su trazo
  // Como en los manuales japoneses: líneas interiores finas y el contorno exterior de cada pieza algo más grueso.
  // El contorno va debajo, con trazo grueso; las caras lo tapan por dentro y solo asoma por fuera.
  function boxNode(cls) {
    const g = el('g', { class: 'bx ' + cls });
    return { g, o: el('path', { class: 'o' }, g), l: el('path', { class: 'f fl' }, g), r: el('path', { class: 'f fr' }, g), t: el('path', { class: 'f ft' }, g) };
  }
  function drawBox(n, x, y, z, w, d, h) {
    if (h <= 0.002 || w <= 0.002 || d <= 0.002) { n.g.style.display = 'none'; return; }
    n.g.style.display = '';
    n.t.setAttribute('d', poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
    n.l.setAttribute('d', poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
    n.r.setAttribute('d', poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
    n.o.setAttribute('d', poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z), P(x, y + d, z + h)]));
  }
  // Caja que crece hacia arriba desde su base dentro de la ventana [a, b] de su fase
  function rise(ph, a, b, x, y, z, w, d, h, cls) {
    const n = boxNode(cls);
    add(() => drawBox(n, x, y, z, w, d, h * eo(win(L[ph], a, b))), [ph]);
  }
  // Losa que se extiende desde su esquina trasera (hormigonado sobre encofrado)
  function spread(ph, a, b, x, y, z, w, d, h, cls) {
    const n = boxNode(cls);
    add(() => { const t = eo(win(L[ph], a, b)); drawBox(n, x, y, z, w * t, d * Math.min(1, t * 1.15), h); }, [ph]);
  }
  // Trazo que se dibuja de principio a fin
  function stroke(ph, a, b, segs, cls) {
    const p = el('path', { class: 'ln ' + cls, d: segs, pathLength: 1 });
    p.style.strokeDasharray = '1 1';
    add(() => { const t = win(L[ph], a, b); p.style.strokeDashoffset = String(1 - t); p.style.opacity = t > 0 ? 1 : 0; }, [ph]);
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
  add(() => { const t = eo(win(L[2], 0.15, 0.7)); drawBox(plot, -0.3, -0.3, 0, (W + 0.6) * t, (W + 0.6) * Math.min(1, t * 1.15), 0.04); }, [2]);
  stroke(2, 0, 0.35, poly([P(-0.6, -0.6, 0), P(W + 0.6, -0.6, 0), P(W + 0.6, W + 0.6, 0), P(-0.6, W + 0.6, 0)]), 'mark');
  [[-0.6, -0.6], [W + 0.4, -0.6], [W + 0.4, W + 0.4], [-0.6, W + 0.4]].forEach(([x, y], i) => rise(2, 0.35 + i * 0.1, 0.65 + i * 0.1, x, y, 0, 0.2, 0.2, 0.9, 'c-red stake'));

  /* ---------- 3 · los cimientos: se excava y se hormigona ---------- */
  const pitFloor = el('path', { class: 'pit-floor' }), pitWallA = el('path', { class: 'pit-wall a' }), pitWallB = el('path', { class: 'pit-wall b' });
  const pour = el('path', { class: 'f ft c-red pour' });
  add(() => {
    const dig = eo(win(L[3], 0, 0.4)), fill = eo(win(L[3], 0.45, 0.95));
    const bottom = -D * dig, top = bottom + (F - bottom) * fill; // se hormigona hasta F, bajo la rasante
    const show = dig > 0.002; // el borde de la excavación sigue a la vista
    [pitFloor, pitWallA, pitWallB, pour].forEach((p) => { p.style.display = show ? '' : 'none'; });
    if (!show) return;
    pitFloor.setAttribute('d', poly([P(0, 0, bottom), P(W, 0, bottom), P(W, W, bottom), P(0, W, bottom)]));
    pitWallA.setAttribute('d', poly([P(0, 0, top), P(W, 0, top), P(W, 0, 0), P(0, 0, 0)])); // pared del fondo (y = 0)
    pitWallB.setAttribute('d', poly([P(0, 0, top), P(0, W, top), P(0, W, 0), P(0, 0, 0)])); // pared del fondo (x = 0)
    pour.style.display = fill > 0.002 ? '' : 'none';
    pour.setAttribute('d', poly([P(0, 0, top), P(W, 0, top), P(W, W, top), P(0, W, top)]));
  }, [3]);

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
    add(pillarSeg(0, j), [4]); add(pillarSeg(1, j), [4]); add(pillarSeg(2, j), [4]);
    add(pillarSeg(3, j), [4]);
    add(wallLeft(j), [6]); add(wallRight(j), [6]);
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
  }, [7]);
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
  }, [8]);

  /* ---------- vallas de obra a rayas: llegan con el solar y se retiran en la entrega ---------- */
  const onSite = () => eo(win(L[2], 0.45, 0.9)) * (1 - eo(win(L[7], 0, 0.35)));
  [[0.3, 3.4], [4.6, 3.4]].forEach(([x0, w]) => {
    const y = W + 1.5, pa = boxNode('c-white post'), pb = boxNode('c-white post'), bar = boxNode('tora'), bar2 = boxNode('tora');
    add(() => {
      const t = onSite();
      drawBox(pa, x0, y, 0, 0.14, 0.14, 0.78 * t); drawBox(pb, x0 + w - 0.14, y, 0, 0.14, 0.14, 0.78 * t);
      drawBox(bar, x0, y - 0.02, 0.52 * t, w, 0.08, 0.2 * (t > 0.01 ? 1 : 0));
      drawBox(bar2, x0, y - 0.02, 0.16 * t, w, 0.08, 0.14 * (t > 0.01 ? 1 : 0));
    }, [2, 7]);
  });
  // conos en las esquinas del solar
  const cone = (x, y) => {
    const [cx, cy] = P(x, y, 0);
    const g = el('g', { class: 'ppl cone', transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)})` });
    [['M-4.2 0.6L4.2 0.6L4.2 -0.6L-4.2 -0.6Z', 'p-red'], ['M-2.6 -0.6L-0.7 -10.6L0.7 -10.6L2.6 -0.6Z', 'p-red'], ['M-1.9 -4.2L1.9 -4.2L1.5 -6.4L-1.5 -6.4Z', 'p-paper']].forEach(([d, c]) => el('path', { d, class: 'pf ' + c }, g));
    return g;
  };
  // contorno exterior: una copia de la figura debajo, con trazo grueso (la propiedad --pw pasa a la copia)
  let uid = 0;
  const outline = (g) => {
    g.id = 'fig-' + (uid++);
    const u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#' + g.id); u.setAttribute('class', 'under');
    g.parentNode.insertBefore(u, g);
    return u;
  };
  const cones = [cone(-1, W + 1.6), cone(W + 1.7, -0.9)].map((g) => [g, outline(g)]);
  add(() => { const on = onSite() > 0.5; cones.forEach((pair) => pair.forEach((c) => { c.style.display = on ? '' : 'none'; })); }, [2, 7]);

  /* ---------- personitas, como en los folletos japoneses de montaje ---------- */
  // Figuras planas con los pies en un punto del suelo: el color va desajustado y el trazo negro encima.
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const BODY = {
    shadow: [circ(0, 0, 6).replace(/a6 6/g, 'a6 2.6'), 'p-shadow', 0],
    legs: (c) => [['M-3.1 -10.2L-0.4 -10.2L-0.7 -1L-3 -1Z', c], ['M0.4 -10.2L3.1 -10.2L3 -0.8L0.7 -0.8Z', c], ['M-3.6 -1.4L-0.5 -1.4L-0.4 0.3L-4 0.3Z', 'p-k'], ['M0.5 -1.2L3.4 -1.2L3.9 0.5L0.4 0.5Z', 'p-k']],
    torso: (c) => ['M-4.4 -18.4Q0 -19.8 4.4 -18.4L3.9 -9.4L-3.9 -9.4Z', c],
    armL: (c) => [['M-4.4 -18.2L-6 -11.2L-4.5 -10.8L-3.3 -16.6Z', c], [circ(-5.3, -10.6, 1), 'p-paper']],
    armR: (c) => [['M4.4 -18.2L6 -11.2L4.5 -10.8L3.3 -16.6Z', c], [circ(5.3, -10.6, 1), 'p-paper']],
    head: [[circ(0, -21.8, 3.1), 'p-paper'], [circ(-1.1, -21.5, 0.38), 'p-k', 0], [circ(1.1, -21.5, 0.38), 'p-k', 0]],
    hair: ['M-3.2 -22.3Q-3.1 -25.7 0 -25.5Q3.1 -25.7 3.2 -22.3Q1.6 -23.7 0 -23.5Q-1.7 -23.7 -3.2 -22.3Z', 'p-k'],
    helmet: (c) => [['M-3.5 -22.5A3.6 3.9 0 0 1 3.5 -22.5Z', c], ['M-4.4 -22.6L4.4 -22.6L4.2 -21.7L-4.2 -21.7Z', c], ['M-1 -24.3h2v.55h-2Z', 'p-green', 0], ['M-0.28 -25.05h.56v2.05h-.56Z', 'p-green', 0]],
    vest: ['M-4.2 -14.3L4.2 -14.3L4.15 -12.9L-4.15 -12.9Z', 'p-yellow'],
    tie: [['M-1.7 -18.9L0 -15.6L1.7 -18.9Z', 'p-paper'], ['M-0.5 -18.4L0.5 -18.4L0.8 -13.6L0 -12.6L-0.8 -13.6Z', 'p-red']]
  };
  const B = BODY;
  const FOLK = [
    // peatones, siempre en la calle: el público que estudiamos en el terreno
    { at: [10.2, 5.4], parts: [B.shadow, ...B.legs('p-navy'), ['M4.6 -10.2h4.8v3.6h-4.8Z', 'p-paper'], ['M5.9 -10.2v-1h2.2v1', 'p-none'], B.torso('p-paper'), ...B.tie, ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.hair] }, // oficinista con cartera
    { at: [3.2, 10.6], s: 0.74, parts: [B.shadow, ...B.legs('p-blue'), ['M-5 -18.6h10v7.4h-10Z', 'p-red'], B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, ['M-3.6 -22.4A3.7 3.6 0 0 1 3.6 -22.4L4.8 -21.8L-3.6 -21.8Z', 'p-yellow']] }, // colegial con gorro amarillo y mochila roja
    { at: [11, 9.8], parts: [B.shadow, ['M-2.4 -6.2L-0.6 -6.2L-0.8 -1L-2.2 -1Z', 'p-paper'], ['M0.6 -6.2L2.4 -6.2L2.2 -0.8L0.8 -0.8Z', 'p-paper'], ['M-3.4 -1.3L-0.6 -1.3L-0.5 0.3L-3.7 0.3Z', 'p-k'], ['M0.6 -1.1L3.2 -1.1L3.6 0.5L0.5 0.5Z', 'p-k'], ['M-3.8 -10.6L3.8 -10.6L4.8 -5.6L-4.8 -5.6Z', 'p-pink'], B.torso('p-paper'), ['M-8 -12.6h4.2l.5 4.8h-5.2Z', 'p-blue'], ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, ['M-3.3 -21.6Q-3.6 -26 0 -25.6Q3.6 -26 3.3 -21.6L3.6 -18.6L2.6 -18.8Q3 -22.6 0 -23.2Q-3 -22.6 -2.6 -18.8L-3.6 -18.6Z', 'p-k']] }, // vecina con bolsa
    // obreros: llegan con la obra y se van con la entrega de llaves
    { at: [9.5, 7.7], site: 1, parts: [B.shadow, ...B.legs('p-navy'), B.torso('p-blue'), B.vest, ...B.armL('p-blue'), ['M4.2 -18.2L7.4 -22.8L8.6 -21.8L5.2 -16.4Z', 'p-blue'], [circ(8.1, -22.6, 1.05), 'p-paper'], ['M8.1 -21.4L8.1 -31', 'p-none'], ['M8.1 -31L13.6 -29.2L8.1 -27.4Z', 'p-green'], ...B.head, ...B.helmet('p-yellow')] }, // vigilante con banderín
    { at: [-1.5, 9.6], site: 1, parts: [B.shadow, ...B.legs('p-navy'), B.torso('p-paper'), B.vest, ...B.armR('p-paper'), ['M-7.8 -15.4L1.8 -13L1.5 -11.7L-8.1 -14.1Z', 'p-blue'], ...B.armL('p-paper'), ...B.head, ...B.helmet('p-paper')] } // arquitecta con planos
  ];
  const FOLK_SCALE = 1.3; // algo mayores que a escala, como en los folletos, para que se lean
  const folk = FOLK.map(({ at, s: sc0 = 1, parts, site }) => {
    const sc = sc0 * FOLK_SCALE;
    const [px, py] = P(at[0], at[1], 0);
    const g = el('g', { class: 'ppl', transform: `translate(${px.toFixed(1)} ${py.toFixed(1)})${sc !== 1 ? ` scale(${sc})` : ''}` });
    parts.forEach(([d, c, key = 1]) => { if (c !== 'p-shadow') el('path', { d, class: 'pf ' + c + (key ? '' : ' nk') }, g); }); // sin sombras: solo línea
    return { g, u: outline(g), site };
  });
  add(() => { const on = onSite() > 0.5; folk.forEach((f) => { if (f.site) { f.g.style.display = on ? '' : 'none'; f.u.style.display = f.g.style.display; } }); }, [2, 7]);
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
  }, [3, 4, 5, 6, 7]);

  /* ---------- gomets de validación ---------- */
  const VAL = [[2, W + 0.5, W + 0.5, 0.9], [3, 5, W, F], [4, W - 0.35, W - 0.35, TOP - T], [5, W, W, F + 4 * S - T * 0.5], [6, W, W * 0.5, TOP + 0.4]];
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
  // Caja de la obra en todas sus fases, calculada a partir de la geometría (sin tocar el DOM al cargar):
  // el terreno marca los lados y el pie; arriba manda lo más alto (grúa, ampliación o vecinos).
  function measure() {
    const pts = [P(G0, G0, 0), P(G1, G0, 0), P(G1, G1, 0), P(G0, G1, 0), P(0, 0, TOP + 2.3), P(W, 0, TOP + 2.3), P(MX, MY, 11.4), P(MX + 3.6, MY, 11.4)];
    city.forEach(([x, y, , , h]) => pts.push(P(x, y, h)));
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const m = 18; // aire para trazos, gomets y banderines
    return { x0: Math.min(...xs) - m, y0: Math.min(...ys) - m - 8, x1: Math.max(...xs) + m, y1: Math.max(...ys) + m };
  }
  const BOX = measure();
  const stage = svg.closest('.obra');
  // Zona libre para el dibujo: en escritorio, entre la columna del relato y la de la ficha, y por encima
  // de la línea de fases, siempre centrada en la pantalla; en móvil, el hueco superior.
  function frameView() {
    const r = svg.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // franja del dibujo: entre los títulos (arriba) y los textos (abajo); puede pisarlos un poco, como un sello
    let cx = r.width / 2, half = r.width / 2 - 12;
    let y0 = r.height * (narrow() ? 0.15 : 0.17), y1 = r.height * (narrow() ? 0.6 : 0.75);
    if (!narrow()) { half = Math.min(half, r.width * 0.34); cx -= Math.min(60, r.width * 0.04); } // a la derecha va la cuerda del capataz: el dibujo se corre un poco a la izquierda
    const bw = BOX.x1 - BOX.x0, bh = BOX.y1 - BOX.y0;
    const k = Math.max(0.05, Math.min((2 * half) / bw, (y1 - y0) / bh));
    const mx = (BOX.x0 + BOX.x1) / 2, my = (BOX.y0 + BOX.y1) / 2, cy = (y0 + y1) / 2;
    const vx = mx - cx / k, vy = my - cy / k;
    svg.setAttribute('viewBox', `${vx.toFixed(1)} ${vy.toFixed(1)} ${(r.width / k).toFixed(1)} ${(r.height / k).toFixed(1)}`);
    // las cotas mantienen su tamaño en pantalla, sea cual sea la escala del dibujo
    const ms = (narrow() ? 0.72 : 1) / k;
    marks.forEach((m) => m.setAttribute('transform', `translate(${(+m.dataset.x).toFixed(1)} ${(+m.dataset.y).toFixed(1)}) scale(${ms.toFixed(3)})`));
    svg.style.setProperty('--scale', k.toFixed(3));

  }
  frameView();
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(frameView); ro.observe(svg); if (stage) ro.observe(stage); }
  else addEventListener('resize', frameView);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(frameView);

  /* ---------- pintar ---------- */
  let active = -1;
  function paint() {
    runItems(false);
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
