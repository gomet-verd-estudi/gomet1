/*
 * El capataz: animaciones.
 * Ángulos en grados sobre la pose de reposo, en ejes del personaje; en cada hueso se aplica primero z (abrir o
 * cerrar), luego y (girar sobre sí mismo) y al final x (balancear: adelante −, atrás +).
 * Límites medidos en la malla para que no se rompa ni se atraviese:
 *  - brazos: como mucho 48° bajo la horizontal (más abajo, el puño se mete en el pantalón, que es muy ancho);
 *  - piernas: el modelo tiene las botas abiertas casi 70°; para que miren al frente se gira la pierna entera desde
 *    la cadera (42°) y el tobillo solo el resto (22°): así la bota no se retuerce.
 */
const TAU = Math.PI * 2;
const S = (x) => Math.sin(x * TAU), C = (x) => Math.cos(x * TAU);
const pos = (x) => Math.max(0, x);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const win = (t, a, b) => clamp((t - a) / (b - a));
const bump = (t, a, b) => { const u = win(t, a, b); return Math.sin(Math.PI * u); };

// de pie, con los pies al frente, las piernas algo cerradas y los brazos bajados en A con el codo suelto
export const BASE = {
  LeftUpLeg: { z: -12, y: -42 }, RightUpLeg: { z: 12, y: 42 },
  LeftLeg: { z: 4 }, RightLeg: { z: -4 },
  LeftFoot: { y: -22 }, RightFoot: { y: 22 },
  // el modelo no tiene los brazos simétricos en reposo (+8° y −22°): ambos quedan a 48° bajo la horizontal
  LeftArm: { z: -56, x: -4 }, RightArm: { z: 26, x: -4 },
  LeftForeArm: { x: -14 }, RightForeArm: { x: -14 },
  Spine: { x: 2 }, Head: { x: -3 }
};

function add(base, extra) {
  const o = {};
  for (const k of new Set([...Object.keys(base), ...Object.keys(extra)])) {
    const a = base[k], b = extra[k];
    if (typeof a === 'number' || typeof b === 'number') { o[k] = (a || 0) + (b || 0); continue; }
    o[k] = { x: (a?.x || 0) + (b?.x || 0), y: (a?.y || 0) + (b?.y || 0), z: (a?.z || 0) + (b?.z || 0) };
  }
  return o;
}
export function mix(a, b, k) {
  const o = {};
  for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[n], y = b[n];
    if (typeof x === 'number' || typeof y === 'number') { o[n] = (x || 0) + ((y || 0) - (x || 0)) * k; continue; }
    o[n] = { x: (x?.x || 0) + ((y?.x || 0) - (x?.x || 0)) * k, y: (x?.y || 0) + ((y?.y || 0) - (x?.y || 0)) * k, z: (x?.z || 0) + ((y?.z || 0) - (x?.z || 0)) * k };
  }
  return o;
}

/* Caminar: p ∈ [0, 1) es la fase del ciclo de dos pasos.
   Contacto (p = 0 y 0.5), recepción, paso e impulso; brazos en oposición; cadera que gira y se inclina; columna
   que contrarresta; antebrazos y cabeza con retraso (follow-through); aplastamiento al recibir el peso. */
export function walk(p, k = 1) {
  // k: energía del paso (1 normal; más, zancada más larga y brazos más sueltos, como al llegar con prisa)
  const A = 24 * k, K = 42 * Math.min(k, 1.2), B = 24 * k;
  const hipL = -A * S(p), hipR = A * S(p);
  const kneeL = K * Math.pow(pos(C(p)), 1.4) + 6 * pos(-C(p)), kneeR = K * Math.pow(pos(-C(p)), 1.4) + 6 * pos(C(p));
  // el pie acompaña: talón al contactar, punta al despegar
  const footL = -(hipL + kneeL) * 0.75 + 12 * pos(S(p + 0.15)), footR = -(hipR + kneeR) * 0.75 + 12 * pos(-S(p + 0.15));
  const land = Math.pow(pos(Math.abs(S(p + 0.04)) - 0.6) / 0.4, 2);
  return add(BASE, {
    Hips: { y: 7 * S(p), z: 2.5 * C(p * 2 + 0.1), x: 3 + 3 * (k - 1) },
    Spine: { y: -5 * S(p), x: 2 }, Spine2: { y: -3 * S(p - 0.05) },
    Head: { y: 4 * S(p - 0.12), x: 2.5 * C(p * 2 - 0.2) },
    LeftUpLeg: { x: hipL }, RightUpLeg: { x: hipR },
    LeftLeg: { x: kneeL }, RightLeg: { x: kneeR },
    LeftFoot: { x: footL }, RightFoot: { x: footR },
    LeftArm: { x: B * S(p - 0.04) }, RightArm: { x: -B * S(p - 0.04) },
    LeftForeArm: { x: -6 - 16 * pos(-S(p - 0.12)) }, RightForeArm: { x: -6 - 16 * pos(S(p - 0.12)) },
    squash: 0.035 * land
  });
}

