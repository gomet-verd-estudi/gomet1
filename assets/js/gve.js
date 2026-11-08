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

  /* ---------- 2. la obra a pantalla completa: el scroll dentro de la sección construye el edificio ---------- */
  const obra = $('.obra');
  if (obra) {
    const panels = $$('.op', obra);
    const rail = $$('.rail-i', obra), railVals = $$('.rail-v', obra);
    const N = panels.length; // portada + 8 fases + resultado
    let cur = Array(9).fill(0), target = Array(9).fill(0), running = false, lastActive = -1, act = 0;
    // Cada fase ocupa una pantalla. Su avance es lo que ha subido su lámina: 0 al asomar por abajo,
    // 1 al encajar bajo la cabecera, que es justo donde se para el scroll.
    const hd = $('.hd');
    const pr = Array(N).fill(0);
    const measure = () => {
      const top = hd ? hd.getBoundingClientRect().bottom : 0, H = innerHeight - top;
      for (let i = 0; i < N; i++) pr[i] = clamp(1 - (panels[i].getBoundingClientRect().top - top) / H);
    };
    // el scroll se detiene en cada fase solo mientras se recorre la obra
    const snap = () => { const r = obra.getBoundingClientRect(); document.documentElement.classList.toggle('snap', r.top <= (hd ? hd.offsetHeight : 0) + 2 && r.bottom >= innerHeight - 2); };
    const send = () => { if (window.GVE_OBRA) window.GVE_OBRA.set(cur, act); };
    let lastT = 0;
    function frame(now) {
      const dt = lastT ? Math.min(50, now - lastT) : 16; lastT = now;
      const maxStep = dt / 1100; // una fase entera, como mínimo en 1,1 s
      let moving = false;
      cur = cur.map((c, k) => {
        const d = target[k] - c;
        if (Math.abs(d) > 0.001) { moving = true; return c + clamp(d * 0.14, -maxStep, maxStep); }
        return target[k];
      });
      send();
      running = moving;
      if (moving) requestAnimationFrame(frame); else lastT = 0;
    }
    function update() {
      measure(); snap();
      let s = 0;
      for (let k = 1; k <= 8; k++) target[k] = clamp(pr[k] * 1.04);
      for (let i = 1; i < N; i++) s += pr[i];
      railVals.forEach((v) => v.classList.toggle('on', pr[+v.dataset.v + 1] >= 0.97));
      const active = clamp(Math.round(s), 0, N - 1);
      act = active >= 1 && active <= 8 ? active : 0;
      if (active !== lastActive) {
        lastActive = active;
        panels.forEach((p, i) => p.classList.toggle('on', i === active));
        obra.dataset.p = active;
      }
      rail.forEach((li, k) => {
        li.classList.toggle('now', k + 1 === active);
        li.classList.toggle('done', pr[k + 1] >= 0.97);
      });
      if (reduce) { cur = target.slice(); send(); return; }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    // El capataz. Su movimiento va pegado al scroll: cada 170 px de página, un ciclo mano sobre mano
    // (una mano agarra y baja tirando mientras la otra suelta, sube y vuelve a agarrar más arriba).
    // Los brazos se resuelven con cinemática inversa de dos huesos; el cuerpo se echa atrás según la
    // velocidad, la cabeza le sigue con retraso, el tenugui se balancea y suda si se tira deprisa.
    // Al parar, habla en su bocadillo con el dato concreto de la lámina.
    const mascot = $('.mascot', obra), bubble = $('.m-bubble', obra), mwrap = $('.mascot-wrap', obra);
    const K = mascot && $('.k-svg', mascot);
    let say = () => {}, haul = () => {};
    if (K) {
      const q = (c) => K.querySelector(c);
      const armF = [q('.k-armF-o'), q('.k-armF-i')], armB = [q('.k-armB-o'), q('.k-armB-i')];
      const gloveF = q('.k-gloveF'), gloveB = q('.k-gloveB'), torso = q('.k-torso'), head = q('.k-head'), tail = q('.k-tail'), ends = q('.k-towel-ends');
      const rope = q('.k-rope'), sweat = q('.k-sweat'), speed = q('.k-speed'), ropeEl = $('.m-rope', obra), pulley = $('.m-pulley', obra);
      const HIP = [84, 141], NECK = [71, 97], SF0 = [62, 104], SB0 = [84, 102], ROPE = 116, L1 = 32, L2 = 35, TOP = 72, BOT = 114;
      const rot = (p, c, a) => { const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };
      const f = (p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      const ik = (S, T) => { // codo hacia abajo
        let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy); const max = L1 + L2 - 0.6;
        if (d > max) { T = [S[0] + dx / d * max, S[1] + dy / d * max]; dx = T[0] - S[0]; dy = T[1] - S[1]; d = max; }
        const a = Math.atan2(dy, dx), b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
        return [[S[0] + L1 * Math.cos(a + b), S[1] + L1 * Math.sin(a + b)], T];
      };
      const hand = (ph) => { // 0–0.56: agarrada, baja tirando; 0.56–1: suelta, sube rápida y se adelanta
        if (ph < 0.56) { const t = ph / 0.56; return { y: TOP + (BOT - TOP) * t, x: ROPE }; }
        const t = (ph - 0.56) / 0.44, e = t * t * (3 - 2 * t);
        return { y: BOT - (BOT - TOP) * e, x: ROPE - 9 * Math.sin(Math.PI * t) };
      };
      let phase = 0.2, vel = 0, lean = 0, look = 0, sway = 0, lastY = scrollY, lastT = performance.now(), looping = false, idleT = 0, sayT = 0, still = 0;
      const pose = (now) => {
        const a = -(0.035 + lean) + Math.sin(phase * Math.PI * 4) * 0.012 * Math.min(1, Math.abs(vel) * 2) + Math.sin(now / 900) * 0.006 * (1 - Math.min(1, Math.abs(vel) * 3));
        torso.setAttribute('transform', `rotate(${(a * 57.3).toFixed(2)} ${f(HIP)})`);
        const N = rot(NECK, HIP, a);
        head.setAttribute('transform', `translate(${(N[0] - NECK[0]).toFixed(2)} ${(N[1] - NECK[1]).toFixed(2)}) rotate(${(look * 57.3).toFixed(2)} ${f(NECK)})`);
        ends.setAttribute('transform', `rotate(${(sway * 57.3).toFixed(2)} 87 101)`);
        const SF = rot(SF0, HIP, a), SB = rot(SB0, HIP, a);
        const hF = hand(((phase % 1) + 1) % 1), hB = hand((((phase + 0.5) % 1) + 1) % 1);
        const [EF, TF] = ik(SF, [hF.x, hF.y]), [EB, TB] = ik(SB, [hB.x, hB.y]);
        const dF = `M${f(SF)} L${f(EF)} L${f(TF)}`, dB = `M${f(SB)} L${f(EB)} L${f(TB)}`;
        armF.forEach((p) => p.setAttribute('d', dF)); armB.forEach((p) => p.setAttribute('d', dB));
        const ang = (E, T) => Math.atan2(T[1] - E[1], T[0] - E[0]) * 57.3;
        gloveF.setAttribute('transform', `translate(${f(TF)}) rotate(${ang(EF, TF).toFixed(1)}) scale(1.32)`);
        gloveB.setAttribute('transform', `translate(${f(TB)}) rotate(${ang(EB, TB).toFixed(1)}) scale(1.32)`);
        const low = Math.max(hF.x === ROPE ? hF.y : 0, hB.x === ROPE ? hB.y : 0, TOP);
        tail.setAttribute('d', `M${ROPE} ${low.toFixed(1)} C${ROPE} ${(low + 44).toFixed(1)} ${ROPE + 2} 188 136 196`);
        // cada valor va solo al elemento que lo usa: nada de recalcular los estilos de todo el muñeco
        sweat.setAttribute('opacity', Math.min(1, Math.max(0, Math.abs(vel) * 2.2 - 0.6)).toFixed(2));
        speed.setAttribute('opacity', Math.min(1, Math.max(0, Math.abs(vel) * 3 - 0.25)).toFixed(2));
      };
      const loop = (now) => {
        const dt = Math.min(50, now - lastT); lastT = now;
        const y = scrollY, dy = y - lastY; lastY = y;
        const v = clamp(dy / Math.max(8, dt) / 2.2, -1, 1); // velocidad normalizada
        vel += (v - vel) * 0.18;
        if (!reduce) phase += dy / 170;
        lean += ((vel > 0 ? vel * 0.16 : vel * 0.06) - lean) * 0.12;
        look += ((-vel * 0.08 + (vel ? 0 : Math.sin(now / 1600) * 0.03)) - look) * 0.08;
        sway += ((-vel * 0.5) - sway) * 0.1;
        pose(now);
        if (Math.abs(dy) > 0.2) still = 0; else still += dt;
        if (still < 900) requestAnimationFrame(loop); else looping = false;
      };
      haul = () => {
        const y = scrollY, o = (y * 0.25).toFixed(1);
        ropeEl.style.backgroundPositionY = (-y * 0.9).toFixed(1) + 'px';
        pulley.style.transform = `rotate(${(y * 0.6).toFixed(1)}deg)`;
        rope.setAttribute('stroke-dashoffset', o); tail.setAttribute('stroke-dashoffset', o);
        bubble.classList.remove('say'); mascot.classList.remove('talking');
        if (!looping) { looping = true; lastT = performance.now(); requestAnimationFrame(loop); }
        clearTimeout(idleT); idleT = setTimeout(say, 380);
      };
      say = () => {
        const i = Math.max(0, lastActive), t = panels[i] && panels[i].dataset.tip;
        if (!t || !html.classList.contains('snap')) return;
        bubble.textContent = t;
        bubble.classList.remove('say'); void bubble.offsetWidth; bubble.classList.add('say');
        mascot.classList.remove('talking', 'hop'); void mascot.offsetWidth; mascot.classList.add('talking', 'hop');
        clearTimeout(sayT); sayT = setTimeout(() => { bubble.classList.remove('say'); mascot.classList.remove('talking'); }, 7000);
      };
      pose(performance.now());
    }
    obra.classList.add('is-live');
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); haul(); }); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('load', () => { update(); send(); setTimeout(() => say(), 1500); });
    update();
    // Saltar a una fase desde el riel (y desde los enlaces #fase-0X)
    const html = document.documentElement;
    const hdH = () => (hd ? hd.offsetHeight : 0);
    const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let gliding = false;
    // Deslizamiento lento hasta una lámina: 1,4 s con aceleración y frenada suaves, para ver la fase entera
    const glide = (to, ms = 1400) => {
      gliding = true; html.classList.add('gliding');
      const from = scrollY, t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        scrollTo(0, from + (to - from) * easeIO(t));
        if (t < 1) requestAnimationFrame(step); else { gliding = false; html.classList.remove('gliding'); }
      };
      requestAnimationFrame(step);
    };
    const topOf = (k) => scrollY + panels[k].getBoundingClientRect().top - hdH();
    const go = (k) => (reduce ? scrollTo(0, topOf(k)) : glide(topOf(k)));
    if (fine && !reduce) {
      // lámina en curso: la última cuyo borde de arriba ya ha llegado a la cabecera
      const current = () => { let c = 0; panels.forEach((p, i) => { if (p.getBoundingClientRect().top <= hdH() + 4) c = i; }); return c; };
      let lastWheel = 0;
      addEventListener('wheel', (e) => {
        if (!html.classList.contains('snap') && !gliding) return; // fuera de la obra, scroll normal
        const now = performance.now(), fresh = now - lastWheel > 170; lastWheel = now;
        if (gliding) { e.preventDefault(); return; }
        const dir = Math.sign(e.deltaY);
        if (!dir) return;
        const i = current(), r = panels[i].getBoundingClientRect(), page = (innerHeight - hdH()) * 0.85;
        if (dir < 0 && i === 0 && r.top >= hdH() - 4) return; // por arriba, scroll normal
        e.preventDefault();
        if (!fresh) return; // la inercia del gesto anterior no cuenta como un gesto nuevo
        if (dir > 0) {
          if (r.bottom > innerHeight + 6) return glide(scrollY + Math.min(r.bottom - innerHeight, page), 900); // lámina más alta que la pantalla: se lee a tramos
          if (i < N - 1) return glide(topOf(i + 1));
          const next = $('#piezas');
          if (next) glide(scrollY + next.getBoundingClientRect().top - hdH(), 1100);
        } else {
          if (r.top < hdH() - 6) return glide(scrollY - Math.min(hdH() - r.top, page), 900);
          glide(topOf(i - 1));
        }
      }, { passive: false });
    }
    $$('[data-go]', obra).forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)));
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
