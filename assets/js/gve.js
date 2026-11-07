/*
 * Gomet Verd Estudi — interacción
 *  1. La tapa: el huevo se abre con el scroll (gira, se abre, sale la cápsula, se abre, salen las instrucciones)
 *  2. Vídeos: se cargan y suenan (mudos) solo cuando se ven
 *  3. Colecciónalos todos: los modelos abiertos se marcan con un gomet
 *  4. Piezas sueltas ↔ hoja de pedido
 *  5. Hoja de gomets: se despegan y se pegan por la página
 *  6. Visor de pasos en cada modelo
 *  7. Hoja de pedido: se envía por correo o WhatsApp ya escrita
 */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: no pasa nada */ } }
  };
  const EMAIL = 'gometverdestudi@gmail.com', WA = '34684450515';

  /* ---------- 1. la tapa ---------- */
  const cover = $('.cover');
  if (cover) {
    const g = (id) => document.getElementById(id);
    const top = g('egg-top'), bot = g('egg-bot'), cap = g('capsule'), capTop = g('cap-top'), leaf = g('leaflet'), split = g('split'), shadow = g('egg-shadow');
    const panels = $$('.lf-panel', leaf), lfText = $$('.lf-inner > text, .lf-deco', leaf);
    const a1 = $('.a1', cover), a2 = $('.a2', cover);
    const steps = $$('.cover-steps li', cover);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const seg = (p, a, b) => clamp((p - a) / (b - a));
    const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const lerp = (a, b, t) => a + (b - a) * t;
    let last = -1;

    function draw(p) {
      if (Math.abs(p - last) < .0005) return;
      last = p;
      const s1 = seg(p, 0, .14);
      const s2 = ease(seg(p, .12, .36));
      const s3 = ease(seg(p, .32, .52));
      const s4 = ease(seg(p, .50, .64));
      const s5 = ease(seg(p, .62, .80));
      const s6 = ease(seg(p, .76, .94));
      // ① gira: un bamboleo que se apaga
      const w = Math.sin(s1 * Math.PI * 4) * 7 * (1 - s1) * (1 - s2);
      const shift = 40 * s2; // la mitad de abajo se aparta un poco para dejar sitio
      bot.setAttribute('transform', `translate(${shift},0) rotate(${w} 300 474)`);
      shadow.setAttribute('transform', `translate(${shift},0)`);
      // ② la tapa del huevo sube y se deja a un lado, boca abajo y en pequeño
      const cx = lerp(300, 112, s2), cy = lerp(180, 446, s2) - 150 * Math.sin(Math.PI * s2);
      const sc = lerp(1, .42, s2), rot = lerp(0, -168, s2) + w;
      top.setAttribute('transform', `translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(-300 -180)`);
      split.setAttribute('transform', `rotate(${w} 300 474)`);
      split.style.opacity = String(clamp(s1 * 3) * (1 - clamp(s2 * 6)));
      split.style.strokeDashoffset = String(-s1 * 48);
      // ③ sale la cápsula
      cap.setAttribute('transform', `translate(${shift},${-130 * s3}) rotate(${w} 300 474)`);
      // ④ se abre la cápsula: la mitad de arriba gira sobre su bisagra derecha
      capTop.setAttribute('transform', `translate(${30 * s4},${70 * s4}) rotate(${112 * s4} 378 332)`);
      // ⑤ salen las instrucciones y se despliegan en acordeón
      const lx = lerp(340, 318, s5), ly = lerp(240, 26, s5), ls = Math.max(.001, lerp(.08, 1.32, s5));
      leaf.setAttribute('transform', `translate(${lx} ${ly}) scale(${ls}) translate(-124 -43)`);
      leaf.style.opacity = String(clamp(s5 * 4));
      panels.forEach((el, i) => {
        const x = -(i * 62) * (1 - s6);
        const sk = (i % 2 ? -14 : 14) * (1 - s6);
        el.setAttribute('transform', `translate(${x} 0) skewY(${sk})`);
      });
      lfText.forEach((t) => { t.style.opacity = String(seg(s6, .7, 1)); });
      // flechas de manual
      a1.style.opacity = String(clamp(s1 * 2) * (1 - seg(p, .3, .36)));
      a2.style.opacity = String(seg(p, .5, .6) * (1 - seg(p, .74, .8)));
      // pasos de la columna
      const now = p < .12 ? 0 : p < .34 ? 1 : p < .52 ? 2 : p < .64 ? 3 : 4;
      steps.forEach((li, i) => { li.classList.toggle('on', i <= now); li.classList.toggle('now', i === now); });
      cover.classList.toggle('is-open', p > .97);
    }
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const r = cover.getBoundingClientRect();
        const run = cover.offsetHeight - innerHeight;
        draw(run > 0 ? clamp(-r.top / run) : 1);
      });
    }
    if (reduce) draw(1);
    else { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll(); }
  }

  /* ---------- 2. vídeos ---------- */
  function load(v) {
    if (v.dataset.src && !v.src) { v.src = v.dataset.src; }
    if (!v.dataset.loaded && v.querySelector('source')) { v.load(); }
    v.dataset.loaded = '1';
  }
  function play(v) {
    if (reduce) return;
    load(v);
    if (!v.dataset.watch) { // se muestra el vídeo solo cuando de verdad avanza (si no, se queda la imagen)
      v.dataset.watch = '1';
      v.addEventListener('timeupdate', () => { if (v.currentTime > .05) v.parentElement.classList.add('playing'); });
    }
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }
  function stop(v) { v.pause(); }
  const cardVideos = $$('.card video');
  if (fine) {
    cardVideos.forEach((v) => {
      const a = v.closest('a');
      a.addEventListener('pointerenter', () => play(v));
      a.addEventListener('pointerleave', () => stop(v));
      a.addEventListener('focus', () => play(v));
      a.addEventListener('blur', () => stop(v));
    });
  }
  const inView = [...(fine ? [] : cardVideos), ...$$('.pj-cover video'), ...$$('.step-video')];
  if ('IntersectionObserver' in window && inView.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play(e.target) : stop(e.target))), { threshold: .45 });
    inView.forEach((v) => io.observe(v));
  }

  /* ---------- 3. colecciónalos todos ---------- */
  const SEEN = 'gve-seen';
  const seen = new Set(store.get(SEEN, []));
  const m = location.pathname.match(/\/modelos\/([^/]+)\/(?:index\.html)?$/);
  if (m) { seen.add(m[1]); store.set(SEEN, [...seen]); }
  const cards = $$('.card[data-slug]');
  if (cards.length) {
    let n = 0;
    cards.forEach((c) => { if (seen.has(c.dataset.slug)) { c.classList.add('seen'); n++; } });
    const tally = $('#tally b');
    if (tally) tally.textContent = n;
  }

  /* ---------- 4 y 7. piezas sueltas y hoja de pedido ---------- */
  const form = $('#order');
  if (form) {
    const partBtns = $$('[data-part]');
    const boxes = $$('input[name="parts"]', form);
    const sync = () => partBtns.forEach((b) => {
      const box = boxes.find((x) => x.value === b.dataset.part);
      b.setAttribute('aria-pressed', box && box.checked ? 'true' : 'false');
    });
    partBtns.forEach((b) => b.addEventListener('click', () => {
      const box = boxes.find((x) => x.value === b.dataset.part);
      if (box) { box.checked = !box.checked; sync(); }
    }));
    boxes.forEach((x) => x.addEventListener('change', sync));
    sync();

    // modelo de referencia: /?m=claur-tiles#pedido
    const ref = new URLSearchParams(location.search).get('m');
    const card = ref && $(`.card[data-slug="${CSS.escape(ref)}"]`);
    const note = $('#order-note');
    if (card) {
      const label = `${$('.card-top .mono', card).textContent} ${$('.card-name', card).textContent}`;
      form.elements.model.value = label;
      note.textContent = `Modelo de referencia: ${label}. Solo usamos estos datos para responderte.`;
    }

    let via = 'email';
    $$('button[type="submit"]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      const name = f.name.value.trim();
      const nameField = f.name.closest('.field');
      if (!name) { nameField.classList.add('bad'); f.name.focus(); note.textContent = 'Falta tu nombre: es lo único imprescindible.'; return; }
      nameField.classList.remove('bad');
      const val = (k) => { const x = $(`input[name="${k}"]:checked`, form); return x ? x.value : '—'; };
      const parts = boxes.filter((x) => x.checked).map((x) => x.value).join(', ') || '—';
      const lines = [
        'Hola, Gomet Verd Estudi:', '',
        `Piezas: ${parts}`, `Momento: ${val('stage')}`, `Plazo: ${val('when')}`, `Presupuesto: ${val('budget')}`,
        f.model.value ? `Referencia: ${f.model.value}` : null, '',
        'El proyecto:', f.about.value.trim() || '—', '',
        `${name}${f.brand.value.trim() ? ' · ' + f.brand.value.trim() : ''}`,
        f.email.value.trim() || null, f.phone.value.trim() || null, '',
        `— Hoja de pedido de gometverdestudi.com${document.referrer ? ' · llegó desde ' + new URL(document.referrer).hostname : ''}`
      ].filter((x) => x !== null).join('\n');
      const subject = `Hoja de pedido — ${f.brand.value.trim() || name}`;
      const url = via === 'wa'
        ? `https://wa.me/${WA}?text=${encodeURIComponent(lines)}`
        : `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
      form.classList.add('stamped');
      note.innerHTML = via === 'wa'
        ? 'Se ha abierto WhatsApp con la hoja escrita: solo falta enviarla.'
        : `Se ha abierto tu correo con la hoja escrita: solo falta enviarla. ¿No se abrió nada? Escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
      if (via === 'wa') window.open(url, '_blank', 'noopener'); else location.href = url;
    });
  }

  /* ---------- 5. hoja de gomets ---------- */
  const layer = $('#stuck');
  const sheet = $('.sticker-sheet');
  if (sheet && layer) {
    const KEY = 'gve-stickers';
    const src = $$('.gomet', sheet);
    let placed = store.get(KEY, []);
    const save = () => store.set(KEY, placed);
    const center = () => document.documentElement.clientWidth / 2;
    const size = () => (innerWidth <= 640 ? 60 : 76);

    function make(i, rot) {
      const o = src[i];
      const el = o.cloneNode(true);
      el.removeAttribute('data-i'); el.dataset.k = i;
      el.style.setProperty('--rot', rot + 'deg');
      el.setAttribute('aria-label', 'Gomet pegado: arrástralo para moverlo');
      el.tabIndex = -1;
      return el;
    }
    function put(rec) {
      const el = make(rec.i, rec.rot);
      el.style.left = (center() + rec.x - size() / 2) + 'px';
      el.style.top = (rec.y - size() / 2) + 'px';
      layer.appendChild(el);
      src[rec.i].classList.add('gone');
      return el;
    }
    function render() { layer.innerHTML = ''; src.forEach((s) => s.classList.remove('gone')); placed.forEach(put); }
    render();
    addEventListener('resize', () => { clearTimeout(render.t); render.t = setTimeout(render, 200); });

    let drag = null;
    function start(e, i, fromEl) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const rec = placed.find((r) => r.i === i);
      const rot = rec ? rec.rot : Math.round(Math.random() * 30 - 15);
      placed = placed.filter((r) => r.i !== i);
      if (fromEl.parentElement === layer) fromEl.remove();
      src[i].classList.add('gone');
      const el = make(i, rot);
      el.classList.add('dragging');
      document.body.appendChild(el);
      drag = { el, i, rot, x0: e.clientX, y0: e.clientY, moved: false };
      move(e);
    }
    function move(e) {
      if (!drag) return;
      const s = size() * 1.12;
      drag.el.style.left = (e.clientX - s / 2) + 'px';
      drag.el.style.top = (e.clientY - s / 2) + 'px';
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    }
    function end(e) {
      if (!drag) return;
      const { el, i, rot, moved } = drag;
      drag = null;
      el.remove();
      let x = e.clientX, y = e.clientY;
      const r = sheet.getBoundingClientRect();
      const overSheet = x > r.left && x < r.right && y > r.top && y < r.bottom;
      if (!moved) { // un clic: se pega en un sitio al azar de la pantalla
        x = innerWidth * (.15 + Math.random() * .7); y = innerHeight * (.2 + Math.random() * .6);
      } else if (overSheet) { // vuelve a la hoja
        src[i].classList.remove('gone'); save(); return;
      }
      const rec = { i, rot, x: x + scrollX - center(), y: y + scrollY };
      placed.push(rec); save(); put(rec);
    }
    src.forEach((el) => {
      el.addEventListener('pointerdown', (e) => start(e, +el.dataset.i, el));
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const i = +el.dataset.i, rec = { i, rot: Math.round(Math.random() * 30 - 15), x: innerWidth * (Math.random() * .6 - .3), y: scrollY + innerHeight * (.25 + Math.random() * .5) };
        placed = placed.filter((r) => r.i !== i); placed.push(rec); save(); put(rec);
      });
    });
    layer.addEventListener('pointerdown', (e) => { const el = e.target.closest('.gomet'); if (el) start(e, +el.dataset.k, el); });
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
    const un = $('#unstick');
    if (un) un.addEventListener('click', () => { placed = []; save(); render(); });
  }

  /* ---------- 8. láminas del método ---------- */
  // En móvil, los dibujos anchos se recortan al edificio (la leyenda va debajo, en texto)
  const narrow = matchMedia('(max-width: 640px)');
  const fitViewBox = () => $$('svg[data-vb-narrow]').forEach((svg) => {
    if (!svg.dataset.vbWide) svg.dataset.vbWide = svg.getAttribute('viewBox');
    svg.setAttribute('viewBox', narrow.matches ? svg.dataset.vbNarrow : svg.dataset.vbWide);
  });
  fitViewBox();
  if (narrow.addEventListener) narrow.addEventListener('change', fitViewBox);
  // El edificio se monta de abajo arriba: una capa, su gomet de validación, la siguiente capa…
  const building = $('.plate-building');
  if (building) {
    const seq = [];
    const layers = $$('.ed-layer', building), vals = $$('.ed-val', building);
    layers.forEach((l, k) => { seq.push(l); if (vals[k]) seq.push(vals[k]); });
    const showAll = () => seq.forEach((el) => el.classList.add('on'));
    if (reduce || !('IntersectionObserver' in window)) showAll();
    else {
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        seq.forEach((el, k) => setTimeout(() => el.classList.add('on'), 250 + k * 280));
      }, { threshold: .35 });
      io.observe($('.edificio', building));
    }
  }

  /* ---------- 6. visor ---------- */
  const data = $('#lb-data');
  const lb = $('#lb');
  if (data && lb && lb.showModal) {
    const items = JSON.parse(data.textContent);
    const img = $('img', lb), cap = $('figcaption', lb);
    const name = ($('h1') || {}).textContent || '';
    let k = 0;
    const show = (n) => {
      k = (n + items.length) % items.length;
      const it = items[k];
      img.src = it.src; img.width = it.w; img.height = it.h;
      img.alt = `${name}, paso ${k + 1} de ${items.length}`;
      cap.textContent = `Paso ${k + 1} / ${items.length} · 手順${k + 1}`;
    };
    $$('.pstep-btn').forEach((b) => b.addEventListener('click', () => { show(+b.dataset.k); lb.showModal(); }));
    $('.lb-x', lb).addEventListener('click', () => lb.close());
    $('.lb-p', lb).addEventListener('click', () => show(k - 1));
    $('.lb-n', lb).addEventListener('click', () => show(k + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(k - 1); if (e.key === 'ArrowRight') show(k + 1); });
  }
})();