// Reposo: respira, cambia el peso de pierna y mira alrededor despacio
export function idle(t) {
  const br = S(t / 3.4), sh = S(t / 7.3), lk = S(t / 9.1 + 0.2);
  return add(BASE, {
    Hips: { z: 1.8 * sh }, LeftUpLeg: { z: -1.5 * sh }, RightUpLeg: { z: -1.5 * sh },
    Spine2: { x: 1.6 * br }, Neck: { x: -0.8 * br },
    Head: { y: 9 * lk, x: 1.5 * S(t / 4.7) },
    LeftArm: { z: 2.2 * br }, RightArm: { z: -2.2 * br },
    LeftForeArm: { x: -3 * S(t / 3.4 - 0.15) }, RightForeArm: { x: -3 * S(t / 3.4 - 0.2) },
    squash: 0.006 * br
  });
}

// Habla: pulgar arriba hacia el bocadillo, al ritmo de la frase, con la cabeza que asiente y el cuerpo que rebota
export function talk(t) {
  const beat = S(t * 1.6), nod = S(t * 1.6 - 0.12), bounce = pos(S(t * 1.6));
  return add(BASE, {
    RightArm: { z: -48, x: -28 + 4 * beat }, RightForeArm: { x: -24 - 10 * pos(nod), z: -8 },
    LeftArm: { z: 2, x: 3 }, LeftForeArm: { x: -6 },
    Spine: { x: -2 + 1.5 * beat, z: 2 }, Spine2: { y: 5 },
    Head: { x: -4 + 4 * nod, y: 6, z: -3 },
    LeftLeg: { x: 5 * bounce }, RightLeg: { x: 5 * bounce }, LeftUpLeg: { x: -2.5 * bounce }, RightUpLeg: { x: -2.5 * bounce },
    squash: 0.02 * bounce
  });
}

/* Girarse hacia quien mira, como una persona: primero la cabeza, luego el torso y al final la cadera, recolocando
   los pies con dos pasitos; antes, una pequeña anticipación (se agacha un poco) y al final se pasa y vuelve. */
export const TURN = 1.1;
export function turn(t, from, to) {
  const d = to - from;
  const head = from + d * eio(win(t, 0.0, 0.5)), chest = from + d * eio(win(t, 0.12, 0.7)), hips = from + d * eio(win(t, 0.25, 0.95));
  const settle = 1 + 0.06 * Math.sin(Math.PI * win(t, 0.8, 1.1)) * (1 - win(t, 0.95, 1.1)); // se pasa un poco y vuelve
  const stepL = bump(t, 0.32, 0.6), stepR = bump(t, 0.58, 0.88);
  const q = add(BASE, {
    Spine: { y: (chest - hips) * 0.6 }, Spine2: { y: (chest - hips) * 0.4 },
    Head: { y: head - chest, x: -2 },
    LeftUpLeg: { x: -12 * stepL }, LeftLeg: { x: 26 * stepL }, LeftFoot: { x: -10 * stepL },
    RightUpLeg: { x: -12 * stepR }, RightLeg: { x: 26 * stepR }, RightFoot: { x: -10 * stepR },
    LeftArm: { x: 6 * bump(t, 0.2, 0.9) }, RightArm: { x: -6 * bump(t, 0.2, 0.9) },
    squash: 0.03 * bump(t, 0, 0.25) - 0.015 * bump(t, 0.25, 0.5)
  });
  q.yaw = from + d * eio(win(t, 0.25, 0.95)) * settle;
  return q;
}

/* Saludar: levanta el brazo con anticipación (primero baja un poco), agita la mano tres veces con el antebrazo de lado a lado (el codo
   quieto, la muñeca suelta), ladea la cabeza y se balancea; luego lo baja. */
