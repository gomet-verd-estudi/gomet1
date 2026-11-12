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
const back = (t) => { const c = 1.25, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };   // llega, se pasa un 5 % y vuelve
const bump = (t, a, b) => { const u = win(t, a, b); return Math.sin(Math.PI * u); };

// De pie como un capataz: pies al frente, piernas algo cerradas, brazos caídos con el codo suelto y los puños a los
// lados de la cadera. hands: hacia dónde mira el pulgar de cada mano (el motor gira la muñeca; la palma sale sola).
export const BASE = {
  LeftUpLeg: { z: -12, y: -42 }, RightUpLeg: { z: 12, y: 42 },
  LeftLeg: { z: 4 }, RightLeg: { z: -4 },
  LeftFoot: { y: -22 }, RightFoot: { y: 22 },
  // el modelo no tiene los brazos simétricos en reposo (+8° y −22°): ambos quedan a 64° bajo la horizontal
  LeftArm: { z: -72, x: -12 }, RightArm: { z: 42, x: -12 },
  LeftForeArm: { x: -34 }, RightForeArm: { x: -34 },
  Spine: { x: 2 }, Head: { x: -3 },
  // con los brazos caídos, el pulgar mira al frente y la palma al muslo
  hands: { Left: { thumb: [0, 0, 1] }, Right: { thumb: [0, 0, 1] } }
};
const SPECIAL = new Set(['reach', 'sole', 'legs', 'soleYaw', 'local', 'thumb', 'face', 'hands']);
const addV = (a, b) => ({ x: (a?.x || 0) + (b?.x || 0), y: (a?.y || 0) + (b?.y || 0), z: (a?.z || 0) + (b?.z || 0) });
const mixV = (a, b, k) => ({ x: (a?.x || 0) + ((b?.x || 0) - (a?.x || 0)) * k, y: (a?.y || 0) + ((b?.y || 0) - (a?.y || 0)) * k, z: (a?.z || 0) + ((b?.z || 0) - (a?.z || 0)) * k });
const keys = (a, b) => new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
// suma una pose a otra (ángulos); lo demás (alcances, piernas, planta, pulgares) lo pone la segunda
export function add(base, extra) {
  const o = {};
  for (const k of keys(base, extra)) {
    if (SPECIAL.has(k)) continue;
    const a = base[k], b = extra[k];
    if (typeof a === 'number' || typeof b === 'number') { o[k] = (a || 0) + (b || 0); continue; }
    o[k] = addV(a, b);
  }
  if (base.local || extra.local) { o.local = {}; for (const n of keys(base.local, extra.local)) o.local[n] = addV(base.local?.[n], extra.local?.[n]); }
  for (const k of ['reach', 'sole', 'legs', 'soleYaw', 'thumb', 'face']) { const v = extra[k] ?? base[k]; if (v !== undefined) o[k] = v; }
  // las manos, una a una: la segunda pose puede cambiar solo una
  if (base.hands || extra.hands) o.hands = { Left: extra.hands?.Left ?? base.hands?.Left, Right: extra.hands?.Right ?? base.hands?.Right };
  return o;
}
const mixP = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
export function mix(a, b, k, kb = k) {
  // kb: factor para ángulos y alcances de los brazos (puede pasarse de 1: remate elástico); k: para pies, pelvis y manos
  const o = {};
  for (const n of keys(a, b)) {
    if (SPECIAL.has(n)) continue;
    const x = a[n], y = b[n];
    if (typeof x === 'number' || typeof y === 'number') { o[n] = (x || 0) + ((y || 0) - (x || 0)) * k; continue; }
    o[n] = mixV(x, y, kb);
  }
  if (a.local || b.local) { o.local = {}; for (const n of keys(a.local, b.local)) o.local[n] = mixV(a.local?.[n], b.local?.[n], kb); }
  // pulgares: 0 puño, 1 arriba
  if (a.thumb || b.thumb) o.thumb = { Left: (a.thumb?.Left || 0) + ((b.thumb?.Left || 0) - (a.thumb?.Left || 0)) * k, Right: (a.thumb?.Right || 0) + ((b.thumb?.Right || 0) - (a.thumb?.Right || 0)) * k };
  // hacia dónde mira el pulgar de cada mano: se mezcla la dirección (y el peso, si una pose no la lleva)
  if (a.hands || b.hands) {
    o.hands = {};
    for (const s of ['Left', 'Right']) {
      const x = a.hands?.[s], y = b.hands?.[s];
      if (x && y) o.hands[s] = { thumb: mixP(x.thumb, y.thumb, k), w: (x.w ?? 1) + ((y.w ?? 1) - (x.w ?? 1)) * k };
      else if (y) o.hands[s] = { ...y, w: k * (y.w ?? 1) }; else if (x) o.hands[s] = { ...x, w: (1 - k) * (x.w ?? 1) };
    }
  }
  // la planta del pie respecto al suelo (sin indicar, plana)
  if (a.sole || b.sole) { const sa = a.sole || {}, sb = b.sole || {}; o.sole = { Left: (sa.Left || 0) + ((sb.Left || 0) - (sa.Left || 0)) * k, Right: (sa.Right || 0) + ((sb.Right || 0) - (sa.Right || 0)) * k }; }
  const sy = k < 0.5 ? a.soleYaw : b.soleYaw; if (sy) o.soleYaw = sy;
  // piernas por cinemática inversa: entre dos poses que las llevan se mezclan los puntos; si solo una, entra o sale con peso
  if (a.legs && b.legs) {
    const L = (s) => ({ ankle: mixP(a.legs[s].ankle, b.legs[s].ankle, k), pole: mixP(a.legs[s].pole, b.legs[s].pole, k) });
    o.legs = { hip: mixP(a.legs.hip, b.legs.hip, k), Left: L('Left'), Right: L('Right'), w: (a.legs.w ?? 1) + ((b.legs.w ?? 1) - (a.legs.w ?? 1)) * k };
  } else if (b.legs) o.legs = { ...b.legs, w: k * (b.legs.w ?? 1) }; else if (a.legs) o.legs = { ...a.legs, w: (1 - k) * (a.legs.w ?? 1) };
  // manos con alcance (cuerda, casco): cada brazo por su cuenta, igual
  if (a.reach || b.reach) {
    o.reach = {};
    for (const s of ['Left', 'Right']) {
      const x = a.reach?.[s], y = b.reach?.[s];
      if (x && y) o.reach[s] = { at: mixP(x.at, y.at, kb), pole: mixP(x.pole, y.pole, k), w: (x.w ?? 1) + ((y.w ?? 1) - (x.w ?? 1)) * k };
      else if (y) o.reach[s] = { ...y, w: k * (y.w ?? 1) }; else if (x) o.reach[s] = { ...x, w: (1 - k) * (x.w ?? 1) };
    }
  }
  if ((k < 0.5 ? a.face : b.face) !== undefined) o.face = k < 0.5 ? a.face : b.face;
  return o;
}

