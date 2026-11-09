/*
 * El capataz: animaciones.
 * Ángulos en grados sobre la pose de reposo, en ejes del personaje; en cada hueso se aplica primero z (abrir o
 * cerrar), luego y (girar sobre sí mismo) y al final x (balancear: adelante −, atrás +).
 * Límites medidos en la malla para que no se rompa ni se atraviese:
 *  - brazos: en reposo, como mucho 48° bajo la horizontal (más abajo, el puño se mete en el pantalón, que es muy
 *    ancho); al andar pueden bajar a ~64° porque el puño va y viene por delante y por detrás del pantalón;
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
    if (n === 'reach' || n === 'sole') continue;
    const x = a[n], y = b[n];
    if (typeof x === 'number' || typeof y === 'number') { o[n] = (x || 0) + ((y || 0) - (x || 0)) * k; continue; }
    o[n] = { x: (x?.x || 0) + ((y?.x || 0) - (x?.x || 0)) * k, y: (x?.y || 0) + ((y?.y || 0) - (x?.y || 0)) * k, z: (x?.z || 0) + ((y?.z || 0) - (x?.z || 0)) * k };
  }
  // las manos con alcance (tirar de la cuerda)
  // (el alcance entra y sale con peso: el brazo pasa de su pose a la cuerda sin saltos)
  // la planta del pie respecto al suelo (sin indicar, plana)
  if (a.sole || b.sole) { const sa = a.sole || {}, sb = b.sole || {}; o.sole = { Left: (sa.Left || 0) + ((sb.Left || 0) - (sa.Left || 0)) * k, Right: (sa.Right || 0) + ((sb.Right || 0) - (sa.Right || 0)) * k }; }
  if (b.reach) o.reach = { ...b.reach, w: k * (b.reach.w ?? 1) }; else if (a.reach) o.reach = { ...a.reach, w: (1 - k) * (a.reach.w ?? 1) };
  return o;
}

/* Caminar, por poses clave como en animación (no con senos): cada pierna recorre su ciclo con apoyo ~60 % y
   balanceo ~40 %. q = 0: el talón toca el suelo delante; carga (la rodilla cede y el cuerpo baja); apoyo medio (la
   pierna se estira y el cuerpo sube); impulso (el talón se levanta); despegue de la punta; balanceo con la rodilla
   alta y el pie que pasa bajo el cuerpo; y la pierna que se extiende para volver a pisar. Interpolación suave
   (Catmull-Rom cerrada). El sube y baja del cuerpo sale solo: el suelo se apoya en el punto más bajo de la suela.
   p ∈ [0, 1) es la fase del ciclo de dos pasos; p = 0 y 0.5: paso (pies juntos), p = 0.25: pisa la izquierda. */
