/*
 * Gomet · Method — drawing kit.
 * The drawings are built, not shown: boxes grow from their base, slabs spread from a corner, lines are drawn
 * end to end, people walk in and a crane grows with the building. Same isometric engine as the Gomet web
 * (assets/js/obra.js), driven by time instead of scroll so each plate plays on its own.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const U = 22, C = Math.cos(Math.PI / 6);
  const P = (x, y, z) => [(x - y) * C * U, (x + y) * 0.5 * U - z * U];
  const pts = (a) => a.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1));
  const poly = (a) => 'M' + pts(a).join('L') + 'Z';
  const open = (a) => 'M' + pts(a).join('L');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const eo = (t) => 1 - Math.pow(1 - t, 3);                      // brakes on arrival
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)); // overshoots and settles
  const win = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sq = (x, y, z, w, d) => [P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)];

  /* ---------- people, as in Japanese assembly leaflets (same figures as the Gomet web) ---------- */
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const B = {
    legs: (c) => [['M-3.1 -10.2L-0.4 -10.2L-0.7 -1L-3 -1Z', c], ['M0.4 -10.2L3.1 -10.2L3 -0.8L0.7 -0.8Z', c], ['M-3.6 -1.4L-0.5 -1.4L-0.4 0.3L-4 0.3Z', 'p-k'], ['M0.5 -1.2L3.4 -1.2L3.9 0.5L0.4 0.5Z', 'p-k']],
    torso: (c) => ['M-4.4 -18.4Q0 -19.8 4.4 -18.4L3.9 -9.4L-3.9 -9.4Z', c],
    armL: (c) => [['M-4.4 -18.2L-6 -11.2L-4.5 -10.8L-3.3 -16.6Z', c], [circ(-5.3, -10.6, 1), 'p-paper']],
    armR: (c) => [['M4.4 -18.2L6 -11.2L4.5 -10.8L3.3 -16.6Z', c], [circ(5.3, -10.6, 1), 'p-paper']],
    armUp: (c) => [['M4.2 -18.2L7.4 -22.8L8.6 -21.8L5.2 -16.4Z', c], [circ(8.1, -22.6, 1.05), 'p-paper']],
    head: [[circ(0, -21.8, 3.1), 'p-paper'], [circ(-1.1, -21.5, 0.38), 'p-k', 0], [circ(1.1, -21.5, 0.38), 'p-k', 0]],
    hair: ['M-3.2 -22.3Q-3.1 -25.7 0 -25.5Q3.1 -25.7 3.2 -22.3Q1.6 -23.7 0 -23.5Q-1.7 -23.7 -3.2 -22.3Z', 'p-k'],
    bob: ['M-3.3 -21.6Q-3.6 -26 0 -25.6Q3.6 -26 3.3 -21.6L3.6 -18.6L2.6 -18.8Q3 -22.6 0 -23.2Q-3 -22.6 -2.6 -18.8L-3.6 -18.6Z', 'p-k'],
    cap: ['M-3.6 -22.4A3.7 3.6 0 0 1 3.6 -22.4L4.8 -21.8L-3.6 -21.8Z', 'p-yellow'],
    helmet: (c) => [['M-3.5 -22.5A3.6 3.9 0 0 1 3.5 -22.5Z', c], ['M-4.4 -22.6L4.4 -22.6L4.2 -21.7L-4.2 -21.7Z', c], ['M-1 -24.3h2v.55h-2Z', 'p-green', 0], ['M-0.28 -25.05h.56v2.05h-.56Z', 'p-green', 0]],
    vest: ['M-4.2 -14.3L4.2 -14.3L4.15 -12.9L-4.15 -12.9Z', 'p-yellow'],
    tie: [['M-1.7 -18.9L0 -15.6L1.7 -18.9Z', 'p-paper'], ['M-0.5 -18.4L0.5 -18.4L0.8 -13.6L0 -12.6L-0.8 -13.6Z', 'p-red']],
    skirt: [['M-2.4 -6.2L-0.6 -6.2L-0.8 -1L-2.2 -1Z', 'p-paper'], ['M0.6 -6.2L2.4 -6.2L2.2 -0.8L0.8 -0.8Z', 'p-paper'], ['M-3.4 -1.3L-0.6 -1.3L-0.5 0.3L-3.7 0.3Z', 'p-k'], ['M0.6 -1.1L3.2 -1.1L3.6 0.5L0.5 0.5Z', 'p-k'], ['M-3.8 -10.6L3.8 -10.6L4.8 -5.6L-4.8 -5.6Z', 'p-pink']]
  };
  const FIG = {
    office: () => [...B.legs('p-navy'), ['M4.6 -10.2h4.8v3.6h-4.8Z', 'p-paper'], ['M5.9 -10.2v-1h2.2v1', 'p-none'], B.torso('p-paper'), ...B.tie, ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.hair],
    kid: () => [...B.legs('p-blue'), ['M-5 -18.6h10v7.4h-10Z', 'p-red'], B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.cap],
    neighbour: () => [...B.skirt, B.torso('p-paper'), ['M-8 -12.6h4.2l.5 4.8h-5.2Z', 'p-blue'], ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.bob],
    walker: () => [...B.legs('p-navy'), B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.hair],
    woman: () => [...B.skirt, B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ...B.head, B.bob],
    pointer: () => [...B.legs('p-navy'), B.torso('p-paper'), ...B.armL('p-paper'), ...B.armUp('p-paper'), ...B.head, B.hair],
    guard: () => [...B.legs('p-navy'), B.torso('p-blue'), B.vest, ...B.armL('p-blue'), ...B.armUp('p-blue'), ['M8.1 -21.4L8.1 -31', 'p-none'], ['M8.1 -31L13.6 -29.2L8.1 -27.4Z', 'p-green'], ...B.head, ...B.helmet('p-yellow')],
    architect: () => [...B.legs('p-navy'), B.torso('p-paper'), B.vest, ...B.armR('p-paper'), ['M-7.8 -15.4L1.8 -13L1.5 -11.7L-8.1 -14.1Z', 'p-blue'], ...B.armL('p-paper'), ...B.head, ...B.helmet('p-paper')],
    camera: () => [...B.legs('p-navy'), B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ['M-7.5 -19.5h6v4.4h-6Z', 'p-blue'], [circ(-4.5, -17.3, 1.3), 'p-paper'], ...B.head, B.hair],
    phone: () => [...B.skirt, B.torso('p-paper'), ...B.armL('p-paper'), ['M4.2 -18.2L5.6 -12.6L4.1 -12.3L3.2 -16.6Z', 'p-paper'], ['M3.4 -16.4h2.4v-3.4h-2.4Z', 'p-blue'], ...B.head, B.bob],
    laptop: () => [...B.legs('p-navy'), B.torso('p-paper'), ...B.armL('p-paper'), ...B.armR('p-paper'), ['M-5.4 -12.4L5.4 -12.4L6.6 -9.4L-6.6 -9.4Z', 'p-blue'], ...B.head, B.hair]
  };

  /* ---------- the kit ---------- */
  function Kit(svg) {
    const k = { svg, items: [], bounds: [], marks: [], t: -1 };
    const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const a in attrs) n.setAttribute(a, attrs[a]); parent.appendChild(n); return n; };
    const scene = mk('g', { class: 'scene' }, svg), labels = mk('g', { class: 'labels' }, svg);
    k.el = (tag, attrs, parent) => mk(tag, attrs, parent || scene);
    k.pt = (x, y, z) => { k.bounds.push(P(x, y, z)); };
    k.ptBox = (x, y, z, w, d, h) => { [[x, y, z], [x + w, y, z], [x, y + d, z], [x + w, y + d, z]].forEach(([a, b, c]) => { k.pt(a, b, c); k.pt(a, b, c + h); }); };
    // add(fn, key): fn(t) redraws; key(t) returns a string; the item is skipped while the key does not change
    k.add = (fn, key) => { k.items.push({ fn, key, last: null }); };
    k.set = (t) => {
      k.t = t;
      for (const it of k.items) {
        if (it.key) { const v = it.key(t); if (v === it.last) continue; it.last = v; }
        it.fn(t);
      }
    };
    const kw = (a, b) => (t) => win(t, a, b).toFixed(4);

    k.box = (cls) => { const g = mk('g', { class: 'bx ' + (cls || '') }, scene); return { g, o: mk('path', { class: 'o' }, g), l: mk('path', { class: 'f fl' }, g), r: mk('path', { class: 'f fr' }, g), t: mk('path', { class: 'f ft' }, g) }; };
    k.draw = (n, x, y, z, w, d, h) => {
      if (h <= 0.002 || w <= 0.002 || d <= 0.002) { n.g.style.display = 'none'; return; }
      n.g.style.display = '';
      n.t.setAttribute('d', poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
      n.l.setAttribute('d', poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
      n.r.setAttribute('d', poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
      n.o.setAttribute('d', poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z), P(x, y + d, z + h)]));
    };
    // box that grows upwards from its base during [a, b] seconds
    k.rise = (a, b, x, y, z, w, d, h, cls, ease) => {
      const n = k.box(cls); k.ptBox(x, y, z, w, d, h);
      k.add((t) => k.draw(n, x, y, z, w, d, h * (ease || eo)(win(t, a, b))), kw(a, b));
      return n;
    };
    // slab poured from its back corner
    k.spread = (a, b, x, y, z, w, d, h, cls) => {
      const n = k.box(cls); k.ptBox(x, y, z, w, d, h);
      k.add((t) => { const v = eo(win(t, a, b)); k.draw(n, x, y, z, w * v, d * Math.min(1, v * 1.15), h); }, kw(a, b));
      return n;
    };
    // line drawn from start to end
    k.stroke = (a, b, d, cls) => {
      const p = mk('path', { class: 'ln ' + (cls || ''), d, pathLength: 1 }, scene);
      p.style.strokeDasharray = '1 1';
      k.add((t) => { const v = eio(win(t, a, b)); p.style.strokeDashoffset = String(1 - v); p.style.opacity = v > 0 ? 1 : 0; }, kw(a, b));
      return p;
    };
    // dashed line: it slides into place while it fades in
    k.dash = (a, b, d, cls) => {
      const p = mk('path', { class: 'ln dash ' + (cls || ''), d }, scene);
      k.add((t) => { const v = eo(win(t, a, b)); p.style.opacity = v; p.style.strokeDashoffset = String((1 - v) * 24); }, kw(a, b));
      return p;
    };
    k.path = (d, cls, a, b) => {
      const p = mk('path', { class: cls, d }, scene);
      if (a != null) k.add((t) => { p.style.opacity = eo(win(t, a, b)); }, kw(a, b));
      return p;
    };
    // a person; optional walk from `from` to `at` during [a, b]
    let uid = 0;
    k.person = (kind, at, a, o) => {
      o = o || {};
      const s = (o.s || 1) * 1.3;
      const g = mk('g', { class: 'ppl' }, scene);
      FIG[kind]().forEach(([d, c, key = 1]) => mk('path', { d, class: 'pf ' + c + (key ? '' : ' nk') }, g));
      g.id = 'kp' + (++uid) + Math.random().toString(36).slice(2, 6);
      const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#' + g.id); u.setAttribute('class', 'under'); scene.insertBefore(u, g);
      const from = o.from || at, b = o.b != null ? o.b : a + 0.5;
      k.pt(at[0], at[1], 0); k.pt(at[0], at[1], 2.2);
      k.add((t) => {
        const walk = o.from ? eio(win(t, a, b)) : 1, x = lerp(from[0], at[0], walk), y = lerp(from[1], at[1], walk);
        const [px, py] = P(x, y, 0);
        const pop = o.from ? clamp((t - a) / 0.25) : back(win(t, a, a + 0.45));
        const bobv = o.from && walk > 0 && walk < 1 ? Math.abs(Math.sin(t * 13)) * 1.2 : 0;
        const flip = o.flip ? -1 : 1;
        const tr = `translate(${px.toFixed(1)} ${(py - bobv).toFixed(1)}) scale(${(s * flip).toFixed(3)} ${s.toFixed(3)})`;
        g.setAttribute('transform', tr);
        const op = o.from ? pop : (pop > 0 ? 1 : 0);
        const sc = o.from ? 1 : pop;
        g.style.opacity = u.style.opacity = op;
        if (!o.from) { const t2 = `translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${(s * sc * flip).toFixed(3)} ${(s * sc).toFixed(3)})`; g.setAttribute('transform', t2); }
      }, (t) => (o.from ? win(t, a, b + 0.3).toFixed(3) + (win(t, a, b) > 0 && win(t, a, b) < 1 ? t.toFixed(2) : '') : win(t, a, a + 0.45).toFixed(3)));
      return g;
    };
    // green validation sticker (the gomet)
    k.gomet = (x, y, z, a) => {
      const [cx, cy] = P(x, y, z);
      const g = mk('g', { class: 'gv' }, labels), inner = mk('g', {}, g);
      mk('circle', { r: 9, class: 'gv-c' }, inner);
      mk('path', { d: 'M-4.2 0.3L-1.2 3.4L4.5 -3.4', class: 'gv-k' }, inner);
      const m = { g, inner, x: cx, y: cy, fixed: true };
      k.marks.push(m);
      k.add((t) => { const v = back(win(t, a, a + 0.5)); inner.setAttribute('transform', `scale(${v.toFixed(3)})`); g.style.opacity = v > 0 ? 1 : 0; }, kw(a, a + 0.5));
      return g;
    };
    // numbered mark; its number is the item number in the legend
    k.mark = (x, y, z, n, a) => {
      const [cx, cy] = P(x, y, z);
      const g = mk('g', { class: 'mk', 'data-i': n }, labels), inner = mk('g', {}, g);
      mk('circle', { r: 9 }, inner);
      const tx = mk('text', { y: 3.6, 'text-anchor': 'middle' }, inner); tx.textContent = n;
      const m = { g, inner, x: cx, y: cy };
      k.marks.push(m);
      k.add((t) => { const v = back(win(t, a, a + 0.5)); inner.setAttribute('transform', `scale(${v.toFixed(3)})`); g.style.opacity = v > 0 ? 1 : 0; }, kw(a, a + 0.5));
      return g;
    };
    k.grid = (x0, y0, x1, y1, step, a, b, cls) => {
      let d = '';
      for (let i = x0; i <= x1 + 1e-6; i += step) d += open([P(i, y0, 0), P(i, y1, 0)]);
      for (let j = y0; j <= y1 + 1e-6; j += step) d += open([P(x0, j, 0), P(x1, j, 0)]);
      k.pt(x0, y0, 0); k.pt(x1, y0, 0); k.pt(x0, y1, 0); k.pt(x1, y1, 0);
      return k.stroke(a, b, d, cls || 'grid');
    };
    k.ground = (x0, y0, x1, y1, a, b) => {
      const g = mk('path', { class: 'ground', d: poly([P(x0, y0, 0), P(x1, y0, 0), P(x1, y1, 0), P(x0, y1, 0)]) }, scene);
      k.add((t) => { g.style.opacity = eo(win(t, a, b)); }, kw(a, b));
      return k.grid(x0, y0, x1, y1, 1, a, b + 0.4);
    };
    // fit the drawing into the box: centred, nothing cut, marks at a constant size on screen
    k.frame = (pad) => {
      const r = svg.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || !k.bounds.length) return;
      const xs = k.bounds.map((q) => q[0]), ys = k.bounds.map((q) => q[1]);
      const m = pad == null ? 16 : pad;
      const x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, x1 = Math.max(...xs) + m, y1 = Math.max(...ys) + m;
      const s = Math.min(r.width / (x1 - x0), r.height / (y1 - y0));
      k.aspect = (x1 - x0) / (y1 - y0);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      svg.setAttribute('viewBox', `${(cx - r.width / s / 2).toFixed(1)} ${(cy - r.height / s / 2).toFixed(1)} ${(r.width / s).toFixed(1)} ${(r.height / s).toFixed(1)}`);
      const ms = Math.min(1.6, (r.width < 520 ? 0.82 : 1) / s);
      k.marks.forEach((q) => q.g.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${ms.toFixed(3)})`));
      const w = k.sw || 1, st = svg.style; st.setProperty('--k', s.toFixed(3)); st.setProperty('--thin', (1.05 * w / s).toFixed(3)); st.setProperty('--outer', (2.6 * w / s).toFixed(3)); st.setProperty('--pwo', (2.4 * w / s).toFixed(3)); st.setProperty('--dd', (4 * Math.max(0.6, w) / s).toFixed(2));
    };
    return k;
  }

  /* ======================================================================================
   * The building (the Gomet web sequence): 1 ground · 2 site · 3 foundations · 4 structure ·
   * 5 floors · 6 utilities and finishes · 7 handover · 8 maintenance. A crane grows with it.
   * ==================================================================================== */
  function obra(k, sched, opt) {
    opt = opt || {};
    const L = Array(9).fill(0);
    k.add((t) => { const v = sched(t); for (let i = 1; i <= 8; i++) L[i] = v[i]; });
    const key = (...ph) => () => ph.map((p) => L[p].toFixed(4)).join(',');
    const W = 8, F = -0.3, D = 1.3, S = 1.7, T = 0.3, TOP = F + 4 * S;
    const rise = (ph, a, b, x, y, z, w, d, h, cls) => { const n = k.box(cls); k.add(() => k.draw(n, x, y, z, w, d, h * eo(win(L[ph], a, b))), key(ph)); return n; };
    const spread = (ph, a, b, x, y, z, w, d, h, cls) => { const n = k.box(cls); k.add(() => { const v = eo(win(L[ph], a, b)); k.draw(n, x, y, z, w * v, d * Math.min(1, v * 1.15), h); }, key(ph)); };
    const stroke = (ph, a, b, d, cls) => { const p = k.el('path', { class: 'ln ' + cls, d, pathLength: 1 }); p.style.strokeDasharray = '1 1'; k.add(() => { const v = win(L[ph], a, b); p.style.strokeDashoffset = String(1 - v); p.style.opacity = v > 0 ? 1 : 0; }, key(ph)); };

    /* 1 · the ground: the city we study */
    const G0 = -3, G1 = 13;
    let grid = '';
    for (let i = G0; i <= G1; i += 1) grid += open([P(i, G0, 0), P(i, G1, 0)]) + open([P(G0, i, 0), P(G1, i, 0)]);
    const groundP = k.el('path', { class: 'ground', d: poly(sq(G0, G0, 0, G1 - G0, G1 - G0)) });
    k.add(() => { groundP.style.opacity = eo(win(L[1], 0, 0.3)); }, key(1));
    stroke(1, 0, 0.55, grid, 'grid');
    const ghost = k.el('path', { class: 'ghost', d: poly(sq(0, 0, 0, W, W)) + poly(sq(0, 0, TOP, W, W)) + open([P(W, 0, 0), P(W, 0, TOP)]) + open([P(W, W, 0), P(W, W, TOP)]) + open([P(0, W, 0), P(0, W, TOP)]) });
    k.add(() => { ghost.style.opacity = 0.9 * eo(win(L[1], 0.3, 0.8)) * (1 - eo(win(L[6], 0.3, 0.9))); }, key(1, 6));
    const city = [[-2.8, -2.8, 1.8, 1.8, 3.2], [1.5, -2.9, 2.2, 1.8, 4.6], [5, -2.7, 1.6, 1.6, 2.2], [9.6, -2.6, 2.4, 2, 3.6], [-2.9, 2.5, 1.8, 2.4, 2.2]];
    city.forEach(([x, y, w, d, h], i) => rise(1, 0.2 + i * 0.07, 0.6 + i * 0.07, x, y, 0, w, d, h, 'city'));

    /* 2 · the site: the gap no one occupies */
    const plot = k.box('plot');
    k.add(() => { const v = eo(win(L[2], 0.15, 0.7)); k.draw(plot, -0.3, -0.3, 0, (W + 0.6) * v, (W + 0.6) * Math.min(1, v * 1.15), 0.04); }, key(2));
    stroke(2, 0, 0.35, poly(sq(-0.6, -0.6, 0, W + 1.2, W + 1.2)), 'mark');
    [[-0.6, -0.6], [W + 0.4, -0.6], [W + 0.4, W + 0.4], [-0.6, W + 0.4]].forEach(([x, y], i) => rise(2, 0.35 + i * 0.1, 0.65 + i * 0.1, x, y, 0, 0.2, 0.2, 0.9, 'stake'));

    /* 3 · the foundations: dug and poured */
    const pitFloor = k.el('path', { class: 'pit-floor' }), pitA = k.el('path', { class: 'pit-wall' }), pitB = k.el('path', { class: 'pit-wall' }), pour = k.el('path', { class: 'pour' });
    k.add(() => {
      const dig = eo(win(L[3], 0, 0.4)), fill = eo(win(L[3], 0.45, 0.95));
      const bottom = -D * dig, top = bottom + (F - bottom) * fill, show = dig > 0.002;
      [pitFloor, pitA, pitB, pour].forEach((p) => { p.style.display = show ? '' : 'none'; });
      if (!show) return;
      pitFloor.setAttribute('d', poly(sq(0, 0, bottom, W, W)));
      pitA.setAttribute('d', poly([P(0, 0, top), P(W, 0, top), P(W, 0, 0), P(0, 0, 0)]));
      pitB.setAttribute('d', poly([P(0, 0, top), P(0, W, top), P(0, W, 0), P(0, 0, 0)]));
      pour.style.display = fill > 0.002 ? '' : 'none';
      pour.setAttribute('d', poly(sq(0, 0, top, W, W)));
    }, key(3));

    /* 4 · the structure: four pillars, floor by floor; 5 · floors; 6 · façade, utilities and finishes */
    const PIL = [[0.35, 0.35], [W - 1.05, 0.35], [0.35, W - 1.05], [W - 1.05, W - 1.05]];
    const pillarSeg = (i, j) => { const n = k.box('pillar'); const [x, y] = PIL[i]; return () => { const grown = (4 * S - T) * eo(win(L[4], i * 0.12, 0.55 + i * 0.12)); k.draw(n, x, y, F + j * S, 0.7, 0.7, clamp(grown - j * S, 0, j === 3 ? S - T : S)); }; };
    const slab = (i) => spread(5, i * 0.24, i * 0.24 + 0.3, 0, 0, F + (i + 1) * S - T, W, W, T, 'slab');
    const wallL = (i) => { const n = k.box('wall'), wins = [0, 1, 2].map(() => k.el('path', { class: 'window' })); return () => {
      const z0 = F + i * S, h = (S - T) * eo(win(L[6], i * 0.13, i * 0.13 + 0.32));
      k.draw(n, 0, W - 0.16, z0, W, 0.16, h);
      wins.forEach((p, j) => { const x0 = 0.7 + j * 2.55, x1 = x0 + 1.75, a = z0 + 0.35, b = Math.min(z0 + 1.1, z0 + h); if (b <= a || (i === 0 && j === 2)) { p.style.display = 'none'; return; } p.style.display = ''; p.setAttribute('d', poly([P(x0, W, a), P(x1, W, a), P(x1, W, b), P(x0, W, b)])); });
    }; };
    const wallR = (i) => { const n = k.box('wall'), wins = [0, 1, 2].map(() => k.el('path', { class: 'window' })); return () => {
      const z0 = F + i * S, h = (S - T) * eo(win(L[6], 0.06 + i * 0.13, 0.38 + i * 0.13));
      k.draw(n, W - 0.16, 0, z0, 0.16, W - 0.16, h);
      wins.forEach((p, j) => { const y0 = 0.7 + j * 2.55, y1 = y0 + 1.75, a = z0 + 0.35, b = Math.min(z0 + 1.1, z0 + h); if (b <= a) { p.style.display = 'none'; return; } p.style.display = ''; p.setAttribute('d', poly([P(W, y0, a), P(W, y1, a), P(W, y1, b), P(W, y0, b)])); });
    }; };
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) k.add(pillarSeg(i, j), key(4));
      k.add(wallL(j), key(6)); k.add(wallR(j), key(6));
      slab(j);
    }
    rise(6, 0.62, 0.85, 0, 0, TOP, W, 0.18, 0.4, 'parapet');
    rise(6, 0.62, 0.85, 0, 0, TOP, 0.18, W, 0.4, 'parapet');
    rise(6, 0.55, 0.8, 4.6, 1.2, TOP, 1.5, 1.5, 0.9, 'plant');
    rise(6, 0.66, 0.9, W - 0.18, 0, TOP, 0.18, W, 0.4, 'parapet');
    rise(6, 0.66, 0.9, 0, W - 0.18, TOP, W, 0.18, 0.4, 'parapet');
    const CAB = [[11.6, 4.6], [12.2, 8.2], [9.6, 11.4]];
    CAB.forEach(([x, y], i) => stroke(6, 0.7 + i * 0.07, 0.95 + i * 0.03, open([P(W, 6.5, 0.2), P(W + 0.8, 6.5, 0.02), P(x, y, 0.02)]), 'cable'));
    CAB.forEach(([x, y], i) => rise(6, 0.85 + i * 0.04, 1, x - 0.3, y - 0.3, 0, 0.6, 0.6, 0.35, 'node'));

    /* 7 · handover: door, finishes, keys and building manual */
    const door = k.el('path', { class: 'door' });
    k.add(() => { const v = eo(win(L[7], 0, 0.35)); door.style.display = v > 0.002 ? '' : 'none'; door.setAttribute('d', poly([P(5.9, W, F), P(7.2, W, F), P(7.2, W, F + 1.2 * v), P(5.9, W, F + 1.2 * v)])); }, key(7));
    let mull = '';
    for (let i = 1; i < 8; i++) mull += open([P(i, W, F), P(i, W, TOP)]) + open([P(W, i, F), P(W, i, TOP)]);
    stroke(7, 0.15, 0.6, mull, 'mullion');
    rise(7, 0.5, 0.75, 9.4, 10.6, 0, 1.3, 0.95, 0.28, 'book');
    stroke(7, 0.65, 0.95, open([P(11.4, 10.2, 0.05), P(12.6, 9.6, 0.05)]) + open([P(12.25, 9.78, 0.05), P(12.45, 10.1, 0.05)]), 'key');

    /* 8 · in use: inspection scaffold and extension */
    [0.9, 3, 5.1, 7.2].forEach((y, i) => rise(8, i * 0.06, 0.4 + i * 0.06, W + 0.55, y, 0, 0.12, 0.12, TOP + 0.4, 'scaf'));
    [1.9, 3.6, 5.3, 7].forEach((z, i) => spread(8, 0.3 + i * 0.07, 0.55 + i * 0.07, W + 0.4, 0.8, z, 0.45, 6.6, 0.08, 'plank'));
    const amp = k.el('path', { class: 'amp' });
    k.add(() => { const v = eo(win(L[8], 0.45, 0.95)), z1 = TOP + 0.4 + 1.9 * v; amp.style.display = v > 0.002 ? '' : 'none'; amp.setAttribute('d', poly(sq(0, 0, z1, W, W)) + open([P(W, 0, TOP + 0.4), P(W, 0, z1)]) + open([P(W, W, TOP + 0.4), P(W, W, z1)]) + open([P(0, W, TOP + 0.4), P(0, W, z1)])); }, key(8));

    /* site fences arrive with the site and leave at handover */
    const onSite = () => eo(win(L[2], 0.45, 0.9)) * (1 - eo(win(L[7], 0, 0.35)));
    [[0.3, 3.4], [4.6, 3.4]].forEach(([x0, w]) => {
      const y = W + 1.5, pa = k.box('post'), pb = k.box('post'), bar = k.box('tora'), bar2 = k.box('tora');
      k.add(() => { const v = onSite(); k.draw(pa, x0, y, 0, 0.14, 0.14, 0.78 * v); k.draw(pb, x0 + w - 0.14, y, 0, 0.14, 0.14, 0.78 * v); k.draw(bar, x0, y - 0.02, 0.52 * v, w, 0.08, v > 0.01 ? 0.2 : 0); k.draw(bar2, x0, y - 0.02, 0.16 * v, w, 0.08, v > 0.01 ? 0.14 : 0); }, key(2, 7));
    });

    /* people: passers-by always; workers while the site is open */
    const folk = [['office', [10.2, 5.4]], ['kid', [3.2, 10.6], 0.74], ['neighbour', [11, 9.8]]];
    folk.forEach(([kind, at, s]) => k.person(kind, at, -1, { s }));
    const crew = [k.person('guard', [9.5, 7.7], -1), k.person('architect', [-1.5, 9.6], -1)];
    const crewUse = crew.map((g) => g.previousSibling);
    k.add(() => { const on = onSite() > 0.5 ? '' : 'none'; crew.forEach((g, i) => { g.style.display = on; crewUse[i].style.display = on; }); }, key(2, 7));
    rise(1, 0.5, 0.85, 11.2, 11.4, 0, 1.5, 1.4, 1.1, 'city');

    /* the crane: grows with the building and is dismantled at the end */
    const MX = 11.2, MY = 2.2;
    const mast = k.box('crane'), jib = k.box('crane'), cjib = k.box('crane'), cw = k.box('crane');
    const hookLine = k.el('path', { class: 'hook-line' }), hook = k.box('hook'), lattice = k.el('path', { class: 'lattice' });
    k.add(() => {
      const up = eo(win(L[3], 0.05, 0.45)) * 4 + eo(L[4]) * 3.6 + eo(L[5]) * 2.6 + eo(L[6]) * 0.8;
      const H = up * (1 - eo(win(L[7], 0.55, 1)));
      k.draw(mast, MX, MY, 0, 0.6, 0.6, H);
      let lat = '';
      for (let z = 0.6; z < H - 0.3; z += 0.6) lat += open([P(MX + 0.6, MY, z - 0.6), P(MX + 0.6, MY + 0.6, z)]) + open([P(MX, MY + 0.6, z - 0.6), P(MX + 0.6, MY + 0.6, z)]);
      lattice.setAttribute('d', lat || 'M0 0');
      const arm = H > 2.5 ? eo(clamp((H - 2.5) / 1.5)) : 0;
      k.draw(jib, MX + 0.6 - 9.5 * arm, MY + 0.1, H, 9.5 * arm, 0.4, 0.35);
      k.draw(cjib, MX + 0.6, MY + 0.1, H, 3 * arm, 0.4, 0.3);
      k.draw(cw, MX + 0.6 + 2.2 * arm, MY - 0.05, H - 0.6, 0.8 * arm, 0.7, 0.6 * (arm > 0.9 ? 1 : 0));
      const work = F + 0.6 + 4 * S * eo(L[5]) * 0.92, tx = 4.3, ty = MY + 0.3;
      const show = arm > 0.95 && H > work + 0.8;
      hookLine.style.display = show ? '' : 'none';
      if (show) hookLine.setAttribute('d', open([P(tx, ty, H), P(tx, ty, work + 0.35)]));
      k.draw(hook, tx - 0.15, ty - 0.15, work, 0.3, 0.3, show ? 0.35 : 0);
    }, key(3, 4, 5, 6, 7));

    /* sign-off gomets: one per closed phase */
    const VAL = [[2, W + 0.5, W + 0.5, 0.9], [3, 5, W, F], [4, W - 0.35, W - 0.35, TOP - T], [5, W, W, F + 4 * S - T * 0.5], [6, W, W * 0.5, TOP + 0.4]];
    VAL.forEach(([ph, x, y, z]) => {
      const [cx, cy] = P(x, y, z), g = k.el('g', { class: 'gv' }, k.svg.querySelector('.labels')), inner = k.el('g', {}, g);
      k.el('circle', { r: 9, class: 'gv-c' }, inner); k.el('path', { d: 'M-4.2 0.3L-1.2 3.4L4.5 -3.4', class: 'gv-k' }, inner);
      k.marks.push({ g, inner, x: cx, y: cy });
      k.add(() => { const v = back(win(L[ph], 0.92, 1) * 1); inner.setAttribute('transform', `scale(${v.toFixed(3)})`); g.style.opacity = v > 0 ? 1 : 0; }, key(ph));
    });

    /* numbered marks: what each phase points at, in the order of the legend */
    const MARKS = {
      1: [[2.6, -2, 4.6], [10.8, -1.6, 3.6], [10.36, 5.56, 1]],
      2: [[W + 0.5, -0.5, 0.9], [W, W * 0.6, 0]],
      3: [[2, W, F], [W, 3, F]],
      4: [[0.7, 0.7, TOP - T], [W - 0.7, 0.7, TOP - T], [W - 0.35, W - 0.35, 4], [W - 0.35, W - 0.35, 1.2]],
      5: [[W, 4, F + S - T], [W, 4, F + 2 * S - T], [W, 4, F + 3 * S - T], [W, 4, F + 4 * S - T]],
      6: [[W, 0.1, TOP + 0.4], [5.35, 1.95, TOP + 0.9], [11.6, 4.6, 0.35], [12.2, 8.2, 0.35], [9.6, 11.4, 0.35]],
      7: [[12.2, 9.8, 0.05], [10, 11, 0.28]],
      8: [[W + 0.6, 3, 5], [W + 0.6, 5.1, 2], [W, 0, TOP + 2.3]]
    };
    const lab = k.svg.querySelector('.labels');
    const showMarks = opt.marks || {};
    Object.keys(showMarks).forEach((ph) => {
      const list = showMarks[ph] === true ? MARKS[ph].map((p, i) => [p, i + 1]) : showMarks[ph];
      list.forEach(([p, n]) => {
        const [cx, cy] = P(p[0], p[1], p[2]);
        const g = k.el('g', { class: 'mk', 'data-i': n }, lab), inner = k.el('g', {}, g);
        k.el('circle', { r: 9 }, inner); const tx = k.el('text', { y: 3.6, 'text-anchor': 'middle' }, inner); tx.textContent = n;
        k.marks.push({ g, inner, x: cx, y: cy });
        const at = opt.markAt ? opt.markAt(+ph, n) : 0.75;
        k.add(() => { const v = back(win(L[ph], at, Math.min(1, at + 0.2))); inner.setAttribute('transform', `scale(${v.toFixed(3)})`); g.style.opacity = v > 0 ? 1 : 0; }, key(+ph));
      });
    });

    /* framing points: the ground and whatever stands up in the phases shown */
    const upto = opt.upto || 8;
    [P(G0, G0, 0), P(G1, G0, 0), P(G1, G1, 0), P(G0, G1, 0)].forEach((q) => k.bounds.push(q));
    city.forEach(([x, y, , , h]) => k.pt(x, y, h));
    if (upto >= 3 && (opt.from || 1) <= 7) { k.pt(MX, MY, 11.4); k.pt(MX + 3.6, MY, 11.4); k.pt(MX - 9, MY, 11.4); }
    if (upto >= 4) k.pt(0, 0, TOP + 0.5);
    if (upto >= 8) k.pt(0, 0, TOP + 2.4);
    return { W, F, S, T, TOP };
  }

  // phase schedule: phases before `ph` already built, `ph` builds during [a, b] seconds
  const phaseAt = (ph, a, b) => (t) => { const v = [0]; for (let i = 1; i <= 8; i++) v.push(i < ph ? 1 : i === ph ? win(t, a, b) : 0); return v; };
  // the whole sequence, one phase after another
  const sequence = (a, each) => (t) => { const v = [0]; for (let i = 1; i <= 8; i++) v.push(win(t, a + (i - 1) * each, a + i * each)); return v; };

  /* ======================================================================================
   * Scenes, keyed by slide number. Each returns its duration in seconds.
   * ==================================================================================== */
  const SCENES = {};
  // every step shows the same building, framed the same way: what came before is already built, its own phase builds now
  const phaseScene = (ph) => (k) => { obra(k, phaseAt(ph, 0.35, 4.6), { upto: 8, from: 1 }); return 5.4; };
  [[5, 1], [7, 2], [11, 3], [17, 4], [20, 5], [22, 6], [24, 7], [26, 8]].forEach(([n, ph]) => { SCENES[n] = phaseScene(ph); });

  // 04 · the building: every layer rests on the one before
  SCENES[4] = (k) => {
    obra(k, sequence(0.3, 1.15), { upto: 8, marks: { 2: [[[8.5, -0.5, 0.9], 1]], 3: [[[8, 3, -0.3], 2]], 4: [[[7.65, 7.65, 6.5], 3]], 5: [[[8, 4, 2.8], 4]], 6: [[[5.35, 1.95, 7.6], 5]], 7: [[[12.2, 9.8, 0.05], 6]] }, markAt: () => 0.85 });
    return 10.2;
  };

  // 03 · many brands start with the façade
  SCENES[3] = (k) => {
    const W = 7;
    k.ground(-2.5, -2.5, 10.5, 10.5, 0, 0.8);
    k.dash(3.9, 4.6, poly(sq(0, 0, -1.2, W, W)) + open([P(W, 0, -1.2), P(W, 0, 0)]) + open([P(W, W, -1.2), P(W, W, 0)]) + open([P(0, W, -1.2), P(0, W, 0)]), 'missing');
    const blink = k.svg.querySelector('.missing');
    k.add((t) => { if (t > 4.6 && t < 6) blink.style.opacity = 0.35 + 0.65 * Math.abs(Math.cos((t - 4.6) * 7)); }, (t) => (t > 4.6 && t < 6.05 ? t.toFixed(2) : t > 6 ? 'end' : 'pre'));
    // floors that do not fit, slid in under the façade one by one
    // [z0, z1, comes from (+/-), final dx, final dy, width change]
    const FL = [[4.5, 5.9, -1, 0.55, -0.4, 0], [3, 4.5, 1, -0.6, 0.4, 0.5], [1.5, 3, -1, 0.5, 0.6, -0.6], [0, 1.5, 1, -0.4, -0.5, 0.3]];
    const boxes = FL.map(() => k.box('floor'));
    FL.forEach(([z0, z1]) => k.ptBox(-1.5, -1.5, z0, W + 3, W + 3, z1 - z0));
    k.add((t) => {
      FL.forEach(([z0, z1, from, dx, dy, dw], j) => {
        const a = 1.5 + j * 0.62, v = back(win(t, a, a + 0.75));
        const sway = t > 4.2 ? Math.sin((t - 4.2) * 5 + j * 1.7) * 0.09 * (j + 1) * Math.max(0, 1 - (t - 4.2) / 2.2) : 0;
        const slide = from * 5.5 * (1 - v);
        k.draw(boxes[3 - j], dx + slide + sway, dy - slide * 0.35, z0, W + dw, W - dw * 0.5, v > 0 ? z1 - z0 - 0.08 : 0);
      });
    }, (t) => (t < 6.6 ? t.toFixed(3) : 'end'));
    // reorder: lowest floor first so the stack overlaps correctly
    boxes.forEach((b) => k.svg.querySelector('.scene').appendChild(b.g));
    k.pt(W, W, -1.2); k.pt(0, W, -1.2); k.pt(W, 0, -1.2);
    const facade = k.box('facade-panel');
    k.add((t) => { const v = back(win(t, 0.6, 1.3)); k.draw(facade, 1.5, W + 0.05, 4.6 + (1 - v) * 1.2, 4, 0.12, 1.15 * Math.min(1, v)); }, (t) => win(t, 0.6, 1.3).toFixed(4));
    const logo = k.path('', 'logo-mark', 1.1, 1.5);
    logo.setAttribute('d', poly([P(2.5, W + 0.17, 4.85), P(4.5, W + 0.17, 4.85), P(4.5, W + 0.17, 5.5), P(2.5, W + 0.17, 5.5)]));
    k.person('pointer', [9.2, 5.5], 2.4);
    k.person('walker', [8.6, 8.8], 2.7, { s: 0.92 });
    k.mark(3.5, W + 0.1, 6.1, 1, 1.4); k.mark(W, 2, 3.4, 2, 4.2); k.mark(W, W * 0.5, -1.2, 3, 5.0);
    return 6.6;
  };

  // 29 · technique and creativity
  SCENES[29] = (k) => {
    k.ground(-2.5, -2.5, 10.5, 10.5, 0, 0.7);
    k.rise(0.4, 1.5, 0, 0, 0, 6, 6, 5.2, 'block', eio);
    // calculation: dimension lines and the structural grid on the left face
    let dim = open([P(0, 6.9, 0), P(6, 6.9, 0)]) + open([P(-0.45, 6.9, 0), P(-0.45, 6.9, 5.2)]);
    for (let i = 0; i <= 6; i += 1.5) dim += open([P(i, 6.6, 0), P(i, 7.2, 0)]);
    for (let z = 0; z <= 5.2; z += 1.3) dim += open([P(-0.75, 6.9, z), P(-0.15, 6.9, z)]);
    k.pt(-0.75, 7.2, 0); k.pt(6, 7.2, 0);
    k.stroke(1.6, 2.7, dim, 'dim');
    let calc = '';
    for (let i = 1.5; i < 6; i += 1.5) calc += open([P(i, 6, 0), P(i, 6, 5.2)]);
    for (let z = 1.3; z < 5.2; z += 1.3) calc += open([P(0, 6, z), P(6, 6, z)]);
    k.dash(2.0, 2.9, calc, 'calc');
    // design: panels pop on the right face
    const pan = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) pan.push([c, r]);
    pan.forEach(([c, r], i) => {
      const y0 = 0.5 + c * 1.85, z0 = 0.45 + r * 1.2, a = 3.0 + (i % 5) * 0.12 + r * 0.16;
      const p = k.el('path', { class: 'panel' + ((c * 7 + r * 3) % 5 === 0 ? ' on' : '') });
      k.add((t) => { const v = back(win(t, a, a + 0.45)); const w = 1.4 * v, h = 0.85 * v, yc = y0 + 0.7, zc = z0 + 0.42; p.style.display = v > 0.01 ? '' : 'none'; p.setAttribute('d', poly([P(6, yc - w / 2, zc - h / 2), P(6, yc + w / 2, zc - h / 2), P(6, yc + w / 2, zc + h / 2), P(6, yc - w / 2, zc + h / 2)])); }, (t) => win(t, a, a + 0.45).toFixed(4));
    });
    k.person('architect', [-1.6, 8.2], 2.2);
    k.person('pointer', [8.4, 2.6], 3.4);
    k.mark(3, 6.9, 0, 1, 2.6); k.mark(6, 3.3, 5.2, 2, 4.2);
    return 5.4;
  };

  // 31 · open up and choose: options rise through the filters
  SCENES[31] = (k) => {
    const LV = [[0, 6.4, 0], [0.8, 4.8, 2.4], [1.6, 3.2, 4.8], [2.4, 1.6, 7.2], [2.9, 0.6, 9.6]];
    const SLOT = 3.0;
    LV.forEach(([o, s, z], i) => {
      const a = i * SLOT * 0.42;
      k.spread(a, a + 0.6, o, o, z, s, s, 0.16, 'plate');
      if (i) k.dash(a - 0.3, a + 0.4, open([P(LV[i - 1][0], LV[i - 1][0] + LV[i - 1][1], LV[i - 1][2]), P(o, o + s, z)]) + open([P(LV[i - 1][0] + LV[i - 1][1], LV[i - 1][0], LV[i - 1][2]), P(o + s, o, z)]) + open([P(LV[i - 1][0] + LV[i - 1][1], LV[i - 1][0] + LV[i - 1][1], LV[i - 1][2]), P(o + s, o + s, z)]), 'funnel');
    });
    // 36 options; each one survives up to a level, then fades on its plate
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const keep = [36, 18, 9, 3, 1];
    const dots = [];
    for (let i = 0; i < 36; i++) {
      const lvl = i < 1 ? 4 : i < 3 ? 3 : i < 9 ? 2 : i < 18 ? 1 : 0;
      const pos = LV.map(([o, s]) => [o + 0.35 + rnd() * (s - 0.7), o + 0.35 + rnd() * (s - 0.7)]);
      dots.push({ lvl, pos, el: k.el('circle', { r: 4.2, class: 'opt' }) });
    }
    k.add((t) => {
      dots.forEach((d, i) => {
        let lv = 0, f = 0;
        for (let j = 1; j <= d.lvl; j++) { const a = j * SLOT * 0.42 - 0.2 + (i % 6) * 0.05; const v = eio(win(t, a, a + 0.75)); if (v > 0) { lv = j - 1; f = v; } }
        const born = back(win(t, 0.4 + (i % 12) * 0.05, 0.8 + (i % 12) * 0.05));
        const a0 = d.pos[lv], a1 = d.pos[Math.min(d.lvl, lv + 1)], z0 = LV[lv][2], z1 = LV[Math.min(d.lvl, lv + 1)][2];
        const x = lerp(a0[0], a1[0], f), y = lerp(a0[1], a1[1], f), z = lerp(z0, z1, f) + 0.16 + Math.sin(f * Math.PI) * 0.6;
        const [px, py] = P(x, y, z);
        const dead = d.lvl < 4 ? win(t, (d.lvl + 1) * SLOT * 0.42 - 0.1, (d.lvl + 1) * SLOT * 0.42 + 0.4) : 0;
        d.el.setAttribute('cx', px.toFixed(1)); d.el.setAttribute('cy', py.toFixed(1));
        d.el.setAttribute('r', (4.2 * born).toFixed(2));
        d.el.style.opacity = (1 - dead * 0.82).toFixed(3);
        d.el.classList.toggle('out', dead > 0.5);
      });
    });
    const sol = k.rise(4 * SLOT * 0.42 + 0.7, 4 * SLOT * 0.42 + 1.4, 2.95, 2.95, 9.76, 0.5, 0.5, 0.55, 'solution', back);
    k.gomet(3.2, 3.2, 10.8, 4 * SLOT * 0.42 + 1.5);
    LV.forEach(([o, s, z], i) => k.mark(o + s, o + s * 0.5, z, i + 1, i * SLOT * 0.42 + 0.5));
    return 4 * SLOT * 0.42 + 2.2;
  };

  // 32 · every decision has a reason and a test
  SCENES[32] = (k) => {
    k.ground(-2, -2, 14, 9, 0, 0.7);
    k.rise(0.5, 1.0, 0.6, 2.2, 0, 0.18, 0.18, 1.6, 'post');
    k.rise(0.55, 1.05, 0.6, 5.6, 0, 0.18, 0.18, 1.6, 'post');
    k.rise(0.9, 1.6, 0.5, 1.6, 1.6, 0.25, 5.2, 2.6, 'sign', eio);
    k.path(poly([P(0.75, 3.2, 2.4), P(0.75, 4.6, 2.4), P(0.75, 4.6, 3.6), P(0.75, 3.2, 3.6)]), 'logo-mark', 1.5, 1.9);
    const sight = (a, x, y) => k.dash(a, a + 0.7, open([P(0.8, 3.9, 3), P(x, y, 1.6)]), 'sight');
    k.person('pointer', [3.4, 4.6], 1.8, { flip: true }); sight(2.0, 3.4, 4.6);
    k.person('walker', [7.6, 2.4], 2.6, { flip: true }); sight(2.8, 7.6, 2.4);
    const p3 = k.person('woman', [12.4, 6.2], 3.3, { from: [12.4, 0.2], b: 5.4 });
    const s3 = k.el('path', { class: 'ln dash sight' });
    k.add((t) => { const v = eio(win(t, 3.3, 5.4)), y = lerp(0.2, 6.2, v); s3.style.opacity = eo(win(t, 3.5, 3.9)); s3.setAttribute('d', open([P(0.8, 3.9, 3), P(12.4, y, 1.6)])); }, (t) => win(t, 3.3, 5.4).toFixed(3));
    k.mark(3.4, 4.6, 2.6, 1, 2.2); k.mark(7.6, 2.4, 2.6, 2, 3.0); k.mark(12.4, 6.2, 2.6, 3, 5.0);
    return 6;
  };

  // 33 · the method is always the same, the result never
  SCENES[33] = (k) => {
    const X = [0, 8, 16];
    X.forEach((x0, i) => { k.ground(x0 - 1, -1, x0 + 6, 6, i * 0.15, 0.8 + i * 0.15); k.dash(0.6 + i * 0.15, 1.2 + i * 0.15, poly(sq(x0, 0, 0, 5, 5)), 'lot'); });
    // product: a slim tower floor by floor
    for (let f = 0; f < 6; f++) k.rise(1.3 + f * 0.18, 1.6 + f * 0.18, 1.4, 1.4, f * 0.9, 2.2, 2.2, 0.9, 'tower');
    // hospitality: stepped terraces
    [[0.4, 0.4, 4.2, 4.2, 0, 1.2], [1.0, 1.0, 3.0, 3.0, 1.2, 1.2], [1.6, 1.6, 1.8, 1.8, 2.4, 1.1]].forEach(([x, y, w, d, z, h], i) => k.rise(2.6 + i * 0.32, 3.1 + i * 0.32, 8 + x, y, z, w, d, h, 'terrace', eio));
    // culture: two volumes that meet
    k.rise(3.9, 4.6, 16.4, 0.4, 0, 4.2, 2, 2.4, 'hall', eio);
    k.rise(4.2, 4.9, 16.4, 2.4, 0, 1.8, 2.4, 3.6, 'hall', eio);
    k.mark(3.6, 3.6, 0, 1, 2.6); k.mark(11.6, 4.2, 0, 2, 3.8); k.mark(20.6, 3, 0, 3, 5.0);
    return 5.6;
  };

  // 34 · a core team and the best trades
  SCENES[34] = (k) => {
    k.ground(-3, -3, 12, 12, 0, 0.7);
    const W = 6, S = 1.5;
    [[0.2, 0.2], [W - 0.8, 0.2], [0.2, W - 0.8], [W - 0.8, W - 0.8]].forEach(([x, y], i) => k.rise(0.5 + i * 0.08, 1.5 + i * 0.08, x, y, 0, 0.6, 0.6, 3 * S, 'pillar'));
    for (let f = 1; f <= 3; f++) k.spread(0.9 + f * 0.25, 1.4 + f * 0.25, 0, 0, f * S - 0.22, W, W, 0.22, 'slab');
    k.person('walker', [1.8, 7.2], 2.0); k.person('pointer', [3.1, 7.6], 2.1); k.person('woman', [4.4, 7.2], 2.2);
    k.person('camera', [-1.8, 3.2], 2.4, { from: [-3.5, 3.2], b: 3.4 });
    k.person('phone', [7.2, 9.4], 3.0, { from: [7.2, 12], b: 4.0 });
    k.person('laptop', [8.2, 3.0], 3.6, { from: [11.5, 3.0], b: 4.6, flip: true });
    // production: crates arrive on a path
    k.dash(4.4, 5.0, open([P(11, 9, 0), P(8.6, 8.6, 0), P(6.8, 9.4, 0)]), 'route');
    [[9.2, 9.6, 0], [10.4, 8.4, 0], [9.6, 8.2, 0.6]].forEach(([x, y, z], i) => k.rise(4.8 + i * 0.2, 5.3 + i * 0.2, x, y, z, 0.9, 0.9, 0.6, 'crate', back));
    k.mark(3, 3, 3 * S, 1, 2.4); k.mark(-1.8, 3.2, 2.7, 2, 3.4); k.mark(7.2, 9.4, 2.7, 3, 4.0); k.mark(8.2, 3, 2.7, 4, 4.6); k.mark(10, 9, 1.5, 5, 5.6);
    return 6.2;
  };

  // 36 · we work with you, not for you
  SCENES[36] = (k) => {
    k.ground(-2, -2, 11, 9, 0, 0.7);
    k.person('office', [0.6, 5.2], 0.5, { from: [-2.5, 6.4], b: 1.9 });
    k.person('woman', [1.2, 3.6], 0.6, { from: [-2.2, 4.4], b: 2.0, s: 0.95 });
    k.person('pointer', [8.4, 2.6], 0.5, { from: [11, 1.4], b: 1.9, flip: true });
    k.person('walker', [8.0, 4.4], 0.7, { from: [11.2, 4.8], b: 2.1, flip: true });
    k.rise(2.0, 3.2, 3, 1.8, 0, 3.4, 3.4, 2.6, 'shared', eio);
    k.stroke(2.6, 3.4, poly(sq(3, 1.8, 2.6, 3.4, 3.4)), 'shared-top');
    k.gomet(4.7, 3.5, 3.4, 3.4);
    return 4.2;
  };

  // 38 · the empty site where everything starts
  SCENES[38] = (k) => {
    k.ground(-2, -2, 10, 10, 0, 1.0);
    k.stroke(1.0, 1.7, poly(sq(1, 1, 0, 6, 6)), 'mark');
    [[1, 1], [6.8, 1], [6.8, 6.8], [1, 6.8]].forEach(([x, y], i) => k.rise(1.6 + i * 0.12, 2.0 + i * 0.12, x - 0.1, y - 0.1, 0, 0.2, 0.2, 0.9, 'stake', back));
    k.person('pointer', [4, 4], 2.2, { from: [9.5, 6], b: 3.6 });
    k.gomet(4, 4, 2.6, 3.8);
    return 4.4;
  };

  // 18 · the four pillars, one small drawing each
  const PILLARS = {
    typo: (k) => { k.ground(-0.5, -0.5, 4.5, 2, 0, 0.5); [[0, 2.8], [1.4, 1.9], [2.8, 1.1]].forEach(([x, h], i) => k.rise(0.25 + i * 0.2, 1.0 + i * 0.2, x, 0, 0, 1, 1.4, h, 'sort', eio)); return 1.6; },
    grid: (k) => { k.ground(0, 0, 5, 5, 0, 0.9); k.spread(0.9, 1.4, 1, 1, 0, 2, 2, 0.25, 'cell'); return 1.6; },
    color: (k) => { [0, 1.3, 2.6, 3.9].forEach((x, i) => k.rise(0.2 + i * 0.18, 0.8 + i * 0.18, x, 0, 0, 1.1, 1.1, 1.6 - i * 0.3, 'sw sw' + i, back)); return 1.6; },
    imagery: (k) => { k.dash(0, 0.6, poly(sq(-0.4, -0.4, 0, 3.6, 3.6)), 'frame'); k.rise(0.4, 1.2, 0.8, 0.8, 0, 2, 2, 2, 'cube', back); return 1.6; }
  };

  /* ---------- player ---------- */
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(host, build, opts) {
    opts = opts || {};
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'kit');
    svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);
    const k = Kit(svg);
    k.sw = opts.sw || 1;
    const dur = build(k);
    const st = { k, dur, raf: 0, t0: 0, playing: false };
    k.frame(opts.pad);
    k.set(opts.final || RM ? dur + 1 : 0);
    if ('ResizeObserver' in window) new ResizeObserver(() => k.frame(opts.pad)).observe(svg);
    st.play = () => {
      cancelAnimationFrame(st.raf);
      if (RM) { k.set(dur + 1); return; }
      st.t0 = performance.now(); st.playing = true;
      host.classList.add('playing');
      const tick = (now) => {
        const t = (now - st.t0) / 1000 * (opts.speed || 1);
        k.set(t);
        if (host._onProgress) host._onProgress(Math.min(1, t / dur));
        if (t < dur + 0.3) st.raf = requestAnimationFrame(tick); else { st.playing = false; host.classList.remove('playing'); }
      };
      st.raf = requestAnimationFrame(tick);
    };
    st.finish = () => { cancelAnimationFrame(st.raf); k.set(dur + 1); };
    st.reset = () => { cancelAnimationFrame(st.raf); k.set(0); };
    // driven by scroll: p 0–1 is how far the reader has gone through the drawing's block
    st.seek = (p) => { cancelAnimationFrame(st.raf); k.set(p >= 1 ? dur + 1 : Math.max(0, p) * dur); };
    return st;
  }

  window.GVE_KIT = {
    has: (n) => !!SCENES[n],
    mount: (host, n, opts) => mount(host, SCENES[n], opts),
    pillar: (host, name, opts) => mount(host, PILLARS[name], Object.assign({ pad: 10 }, opts)),
    // one building for the whole method: phases(arr) sets how far each of the eight phases has gone (0–1)
    building: (host, opts) => {
      let ext = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const st = mount(host, (k) => { obra(k, () => ext, { upto: 8, from: 1 }); return 1; }, opts);
      st.phases = (arr) => { ext = [0].concat(arr); st.k.set(0.5); };
      return st;
    },
    // a small, already finished building at the end of phase `ph`, for the timeline
    phaseIcon: (host, ph) => mount(host, (k) => { obra(k, phaseAt(ph + 1, 0, 0.001), { upto: ph, from: ph }); return 0.01; }, { final: true, pad: 4, sw: 0.42 })
  };
})();