/* Caminar como una persona: los pies se plantan en el suelo y no se mueven mientras apoyan; las piernas llegan a
   ellos con cinemática inversa. Así el cuerpo avanza a velocidad constante (sin tirones) y nada patina.
   Cada pie, a lo largo de su ciclo q (q = 0: el talón toca el suelo delante):
     apoyo (60 %): el talón pisa con la punta arriba y el pie baja rodando sobre el talón; apoyo plano; el talón se
                   levanta y el pie rueda sobre la punta hasta despegar. El punto que toca el suelo es fijo en el mundo,
                   así que en el espacio del personaje va hacia atrás a velocidad constante.
     balanceo (40 %): el pie sube, adelanta por debajo del cuerpo y baja a pisar, en una curva con la velocidad
                   continua en los dos extremos (sin saltos al despegar ni al pisar).
   La pelvis va tan alta como dejan las dos piernas (baja sola en el doble apoyo y sube al pasar), se mece hacia la
   pierna que apoya y gira con la que avanza; el pecho contrarresta y los brazos van en oposición.
   p ∈ [0, 1): fase del ciclo de dos pasos; p = 0.25: pisa la izquierda; p = 0.75: la derecha. */
// medidas del modelo en reposo (unidades del mundo); capataz-web las cambia por las que mide el motor (setRig)
let RIG = { H: 0.978, floor: 0, hips: [0.002, 0.433, -0.014],
  Left: { hip: [0.06, 0.415, -0.014], thigh: 0.19, shin: 0.197, ah: 0.063, back: 0.026, F: 0.15 },
  Right: { hip: [-0.056, 0.415, -0.014], thigh: 0.19, shin: 0.197, ah: 0.063, back: 0.034, F: 0.2 } };
