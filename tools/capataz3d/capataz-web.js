/*
 * El capataz en la web: crea el muñeco 3D en un <canvas>, lo anima con el director y solo pinta cuando hace falta.
 * API para gve.js: set('walk' | 'idle' | 'talk'), advance(fase), face(±1 | 0), start(), stop().
 */
import { createCapataz } from './capataz3d.js';
import { director } from './capataz-anim.js';

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
  const draw = (dt) => { C.pose(D.tick(dt)); C.render(); };
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
    still(state = 'idle') { D.set(state); for (let i = 0; i < 30; i++) D.tick(1 / 30); draw(0); }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.stop(); });
  return api;
};
