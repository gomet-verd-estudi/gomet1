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

// De pie, desde la pose neutra del motor (brazos en cruz, piernas rectas, pies al frente): los brazos caídos a los
// lados con el codo suelto y las manos algo al frente. hands: hacia dónde mira el pulgar de cada mano.
export const BASE = {
  LeftArm: { z: -66, x: -10 }, RightArm: { z: 66, x: -10 },
  LeftForeArm: { x: -26 }, RightForeArm: { x: -26 },
  LeftUpLeg: { z: 7 }, RightUpLeg: { z: -7 },
  Spine: { x: 1 }, Head: { x: -2 },
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
let RIG = { H: 0.978, floor: 0, hips: [0, 0.361, 0], head: [0, 0.69, 0.019], top: 0.978, chest: [0, 0.541, 0.004],
  Left: { hip: [0.076, 0.33, 0.004], thigh: 0.142, shin: 0.153, ah: 0.055, back: 0.028, F: 0.163, shoulder: [0.111, 0.609, -0.011], upper: 0.091, fore: 0.092 },
  Right: { hip: [-0.076, 0.33, 0.004], thigh: 0.142, shin: 0.153, ah: 0.055, back: 0.028, F: 0.163, shoulder: [-0.111, 0.609, -0.011], upper: 0.091, fore: 0.098 } };
export function setRig(r) { if (r && r.Left && r.Right) RIG = r; }
const STANCE = 0.6;
const LEG = () => RIG.Left.thigh + RIG.Left.shin;
const stepLen = (k) => 0.78 * LEG() * (0.85 + 0.15 * k);   // largo de un paso: unas tres cuartas partes de la pierna
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
  const lift = 0.13 * LEG() * Math.min(1.25, k) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), 2);
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
  const track = RIG.Left.hip[0] + 0.022 * RIG.H, H = RIG.H;
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
    LeftForeArm: { x: 6 - 18 * Math.max(0, -C(qL - 0.1)) }, RightForeArm: { x: 6 - 18 * Math.max(0, -C(qR - 0.1)) },
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
const FOOT_X = 0.105, FOOT_Z = 0.004;   // dónde pisa cada pie de pie (en alturas, respecto a la pelvis)
function stand(o) {
  const H = RIG.H, ax = FOOT_X * H, az = RIG.hips[2] + FOOT_Z * H;
  return legsAt([ax, RIG.floor + RIG.Left.ah, az], [-ax, RIG.floor + RIG.Right.ah, az], o);
}
const TOES = { Left: 6, Right: -6 };   // de pie, las puntas un poco abiertas
// Dónde llega la mano: un punto respecto al hombro, en largos de brazo (hacia fuera, arriba, al frente). Así los gestos
// valen para cualquier modelo: este tiene los brazos cortos y las manos grandes, y no llega a la cintura ni a la cara.
const ARM = (side) => RIG[side].upper + RIG[side].fore;
const hand_ = (side, o) => { const s = RIG[side].shoulder, sx = side === 'Left' ? 1 : -1, L = ARM(side); return [s[0] + sx * o[0] * L, s[1] + o[1] * L, s[2] + o[2] * L]; };
const elbow = (side, out, y, z = 0) => [(side === 'Left' ? 1 : -1) * out, y, z];   // hacia dónde apunta el codo
const hold = (x, g = 2.4) => Math.tanh(g * x) / Math.tanh(g);   // una onda con pausas en los extremos
const FWD = [0, 0, 1];   // el pulgar al frente: la mano caída, con la palma hacia el muslo

// Reposo: brazos caídos y sueltos; respira (pecho y hombros), cambia el peso de una pierna a otra con pausas, mira
// alrededor y las manos se mecen un poco
export function idle(t) {
  const br = S(t / 3.6), sh = hold(S(t / 12.5)), lk = S(t / 9.1 + 0.2), H = RIG.H;
  const q = add(BASE, {
    LeftArm: { z: 1.8 * br + 1.5 * sh, x: 2 * S(t / 5.3) }, RightArm: { z: -1.8 * br + 1.5 * sh, x: 2 * S(t / 5.3 + 0.4) },
    LeftForeArm: { x: -3 * br }, RightForeArm: { x: -3 * br },
    LeftShoulder: { z: 1.4 * br }, RightShoulder: { z: -1.4 * br },
    Hips: { z: -3 * sh }, Spine: { z: 2 * sh }, Spine2: { x: 1.6 * br, z: 1.1 * sh },
    Neck: { x: -0.8 * br }, Head: { y: 7 * lk, x: 1.2 * S(t / 4.7), z: -1.2 * sh }
  });
  q.legs = stand({ sway: 0.02 * H * sh, dip: 0.003 * H * (1 - br) + 0.005 * H * Math.abs(sh) });
  q.soleYaw = TOES;
  return q;
}

