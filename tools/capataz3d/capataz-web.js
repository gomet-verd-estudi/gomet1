/*
 * El capataz en la web: crea el muñeco 3D en un <canvas>, lo anima con el director y solo pinta cuando hace falta.
 * API para gve.js: set('idle' | 'talk', gesto), speak(sí/no), react('hop' | 'cheer'), haul(dy), face(±1 | 0),
 * start(), stop(), enter(dist), feet().
 */
import { createCapataz } from './capataz3d.js';
import { director, stride, setRig, ROPE_Z, ropePerPhase } from './capataz-anim.js';

const INK = '#0A9651';
// La polea cuelga de la línea de la cabecera; la cuerda baja por su lado izquierdo hasta las manos y el suelo,
// y el otro ramal sube hasta la cabecera: tirando de ella, él sube y baja la página.
const PULLEY = `<svg class="m-pulley" viewBox="-15 -30 34 42" aria-hidden="true"><g fill="none" stroke="${INK}" stroke-linecap="round">
<path d="M0 -30V0" stroke-width="1.8"/>
<g class="m-wheel"><circle r="9" fill="#F4EFE6" stroke-width="2.4"/><path d="M0 -8.6V8.6M-7.4 -4.3L7.4 4.3M-7.4 4.3L7.4 -4.3" stroke-width="1.5"/><circle r="2.2" fill="${INK}" stroke="none"/></g>
<path d="M-9 0A9 9 0 0 1 9 0V-30" style="stroke-width:var(--rw)"/></g></svg>`;

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

// El modelo puede venir como .glb (lo normal) o, donde no se sirven .glb ni se puede usar fetch con data:, como un
// script que deja el .glb en base64 en window.CAPATAZ_GLB (data-model="js:archivo.js")
function modelSource(base, spec) {
  if (!spec || !spec.startsWith('js:')) return Promise.resolve({ url: base + (spec || 'capataz.glb') });
  return new Promise((ok, ko) => {
    const s = document.createElement('script'); s.src = base + spec.slice(3);
    s.onload = () => { const b = atob(window.CAPATAZ_GLB || ''); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); window.CAPATAZ_GLB = null; ok({ gltfBuffer: u.buffer }); };
    s.onerror = ko; document.head.appendChild(s);
  });
}

