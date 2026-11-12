/*
 * El capataz en 3D, renderizado como dibujo:
 *  - colores planos, sin luces ni sombras;
 *  - trazo principal de grosor uniforme en pantalla donde cambia el color o la profundidad (silueta, piezas que se tapan);
 *  - trazo fino en los detalles interiores (pliegues, dedos, costuras, bolsillos): Sobel sobre las normales del modelo
 *    con su mapa de relieve ya limpio, y opcionalmente un mapa de pliegues dibujados, pegado al modelo.
 * El esqueleto es el de Mixamo; las poses se aplican con giros en ejes del mundo sobre la pose de reposo.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function createCapataz({ canvas, url, gltfBuffer = null, texture, textureBlink = null, textureTalk = null, relief, folds = null, line = 3, fine = 1, fineThreshold = 1.0, ink = '#0A9651', fill = '#F4EFE6', background = null, riso = 0, ss = 2, reliefScale = 1.4, colour = false, palette = null, flipY = false, height = 0.978, thumbs = { Left: 'LeftHandThumb', Right: 'RightHandThumb' }, fist = null, skinLines = 1.6 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  const load = (u) => new THREE.TextureLoader().loadAsync(u);
  const [gltf, tex, bump, foldTex, texB, texT] = await Promise.all([gltfBuffer ? new GLTFLoader().parseAsync(gltfBuffer, '') : new GLTFLoader().loadAsync(url), load(texture), load(relief), folds ? load(folds) : null, textureBlink ? load(textureBlink) : null, textureTalk ? load(textureTalk) : null]);
  for (const t of [tex, texB, texT]) { if (!t) continue; t.flipY = flipY; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; } // colores puros, sin mezclas en los bordes
  bump.flipY = false; bump.colorSpace = THREE.NoColorSpace;
  if (foldTex) { foldTex.flipY = false; foldTex.colorSpace = THREE.NoColorSpace; }
  // El modelo va dentro de `root`, que es el espacio del personaje: y arriba, z al frente, pies en el suelo (y = 0),
  // la pelvis sobre el origen y la altura fijada. Cada modelo viene a su manera (este, tumbado y en centímetros), así
  // que se coloca solo a partir del esqueleto: arriba es de la pelvis a la cabeza y el frente, hacia donde van las puntas.
  const inner = gltf.scene, root = new THREE.Group(); root.add(inner); scene.add(root);
  let mesh = null;
  inner.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; mesh = o; } });
  const B = {}; inner.traverse((o) => { if (o.isBone) B[o.name.replace(/^mixamorig:?/, '')] = o; });
  {
    inner.updateMatrixWorld(true);
    const P = (n) => B[n].getWorldPosition(new THREE.Vector3());
    const snap = (v) => { const a = [Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)], i = a.indexOf(Math.max(...a)); return new THREE.Vector3(i === 0 ? Math.sign(v.x) : 0, i === 1 ? Math.sign(v.y) : 0, i === 2 ? Math.sign(v.z) : 0); };
    const up = snap(P('Head').sub(P('Hips')));
    const toes = P('LeftToeBase').add(P('RightToeBase')).sub(P('LeftFoot')).sub(P('RightFoot')); toes.addScaledVector(up, -toes.dot(up));
    const fwd = snap(toes), side = new THREE.Vector3().crossVectors(up, fwd);
    inner.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, fwd).transpose()));
    inner.updateMatrixWorld(true); mesh.computeBoundingBox();
    let bb = new THREE.Box3().setFromObject(inner);
    inner.scale.multiplyScalar(height / (bb.max.y - bb.min.y)); inner.updateMatrixWorld(true);
    bb = new THREE.Box3().setFromObject(inner); const hp = P('Hips');
    inner.position.x -= hp.x; inner.position.z -= hp.z; inner.position.y -= bb.min.y; inner.updateMatrixWorld(true);
    mesh.computeBoundingBox();
  }
  const flatMat = new THREE.MeshBasicMaterial({ map: tex });
  // pasada de detalle: normales con relieve en RGB y el mapa de pliegues dibujados en A
  const detailMat = new THREE.MeshNormalMaterial({ normalMap: bump, normalScale: new THREE.Vector2(reliefScale, reliefScale) });
  detailMat.onBeforeCompile = (sh) => {
    sh.uniforms.tFolds = { value: foldTex };
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform sampler2D tFolds;\nvoid main() {')
      .replace(/gl_FragColor = vec4\( packNormalToRGB\( normal \), diffuseColor\.a \);[\s\S]*?#endif/, `gl_FragColor = vec4( packNormalToRGB( normal ), ${foldTex ? '1.0 - texture2D( tFolds, vNormalMapUv ).r' : '1.0'} );`);
  };
  mesh.material = flatMat;
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3());

  // ---- huesos y pose ----
  const rest = new Map();
  const restPos = B.Hips.position.clone();
  const _q = new THREE.Quaternion(), _pw = new THREE.Quaternion(), _rw = new THREE.Quaternion(), _ax = new THREE.Vector3(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
  // gira el hueso alrededor de un eje del personaje (x: adelante/atrás, y: girar, z: de lado), aunque el personaje esté girado
  function turn(name, axis, deg) {
    const b = B[name]; if (!b || !deg) return;
    root.getWorldQuaternion(_rw); b.parent.getWorldQuaternion(_pw);
    _pw.premultiply(_rw.invert());
    _ax.copy(axis).applyQuaternion(_pw.invert()).normalize();
    b.quaternion.premultiply(_q.setFromAxisAngle(_ax, deg * Math.PI / 180));
  }
  root.updateMatrixWorld(true);
  // La suela de cada bota, con dos puntos pegados a sus huesos: el talón (bajo el tobillo, un poco atrás) y la punta
  // (delante del metatarso). El suelo se apoya siempre en el punto más bajo: al pisar entra el talón, el pie rueda
  // y despega de la punta, sin hundirse ni flotar.
  const floor = box.min.y;
  const SOLE = [];
  for (const side of ['Left', 'Right']) {
    const F = B[side + 'Foot'], T = B[side + 'ToeBase'] || F; if (!F) continue;
    const a = F.getWorldPosition(new THREE.Vector3()), b = T.getWorldPosition(new THREE.Vector3());
    const fwd = b.clone().sub(a).setY(0); const len = Math.max(fwd.length(), size.y * 0.04); fwd.normalize();
    const heel = new THREE.Vector3(a.x, floor, a.z).addScaledVector(fwd, -len * 0.3), toe = new THREE.Vector3(b.x, floor, b.z).addScaledVector(fwd, len * 0.45);
    SOLE.push({ bone: F, at: F.worldToLocal(heel) }, { bone: T, at: T.worldToLocal(toe) });
  }
  const NORMAL = {};
  for (const side of ['Left', 'Right']) if (B[side + 'Foot']) NORMAL[side] = new THREE.Vector3(0, 1, 0).applyQuaternion(B[side + 'Foot'].getWorldQuaternion(new THREE.Quaternion()).invert());
  const soleY = (s) => s.bone.localToWorld(_v.copy(s.at)).y;
  const _h = new THREE.Vector3(), _t = new THREE.Vector3();
  const footMin = () => Math.min(...SOLE.map(soleY));
  const restFoot = footMin();
  // el punto de la suela que está en el suelo y su x en el mundo (la cámara mira de frente): para avanzar sin patinar
  function planted() {
    let i = 0, y = Infinity; SOLE.forEach((s, k) => { const v = soleY(s); if (v < y - 1e-6) { y = v; i = k; } });
    return { i, x: SOLE[i].bone.localToWorld(_v.copy(SOLE[i].at)).x };
  }
  const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
  const ORDER = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
    'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
    'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];
  // pose: ángulos por hueso; yaw: hacia dónde mira; squash: aplastar (+) o estirar (−) sobre el suelo
  // Brazo con cinemática inversa: la mano llega a un punto (en el espacio del personaje) con el codo hacia el polo
  const _S = new THREE.Vector3(), _E = new THREE.Vector3(), _H = new THREE.Vector3(), _T = new THREE.Vector3(), _Po = new THREE.Vector3(),
    _n = new THREE.Vector3(), _pp = new THREE.Vector3(), _E2 = new THREE.Vector3(), _T2 = new THREE.Vector3(), _va = new THREE.Vector3(), _vb = new THREE.Vector3(),
    _qw = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _qd = new THREE.Quaternion();
  function aim(bone, from, to) {
    _qd.setFromUnitVectors(from.normalize(), to.normalize());
    bone.getWorldQuaternion(_qw); bone.parent.getWorldQuaternion(_qp);
    bone.quaternion.copy(_qp.invert().multiply(_qd.multiply(_qw))); bone.updateMatrixWorld(true);
  }
  const _qa = new THREE.Quaternion(), _qf = new THREE.Quaternion();
  // dos huesos (brazo y antebrazo, o muslo y espinilla): el extremo llega al punto t (espacio del personaje) con la
  // articulación del medio hacia el polo; w mezcla con la pose que ya tenían
  function ik2(A, F, H, t, pole, w = 1) {
    if (!A || !F || !H || w <= 0) return;
    _qa.copy(A.quaternion); _qf.copy(F.quaternion);
    A.getWorldPosition(_S); F.getWorldPosition(_E); H.getWorldPosition(_H);
    const l1 = _S.distanceTo(_E), l2 = _E.distanceTo(_H);
    root.localToWorld(_T.set(t[0], t[1], t[2])); root.localToWorld(_Po.set(pole[0], pole[1], pole[2]));
    _n.subVectors(_T, _S); let d = _n.length(); _n.normalize(); d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
    _pp.subVectors(_Po, _S); _pp.addScaledVector(_n, -_pp.dot(_n)).normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    _E2.copy(_S).addScaledVector(_n, a).addScaledVector(_pp, h); _T2.copy(_S).addScaledVector(_n, d);
    aim(A, _va.subVectors(_E, _S), _vb.subVectors(_E2, _S));
    F.getWorldPosition(_E); H.getWorldPosition(_H);
    aim(F, _va.subVectors(_H, _E), _vb.subVectors(_T2, _E));
    if (w < 1) { A.quaternion.slerpQuaternions(_qa, A.quaternion.clone(), w); F.quaternion.slerpQuaternions(_qf, F.quaternion.clone(), w); A.updateMatrixWorld(true); }
  }
  const reach = (side, t, pole, w) => ik2(B[side + 'Arm'], B[side + 'ForeArm'], B[side + 'Hand'], t, pole, w);
  // medidas de las piernas y los pies en reposo (unidades del mundo, suelo en floor): para planear los pasos
  const rig = (() => {
    const g = (n) => B[n].getWorldPosition(new THREE.Vector3()), o = { H: size.y, floor, hips: g('Hips').toArray() };
    for (const side of ['Left', 'Right']) {
      const hip = g(side + 'UpLeg'), knee = g(side + 'Leg'), ank = g(side + 'Foot'), toe = g(side + 'ToeBase');
      const len = Math.hypot(toe.x - ank.x, toe.z - ank.z);
      o[side] = { hip: hip.toArray(), thigh: hip.distanceTo(knee), shin: knee.distanceTo(ank), ah: ank.y - floor, back: len * 0.3, F: len * 1.75 };
      // brazos: el hombro, y lo que miden el brazo y el antebrazo (para colocar los gestos al alcance de la mano)
      const sh = g(side + 'Arm'), el = g(side + 'ForeArm'), wr = g(side + 'Hand');
      o[side].shoulder = sh.toArray(); o[side].upper = sh.distanceTo(el); o[side].fore = el.distanceTo(wr);
    }
    o.head = g('Head').toArray(); o.top = box.max.y; o.chest = g('Spine2').toArray();
    return o;
  })();
  const _hp = new THREE.Vector3(), _hc = new THREE.Vector3();
  // Orientación de las manos. Los auto-rig no dejan las dos manos iguales, así que no vale girarlas igual: se mide en
  // cada una hacia dónde queda el pulgar (perpendicular al antebrazo) y se guarda en el espacio del hueso de la mano.
  const THUMB = {};
  for (const side of ['Left', 'Right']) {
    const H = B[side + 'Hand'], F = B[side + 'ForeArm'], T = B[thumbs[side] + '4'] || B[thumbs[side] + '3'] || B[thumbs[side] + '2']; if (!H || !F || !T) continue;
    const h = H.getWorldPosition(new THREE.Vector3()), a = h.clone().sub(F.getWorldPosition(new THREE.Vector3())).normalize();
    const v = T.getWorldPosition(new THREE.Vector3()).sub(h); v.addScaledVector(a, -v.dot(a)).normalize();
    THUMB[side] = v.applyQuaternion(H.getWorldQuaternion(new THREE.Quaternion()).invert());
  }
  // Pose neutra común: cada modelo viene posado a su manera (este, en aspa), así que antes de animar se lleva a una
  // misma pose de partida: brazos en cruz, piernas rectas hacia abajo y pies al frente con la planta plana. Los ángulos
  // de las animaciones se cuentan desde aquí y valen para cualquier modelo.
  {
    const V = THREE.Vector3, Q = THREE.Quaternion, wp = (b) => b.getWorldPosition(new V());
    const setW = (b, qw) => { b.parent.getWorldQuaternion(_qp); b.quaternion.copy(_qp.invert().multiply(qw)); b.updateMatrixWorld(true); };
    const aimTo = (b, c, dir) => { if (!b || !c) return; const from = wp(c).sub(wp(b)).normalize(); setW(b, new Q().setFromUnitVectors(from, dir).multiply(b.getWorldQuaternion(new Q()))); };
    root.updateMatrixWorld(true);
    for (const [side, sx] of [['Left', 1], ['Right', -1]]) {
      const X = new V(sx, 0, 0), D = new V(0, -1, 0), Yax = new V(0, 1, 0);
      aimTo(B[side + 'Arm'], B[side + 'ForeArm'], X); aimTo(B[side + 'ForeArm'], B[side + 'Hand'], X); aimTo(B[side + 'Hand'], B[side + 'HandMiddle1'], X);
      const F = B[side + 'Foot'], T = B[side + 'ToeBase'], f0 = F.getWorldQuaternion(new Q()), t = wp(T).sub(wp(F)), yaw = Math.atan2(t.x, t.z);
      aimTo(B[side + 'UpLeg'], B[side + 'Leg'], D); aimTo(B[side + 'Leg'], F, D);
      // el pie mira al frente: la pierna entera gira desde la cadera la mayor parte y el tobillo el resto (así la bota no se retuerce)
      setW(B[side + 'UpLeg'], new Q().setFromAxisAngle(Yax, -yaw * 0.65).multiply(B[side + 'UpLeg'].getWorldQuaternion(new Q())));
      setW(F, new Q().setFromAxisAngle(Yax, -yaw).multiply(f0));
    }
    Object.values(B).forEach((b) => rest.set(b, b.quaternion.clone()));
  }
  const _ha = new THREE.Vector3(), _hcur = new THREE.Vector3(), _hw = new THREE.Vector3(), _hx = new THREE.Vector3(), _rq = new THREE.Quaternion();
  // Gira el antebrazo entero sobre su eje (desde el codo) hasta que el lado del pulgar mire hacia `to` (dirección en
  // el espacio del personaje). El guante y su puño giran de una pieza, rígidos: la malla no admite girar la muñeca
  // (el puño se retuerce contra el puño de la manga). La palma y el dorso salen solos.
  function rollHand(side, to, w = 1) {
    const H = B[side + 'Hand'], F = B[side + 'ForeArm'], tl = THUMB[side]; if (!H || !F || !tl || w <= 0) return;
    F.updateWorldMatrix(true, true);
    H.getWorldPosition(_H); F.getWorldPosition(_E); _ha.subVectors(_H, _E).normalize();
    H.getWorldQuaternion(_qw); _hcur.copy(tl).applyQuaternion(_qw); _hcur.addScaledVector(_ha, -_hcur.dot(_ha));
    root.getWorldQuaternion(_rq); _hw.set(to[0], to[1], to[2]).applyQuaternion(_rq); _hw.addScaledVector(_ha, -_hw.dot(_ha));
    if (_hcur.lengthSq() < 1e-8 || _hw.lengthSq() < 1e-8) return;
    _hcur.normalize(); _hw.normalize();
    const ang = Math.atan2(_ha.dot(_hx.crossVectors(_hcur, _hw)), _hcur.dot(_hw));
    _qd.setFromAxisAngle(_ha, ang * w); F.getWorldQuaternion(_qw); F.parent.getWorldQuaternion(_qp);
    F.quaternion.copy(_qp.invert().multiply(_qd.multiply(_qw))); F.updateMatrixWorld(true);
  }
  function pose(p = {}) {
    rest.forEach((q, b) => b.quaternion.copy(q)); B.Hips.position.copy(restPos);
    root.position.set(0, 0, 0); root.rotation.set(0, (p.yaw || 0) * Math.PI / 180, 0);
    const sq = p.squash || 0; root.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
    root.updateMatrixWorld(true);
    // la pelvis, a una altura y posición dadas (al andar sube y baja y se mece hacia la pierna de apoyo)
    if (p.legs && p.legs.hip) {
      const w = p.legs.w ?? 1; B.Hips.getWorldPosition(_hc); root.localToWorld(_hp.fromArray(p.legs.hip)); _hc.lerp(_hp, w);
      B.Hips.position.copy(B.Hips.parent.worldToLocal(_hc)); B.Hips.updateMatrixWorld(true);
    }
    for (const n of ORDER) {
      const r = p[n]; if (!r) continue;
      // primero se abre o cierra (z), luego gira sobre sí mismo (y) y al final se balancea (x)
      if (r.z) turn(n, AX.z, r.z); if (r.y) turn(n, AX.y, r.y); if (r.x) turn(n, AX.x, r.x);
      B[n].updateMatrixWorld(true);
    }
    // giros en los ejes propios de cada hueso (torsión del antebrazo, muñeca, dedos): { Hueso: { x, y, z } } en grados
    if (p.local) for (const n in p.local) { const b = B[n], r = p.local[n]; if (!b) continue; if (r.z) b.rotateZ(r.z * Math.PI / 180); if (r.y) b.rotateY(r.y * Math.PI / 180); if (r.x) b.rotateX(r.x * Math.PI / 180); }
    // manos: cuánto se cierra cada una, de 0 (como viene, abierta) a 1 (puño). fist (opción): por mano, qué huesos
    // de los dedos giran, sobre qué eje propio y cuántos grados a puño cerrado
    if (fist && p.grip) for (const side of ['Left', 'Right']) {
      const g = p.grip[side], f = fist[side]; if (!g || !f) continue;
      for (const [name, ax, deg] of f) { const b = B[name]; if (!b) continue; const a = deg * g * Math.PI / 180; if (ax === 'x') b.rotateX(a); else if (ax === 'y') b.rotateY(a); else b.rotateZ(a); }
    }
    root.updateMatrixWorld(true);
    // piernas por cinemática inversa: el tobillo va a su sitio y la rodilla mira al polo (delante)
    if (p.legs) for (const side of ['Left', 'Right']) { const L = p.legs[side]; if (L) ik2(B[side + 'UpLeg'], B[side + 'Leg'], B[side + 'Foot'], L.ankle, L.pole, p.legs.w ?? 1); }
    // Planta del pie: primero plana del todo (la normal de la suela hacia arriba, así tampoco queda de canto cuando la
    // pierna se abre), luego el rumbo si se pide (al andar, la bota al frente) y al final el cabeceo (− punta arriba:
    // talón al pisar, plano al cargar, punta al despegar).
    for (const [k, side] of [[0, 'Left'], [1, 'Right']]) {
      const F = B[side + 'Foot'], t = (p.sole && p.sole[side]) || 0; if (!F || !SOLE[2 * k] || !NORMAL[side]) continue;
      F.getWorldQuaternion(_qw); _hx.copy(NORMAL[side]).applyQuaternion(_qw); root.getWorldQuaternion(_rq); _hw.set(0, 1, 0).applyQuaternion(_rq);
      _qd.setFromUnitVectors(_hx.normalize(), _hw); F.parent.getWorldQuaternion(_qp); F.quaternion.copy(_qp.invert().multiply(_qd.multiply(_qw))); F.updateMatrixWorld(true);
      const yw = p.soleYaw && p.soleYaw[side];
      if (yw !== undefined) {
        root.worldToLocal(SOLE[2 * k].bone.localToWorld(_h.copy(SOLE[2 * k].at))); root.worldToLocal(SOLE[2 * k + 1].bone.localToWorld(_t.copy(SOLE[2 * k + 1].at)));
        turn(side + 'Foot', AX.y, yw - Math.atan2(_t.x - _h.x, _t.z - _h.z) * 180 / Math.PI); F.updateMatrixWorld(true);
      }
      if (t) { turn(side + 'Foot', AX.x, t); F.updateMatrixWorld(true); }
    }
    if (p.reach) for (const side of ['Left', 'Right']) { const r = p.reach[side]; if (r) reach(side, r.at, r.pole, r.w ?? 1); }
    // hacia dónde mira el pulgar de cada mano: hands: { Left: { thumb: [x, y, z], w }, Right: … }
    if (p.hands) for (const side of ['Left', 'Right']) { const h = p.hands[side]; if (h) rollHand(side, h.thumb, h.w ?? 1); }
    // pies en el suelo: el pie más bajo apoya siempre en el suelo (de ahí sale el sube y baja natural del paso)
    root.position.y = restFoot * (1 - sq) - footMin() + (p.hop || 0) * size.y;
    root.updateMatrixWorld(true);
  }

  // ---- pasada de línea ----
  // sin interpolar: al leer el color entre dos píxeles saldrían mezclas que no son de la paleta (y contornos falsos)
  const rt = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const rtD = new THREE.WebGLRenderTarget(1, 1);
  const hex = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  // paleta: { colours: ['#…'], roles: [0 | 1 | 2], paint: ['#…'] (opcional: con qué se pinta cada uno) }
  const PALV = (() => {
    const P = palette || { colours: ['#FFFFFF', '#FFCB2B', '#F4C2A4', '#2EA648', '#1F63D6', '#146E3C', '#3A3A3A', '#1B1919'], roles: [0, 0, 1, 0, 0, 0, 0, 2] };
    const pad = (a, f) => Array.from({ length: 16 }, (_, i) => f(a[Math.min(i, a.length - 1)]));
    return { n: P.colours.length, src: pad(P.colours, (c) => new THREE.Vector3(...hex(c))), dst: pad(P.paint || P.colours, (c) => new THREE.Vector3(...hex(c))), role: pad(P.roles, (r) => r) };
  })();
  const U = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, tDetail: { value: rtD.texture },
    px: { value: new THREE.Vector2() }, line: { value: line }, fine: { value: fine }, fineT: { value: fineThreshold },
    ink: { value: new THREE.Vector3(...hex(ink)) }, fillC: { value: new THREE.Vector3(...hex(fill || '#000000')) }, useFill: { value: fill ? 1 : 0 }, riso: { value: riso }, colour: { value: colour ? 1 : 0 },
    // a color: los colores de la textura (src), con cuál se pinta cada uno (dst) y su papel (role: 0 ropa y objetos,
    // 1 piel, 2 rasgo: cejas, ojos, bigote, dientes, pelo… que van sin contorno sobre la piel); el contorno va en `ink`
    src: { value: PALV.src }, dst: { value: PALV.dst }, role: { value: PALV.role }, npal: { value: PALV.n }, skinK: { value: skinLines },
    res: { value: new THREE.Vector2(1, 1) }, bg: { value: new THREE.Vector4(...(background ? hex(background) : [0, 0, 0]), background ? 1 : 0) }
  };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      uniform sampler2D tColor, tDepth, tDetail; uniform vec2 px; uniform float line, fine, fineT, useFill, riso, colour; uniform vec3 src[16], dst[16]; uniform float role[16]; uniform int npal; uniform float skinK; uniform vec3 ink, fillC; uniform vec4 bg; uniform vec2 res; varying vec2 vUv;
      // ---- risografía: ruido fijo en el papel (no parpadea entre fotogramas) ----
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      vec2 P;  // punto de muestreo con el borde un poco irregular, como la tinta al calar
      float d(vec2 o){ return texture2D(tDepth, P + o).x; }
      vec3 srgb(vec3 l){ return mix(l * 12.92, 1.055 * pow(l, vec3(1. / 2.4)) - 0.055, step(0.0031308, l)); }
      vec3 c(vec2 o){ return srgb(texture2D(tColor, P + o).rgb); }
      vec3 n(vec2 o){ return texture2D(tDetail, P + o).rgb * 2. - 1.; }
      float fo(vec2 o){ return 1. - texture2D(tDetail, P + o).a; }
      // zonas macizas de tinta: peto y pantalón (azul), botas (gris) y ojos, bigote y pelo (negro de la cabeza)
      // colores de la paleta que van a línea (piel, blanco, amarillo, verde); lo que no es ni esto ni macizo es mezcla de borde
      bool isOpen(vec3 k){ return distance(k, vec3(0.957, 0.761, 0.643)) < 0.18 || distance(k, vec3(1.)) < 0.18 || distance(k, vec3(1.0, 0.796, 0.169)) < 0.18 || distance(k, vec3(0.180, 0.651, 0.282)) < 0.18; }
      bool isFill(vec3 k){ return distance(k, vec3(0.078, 0.431, 0.235)) < 0.1 || distance(k, vec3(0.122, 0.388, 0.839)) < 0.18 || distance(k, vec3(0.227)) < 0.1 || distance(k, vec3(0.106, 0.098, 0.098)) < 0.1; }
      // ---- a color: tintas planas con contorno ----
      // cada punto es del color de la paleta más cercano al de la textura: se pinta con su tinta exacta
      int pal(vec3 k){ float bd = 9.; int b = 0; for (int i = 0; i < 16; i++) { if (i >= npal) break; float e = distance(k, src[i]); if (e < bd) { bd = e; b = i; } } return b; }
      vec4 shadeColour(){
        float d0 = d(vec2(0.)); int i0 = pal(c(vec2(0.))); float r0 = d0 < 1. ? role[i0] : 0.;
        // contorno: silueta, piezas que se tapan y cambio de color. Entre la piel y un rasgo (o entre dos rasgos) no hay
        // contorno: son manchas limpias. Y desde la piel no se mira a través de un rasgo (lo de detrás no cuenta).
        bool edge = false;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 0.5235988; vec2 o = vec2(cos(a), sin(a)) * px * line; float dd = d(o);
          if ((d0 < 1.) != (dd < 1.)) { edge = true; break; }
          if (d0 >= 1.) continue;
          if (abs(dd - d0) > 0.0035) { edge = true; break; }
          int ii = pal(c(o)); if (ii == i0) continue;
          bool soft = r0 > .5 && role[ii] > .5;
          if (!soft && r0 > .5 && r0 < 1.5) soft = role[pal(c(o * .5))] > 1.5 || role[pal(c(o * .25))] > 1.5 || role[pal(c(o * .75))] > 1.5;
          if (!soft) { edge = true; break; }
        }
        if (edge) return vec4(ink, 1.);
        if (d0 >= 1.) return bg;
        // trazo fino: arrugas y pliegues del propio modelo (no en la piel ni en los rasgos)
        vec2 q = px * fine;
        vec3 tl = n(vec2(-q.x, q.y)), tc = n(vec2(0., q.y)), tr = n(q), ml = n(vec2(-q.x, 0.)), mr = n(vec2(q.x, 0.)), bl = n(-q), bc = n(vec2(0., -q.y)), br = n(vec2(q.x, -q.y));
        vec3 gx = (tr + 2. * mr + br) - (tl + 2. * ml + bl), gy = (tl + 2. * tc + tr) - (bl + 2. * bc + br);
        // (en la piel, solo los pliegues marcados: los dedos y las orejas; en los rasgos, ninguno)
        bool fl = r0 < 1.5 && length(gx) + length(gy) > (r0 > .5 ? fineT * skinK : fineT);
        return vec4(fl ? ink : dst[i0], 1.);
      }
      vec4 shade(){
        float d0 = d(vec2(0.)); vec3 c0 = c(vec2(0.)); bool f0 = d0 < 1. && isFill(c0);
        bool skin0 = distance(c0, vec3(0.957, 0.761, 0.643)) < 0.16;
        vec3 paper = useFill > 0.5 ? fillC : vec3(1.);
        // trazo principal: silueta, piezas que se tapan y cambios de color plano (entre dos zonas macizas, calado en papel)
        bool edge = false, knock = false;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 0.5235988; vec2 o = vec2(cos(a), sin(a)) * px * line;
          float dd = d(o); vec3 cc = c(o);
          bool e = (d0 < 1.) != (dd < 1.) || (d0 < 1. && abs(dd - d0) > 0.0035) || (d0 < 1. && distance(cc, c0) > 0.22);

          // los rasgos de la cara (ojos, cejas, bigote) son masas de tinta sin contorno alrededor: no se engordan
          // (y en la piel, nada macizo lleva contorno: los bordes suavizados de los rasgos salen en gris o verde oscuro)
          bool feat = !f0 && d0 < 1. && dd < 1. && abs(dd - d0) < 0.0035 && (distance(cc, vec3(0.106, 0.098, 0.098)) < 0.1 || (skin0 && isFill(cc)));
          // ni a través de ellos: si entre este punto y la muestra hay un rasgo, lo de detrás (el brillo del ojo, el casco
          // tras la patilla) no cuenta; si no, salen anillos de puntos alrededor de los rasgos
          if (e && !feat && !f0 && d0 < 1. && dd < 1. && abs(dd - d0) < 0.0035) {
            if (distance(c(o * .5), vec3(0.106, 0.098, 0.098)) < 0.1 || distance(c(o * .25), vec3(0.106, 0.098, 0.098)) < 0.1 || distance(c(o * .75), vec3(0.106, 0.098, 0.098)) < 0.1) feat = true;
          }
          if (e && !feat) { if (f0 && dd < 1. && isFill(cc)) knock = true; else if (!f0 || dd >= 1. || isOpen(cc)) edge = true; }
        }
        if (edge) { return vec4(ink, 1.); }
        if (d0 >= 1.) { return bg; }
        if (knock) {
          // la línea calada es más fina: solo cerca del borde
          for (int r = 1; r <= 2; r++) for (int i = 0; i < 12; i++) {
            float a = float(i) * 0.5235988; vec2 o = vec2(cos(a), sin(a)) * px * fine * 1.25 * float(r);
            float dd = d(o); vec3 cc = c(o);
            if (abs(dd - d0) > 0.0035 || distance(cc, c0) > 0.15) { return vec4(paper, 1.); }
          }
        }
        // trazo fino: relieve (Sobel sobre normales) y pliegues dibujados
        vec2 q = px * fine;
        vec3 tl = n(vec2(-q.x, q.y)), tc = n(vec2(0., q.y)), tr = n(q), ml = n(vec2(-q.x, 0.)), mr = n(vec2(q.x, 0.)), bl = n(-q), bc = n(vec2(0., -q.y)), br = n(vec2(q.x, -q.y));
        vec3 gx = (tr + 2. * mr + br) - (tl + 2. * ml + bl), gy = (tl + 2. * tc + tr) - (bl + 2. * bc + br);
        float f = length(gx) + length(gy);
        float k = max(fo(vec2(0.)), max(max(fo(vec2(q.x, 0.)), fo(vec2(-q.x, 0.))), max(fo(vec2(0., q.y)), fo(vec2(0., -q.y)))));
        bool quiet = distance(c0, vec3(0.957, 0.761, 0.643)) < 0.16 || distance(c0, vec3(1.0, 0.796, 0.169)) < 0.16 || distance(c0, vec3(0.227)) < 0.12 || distance(c0, vec3(0.180, 0.651, 0.282)) < 0.16 || distance(c0, vec3(0.106, 0.098, 0.098)) < 0.1;
        // (en las botas y en los rasgos negros no se dibujan pliegues: ahí solo salían motas)
        bool dark0 = distance(c0, vec3(0.227)) < 0.12 || distance(c0, vec3(0.106, 0.098, 0.098)) < 0.1;
        bool fl = (f > fineT && !quiet) || (k > 0.35 && !dark0);
        if (useFill < 0.5) { return vec4(fl ? ink : c0, 1.); }
        // tinta maciza con los detalles calados en papel; fuera de lo macizo, papel con los detalles en tinta
        if (f0) { return vec4(fl ? paper : ink, 1.); }
        return vec4(fl ? ink : paper, 1.);
      }
      void main(){
        vec2 fc = vUv * res;
        P = vUv + (vec2(vn(fc / 2.3), vn(fc / 2.3 + 17.)) - .5) * px * .55 * riso;
        vec4 o = colour > .5 ? shadeColour() : shade();
        if (riso < .01) { gl_FragColor = o; return; }
        // cuánta tinta hay: 1 donde el color es la tinta
        float ink01 = o.a < .01 ? 0. : clamp(1. - distance(o.rgb, ink) / max(.001, distance(fillC, ink)), 0., 1.);
        // densidad desigual en manchas grandes, grano fino y motas sin tinta
        float dens = .94 + .06 * vn(fc / 46.);
        float grain = .975 + .025 * h21(fc);
        float drop = step(.993, h21(floor(fc / 1.6) + 3.1)) * step(.55, vn(fc / 3.));
        float cov = ink01 * dens * grain * (1. - .55 * drop) * riso + ink01 * (1. - riso);
        if (o.a < .99) { gl_FragColor = vec4(ink, cov); return; }
        gl_FragColor = vec4(mix(fillC, ink, cov), 1.);
      }`,
    depthTest: false, depthWrite: false, blending: THREE.NoBlending
  }));
  const post = new THREE.Scene(); post.add(quad); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  // Suavizado: todo se dibuja a `ss` veces la resolución del lienzo y se reduce promediando (con ss = 2, una sola lectura
  // con filtro lineal en el centro de cada píxel promedia exactamente los 2 × 2 de dentro). Colores premultiplicados.
  const rtPost = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const down = new THREE.Scene(); down.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { t: { value: rtPost.texture } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main(){ gl_FragColor = texture2D(t, vUv); }',
    depthTest: false, depthWrite: false, blending: THREE.NoBlending
  })));

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
  function view({ yaw = 0, pitch = 0, zoom = 1, cx = 0, cy = 0 } = {}) {
    const w = renderer.domElement.width, h = renderer.domElement.height, ar = w / h, half = size.y * 0.58 / zoom;
    cam.left = -half * ar; cam.right = half * ar; cam.top = half; cam.bottom = -half;
    const a = yaw * Math.PI / 180, p = pitch * Math.PI / 180, R = 10;
    const t = new THREE.Vector3(center.x + cx * size.y, center.y + cy * size.y, center.z);
    cam.position.set(t.x + Math.sin(a) * Math.cos(p) * R, t.y + Math.sin(p) * R, t.z + Math.cos(a) * Math.cos(p) * R);
    cam.lookAt(t); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  }
  let lineScale = 1;
  const setLineScale = (k) => { lineScale = k; };
  let lastW = 1, lastH = 1;
  function resize(w, h) {
    lastW = w; lastH = h;
    renderer.setSize(w, h, false);
    const W = Math.round(renderer.domElement.width * ss), H = Math.round(renderer.domElement.height * ss), r = renderer.getPixelRatio() * ss;
    rt.setSize(W, H); rtD.setSize(W, H); rtPost.setSize(W, H); U.px.value.set(1 / W, 1 / H); U.res.value.set(W, H);
    U.line.value = Math.max(1, line * r * lineScale); U.fine.value = Math.max(.75, fine * r * lineScale);
  }
  function render() {
    renderer.setClearColor(0x000000, 0);
    mesh.material = flatMat; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    mesh.material = detailMat; renderer.setRenderTarget(rtD); renderer.setClearColor(0x8080ff, 1); renderer.clear(); renderer.render(scene, cam);
    mesh.material = flatMat; renderer.setRenderTarget(rtPost); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(post, postCam);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(down, postCam);
  }
  const set = (k, v) => { U[k].value = v; };
  // calidad del suavizado (si el equipo no llega, se baja: 2 → 1,5 → 1)
  const quality = (v) => { if (v === undefined) return ss; ss = v; resize(lastW, lastH); return ss; };
  // parpadeo: la misma textura con los ojos cerrados
  // la cara: la misma textura con los ojos cerrados ('blink') o con la boca abierta ('talk')
  const face = (n) => { flatMat.map = (n === 'blink' && texB) || (n === 'talk' && texT) || tex; };
  const blink = (on) => face(on ? 'blink' : 'open');
  // píxeles CSS por unidad del mundo, para pasar el desplazamiento del pie a la pantalla
  const _pj = new THREE.Vector3();
  // punto del espacio del personaje → píxeles CSS del lienzo
  // de un punto (del personaje o del mundo) a píxeles CSS del lienzo
  const toPx = (v) => { v.project(cam); const c = renderer.domElement; return [(v.x + 1) / 2 * c.clientWidth, (1 - v.y) / 2 * c.clientHeight]; };
  const project = (x, y, z) => toPx(root.localToWorld(_pj.set(x, y, z)));
  const projectWorld = (x, y, z) => toPx(_pj.set(x, y, z));
  const pxPerUnit = () => renderer.domElement.clientHeight / (cam.top - cam.bottom);
  return { renderer, scene, root, mesh, camera: cam, bones: B, size, center, pose, view, resize, render, set, blink, face, setLineScale, quality, project, projectWorld, floor: restFoot, rig, soles: () => SOLE.map(soleY), soleX: () => SOLE.map((s) => s.bone.localToWorld(_v.copy(s.at)).x), planted, pxPerUnit, materials: { flatMat, detailMat } };
}