/* Hablar, con tres maneras de explicarse (v):
   0 «presenta la obra»: el brazo derecho extendido hacia ella con la palma abierta, y la cabeza va de la obra a quien lee;
   1 «explica»: las dos manos delante con las palmas hacia arriba, marcando el ritmo una y otra;
   2 «da el parte»: los brazos caídos, asiente y se balancea.
   El cuerpo marca el ritmo de la frase. */
export function talk(t, v = 0) {
  const f = 1.45, beat = S(t * f), nod = S(t * f - 0.12), em = pos(S(t * f)), H = RIG.H;
  const q = add(BASE, {
    Spine: { x: -1.5 + 1.2 * beat }, Spine2: { y: v === 0 ? -6 : 0, x: 1 * em },
    LeftShoulder: { z: 1.2 * em }, RightShoulder: { z: -1.2 * em },
    Head: { x: -2 + 4 * nod, z: v === 2 ? 2 * S(t * f / 2) : 0 }
  });
  q.hands = { Left: { thumb: FWD }, Right: { thumb: FWD } };
  if (v === 0) {
    // mira hacia la obra (a su derecha) al empezar cada frase y vuelve a quien lee
    const look = bump(t % 4.2, 0.1, 1.5);
    q.Head.y = -24 * look; q.Neck = { y: -8 * look }; q.Spine = addV(q.Spine, { z: -4 });
    q.reach = { Right: { at: hand_('Right', [0.93 + 0.03 * em, 0.22 + 0.05 * beat, 0.2]), pole: elbow('Right', 0.3, 0.2, -0.1) } };
    q.hands.Right = { thumb: [0, 1, 0.25] };   // la palma, abierta hacia quien mira
  } else if (v === 1) {
    const l = S(t * f), r = S(t * f + 0.5);
    q.reach = { Left: { at: hand_('Left', [0.5, -0.42 + 0.07 * l, 0.72]), pole: elbow('Left', 0.5, 0.2, -0.1) }, Right: { at: hand_('Right', [0.5, -0.42 + 0.07 * r, 0.72]), pole: elbow('Right', 0.5, 0.2, -0.1) } };
    q.hands = { Left: { thumb: [1, 0.35, 0.2] }, Right: { thumb: [-1, 0.35, 0.2] } };   // palmas hacia arriba
    q.Head.y = 5 * S(t * f / 2);
  } else {
    q.Head.y = 6 * S(t * f / 4); q.LeftArm = addV(q.LeftArm, { z: 3 * em, x: -4 * em }); q.RightArm = addV(q.RightArm, { z: -3 * em, x: -4 * em });
  }
  q.legs = stand({ sway: 0.006 * H * S(t * f / 2), dip: 0.007 * H * em });
  q.soleYaw = TOES;
  return q;
}

/* Tirar de la cuerda (de perfil): la página sube o baja porque él la mueve. p ∈ [0, 1) es la fase: cada mano
   agarra arriba y baja tirando (medio ciclo) mientras la otra suelta, sube por fuera y vuelve a agarrar. Al hacer
   scroll hacia arriba la fase va al revés: la mano que agarra sube con la cuerda (la deja subir) y la otra baja.
   Postura de tirar: pierna cercana adelantada y flexionada, la otra atrás, cuerpo echado atrás en cada tirón. */