export function setRig(r) { if (r && r.Left && r.Right) RIG = r; }
const STANCE = 0.6;
const stepLen = (k) => 0.3 * RIG.H * (0.85 + 0.15 * k);    // largo de un paso (≈ 0,3 de la altura, como unas piernas cortas)
export const stride = (k = 1) => 2 * stepLen(k);           // lo que avanza el cuerpo en un ciclo (dos pasos)
const ease = (t) => t * t * (3 - 2 * t);
// tobillo y ángulo de la planta (+ punta arriba) de un pie apoyado, a partir del punto que toca el suelo
function planted(R, zc, cyc, q, hs) {
  const q1 = 0.1, q2 = 0.34;
  let pivot, z, th;
  if (q < q1) { th = hs * (1 - ease(q / q1)); pivot = 'heel'; }
  else if (q < q2) { th = 0; pivot = 'heel'; }
  else { const u = (q - q2) / (STANCE - q2); th = -34 * u * u * (1.6 - 0.6 * u); pivot = 'toe'; }
  const fwd = pivot === 'heel' ? R.back : R.back - R.F, up = R.ah, a = th * Math.PI / 180;
  z = (pivot === 'heel' ? zc : zc + R.F) - cyc * q;
  return { z: z + fwd * Math.cos(a) - up * Math.sin(a), y: RIG.floor + fwd * Math.sin(a) + up * Math.cos(a), th };
}
function foot(side, q, k) {
  const R = RIG[side], cyc = stride(k), hs = 14 * Math.min(1.2, k);
  // el apoyo queda centrado bajo la cadera: el talón pisa delante y la punta despega detrás, a la misma distancia
  const zc = R.hip[2] + cyc * STANCE * 0.5 - R.F * 0.5 + 0.012 * RIG.H;
  q = ((q % 1) + 1) % 1;
  if (q < STANCE) return planted(R, zc, cyc, q, hs);
  // balanceo: Hermite entre el despegue y el siguiente contacto, con las velocidades de los dos extremos
  const t = (q - STANCE) / (1 - STANCE), e = 1e-3, sw = 1 - STANCE;
  const A0 = planted(R, zc, cyc, STANCE - e, hs), A0b = planted(R, zc, cyc, STANCE - 2 * e, hs);
  const B0 = planted(R, zc, cyc, 0, hs), B0b = planted(R, zc, cyc, e, hs);
  const v0z = (A0.z - A0b.z) / e * sw, v0y = (A0.y - A0b.y) / e * sw, v1z = (B0b.z - B0.z) / e * sw, v1y = (B0b.y - B0.y) / e * sw;
  const h00 = 2 * t ** 3 - 3 * t * t + 1, h10 = t ** 3 - 2 * t * t + t, h01 = -2 * t ** 3 + 3 * t * t, h11 = t ** 3 - t * t;
  const lift = 0.05 * RIG.H * Math.min(1.25, k) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), 2);
  return {
    air: true,
    z: h00 * A0.z + h10 * v0z + h01 * B0.z + h11 * v1z,
    y: h00 * A0.y + h10 * v0y + h01 * B0.y + h11 * v1y + lift,
    th: A0.th + (B0.th - A0.th) * ease(Math.min(1, t * 1.15))
  };
}
// mínimo suave (la pelvis no se queda clavada contra el límite de la pierna)
const smin = (a, b, r) => -r * Math.log(Math.exp(-a / r) + Math.exp(-b / r));
export function walk(p, k = 1) {
  const qL = p - 0.25, qR = p + 0.25, cL = C(qL);
  const fL = foot('Left', qL, k), fR = foot('Right', qR, k);
  const track = 0.095 * RIG.H, H = RIG.H;
  const ankL = [track, fL.y, fL.z], ankR = [-track, fR.y, fR.z];
  // pelvis: tan alta como dejan las piernas (algo flexionadas), con su balanceo lateral
  const sway = 0.011 * H * C(p - 0.5), fwd = 0.012 * H;
  const dy = RIG.hips[1] - RIG.Left.hip[1];
  const top = (R, a) => { const L = (R.thigh + R.shin) * 0.985, dx = a[0] - (R.hip[0] + sway), dz = a[2] - (R.hip[2] + fwd); return a[1] + Math.sqrt(Math.max(0, L * L - dx * dx - dz * dz)) + dy; };
  // de pie, la cadera iría con las piernas casi estiradas; al andar sube en el apoyo medio y la limitan las piernas
  const stand = RIG.Left.ah + (RIG.Left.thigh + RIG.Left.shin) * 0.985 + dy;
  const want = stand + 0.004 * H + 0.018 * H * C(2 * p);
  // (cuenta sobre todo la pierna que apoya; la del aire solo si va muy baja)
  const hipY = smin(smin(want, top(RIG.Left, ankL) + (fL.air ? 0.03 * H : 0), 0.004 * H), top(RIG.Right, ankR) + (fR.air ? 0.03 * H : 0), 0.004 * H);
  const B = 22 * k, lean = -3 - 2 * (k - 1);
  const load = Math.max(0, S(2 * p - 0.06));
  const q = add(BASE, {
    Hips: { y: -4 * cL, z: 2 * C(2 * p + 0.12) },
    Spine: { x: lean, y: 3 * cL }, Spine1: { y: 1.5 * C(qL - 0.04) }, Spine2: { y: 2 * C(qL - 0.08), x: 0.8 * load },
    Neck: { y: -2 * C(qL - 0.1) },
    Head: { y: -1 * C(qL - 0.16), x: -lean * 0.7 + 1.2 * S(2 * p - 0.2) },
    // los brazos cuelgan más que en reposo y van en oposición a las piernas; el antebrazo llega tarde
    LeftArm: { x: 2 + B * C(qL - 0.03), z: 2 * load }, RightArm: { x: 2 + B * C(qR - 0.03), z: -2 * load },
    LeftForeArm: { x: 12 - 18 * Math.max(0, -C(qL - 0.1)) }, RightForeArm: { x: 12 - 18 * Math.max(0, -C(qR - 0.1)) },
    LeftHand: { x: 5 * C(qL - 0.18) }, RightHand: { x: 5 * C(qR - 0.18) }
  });
  const pole = (x) => [x, RIG.Left.hip[1] * 0.5, 0.4 * H];
  q.legs = { hip: [RIG.hips[0] + sway, hipY, RIG.hips[2] + fwd], Left: { ankle: ankL, pole: pole(track * 1.3) }, Right: { ankle: ankR, pole: pole(-track * 1.3) } };
  q.sole = { Left: -fL.th, Right: -fR.th }; q.soleYaw = { Left: 0, Right: 0 };
  return q;
}

