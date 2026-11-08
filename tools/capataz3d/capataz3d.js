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

export async function createCapataz({ canvas, url, texture, relief, folds = null, line = 3, fine = 1, fineThreshold = 1.0, ink = '#0A9651', fill = '#F4EFE6', background = null, riso = 1 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  const load = (u) => new THREE.TextureLoader().loadAsync(u);
  const [gltf, tex, bump, foldTex] = await Promise.all([new GLTFLoader().loadAsync(url), load(texture), load(relief), folds ? load(folds) : null]);
  tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.NearestFilter; tex.magFilter = THREE.NearestFilter; // colores puros, sin mezclas en los bordes
  bump.flipY = false; bump.colorSpace = THREE.NoColorSpace;
  if (foldTex) { foldTex.flipY = false; foldTex.colorSpace = THREE.NoColorSpace; }
  const root = gltf.scene; scene.add(root);
  let mesh = null;
  root.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; mesh = o; } });
  const flatMat = new THREE.MeshBasicMaterial({ map: tex });
  // pasada de detalle: normales con relieve en RGB y el mapa de pliegues dibujados en A
  const detailMat = new THREE.MeshNormalMaterial({ normalMap: bump, normalScale: new THREE.Vector2(1.4, 1.4) });
  detailMat.onBeforeCompile = (sh) => {
    sh.uniforms.tFolds = { value: foldTex };
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform sampler2D tFolds;\nvoid main() {')
      .replace(/gl_FragColor = vec4\( packNormalToRGB\( normal \), diffuseColor\.a \);[\s\S]*?#endif/, `gl_FragColor = vec4( packNormalToRGB( normal ), ${foldTex ? '1.0 - texture2D( tFolds, vNormalMapUv ).r' : '1.0'} );`);
  };
  mesh.material = flatMat;
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3());

  // ---- huesos y pose ----
  const B = {}; root.traverse((o) => { if (o.isBone) B[o.name.replace(/^mixamorig:?/, '')] = o; });
  const rest = new Map(); Object.values(B).forEach((b) => rest.set(b, b.quaternion.clone()));
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
  const FEET = ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase'].map((n) => B[n]);
  const footMin = () => Math.min(...FEET.map((b) => b.getWorldPosition(_v).y));
  root.updateMatrixWorld(true);
  const restFoot = footMin();
  const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
  const ORDER = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
    'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
    'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];
  // pose: ángulos por hueso; yaw: hacia dónde mira; squash: aplastar (+) o estirar (−) sobre el suelo
  function pose(p = {}) {
    rest.forEach((q, b) => b.quaternion.copy(q)); B.Hips.position.copy(restPos);
    root.position.set(0, 0, 0); root.rotation.set(0, (p.yaw || 0) * Math.PI / 180, 0);
    const sq = p.squash || 0; root.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
    root.updateMatrixWorld(true);
    for (const n of ORDER) {
      const r = p[n]; if (!r) continue;
      if (r.y) turn(n, AX.y, r.y); if (r.x) turn(n, AX.x, r.x); if (r.z) turn(n, AX.z, r.z);
      B[n].updateMatrixWorld(true);
    }
    root.updateMatrixWorld(true);
    // pies en el suelo: el pie más bajo apoya siempre en el suelo (de ahí sale el sube y baja natural del paso)
    root.position.y = restFoot * (1 - sq) - footMin() + (p.hop || 0) * size.y;
    root.updateMatrixWorld(true);
  }

  // ---- pasada de línea ----
  const rt = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1) });
  const rtD = new THREE.WebGLRenderTarget(1, 1);
  const hex = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  const U = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, tDetail: { value: rtD.texture },
    px: { value: new THREE.Vector2() }, line: { value: line }, fine: { value: fine }, fineT: { value: fineThreshold },
    ink: { value: new THREE.Vector3(...hex(ink)) }, fillC: { value: new THREE.Vector3(...hex(fill || '#000000')) }, useFill: { value: fill ? 1 : 0 }, riso: { value: riso }, res: { value: new THREE.Vector2(1, 1) }, bg: { value: new THREE.Vector4(...(background ? hex(background) : [0, 0, 0]), background ? 1 : 0) }
  };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      uniform sampler2D tColor, tDepth, tDetail; uniform vec2 px; uniform float line, fine, fineT, useFill, riso; uniform vec3 ink, fillC; uniform vec4 bg; uniform vec2 res; varying vec2 vUv;
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
      vec4 shade(){
        float d0 = d(vec2(0.)); vec3 c0 = c(vec2(0.)); bool f0 = d0 < 1. && isFill(c0);
        vec3 paper = useFill > 0.5 ? fillC : vec3(1.);
        // trazo principal: silueta, piezas que se tapan y cambios de color plano (entre dos zonas macizas, calado en papel)
        bool edge = false, knock = false;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 0.5235988; vec2 o = vec2(cos(a), sin(a)) * px * line;
          float dd = d(o); vec3 cc = c(o);
          bool e = (d0 < 1.) != (dd < 1.) || (d0 < 1. && abs(dd - d0) > 0.0035) || (d0 < 1. && distance(cc, c0) > 0.22);
          if (e) { if (f0 && dd < 1. && isFill(cc)) knock = true; else if (!f0 || dd >= 1. || isOpen(cc)) edge = true; }
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
        bool fl = (f > fineT && !quiet) || k > 0.35;
        if (useFill < 0.5) { return vec4(fl ? ink : c0, 1.); }
        // tinta maciza con los detalles calados en papel; fuera de lo macizo, papel con los detalles en tinta
        if (f0) { return vec4(fl ? paper : ink, 1.); }
        return vec4(fl ? ink : paper, 1.);
      }
      void main(){
        vec2 fc = vUv * res;
        P = vUv + (vec2(vn(fc / 2.3), vn(fc / 2.3 + 17.)) - .5) * px * 1.4 * riso;
        vec4 o = shade();
        if (riso < .01) { gl_FragColor = o; return; }
        // cuánta tinta hay: 1 donde el color es la tinta
        float ink01 = o.a < .01 ? 0. : clamp(1. - distance(o.rgb, ink) / max(.001, distance(fillC, ink)), 0., 1.);
        // densidad desigual en manchas grandes, grano fino y motas sin tinta
        float dens = .8 + .2 * vn(fc / 38.) + .06 * (vn(fc / 9.) - .5);
        float grain = .9 + .1 * h21(fc);
        float drop = step(.955, h21(floor(fc / 1.6) + 3.1)) * step(.5, vn(fc / 3.));
        float cov = ink01 * dens * grain * (1. - .75 * drop) * riso + ink01 * (1. - riso);
        if (o.a < .99) { gl_FragColor = vec4(ink, cov); return; }
        gl_FragColor = vec4(mix(fillC, ink, cov), 1.);
      }`,
    depthTest: false, depthWrite: false, transparent: true
  }));
  const post = new THREE.Scene(); post.add(quad); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
  function view({ yaw = 0, pitch = 0, zoom = 1, cx = 0, cy = 0 } = {}) {
    const w = renderer.domElement.width, h = renderer.domElement.height, ar = w / h, half = size.y * 0.58 / zoom;
    cam.left = -half * ar; cam.right = half * ar; cam.top = half; cam.bottom = -half;
    const a = yaw * Math.PI / 180, p = pitch * Math.PI / 180, R = 10;
    const t = new THREE.Vector3(center.x + cx * size.y, center.y + cy * size.y, center.z);
    cam.position.set(t.x + Math.sin(a) * Math.cos(p) * R, t.y + Math.sin(p) * R, t.z + Math.cos(a) * Math.cos(p) * R);
    cam.lookAt(t); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  }
  function resize(w, h) {
    renderer.setSize(w, h, false);
    const W = renderer.domElement.width, H = renderer.domElement.height, r = renderer.getPixelRatio();
    rt.setSize(W, H); rtD.setSize(W, H); U.px.value.set(1 / W, 1 / H); U.res.value.set(W, H);
    U.line.value = line * r; U.fine.value = fine * r;
  }
  function render() {
    renderer.setClearColor(0x000000, 0);
    mesh.material = flatMat; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    mesh.material = detailMat; renderer.setRenderTarget(rtD); renderer.setClearColor(0x8080ff, 1); renderer.clear(); renderer.render(scene, cam);
    mesh.material = flatMat; renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(post, postCam);
  }
  const set = (k, v) => { U[k].value = v; };
  return { renderer, scene, root, mesh, camera: cam, bones: B, size, center, pose, view, resize, render, set, materials: { flatMat, detailMat } };
}