export const WAVE = 2.0;
export function wave(t) {
  const up = eio(win(t, 0.05, 0.45)) * (1 - eio(win(t, 1.65, 2.0)));
  const shake = Math.sin(win(t, 0.4, 1.65) * Math.PI * 6) * bump(t, 0.4, 1.65);
  const antic = bump(t, 0, 0.18);
  // brazo derecho del capataz (el más cercano a la cámara cuando se gira hacia quien lee): el brazo sale hacia fuera
  // a unos 20° sobre la horizontal y el antebrazo queda vertical; la mano saluda por encima del hombro, lejos de la cabeza
  return add(BASE, {
    RightArm: { z: -54 * up + 6 * antic, x: -8 * up }, RightForeArm: { z: (-44 - 32 * shake) * up, x: -4 * up },
    RightHand: { z: -16 * shake * up },
    LeftArm: { x: 4 * up }, LeftForeArm: { x: -6 * up },
    Spine: { z: 3 * up, x: -1.5 * up }, Spine2: { y: 4 * up },
    Head: { z: -5 * up - 2 * shake * up, y: 4 * up, x: -3 * up },
    LeftLeg: { x: 4 * antic }, RightLeg: { x: 4 * antic },
    squash: 0.025 * antic
  });
}

/* Director: estados con transiciones suaves; la marcha avanza con el scroll (o con el tiempo, al entrar); el giro
   sigue a la dirección con un muelle; y piezas con principio y fin (girarse, saludar) que avisan al acabar.
   set('walk' | 'idle' | 'talk'), advance(fase), face(+1 | −1 | 0), yawTo(grados), play('turn' | 'wave', ...) */
export function director({ faceYaw = 40 } = {}) {
  const st = { energy: 1, cur: 'idle', prev: null, k: 1, phase: 0, t: 0, yaw: faceYaw, yawTarget: faceYaw, yawVel: 0, clip: null, prevPose: null };
  const poseOf = (s) => (s === 'walk' ? walk(st.phase, st.energy) : s === 'talk' ? talk(st.t) : idle(st.t));
  const api = {
    get state() { return st.clip ? st.clip.name : st.cur; },
    get yaw() { return st.yaw; },
    set(s) { if (s === st.cur && !st.clip) return; st.clip = null; st.prevPose = st.lastPose || null; st.prev = st.cur; st.cur = s; st.k = 0; },
    advance(d) { st.phase = (st.phase + d) % 1; if (st.phase < 0) st.phase += 1; },
    setPhase(p) { st.phase = p; },
    setEnergy(e) { st.energy = e; },
    face(dir) { st.yawTarget = dir > 0 ? faceYaw : dir < 0 ? -faceYaw : 12; },
    yawTo(deg, snap = false) { st.yawTarget = deg; if (snap) { st.yaw = deg; st.yawVel = 0; } },
    // pieza con principio y fin; al acabar vuelve a 'then' (con transición) y llama a done
    play(name, { to = 12, then = 'idle', done } = {}) {
      st.prevPose = st.lastPose || null;
      st.clip = { name, t: 0, dur: name === 'turn' ? TURN : WAVE, from: st.yaw, to, then, done, blendIn: 0 };
    },
    tick(dt) {
      st.t += dt;
      if (st.clip) {
        const c = st.clip; c.t += dt; c.blendIn = Math.min(1, c.blendIn + dt / 0.2);
        let q = c.name === 'turn' ? turn(c.t, c.from, c.to) : wave(c.t);
        if (c.name !== 'turn') q.yaw = st.yaw;
        if (c.blendIn < 1 && st.prevPose && c.from0 === undefined) { const y = q.yaw; q = mix(st.prevPose, q, smooth(c.blendIn)); q.yaw = y; }
        if (c.name === 'turn') { st.yaw = q.yaw; st.yawTarget = c.to; st.yawVel = 0; }
        if (c.t >= c.dur) { st.clip = null; st.prevPose = q; st.prev = null; st.cur = c.then; st.k = 0; const f = c.done; if (f) f(); }
        st.lastPose = q;
        return q;
      }
      if (st.k < 1) st.k = Math.min(1, st.k + dt / 0.32);
      // giro con muelle amortiguado: se pasa un poco y vuelve, como un giro de verdad
      const a = (st.yawTarget - st.yaw) * 90 - st.yawVel * 13;
      st.yawVel += a * dt; st.yaw += st.yawVel * dt;
      let q = poseOf(st.cur);
      if (st.k < 1) { const from = st.prevPose || (st.prev ? poseOf(st.prev) : q); q = mix(from, q, smooth(st.k)); }
      else st.prevPose = null;
      q.yaw = st.yaw;
      st.lastPose = q;
      return q;
    },
    busy() { return !!st.clip || st.k < 1 || Math.abs(st.yawTarget - st.yaw) > 0.3 || Math.abs(st.yawVel) > 0.3; }
  };
  return api;
}