/* De pie con los pies plantados: la pelvis puede mecerse, bajar o adelantarse sin que los pies se muevan (las piernas
   llegan por cinemática inversa). Así cambia el peso de pierna o se agacha sin patinar. */
function legsAt(ankL, ankR, { sway = 0, dip = 0, fwd = 0 } = {}) {
  const H = RIG.H, dy = RIG.hips[1] - RIG.Left.hip[1];
  const top = (R, a) => { const L = (R.thigh + R.shin) * 0.985, dx = a[0] - (R.hip[0] + sway), dz = a[2] - (R.hip[2] + fwd); return a[1] + Math.sqrt(Math.max(0, L * L - dx * dx - dz * dz)) + dy; };
  const y = Math.min(top(RIG.Left, ankL), top(RIG.Right, ankR)) - dip;
  const pole = (a, s) => [a[0] + s * 0.03 * H, RIG.Left.hip[1] * 0.5, a[2] + 0.36 * H];
  return { hip: [RIG.hips[0] + sway, y, RIG.hips[2] + fwd], Left: { ankle: ankL, pole: pole(ankL, 1) }, Right: { ankle: ankR, pole: pole(ankR, -1) } };
}
const FOOT_X = 0.135, FOOT_Z = 0.061;   // dónde pisa cada pie de pie (en alturas, respecto a la pelvis)
function stand(o) {
  const H = RIG.H, ax = FOOT_X * H, az = RIG.hips[2] + FOOT_Z * H;
  return legsAt([ax, RIG.floor + RIG.Left.ah, az], [-ax, RIG.floor + RIG.Right.ah, az], o);
}
const TOES = { Left: 6, Right: -6 };   // de pie, las puntas un poco abiertas
// brazos en jarra: los puños en la cintura y los codos fuera (la postura de quien mira cómo va la obra)
// (la palma contra la cadera, el dorso hacia fuera y el lado del pulgar arriba y al frente, como unos puños en la cintura)
const JL = [-0.4, 0.6, 0.5], JR = [0.4, 0.6, 0.5], BRIM = [0.55, -0.15, -0.6];   // en la cintura (izq. y dcha.); saludando en el ala del casco
const JARRA = { LeftArm: { z: 10, x: 12 }, RightArm: { z: -10, x: 12 }, LeftForeArm: { x: -10, z: -30 }, RightForeArm: { x: -10, z: 30 }, hands: { Left: { thumb: JL }, Right: { thumb: JR } } };
const JARRA_L = { LeftArm: JARRA.LeftArm, LeftForeArm: JARRA.LeftForeArm, hands: { Left: { thumb: JL } } };
const hold = (x, g = 2.4) => Math.tanh(g * x) / Math.tanh(g);   // una onda con pausas en los extremos

// Reposo: en jarra, respira (pecho y hombros), cambia el peso de una pierna a otra con pausas y mira alrededor
export function idle(t) {
  const br = S(t / 3.6), sh = hold(S(t / 12.5)), lk = S(t / 9.1 + 0.2), H = RIG.H;
  const q = add(add(BASE, JARRA), {
    LeftArm: { z: 1.6 * br }, RightArm: { z: -1.6 * br }, LeftShoulder: { z: 1.4 * br }, RightShoulder: { z: -1.4 * br },
    Hips: { z: -3.4 * sh }, Spine: { z: 2.2 * sh }, Spine2: { x: 1.6 * br, z: 1.2 * sh },
    Neck: { x: -0.8 * br }, Head: { y: 7 * lk, x: 1.2 * S(t / 4.7), z: -1.2 * sh }
  });
  q.legs = stand({ sway: 0.024 * H * sh, dip: 0.003 * H * (1 - br) + 0.006 * H * Math.abs(sh) });
  q.soleYaw = TOES;
  return q;
}

/* Hablar, con tres maneras de explicarse (v):
   0 «señala»: el puño derecho a un lado con el pulgar hacia la obra, y la cabeza va de la obra a quien lee;
   1 «pulgar»: pulgar arriba hacia quien lee, con un asentimiento (visto bueno);
   2 «en jarra»: los puños en la cintura, asiente y se balancea, como quien da un parte.
   El izquierdo queda siempre en la cintura. El cuerpo marca el ritmo de la frase. */
