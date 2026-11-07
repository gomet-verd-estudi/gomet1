/*
 * Gomet Verd Estudi — interacción
 *  1. Menú en móvil
 *  2. La obra: el edificio se levanta capa a capa con el scroll; cada validación es un gomet verde
 *  3. Láminas: el edificio de la página Método se monta al verlo; la viga y la fachada aparecen
 *  4. Vídeos: se cargan y se reproducen (mudos) solo cuando se ven
 *  5. Visor de imágenes de cada obra
 *  6. Formulario: la ficha se envía escrita por correo o WhatsApp
 */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const EMAIL = 'gometverdestudi@gmail.com', WA = '34684450515';

  /* ---------- 1. menú ---------- */
  const menu = $('.hd-menu'), nav = $('#nav');
  if (menu && nav) menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* En pantallas estrechas los dibujos anchos se recortan al edificio */
  const fitViewBox = () => $$('svg[data-vb-narrow]').forEach((svg) => {
    if (!svg.dataset.vbWide) svg.dataset.vbWide = svg.getAttribute('viewBox');
    const narrow = innerWidth <= (svg.classList.contains('obra-svg') ? 900 : 640);
    svg.setAttribute('viewBox', narrow ? svg.dataset.vbNarrow : svg.dataset.vbWide);
  });
  fitViewBox();
  addEventListener('resize', fitViewBox);

  /* ---------- 2. la obra ---------- */
  const obra = $('.obra');
  if (obra) {
    const steps = $$('.step', obra);
    const svg = $('.obra-svg', obra);
    const stage = $('.obra-stage', obra);
    const ph = $$('.ph', svg).sort((a, b) => a.dataset.ph - b.dataset.ph); // fases 1–8
    const vals = $$('.v', svg).sort((a, b) => a.dataset.v - b.dataset.v); // validaciones 1–5
    const rail = $$('.rail-i', obra), railVals = $$('.rail-v', obra);
    const ACT = ['', 'e', 'e', 'd', 'd', 'c', 'c', 'c', 'm', 'm'];
    const DROP = [0, 40, 0, 140, 140, 140, 140, 140, 90]; // cuánto cae cada capa (unidades del dibujo)
    const ease = (t) => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }; // cae y rebota al encajar
    let cur = ph.map(() => 0), target = ph.map(() => 0), running = false, lastActive = -1;

    // La línea de lectura: a media pantalla en escritorio; bajo el dibujo fijo en móvil
    const readLine = () => {
      const sb = stage.getBoundingClientRect().bottom;
      return innerWidth <= 900 ? sb + (innerHeight - sb) * 0.35 : innerHeight * 0.55;
    };
    // Posición continua: 0 = portada, k = fase k, 9 = resultado
    const position = () => {
      const y = readLine();
      for (let i = 0; i < steps.length; i++) {
        const r = steps[i].getBoundingClientRect();
        if (y < r.top) return i === 0 ? 0 : i;
        if (y < r.bottom) return i + (y - r.top) / r.height;
      }
      return steps.length;
    };

    function paint() {
      ph.forEach((g, k) => {
        const e = ease(cur[k]);
        g.style.opacity = clamp(cur[k] * 2.2).toFixed(3);
        g.style.transform = DROP[k + 1] ? `translateY(${(-(1 - e) * DROP[k + 1]).toFixed(1)}px)` : '';
      });
    }
    function frame() {
      let moving = false;
      cur = cur.map((c, k) => {
        const d = target[k] - c;
        if (Math.abs(d) > 0.002) { moving = true; return c + d * 0.22; }
        return target[k];
      });
      paint();
      running = moving;
      if (moving) requestAnimationFrame(frame);
    }
    function update() {
      const s = reduce ? steps.length : position();
      target = ph.map((_, k) => clamp((s - (k + 1) + 0.15) / 0.5));
      vals.forEach((v, j) => v.classList.toggle('on', s >= j + 2 + 0.45));
      railVals.forEach((v) => v.classList.toggle('on', s >= +v.dataset.v + 1 + 0.45));
      const active = clamp(Math.floor(s), 0, steps.length - 1);
      if (active !== lastActive) {
        lastActive = active;
        steps.forEach((st, i) => st.classList.toggle('is-active', i === active));
        ph.forEach((g, k) => g.classList.toggle('now', k + 1 === active));
        svg.dataset.act = ACT[active] || '';
      }
      rail.forEach((li, k) => {
        li.classList.toggle('now', k + 1 === active);
        li.classList.toggle('done', s >= k + 1 + 0.45);
      });
      if (reduce) { cur = target.slice(); paint(); return; }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    obra.classList.add('is-live');
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();

    // El riel: saltar a una fase
    $$('[data-go]', obra).forEach((b) => b.addEventListener('click', () => {
      const st = steps[+b.dataset.go];
      const r = st.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top - readLine() + r.height * 0.4, behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  /* ---------- 3. láminas ---------- */
  const seen = (els, fn, threshold = 0.3) => {
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(fn); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), { threshold });
    els.forEach((el) => io.observe(el));
  };
  seen($$('.reveal'), (el) => el.classList.add('in'), 0.25);
  // El edificio de la página Método se monta de abajo arriba: capa, gomet, capa…
  seen($$('.plate-building'), (pl) => {
    const seq = [];
    const layers = $$('.ed-layer', pl), v = $$('.ed-val', pl);
    layers.forEach((l, k) => { seq.push(l); if (v[k]) seq.push(v[k]); });
    seq.forEach((el, k) => (reduce ? el.classList.add('on') : setTimeout(() => el.classList.add('on'), 200 + k * 260)));
  }, 0.35);

  /* ---------- 4. vídeos ---------- */
  function play(v) {
    if (reduce) return;
    if (v.dataset.src && !v.src) v.src = v.dataset.src;
    if (!v.dataset.loaded && v.querySelector('source')) v.load();
    v.dataset.loaded = '1';
    if (!v.dataset.watch) { // se enseña el vídeo solo cuando de verdad avanza
      v.dataset.watch = '1';
      v.addEventListener('timeupdate', () => { if (v.currentTime > .05) v.parentElement.classList.add('playing'); });
    }
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }
  const cardVideos = $$('.card video');
  if (fine) cardVideos.forEach((v) => {
    const a = v.closest('a');
    a.addEventListener('pointerenter', () => play(v));
    a.addEventListener('pointerleave', () => v.pause());
    a.addEventListener('focus', () => play(v));
    a.addEventListener('blur', () => v.pause());
  });
  const inView = [...(fine ? [] : cardVideos), ...$$('.g-video')];
  if ('IntersectionObserver' in window && inView.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play(e.target) : e.target.pause())), { threshold: .45 });
    inView.forEach((v) => io.observe(v));
  }

  /* ---------- 5. visor ---------- */
  const data = $('#lb-data'), lb = $('#lb');
  if (data && lb && lb.showModal) {
    const items = JSON.parse(data.textContent);
    const img = $('img', lb), cap = $('figcaption', lb);
    const name = ($('h1') || {}).textContent || '';
    let k = 0;
    const show = (n) => {
      k = (n + items.length) % items.length;
      const it = items[k];
      img.src = it.src; img.width = it.w; img.height = it.h;
      img.alt = `${name}, imagen ${k + 1} de ${items.length}`;
      cap.textContent = `${name} · ${k + 1} / ${items.length}`;
    };
    $$('.g-btn').forEach((b) => b.addEventListener('click', () => { show(+b.dataset.k); lb.showModal(); }));
    $('.lb-x', lb).addEventListener('click', () => lb.close());
    $('.lb-p', lb).addEventListener('click', () => show(k - 1));
    $('.lb-n', lb).addEventListener('click', () => show(k + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(k - 1); if (e.key === 'ArrowRight') show(k + 1); });
  }

  /* ---------- 6. formulario ---------- */
  const form = $('#order');
  if (form) {
    const note = $('#order-note');
    const params = new URLSearchParams(location.search);
    const pz = params.get('pieza');
    if (pz) $$('input[name="parts"]', form).forEach((x) => { if (x.value === pz) x.checked = true; });
    const ref = params.get('obra');
    if (ref) {
      const nice = ref.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      form.elements.ref.value = nice;
      note.textContent = `Obra de referencia: ${nice}. ` + note.textContent;
    }
    let via = 'email';
    $$('button[type="submit"]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      const name = f.name.value.trim();
      const nameField = f.name.closest('.field');
      if (!name) { nameField.classList.add('bad'); f.name.focus(); note.textContent = 'Falta vuestro nombre: es lo único imprescindible.'; return; }
      nameField.classList.remove('bad');
      const val = (k) => { const x = $(`input[name="${k}"]:checked`, form); return x ? x.value : '—'; };
      const parts = $$('input[name="parts"]:checked', form).map((x) => x.value).join(', ') || '—';
      const lines = [
        'Hola, Gomet Verd Estudi:', '',
        `Programa: ${parts}`, `Momento: ${val('stage')}`, `Plazo: ${val('when')}`, `Presupuesto: ${val('budget')}`,
        f.ref.value ? `Obra de referencia: ${f.ref.value}` : null, '',
        'El proyecto:', f.about.value.trim() || '—', '',
        `${name}${f.brand.value.trim() ? ' · ' + f.brand.value.trim() : ''}`,
        f.email.value.trim() || null, f.phone.value.trim() || null
      ].filter((x) => x !== null).join('\n');
      const subject = `Nuevo proyecto — ${f.brand.value.trim() || name}`;
      note.innerHTML = via === 'wa'
        ? 'Se ha abierto WhatsApp con la ficha escrita: solo falta enviarla.'
        : `Se ha abierto vuestro correo con la ficha escrita: solo falta enviarla. ¿No se abrió nada? Escribidnos a <b>${EMAIL}</b>.`;
      if (via === 'wa') window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');
      else location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    });
  }
})();