export const ROPE_HI = 0.624, ROPE_LO = 0.514, ROPE_Z = 0.165;
export const ropePerPhase = 2 * (ROPE_HI - ROPE_LO); // cuerda que corre por cada ciclo de fase
// (la muñeca va antes de la cuerda y a su lado: lo que agarra es la palma, y las manos son grandes. Los brazos son
// cortos: tira echado hacia atrás, con los brazos casi estirados, y así la cabeza y el casco no tocan la cuerda)
function hand(p, side) {
  const t = ((p % 1) + 1) % 1, x = side * 0.07, z = ROPE_Z - 0.068;   // cada mano, a su lado de la cuerda
  if (t < 0.5) { const u = t / 0.5; return [x, ROPE_HI - (ROPE_HI - ROPE_LO) * u, z]; } // agarrada, tira
  const u = (t - 0.5) / 0.5, e = u * u * (3 - 2 * u), a = Math.sin(Math.PI * u);
  return [x + side * 0.03 * a, ROPE_LO + (ROPE_HI - ROPE_LO) * e, z - 0.035 * a];         // suelta, sube pegada al cuerpo
}
export function haul(p) {
  const pull = Math.pow(Math.abs(Math.sin(Math.PI * 2 * p)), 0.8); // dos tirones por ciclo, uno por mano
  const tug = Math.sin(Math.PI * 4 * p - 0.6);                       // rebote del cuerpo en cada tirón
  const side = Math.sin(Math.PI * 2 * p), H = RIG.H;                 // qué mano tira (+ izquierda)
  const q = add(BASE, {
    // echado hacia atrás desde la cadera, colgándose de la cuerda; en cada tirón se echa un poco más y gira el pecho
    // hacia la mano que tira
    Hips: { x: -9 - 3 * pull }, Spine: { x: -3 - 2 * pull, y: 4 * side }, Spine1: { y: 5 + 4 * side }, Spine2: { y: 5 + 3 * side },
    // los hombros, adelantados (los brazos no dan más de sí)
    LeftShoulder: { y: -12 }, RightShoulder: { y: 12 },
    // mira arriba, a la polea, y un poco hacia quien lee (está de perfil, mirando a la izquierda)
    Neck: { x: -3 }, Head: { x: -5 - 3 * tug, y: 20 },
    squash: 0.02 * pull
  });
  // plantado en zancada: un pie adelantado y el otro atrás; con cada tirón dobla las rodillas
  const tr = RIG.Left.hip[0] + 0.02 * H, ah = RIG.floor + RIG.Left.ah;
  q.legs = legsAt([tr, ah, 0.1 * H], [-tr, ah, -0.085 * H], { fwd: -0.004 * H, dip: 0.01 * H + 0.022 * H * pull });
  q.soleYaw = { Left: 4, Right: -12 };
  q.reach = { Left: { at: hand(p, 1), pole: [0.5, 0.1, -0.2] }, Right: { at: hand(p + 0.5, -1), pole: [-0.5, 0.1, -0.2] } };
  q.hands = { Left: { thumb: [0, 1, 0] }, Right: { thumb: [0, 1, 0] } };   // las palmas enfrentadas, abrazando la cuerda
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

/* Saludar con la mano: se agacha un pelo (anticipación), levanta el brazo derecho con la palma abierta hacia quien
   lee, la agita tres veces (el antebrazo va de lado a lado con el codo quieto), ladea la cabeza y lo baja. */
export const GREET = 2.5;
export function greet(t) {
  const up = eio(win(t, 0.08, 0.5)) * (1 - eio(win(t, 2.0, 2.5))), antic = bump(t, 0, 0.22), H = RIG.H;
  const w = Math.sin(win(t, 0.45, 2.0) * Math.PI * 6) * bump(t, 0.4, 2.05);
  const q = add(BASE, { Spine: { z: -3 * up, x: -1 * up }, Spine2: { y: 4 * up }, Head: { x: -2 - 2 * up, z: 4 * up + 2 * w * up, y: 3 * up } });
  q.reach = { Right: { at: hand_('Right', [0.62 + 0.2 * w, 0.72 - 0.06 * Math.abs(w), 0.18]), pole: elbow('Right', 0.5, 0.35, -0.05), w: up } };
  q.hands = { Left: { thumb: FWD }, Right: { thumb: mixP(FWD, [1, 0.2, 0], up) } };   // la palma hacia quien mira
  q.legs = stand({ dip: 0.012 * H * antic, sway: 0.006 * H * up }); q.soleYaw = TOES;
  return q;
}

/* Celebrar (fin de obra): se agacha, salta con los dos brazos arriba y las manos abiertas, y cae amortiguando;
   aguanta un momento y baja. */
export const CHEER = 1.9;
export function cheer(t) {
  const crouch = bump(t, 0, 0.34), air = win(t, 0.3, 0.74), land = bump(t, 0.72, 1.02), H = RIG.H;
  const up = eio(win(t, 0.16, 0.44)) * (1 - eio(win(t, 1.4, 1.9)));
  const q = add(BASE, {
    Spine: { x: 3 * crouch - 3 * up }, Head: { x: -2 + 5 * crouch - 6 * up },
    squash: 0.05 * crouch - 0.04 * Math.sin(Math.PI * air) + 0.05 * land,
    hop: 0.085 * Math.sin(Math.PI * air)
  });
  const pump = 0.08 * S(win(t, 0.74, 1.4) * 2) * up;
  q.reach = { Left: { at: hand_('Left', [0.5, 0.84 + pump, 0.06]), pole: elbow('Left', 0.6, 0.5, -0.1), w: up }, Right: { at: hand_('Right', [0.5, 0.84 + pump, 0.06]), pole: elbow('Right', 0.6, 0.5, -0.1), w: up } };
  q.hands = { Left: { thumb: mixP(FWD, [-1, 0.2, 0], up) }, Right: { thumb: mixP(FWD, [1, 0.2, 0], up) } };   // palmas al frente
  q.legs = stand({ dip: 0.03 * H * crouch + 0.02 * H * land }); q.soleYaw = TOES;
  return q;
}

/* Respuesta a un toque: un saltito levantando la mano. */
export const HOP = 1.0;
export function hop(t) {
  const crouch = bump(t, 0, 0.22), air = win(t, 0.18, 0.5), land = bump(t, 0.48, 0.72), H = RIG.H;
  const up = eio(win(t, 0.1, 0.32)) * (1 - eio(win(t, 0.72, 1.0)));
  const q = add(BASE, { Head: { x: -2 + 4 * crouch - 4 * up }, squash: 0.04 * crouch - 0.03 * Math.sin(Math.PI * air) + 0.04 * land, hop: 0.045 * Math.sin(Math.PI * air) });
  q.reach = { Right: { at: hand_('Right', [0.62, 0.72, 0.18]), pole: elbow('Right', 0.5, 0.35, -0.05), w: up } };
  q.hands = { Left: { thumb: FWD }, Right: { thumb: mixP(FWD, [1, 0.2, 0], up) } };
  q.legs = stand({ dip: 0.02 * H * crouch + 0.014 * H * land }); q.soleYaw = TOES;
  return q;
}

/* Gestos sueltos mientras espera (uno cada tanto, al azar):
   mirar la obra (cabeza y pecho hacia ella, echándose un poco), colocarse el casco y mecerse de puntas a talones. */
export const PEEK = 2.8, HAT = 2.0, ROCK = 2.4;
export function peek(t) {
  const k = eio(win(t, 0, 0.6)) * (1 - eio(win(t, 2.1, 2.8))), H = RIG.H;
  const q = add(BASE, { Spine: { y: -8 * k, z: -2 * k }, Spine2: { y: -10 * k }, Neck: { y: -10 * k }, Head: { y: -24 * k, x: -2 + 2 * k + 2 * bump(t, 1.0, 1.9) } });
  q.legs = stand({ sway: -0.014 * H * k, dip: 0.004 * H * k }); q.soleYaw = TOES;
  return q;
}
export function hat(t) {
  const up = eio(win(t, 0.05, 0.5)) * (1 - eio(win(t, 1.45, 2.0))), fix = S(win(t, 0.55, 1.4) * 1.5) * bump(t, 0.5, 1.45);
  const q = add(BASE, { Head: { x: -2 - 4 * up, z: 4 * fix }, Spine: { z: -2 * up } });
  q.reach = { Right: { at: hand_('Right', [0.3, 0.9 + 0.04 * fix, 0.22]), pole: elbow('Right', 0.6, 0.45, -0.1), w: up } };
  q.hands = { Left: { thumb: FWD }, Right: { thumb: mixP(FWD, [0.6, -0.3, -0.6], up) } };
  q.legs = stand(); q.soleYaw = TOES;
  return q;
}
export function rock(t) {
  const r = S(win(t, 0.1, 2.3) * 2) * bump(t, 0, 2.4), H = RIG.H;   // + de puntillas, − sobre los talones
  const q = add(BASE, { Spine: { x: -1.5 * r }, Head: { x: -2 + 1.5 * r }, LeftArm: { z: 2 * pos(r), x: 3 * r }, RightArm: { z: -2 * pos(r), x: 3 * r } });
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