export function talk(t, v = 0) {
  const f = 1.45, beat = S(t * f), nod = S(t * f - 0.12), em = pos(S(t * f)), H = RIG.H;
  const q = add(add(BASE, v === 2 ? JARRA : JARRA_L), {
    Spine: { x: -2 + 1.5 * beat, z: v === 2 ? 0 : 2 }, Spine2: { y: v === 0 ? -6 : v === 1 ? 4 : 0, x: 1 * em },
    LeftShoulder: { z: 1.2 * em }, RightShoulder: { z: -1.2 * em },
    Head: { x: -3 + 4 * nod, z: v === 2 ? 2 * S(t * f / 2) : -2 }
  });
  if (v === 0) {
    // mira hacia la obra (a su derecha) al empezar cada frase y vuelve a quien lee
    const look = bump(t % 4.2, 0.1, 1.5);
    q.Head.y = -26 * look; q.Neck = { y: -8 * look }; q.Spine = addV(q.Spine, { z: -4 });
    q.reach = { Right: { at: [-0.27 - 0.03 * em, 0.66 + 0.01 * beat, 0.07], pole: [-0.35, 0.3, -0.05] } };
    q.hands.Right = { thumb: [-1, 0.2, 0] }; q.thumb = { Right: 1 };
  } else if (v === 1) {
    q.Head.y = 5;
    q.reach = { Right: { at: [-0.22, 0.6 + 0.025 * em, 0.18 + 0.015 * em], pole: [-0.35, 0.3, 0] } };
    q.hands.Right = { thumb: [0, 1, 0] }; q.thumb = { Right: 1 };
  } else {
    q.Head.y = 6 * S(t * f / 4); q.LeftArm = addV(q.LeftArm, { z: 2 * em }); q.RightArm = addV(q.RightArm, { z: -2 * em });
  }
  q.legs = stand({ sway: 0.006 * H * S(t * f / 2), dip: 0.008 * H * em });
  q.soleYaw = TOES;
  return q;
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
  q.reach = { Left: { at: hand(p, 1), pole: [0.3, 0.3, -0.12] }, Right: { at: hand(p + 0.5, -1), pole: [-0.3, 0.3, -0.12] } };
  q.hands = { Left: { thumb: [0, 1, 0] }, Right: { thumb: [0, 1, 0] } };
  return q;
}

/* Girarse como una persona, con los pies plantados: primero la cabeza, luego el pecho y al final la cadera. Los pies
   no patinan: cada uno se queda donde está (en el suelo, no respecto al cuerpo) hasta que le toca dar su paso; abre
   primero el del lado hacia el que gira y luego recoge el otro. Antes, una pequeña anticipación (se agacha un poco);
   al final se pasa un pelo y vuelve. Las piernas van por cinemática inversa, en el espacio del cuerpo que gira. */
export const TURN = 1.15;
export function turn(t, from, to) {
  const d = to - from, H = RIG.H, rad = Math.PI / 180;
  const head = from + d * eio(win(t, 0.0, 0.5)), chest = from + d * eio(win(t, 0.12, 0.7));
  const settle = 1 + 0.05 * Math.sin(Math.PI * win(t, 0.82, 1.15)) * (1 - win(t, 0.98, 1.15)); // se pasa un poco y vuelve
  const yaw = from + d * eio(win(t, 0.2, 0.92)) * settle;
  // d < 0: gira hacia su derecha → abre el pie derecho; d > 0: el izquierdo
  const lead = d < 0 ? 'Right' : 'Left';
  const step = { [lead]: eio(win(t, 0.16, 0.5)), [lead === 'Left' ? 'Right' : 'Left']: eio(win(t, 0.52, 0.9)) };
  const air = { Left: Math.sin(Math.PI * step.Left), Right: Math.sin(Math.PI * step.Right) };
  const az = RIG.hips[2] + FOOT_Z * H, c = Math.cos(yaw * rad), sn = Math.sin(yaw * rad);
  const ank = {}, sole = {}, sy = {};
  for (const [side, sx] of [['Left', 1], ['Right', -1]]) {
    const px = sx * FOOT_X * H, k = step[side], f = (from + d * k) * rad;          // rumbo del pie en el suelo
    // dónde pisa en el suelo: su sitio de siempre, girado al rumbo que lleva; y de vuelta al espacio del cuerpo
    const wx = px * Math.cos(f) + az * Math.sin(f), wz = -px * Math.sin(f) + az * Math.cos(f);
    ank[side] = [wx * c - wz * sn, RIG.floor + RIG[side].ah + 0.034 * H * air[side], wx * sn + wz * c];
    sy[side] = (from + d * k) - yaw + TOES[side]; sole[side] = 7 * air[side];
  }
  const antic = bump(t, 0, 0.26), sway = 0.012 * H * (air[lead === 'Left' ? 'Right' : 'Left'] - air[lead]) * (lead === 'Left' ? -1 : 1);
  const q = add(BASE, {
    Spine: { y: (chest - yaw) * 0.6 }, Spine2: { y: (chest - yaw) * 0.4 },
    Head: { y: head - chest, x: -2 },
    LeftArm: { x: 7 * bump(t, 0.2, 0.9), z: 4 * bump(t, 0.2, 0.9) }, RightArm: { x: -7 * bump(t, 0.2, 0.9), z: -4 * bump(t, 0.2, 0.9) },
    squash: 0.02 * antic
  });
  q.legs = legsAt(ank.Left, ank.Right, { sway, dip: 0.012 * H * antic + 0.006 * H * (air.Left + air.Right) });
  q.sole = sole; q.soleYaw = sy; q.yaw = yaw;
  return q;
}

