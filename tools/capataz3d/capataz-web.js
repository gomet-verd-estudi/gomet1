/*
 * El capataz en la web: crea el muñeco 3D en un <canvas>, lo anima con el director y solo pinta cuando hace falta.
 * API para gve.js: set('walk' | 'idle' | 'talk'), advance(fase), face(±1 | 0), start(), stop().
 */
import { createCapataz } from './capataz3d.js';
import { director, walk as walkPose } from './capataz-anim.js';

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

window.GVECapataz3D = async function ({ canvas, base, line = 1.7, fine = 0.8, reduce = false }) {
  if (!webgl()) throw new Error('sin WebGL');
  const dpr = Math.min(1.5, window.devicePixelRatio || 1); // con este grosor de línea, más resolución no se nota
  const C = await createCapataz({
    canvas, url: base + (canvas.dataset.model || 'capataz.glb'), texture: base + 'color.png', relief: base + 'relieve.jpg', folds: base + 'pliegues.png',
    line, fine, fineThreshold: 2.0, background: null
  });
  C.renderer.setPixelRatio(dpr);
  const D = director({ faceYaw: 40 });
  const fit = () => {
    const r = canvas.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    C.resize(r.width, r.height); C.view({ zoom: 0.9, cy: -0.03 }); dirty = true;
  };
  let dirty = true, raf = 0, last = 0, running = false;
  // Entrada caminando: el muñeco avanza lo que retrocede el pie apoyado (sin patinar). ent = { x, end, done }
  let ent = null;
  const host = canvas.closest('.mascot') || canvas;
  const place = (x) => { host.style.transform = x ? `translateX(${x.toFixed(1)}px)` : ''; };
  const draw = (dt) => {
    const a = ent && ent.walking ? C.planted() : null;
    let dp = 0;
    if (ent && ent.walking) { dp = Math.min(dt / ent.cycle, ent.left); D.advance(dp); }
    C.pose(D.tick(dt));
    if (a) {
      const b = C.planted();
      if (b.i === a.i) ent.x -= (b.x - a.x) * C.pxPerUnit();
      ent.left -= dp;
      if (ent.left <= 0) { ent.walking = false; ent.settle = ent.x; ent.st = 0; ent.end(); }
    }
    if (ent && !ent.walking) { ent.st = Math.min(1, ent.st + dt / 0.5); ent.x = ent.settle * (1 - ent.st * ent.st * (3 - 2 * ent.st)); if (ent.st >= 1) { ent = null; } }
    if (ent) place(ent.x); else if (host.style.transform) place(0);
    C.render();
  };
  // largo de medio ciclo (un paso) en píxeles, de perfil: para empezar fuera de la pantalla y acabar justo en su sitio
  function stepPx(k) {
    let d = 0, prev = null; const q0 = D.tick(0);
    for (let i = 0; i <= 48; i++) {
      const q = walkPose(i / 48, k); q.yaw = 90; C.pose(q); const pl = C.planted();
      if (prev && pl.i === prev.i) d -= pl.x - prev.x; prev = pl;
    }
    C.pose(q0);
    return Math.max(1, d / 2 * C.pxPerUnit());
  }
  function frame(now) {
    raf = 0; if (!running) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 24;
    // como en animación: 24 fotogramas por segundo en movimiento y 12 en reposo (respira despacio)
    const calm = D.state === 'idle' && !D.busy();
    if (now - last >= (calm ? 1000 / 12 : 1000 / 24) - 2) { last = now; draw(dt); dirty = false; }
    raf = requestAnimationFrame(frame);
  }
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(canvas); else addEventListener('resize', fit);
  fit(); draw(0);
  const api = {
    set: (s) => { D.set(s); dirty = true; },
    advance: (d) => { D.advance(d); dirty = true; },
    face: (dir) => { D.face(dir); dirty = true; },
    start() { if (reduce || running) return; running = true; last = 0; if (!raf) raf = requestAnimationFrame(frame); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    // con movimiento reducido: una sola imagen por cambio de estado
    still(state = 'idle') { D.set(state); for (let i = 0; i < 30; i++) D.tick(1 / 30); draw(0); },
    // entra caminando de perfil desde `dist` píxeles a la izquierda, se gira hacia quien lee y saluda
    enter(dist) {
      return new Promise((resolve) => {
        const E = 1.4, step = stepPx(E), n = Math.max(2, Math.ceil(dist / step));
        D.yawTo(90, true); D.setEnergy(E); D.set('walk'); D.setPhase(0);
        ent = { x: -n * step, left: n * 0.5, cycle: 0.72, walking: true, end: () => {
          D.setEnergy(1);
          D.play('turn', { to: 12, then: 'idle', done: () => D.play('wave', { then: 'idle', done: resolve }) });
        } };
        place(ent.x); dirty = true; api.start();
      });
    },
    get entering() { return !!ent || D.state === 'turn' || D.state === 'wave'; }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.stop(); });
  return api;
};
