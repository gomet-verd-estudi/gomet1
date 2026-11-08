/*
 * El capataz: animaciones.
 * Ángulos en grados sobre la pose de reposo, en ejes del personaje: x adelante(−)/atrás(+), y girar, z de lado.
 * Límites medidos en la malla para que no se rompa ni se atraviese:
 *  - brazos: como mucho ~42° por debajo de la horizontal (más abajo, el puño se mete en el pantalón, que es muy ancho);
 *  - piernas: se cierran 9° desde la postura abierta del modelo (más, las perneras se cruzan);
 *  - pies: giran 30° hacia delante como máximo (más, la bota se deforma).
 */
const TAU = Math.PI * 2;
const S = (x) => Math.sin(x * TAU), C = (x) => Math.cos(x * TAU);
const pos = (x) => Math.max(0, x);
const smooth = (t) => t * t * (3 - 2 * t);

// postura base, de pie: piernas algo más juntas, pies hacia delante, brazos bajados en A con el codo suelto
export const BASE = {
  LeftUpLeg: { z: -9 }, RightUpLeg: { z: 9 },
  LeftLeg: { z: 4 }, RightLeg: { z: -4 },
  LeftFoot: { y: -28 }, RightFoot: { y: 28 },
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

/* Caminar: p ∈ [0, 1) es la fase del ciclo de dos pasos.
   Contacto (p = 0 y 0.5), recepción, paso e impulso; brazos en oposición a las piernas; cadera que gira y se inclina;
   columna que contrarresta; antebrazos y cabeza con retraso (follow-through); aplastamiento al recibir el peso. */
export function walk(p) {
  const A = 22, K = 40, B = 24;
  const hipL = -A * S(p), hipR = A * S(p);
  // la rodilla se dobla mientras la pierna pasa hacia delante, y un poco al recibir el peso
  const kneeL = K * Math.pow(pos(C(p)), 1.4) + 6 * pos(-C(p)), kneeR = K * Math.pow(pos(-C(p)), 1.4) + 6 * pos(C(p));
  // el pie acompaña: talón al contactar, punta al despegar
  const footL = -(hipL + kneeL) * 0.75 + 10 * pos(S(p + 0.15)), footR = -(hipR + kneeR) * 0.75 + 10 * pos(-S(p + 0.15));
  const land = Math.pow(pos(Math.abs(S(p + 0.04)) - 0.6) / 0.4, 2); // justo después de cada contacto
  return add(BASE, {
    Hips: { y: 7 * S(p), z: 2.5 * C(p * 2 + 0.1), x: 3 },
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

// Mezcla de dos poses (transiciones): interpolación de cada ángulo
export function mix(a, b, k) {
  const o = {};
  for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[n], y = b[n];
    if (typeof x === 'number' || typeof y === 'number') { o[n] = (x || 0) + ((y || 0) - (x || 0)) * k; continue; }
    o[n] = { x: (x?.x || 0) + ((y?.x || 0) - (x?.x || 0)) * k, y: (x?.y || 0) + ((y?.y || 0) - (x?.y || 0)) * k, z: (x?.z || 0) + ((y?.z || 0) - (x?.z || 0)) * k };
  }
  return o;
}

/* Director: estados con transiciones suaves, la marcha avanza con el scroll y el giro sigue a la dirección.
   set('walk' | 'idle' | 'talk'), advance(fase), face(+1 derecha | −1 izquierda | 0 de frente), tick(dt) → pose */
export function director({ faceYaw = 40 } = {}) {
  const st = { cur: 'idle', prev: null, k: 1, phase: 0, t: 0, yaw: faceYaw, yawTarget: faceYaw, yawVel: 0 };
  const poseOf = (s) => (s === 'walk' ? walk(st.phase) : s === 'talk' ? talk(st.t) : idle(st.t));
  return {
    get state() { return st.cur; },
    set(s) { if (s === st.cur) return; st.prev = st.cur; st.cur = s; st.k = 0; },
    advance(d) { st.phase = (st.phase + d) % 1; if (st.phase < 0) st.phase += 1; },
    face(dir) { st.yawTarget = dir > 0 ? faceYaw : dir < 0 ? -faceYaw : 12; },
    tick(dt) {
      st.t += dt;
      if (st.k < 1) st.k = Math.min(1, st.k + dt / 0.32);
      // giro con muelle amortiguado: se pasa un poco y vuelve, como un giro de verdad
      const a = (st.yawTarget - st.yaw) * 90 - st.yawVel * 13;
      st.yawVel += a * dt; st.yaw += st.yawVel * dt;
      let q = poseOf(st.cur);
      if (st.prev && st.k < 1) q = mix(poseOf(st.prev), q, smooth(st.k));
      q.yaw = st.yaw;
      return q;
    },
    busy() { return st.k < 1 || Math.abs(st.yawTarget - st.yaw) > 0.3 || Math.abs(st.yawVel) > 0.3; }
  };
}