/* Saludar tocándose el casco: se agacha un pelo (anticipación), lleva el puño derecho al ala, inclina la cabeza y
   el casco con él, y lo remata con el pulgar arriba hacia quien lee antes de volver a la cintura. */
export const GREET = 2.5;
export function greet(t) {
  const up = eio(win(t, 0.08, 0.5)), out = eio(win(t, 1.05, 1.45)), back = eio(win(t, 2.05, 2.5));
  const antic = bump(t, 0, 0.22), tip = bump(t, 0.45, 1.05), H = RIG.H;
  const brim = [-0.17, 0.79 - 0.018 * tip, 0.07], thumb = [-0.22, 0.62, 0.18], hip = [-0.2, 0.5, 0.06];
  const at = mixP(mixP(mixP(hip, brim, up), thumb, out), hip, back), dir = mixP(mixP(mixP(JR, BRIM, up), [0, 1, 0], out), JR, back);
  const q = add(add(BASE, JARRA), {
    Spine: { z: -3 * up * (1 - out), x: -1.5 * tip }, Spine2: { y: 4 * up * (1 - back) },
    Head: { x: -3 - 9 * tip, z: 4 * up * (1 - out), y: 4 * out * (1 - back) }
  });
  q.reach = { Right: { at, pole: mixP([-0.45, 0.6, -0.1], [-0.35, 0.3, 0], out), w: Math.min(1, up * 4) * (1 - back) } };
  q.hands.Right = { thumb: dir }; q.thumb = { Right: out * (1 - back) };
  q.legs = stand({ dip: 0.012 * H * antic + 0.004 * H * tip }); q.soleYaw = TOES;
  return q;
}

/* Celebrar (fin de obra): se agacha, salta con los dos puños arriba y cae amortiguando; aguanta un momento y baja. */
export const CHEER = 1.9;
export function cheer(t) {
  const crouch = bump(t, 0, 0.34), air = win(t, 0.3, 0.74), land = bump(t, 0.72, 1.02), H = RIG.H;
  const up = eio(win(t, 0.16, 0.44)) * (1 - eio(win(t, 1.4, 1.9)));
  const q = add(add(BASE, JARRA), {
    Spine: { x: 3 * crouch - 3 * up }, Head: { x: -3 + 5 * crouch - 6 * up },
    squash: 0.05 * crouch - 0.04 * Math.sin(Math.PI * air) + 0.05 * land,
    hop: 0.085 * Math.sin(Math.PI * air)
  });
  const pump = 0.012 * S(win(t, 0.74, 1.4) * 2) * up;
  q.reach = { Left: { at: [0.2, 0.9 + pump, 0.04], pole: [0.5, 0.6, -0.1], w: up }, Right: { at: [-0.2, 0.9 + pump, 0.04], pole: [-0.5, 0.6, -0.1], w: up } };
  q.hands = { Left: { thumb: mixP(JL, [-1, 0.2, 0], up) }, Right: { thumb: mixP(JR, [1, 0.2, 0], up) } };
  q.legs = stand({ dip: 0.03 * H * crouch + 0.02 * H * land }); q.soleYaw = TOES;
  return q;
}

/* Respuesta a un toque: un saltito con el pulgar arriba. */
export const HOP = 1.0;
export function hop(t) {
  const crouch = bump(t, 0, 0.22), air = win(t, 0.18, 0.5), land = bump(t, 0.48, 0.72), H = RIG.H;
  const up = eio(win(t, 0.1, 0.32)) * (1 - eio(win(t, 0.72, 1.0)));
  const q = add(add(BASE, JARRA), { Head: { x: -3 + 4 * crouch - 4 * up }, squash: 0.04 * crouch - 0.03 * Math.sin(Math.PI * air) + 0.04 * land, hop: 0.045 * Math.sin(Math.PI * air) });
  q.reach = { Right: { at: [-0.22, 0.62, 0.18], pole: [-0.35, 0.3, 0], w: up } }; q.hands.Right = { thumb: mixP(JR, [0, 1, 0], up) }; q.thumb = { Right: up };
  q.legs = stand({ dip: 0.02 * H * crouch + 0.014 * H * land }); q.soleYaw = TOES;
  return q;
}