window.GVECapataz3D = async function ({ canvas, base, line = 1.7, fine = 0.8, reduce = false }) {
  if (!webgl()) throw new Error('sin WebGL');
  // Trazo suavizado: se dibuja al doble y se reduce (ss = 2), y el lienzo va a la densidad de la pantalla hasta 1,75x
  // (más no se distingue a este tamaño y cuesta el doble). Sin mapa de relieve: solo las líneas del modelo y los
  // pliegues dibujados, sin el ruido de motas que daba el relieve.
  const dpr = Math.max(1, Math.min(1.75, window.devicePixelRatio || 1));
  const C = await createCapataz({
    canvas, ...(await modelSource(base, canvas.dataset.model)), texture: base + 'color.png', textureBlink: base + 'color-parpadeo.png', textureTalk: base + 'color-habla.png', relief: base + 'plano.png', folds: base + 'pliegues.png',
    line, fine, fineThreshold: 2.0, background: null, ss: 2, reliefScale: 0
  });
  C.renderer.setPixelRatio(dpr);
  setRig(C.rig); // los pasos se planean con las medidas reales de las piernas
  const D = director({ faceYaw: 40, fidget: !reduce });   // con movimiento reducido, sin gestos sueltos
  const fit = () => {
    const r = canvas.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    // el trazo se mide para el muñeco de escritorio (238 px de alto) y escala con él: en móvil no engorda
    C.setLineScale(Math.max(.55, Math.min(1.15, r.height / 238)));
    C.resize(r.width, r.height); C.view({ zoom: 0.9, cy: -0.03 }); dirty = true;
    // distancia del muñeco a la línea de la cabecera (el envoltorio es pegajoso: no cambia con el scroll)
    offTop = wrap ? host.offsetTop : r.top;
  };
  let dirty = true, raf = 0, last = 0, running = false, slow = 16;
  // Entrada caminando: el cuerpo avanza exactamente lo que el paso planea (los pies apoyados quedan quietos en la página)
  let ent = null;
  const host = canvas.closest('.mascot') || canvas;
  const place = (x) => { host.style.transform = x ? `translateX(${x.toFixed(1)}px)` : ''; };
  // ---- la cuerda (dibujo en la página, detrás del lienzo: las manos quedan por delante) ----
  const wrap = canvas.closest('.mascot-wrap');
  const ropeEl = document.createElement('div'); ropeEl.className = 'm-rope'; ropeEl.setAttribute('aria-hidden', 'true');
  ropeEl.innerHTML = '<i class="m-rope-line"></i>' + PULLEY; host.prepend(ropeEl);
  const ropeLine = ropeEl.firstChild, pulley = ropeEl.lastChild, wheel = pulley.querySelector('.m-wheel');
  const HAUL_YAW = -90; // de perfil, mirando hacia la página
  let rope = 0, ropeTarget = 0, units = 0, offTop = 0, lastHaul = 0;
  const ease = (t) => t * t * (3 - 2 * t);
  function drawRope(dt) {
    rope = ropeTarget > rope ? Math.min(ropeTarget, rope + dt / 0.3) : Math.max(ropeTarget, rope - dt / 0.35);
    if (rope <= 0) { if (ropeEl.classList.contains('on')) ropeEl.classList.remove('on'); return; }
    if (!ropeEl.classList.contains('on')) ropeEl.classList.add('on');
    const ppu = C.pxPerUnit(), sx = Math.sin(HAUL_YAW * Math.PI / 180) * ROPE_Z, sz = Math.cos(HAUL_YAW * Math.PI / 180) * ROPE_Z;
    const [x, ground] = C.projectWorld(sx, 0, sz);
    const rw = Math.max(2.4, Math.min(5, ppu * 0.022)), R = rw * 3, k = R / 9;   // grosor de la cuerda y radio de la polea
    const top = -offTop + 30 * k, full = Math.max(0, ground - top), h = full * ease(rope);
    ropeEl.style.setProperty('--rw', (rw / k).toFixed(2));
    ropeLine.style.cssText = `width:${rw.toFixed(2)}px;height:${h.toFixed(1)}px;transform:translate(${(x - rw / 2).toFixed(1)}px,${top.toFixed(1)}px);background-position:0 ${(units * ppu).toFixed(1)}px`;
    pulley.style.cssText = `width:${(34 * k).toFixed(1)}px;height:${(42 * k).toFixed(1)}px;transform:translate(${(x - 6 * k).toFixed(1)}px,${(top - 30 * k).toFixed(1)}px);opacity:${Math.min(1, rope * 2.5).toFixed(2)}`;
    wheel.style.transform = `rotate(${(units * ppu / R * 180 / Math.PI).toFixed(1)}deg)`;
  }
  // parpadeo: cada 2,5–5,5 s, 0,13 s con los ojos cerrados; a veces dos seguidos
  let blinkAt = 2 + Math.random() * 2, clock = 0, shut = false;
  const blinkTick = (dt) => {
    clock += dt;
    const want = clock >= blinkAt && clock < blinkAt + 0.13;
    if (clock >= blinkAt + 0.13) { blinkAt = clock + (Math.random() < 0.18 ? 0.22 : 2.5 + Math.random() * 3); }
    shut = want;
  };
  // la cara: parpadea y, mientras habla, mueve la boca a golpes irregulares (unas seis sílabas por segundo)
  let speaking = false, faceNow = 'open';
  const faceTick = () => {
    const f = shut ? 'blink' : speaking && Math.sin(clock * 20) + Math.sin(clock * 33.7 + 1) > 0.15 ? 'talk' : 'open';
    if (f !== faceNow) { faceNow = f; C.face(f); }
  };
  // la mirada sigue al cursor (solo ratón); si el cursor se queda quieto unos segundos, vuelve a mirar a quien lee
  let lookAt = 0, lookEv = null;
  if (!reduce) addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') lookEv = e; }, { passive: true });
  const lookTick = () => {
    if (lookEv) {
      const r = canvas.getBoundingClientRect(), hx = r.left + r.width * 0.5, hy = r.top + r.height * 0.24;
      D.look(Math.max(-42, Math.min(42, (lookEv.clientX - hx) / 13)), Math.max(-14, Math.min(20, (hy - lookEv.clientY) / 15)));
      lookEv = null; lookAt = performance.now();
    } else if (lookAt && performance.now() - lookAt > 3500) { D.look(0, 0); lookAt = 0; }
  };
  let pending = null;   // una pieza pedida mientras hacía otra cosa (p. ej. celebrar al acabar de girarse)
  const draw = (dt) => {
    blinkTick(dt); faceTick(); lookTick();
    if (pending && !ent && (D.state === 'idle' || D.state === 'talk')) { D.play(pending, { then: D.state }); pending = null; }
    // el último paso frena (como al llegar a un sitio); el cuerpo avanza lo mismo que la fase, así que los pies no patinan
    if (ent && ent.walking) {
      const dp = Math.min(dt / ent.cycle * (0.45 + 0.55 * ease(Math.min(1, ent.left / 0.6))), ent.left);
      D.advance(dp); ent.x += dp * stride(ent.k) * C.pxPerUnit(); ent.left -= dp;
      if (ent.left <= 1e-6) { ent.walking = false; ent.settle = ent.x; ent.st = 0; ent.end(); }
    }
    C.pose(D.tick(dt));
    if (ent && !ent.walking) { ent.st = Math.min(1, ent.st + dt / 0.5); ent.x = ent.settle * (1 - ent.st * ent.st * (3 - 2 * ent.st)); if (ent.st >= 1) { ent = null; } }
    if (ent) place(ent.x); else if (host.style.transform) place(0);
    if (rope > 0 || ropeTarget > 0) drawRope(dt);
    C.render();
  };
  // largo de un paso en píxeles: para empezar fuera de la pantalla y acabar justo en su sitio
  const stepPx = (k) => Math.max(1, stride(k) / 2 * C.pxPerUnit());
  function frame(now) {
    raf = 0; if (!running) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    // en movimiento, cada fotograma de la pantalla (fluido); en reposo, 30 por segundo (respira despacio)
    const calm = D.state === 'idle' && !D.busy() && !shut && clock + 0.1 < blinkAt && !ent && rope <= 0 && !speaking && !lookEv;
    if (!calm || now - last >= 1000 / 30 - 2) {
      // si en movimiento no llega a ~30 fotogramas por segundo, baja el suavizado (una vez por escalón)
      if (!calm && last) { slow = slow * 0.92 + (now - last) * 0.08; if (slow > 34 && C.quality() > 1) { C.quality(C.quality() > 1.5 ? 1.5 : 1); slow = 16; } }
      last = now; draw(dt); dirty = false;
    }
    raf = requestAnimationFrame(frame);
  }
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(canvas); else addEventListener('resize', fit);
  fit(); draw(0);
  const api = {
    // al soltar la cuerda se vuelve hacia quien lee como una persona (cabeza, torso, cadera y dos pasitos)
    set: (s, v) => {
      if (s !== 'haul') ropeTarget = 0;
      if (v !== undefined) D.variant(v);
      if (D.state === 'haul' && s !== 'haul') D.play('turn', { to: 12, then: s }); else D.set(s, v);
      dirty = true;
    },
    // mueve la boca mientras se escribe su frase
    speak(on) { speaking = !!on; dirty = true; },
    // una pieza suelta: 'hop' (saltito con el pulgar, al tocarlo) o 'cheer' (celebrar); si está ocupado, la hace al acabar
    react(name) {
      if (reduce || ent) return false;
      if (D.state === 'idle' || D.state === 'talk') D.play(name, { then: D.state }); else if (D.state !== 'haul' && D.state !== 'walk') pending = name; else return false;
      dirty = true; api.start(); return true;
    },
    advance: (d) => { D.advance(d); dirty = true; },
    face: (dir) => { if (D.state !== 'haul' && D.state !== 'turn') D.face(dir); dirty = true; },
    // Scroll = tirar de la cuerda. dy > 0 (bajar la página): recoge cuerda mano sobre mano; dy < 0: la deja correr.
    // Un ciclo (dos tirones) cada ~300 px de scroll, y nunca más de 1,6 ciclos por segundo.
    haul(dy) {
      if (D.state !== 'haul') { D.set('haul'); D.yawTo(HAUL_YAW); }
      ropeTarget = 1;
      const now = performance.now(), cap = 1.6 * Math.min(0.1, lastHaul ? (now - lastHaul) / 1000 : 1 / 60); lastHaul = now;
      const d = Math.max(-cap, Math.min(cap, dy / 300));
      D.advance(d); units += d * ropePerPhase; dirty = true; api.start();
    },
    start() { if (running) return; running = true; last = 0; if (!raf) raf = requestAnimationFrame(frame); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    // con movimiento reducido: una sola imagen por cambio de estado
    still(state = 'idle') { D.set(state); for (let i = 0; i < 30; i++) D.tick(1 / 30); draw(0); },
    // entra caminando de perfil desde `dist` píxeles a la izquierda, se gira hacia quien lee y saluda tocándose el casco
    enter(dist) {
      return new Promise((resolve) => {
        const E = 1.1, step = stepPx(E), n = Math.max(2, Math.ceil(dist / step));
        D.yawTo(90, true); D.setEnergy(E); D.set('walk'); D.setPhase(0);
        ent = { x: -n * step, k: E, left: n * 0.5, cycle: 0.8, walking: true, end: () => {
          D.setEnergy(1);
          D.play('turn', { to: 12, then: 'idle', done: () => D.play('greet', { then: 'idle', done: resolve }) });
        } };
        place(ent.x); dirty = true; api.start();
      });
    },
    // de la base del lienzo a las suelas (px): para apoyarlo sobre una línea de la página
    feet: () => canvas.getBoundingClientRect().height - C.projectWorld(0, C.floor, 0)[1],
    get entering() { return !!ent || D.state === 'turn' || D.state === 'greet'; }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.stop(); });
  return api;
};