//                 contacto carga  medio  impulso despegue balanceo  paso  extensión
export const THIGH = [   -18,    -15,    -4,     9,     20,      10,      -8,    -18 ];  // muslo (− adelante)
export const KNEE = [      4,     20,    10,    18,     44,      56,      56,     16 ];  // rodilla (+ dobla)
export const SOLE = [    -16,      0,     0,     5,     20,      24,       8,     -6 ];  // planta respecto al suelo (− punta arriba)
function loop(keys, q) {
  const n = keys.length, f = (((q % 1) + 1) % 1) * n, i = Math.floor(f), t = f - i;
  const a = keys[(i + n - 1) % n], b = keys[i], c = keys[(i + 1) % n], d = keys[(i + 2) % n];
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
}
function leg(q, k) {
  const th = loop(THIGH, q) * k, kn = loop(KNEE, q) * (0.75 + 0.25 * k), so = loop(SOLE, q) * Math.min(k, 1.3);
  return { th, kn, so };
}
export function walk(p, k = 1) {
  // k: energía (1 paseo; más, zancada más larga, más inclinado y brazos más sueltos)
  const qL = p - 0.25, qR = p + 0.25, L = leg(qL, k), R = leg(qR, k);
  const B = 26 * k;                                   // vaivén de los brazos, en oposición a las piernas
  const cL = C(qL), cR = C(qR);
  const load = Math.max(0, S(2 * p - 0.06));          // recepción del peso tras cada contacto
  const lean = -4 - 3 * (k - 1);
  const q = add(BASE, {
    // la pelvis gira con la pierna que avanza y cae hacia el lado de la pierna en el aire; el pecho contrarresta
    // (la inclinación va en la columna, no en la pelvis: así no altera el ángulo de las piernas)
    Hips: { y: 6 * cL, z: 2.2 * C(2 * p + 0.12) },
    Spine: { x: lean, y: -3.5 * cL }, Spine1: { y: -2 * C(qL - 0.04) }, Spine2: { y: -2.5 * C(qL - 0.08), x: 1.2 * load },
    // la cabeza estabiliza la mirada: compensa el giro y la inclinación y asiente un poco con retraso
    Neck: { y: 3 * C(qL - 0.1) },
    Head: { y: 1.5 * C(qL - 0.16), x: -lean * 0.6 + 1.6 * S(2 * p - 0.18) },
    LeftUpLeg: { x: L.th }, RightUpLeg: { x: R.th },
    LeftLeg: { x: L.kn }, RightLeg: { x: R.kn },
    // brazos: el hombro lleva el péndulo; el antebrazo llega tarde y se dobla más al ir hacia delante
    // al andar los brazos cuelgan más (el puño ya no roza el pantalón porque va y viene por delante y por detrás)
    LeftArm: { x: -6 + B * C(qL - 0.03), z: -16 + 2 * load }, RightArm: { x: -6 + B * C(qR - 0.03), z: 16 - 2 * load },
    LeftForeArm: { x: -8 - 20 * Math.max(0, -C(qL - 0.1)) }, RightForeArm: { x: -8 - 20 * Math.max(0, -C(qR - 0.1)) },
    LeftHand: { x: 6 * C(qL - 0.18) }, RightHand: { x: 6 * C(qR - 0.18) },
    squash: 0.018 * load * load
  });
  q.sole = { Left: L.so, Right: R.so };
  return q;
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

/* Tirar de la cuerda (de perfil): la página sube o baja porque él la mueve. p ∈ [0, 1) es la fase: cada mano
   agarra arriba y baja tirando (medio ciclo) mientras la otra suelta, sube por fuera y vuelve a agarrar. Al hacer
   scroll hacia arriba la fase va al revés: la mano que agarra sube con la cuerda (la deja subir) y la otra baja.
   Postura de tirar: pierna cercana adelantada y flexionada, la otra atrás, cuerpo echado atrás en cada tirón. */
export const ROPE_HI = 0.68, ROPE_LO = 0.40, ROPE_Z = 0.25;
export const ropePerPhase = 2 * (ROPE_HI - ROPE_LO); // cuerda que corre por cada ciclo de fase
function hand(p, side) {
  const t = ((p % 1) + 1) % 1;
  if (t < 0.5) { const u = t / 0.5; return [0, ROPE_HI - (ROPE_HI - ROPE_LO) * u, ROPE_Z]; } // agarrada, tira
  const u = (t - 0.5) / 0.5, e = u * u * (3 - 2 * u), a = Math.sin(Math.PI * u);
  return [side * 0.06 * a, ROPE_LO + (ROPE_HI - ROPE_LO) * e, ROPE_Z - 0.025 * a];              // suelta, sube pegada al cuerpo
}
export function haul(p) {
  const pull = Math.pow(Math.abs(Math.sin(Math.PI * 2 * p)), 0.8); // dos tirones por ciclo, uno por mano
  const tug = Math.sin(Math.PI * 4 * p - 0.6);                       // rebote del cuerpo en cada tirón
  const q = add(BASE, {
    RightUpLeg: { x: -24 }, RightLeg: { x: 22 + 6 * pull }, RightFoot: { x: -8 },
    LeftUpLeg: { x: 20 }, LeftLeg: { x: 6 + 4 * pull }, LeftFoot: { x: -18 },
    // inclinado hacia la cuerda; en cada tirón se echa atrás
    Hips: { x: -6 + 5 * pull, y: 3 * Math.sin(Math.PI * 2 * p) },
    // (de perfil mirando a la izquierda: pecho y cara un poco abiertos hacia quien mira)
    Spine: { x: -8 + 7 * pull }, Spine1: { x: -3 + 3 * pull, y: 6 }, Spine2: { y: 6 },
    Head: { x: -4 - 3 * tug, y: 22 },
    squash: 0.03 * pull
  });
  q.reach = { Left: hand(p, 1), Right: hand(p + 0.5, -1), LeftPole: [0.3, 0.3, -0.12], RightPole: [-0.3, 0.3, -0.12] };
  return q;
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
  const poseOf = (s) => (s === 'haul' ? haul(st.phase) : s === 'walk' ? walk(st.phase, st.energy) : s === 'talk' ? talk(st.t) : idle(st.t));
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