/* Gestos sueltos mientras espera (uno cada tanto, al azar):
   mirar la obra (cabeza y pecho hacia ella, echándose un poco), colocarse el casco y mecerse de puntas a talones. */
export const PEEK = 2.8, HAT = 2.0, ROCK = 2.4;
export function peek(t) {
  const k = eio(win(t, 0, 0.6)) * (1 - eio(win(t, 2.1, 2.8))), H = RIG.H;
  const q = add(add(BASE, JARRA), { Spine: { y: -8 * k, z: -2 * k }, Spine2: { y: -10 * k }, Neck: { y: -10 * k }, Head: { y: -24 * k, x: -3 + 2 * k + 2 * bump(t, 1.0, 1.9) } });
  q.legs = stand({ sway: -0.014 * H * k, dip: 0.004 * H * k }); q.soleYaw = TOES;
  return q;
}
export function hat(t) {
  const up = eio(win(t, 0.05, 0.5)) * (1 - eio(win(t, 1.45, 2.0))), fix = S(win(t, 0.55, 1.4) * 1.5) * bump(t, 0.5, 1.45);
  const q = add(add(BASE, JARRA), { Head: { x: -3 - 4 * up, z: 4 * fix }, Spine: { z: -2 * up } });
  q.reach = { Right: { at: [-0.17, 0.8 + 0.012 * fix, 0.07], pole: [-0.45, 0.6, -0.1], w: up } };
  q.hands.Right = { thumb: mixP(JR, BRIM, up) };
  q.legs = stand(); q.soleYaw = TOES;
  return q;
}
export function rock(t) {
  const r = S(win(t, 0.1, 2.3) * 2) * bump(t, 0, 2.4), H = RIG.H;   // + de puntillas, − sobre los talones
  const q = add(add(BASE, JARRA), { Spine: { x: -1.5 * r }, Head: { x: -3 + 1.5 * r }, LeftArm: { z: 2 * pos(r) }, RightArm: { z: -2 * pos(r) } });
  q.legs = stand({ fwd: 0.012 * H * r }); q.soleYaw = TOES;
  q.sole = { Left: r > 0 ? 13 * r : 9 * r, Right: r > 0 ? 13 * r : 9 * r };
  return q;
}

/* Director: estados con transiciones suaves (reposo, hablar, andar, tirar de la cuerda), piezas con principio y fin
   (girarse, saludar, celebrar, saltito y los gestos de espera) que avisan al acabar, la mirada (la cabeza sigue un
   punto, con el cuello y el pecho acompañando) y, en reposo, un gesto suelto cada tanto para que no parezca parado.
   set('idle' | 'talk' | 'walk' | 'haul', variante), advance(fase), face(+1 | −1 | 0), yawTo(grados),
   play('turn' | 'greet' | 'cheer' | 'hop' | 'peek' | 'hat' | 'rock', { to, then, done }), look(giro, cabeceo) */
const CLIPS = { turn: { dur: TURN }, greet: { dur: GREET, fn: greet }, cheer: { dur: CHEER, fn: cheer }, hop: { dur: HOP, fn: hop },
  peek: { dur: PEEK, fn: peek }, hat: { dur: HAT, fn: hat }, rock: { dur: ROCK, fn: rock } };
const FIDGETS = ['peek', 'rock', 'hat', 'rock', 'peek'];
// cuánto sigue la mirada en cada momento (andando, tirando o girándose mira a lo suyo)
const LOOKS = { idle: 1, talk: 0.7, greet: 0.5, hop: 0.6, hat: 0.6, rock: 1, cheer: 0.3, peek: 0, turn: 0, walk: 0, haul: 0 };
export function director({ faceYaw = 40, fidget = true } = {}) {
  const st = { energy: 1, cur: 'idle', prev: null, k: 1, phase: 0, t: 0, yaw: faceYaw, yawTarget: faceYaw, yawVel: 0, clip: null, prevPose: null,
    variant: 0, look: [0, 0], lookTo: [0, 0], lookW: 0, waited: 0, nextFidget: 5 + Math.random() * 4, fi: Math.floor(Math.random() * FIDGETS.length) };
  const poseOf = (s) => (s === 'haul' ? haul(st.phase) : s === 'walk' ? walk(st.phase, st.energy) : s === 'talk' ? talk(st.t, st.variant) : idle(st.t));
  const api = {
    get state() { return st.clip ? st.clip.name : st.cur; },
    get yaw() { return st.yaw; },
    set(s, v) {
      if (s === 'talk' && v !== undefined && v !== st.variant) { st.variant = v; if (s === st.cur && !st.clip) { st.prevPose = st.lastPose || null; st.k = 0; } }
      if (s === st.cur && !st.clip) return;
      st.clip = null; st.prevPose = st.lastPose || null; st.prev = st.cur; st.cur = s; st.k = 0; st.waited = 0;
    },
    advance(d) { st.phase = (st.phase + d) % 1; if (st.phase < 0) st.phase += 1; },
    setPhase(p) { st.phase = p; },
    setEnergy(e) { st.energy = e; },
    variant(v) { st.variant = v; },
    get current() { return st.cur; },
    face(dir) { st.yawTarget = dir > 0 ? faceYaw : dir < 0 ? -faceYaw : 12; },
    // un giro grande y rápido (ponerse a tirar de la cuerda) se da con un saltito: los pies no patinan en el suelo
    yawTo(deg, snap = false) { if (!snap && Math.abs(deg - st.yaw) > 50) st.spin = 0; st.yawTarget = deg; if (snap) { st.yaw = deg; st.yawVel = 0; } },
    // hacia dónde mira: giro (+ a su izquierda, la derecha de la pantalla) y cabeceo (+ arriba), en grados
    look(yaw, pitch) { st.lookTo[0] = yaw; st.lookTo[1] = pitch; },
    // pieza con principio y fin; al acabar vuelve a 'then' (con transición) y llama a done
    play(name, { to = 12, then = 'idle', done } = {}) {
      if (!CLIPS[name]) return;
      st.prevPose = st.lastPose || null; st.waited = 0;
      st.clip = { name, t: 0, dur: CLIPS[name].dur, from: st.yaw, to, then, done, blendIn: 0 };
    },
    tick(dt) {
      st.t += dt;
      let q;
      if (st.clip) {
        const c = st.clip; c.t += dt; c.blendIn = Math.min(1, c.blendIn + dt / 0.22);
        q = c.name === 'turn' ? turn(c.t, c.from, c.to) : CLIPS[c.name].fn(c.t);
        if (c.name !== 'turn') {
          // mientras tanto, el giro del cuerpo sigue su muelle
          const a = (st.yawTarget - st.yaw) * 90 - st.yawVel * 13; st.yawVel += a * dt; st.yaw += st.yawVel * dt; q.yaw = st.yaw;
        }
        if (c.blendIn < 1 && st.prevPose) { const y = q.yaw; q = mix(st.prevPose, q, smooth(c.blendIn)); q.yaw = y; }
        if (c.name === 'turn') { st.yaw = q.yaw; st.yawTarget = c.to; st.yawVel = 0; }
        if (c.t >= c.dur) { st.clip = null; st.prevPose = q; st.prev = null; st.cur = c.then; st.k = 0; const f = c.done; if (f) f(); }
      } else {
        if (st.k < 1) st.k = Math.min(1, st.k + dt / 0.4);
        // giro con muelle amortiguado: se pasa un poco y vuelve, como un giro de verdad
        const a = (st.yawTarget - st.yaw) * 90 - st.yawVel * 13;
        st.yawVel += a * dt; st.yaw += st.yawVel * dt;
        q = poseOf(st.cur);
        if (st.k < 1) { const from = st.prevPose || (st.prev ? poseOf(st.prev) : q); q = mix(from, q, smooth(st.k), back(st.k)); }
        else st.prevPose = null;
        q.yaw = st.yaw;
        // en reposo, un gesto suelto de vez en cuando
        if (fidget && st.cur === 'idle' && st.k >= 1) {
          st.waited += dt;
          if (st.waited > st.nextFidget) { st.nextFidget = 7 + Math.random() * 7; st.lastPose = q; api.play(FIDGETS[st.fi++ % FIDGETS.length], { then: 'idle' }); }
        } else st.waited = 0;
      }
      if (st.spin !== undefined && st.spin !== null) {
        st.spin += dt; const u = st.spin / 0.36;
        if (u >= 1) st.spin = null; else { q = { ...q, hop: (q.hop || 0) + 0.03 * Math.sin(Math.PI * u), squash: (q.squash || 0) - 0.025 * Math.sin(Math.PI * u) + 0.03 * bump(u, 0.8, 1.15) }; }
      }
      st.lastPose = q;
      // la mirada se suma al final (no entra en las mezclas): cabeza, y algo de cuello y pecho
      const kk = 1 - Math.exp(-dt * 6), want = LOOKS[api.state] ?? 0;
      st.look[0] += (st.lookTo[0] - st.look[0]) * kk; st.look[1] += (st.lookTo[1] - st.look[1]) * kk; st.lookW += (want - st.lookW) * (1 - Math.exp(-dt * 5));
      if (st.lookW > 0.01 && (Math.abs(st.look[0]) > 0.05 || Math.abs(st.look[1]) > 0.05)) {
        const w = st.lookW, y = st.look[0] * w, x = st.look[1] * w; q = { ...q };
        q.Head = addV(q.Head, { y: 0.58 * y, x: 0.7 * x }); q.Neck = addV(q.Neck, { y: 0.26 * y, x: 0.2 * x }); q.Spine2 = addV(q.Spine2, { y: 0.16 * y });
      }
      return q;
    },
    busy() { return !!st.clip || st.k < 1 || Math.abs(st.yawTarget - st.yaw) > 0.3 || Math.abs(st.yawVel) > 0.3; }
  };
  return api;
}
