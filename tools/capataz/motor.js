/*
 * El capataz — motor de animación.
 * Un único trazado (la ilustración original vectorizada) deformado por un esqueleto de 13 huesos con pesos de
 * piel: cada punto de control sigue a uno o varios huesos y se mezcla en las articulaciones, así que el dibujo se
 * dobla como goma y nunca se ven juntas. Las poses son ángulos por hueso (grados, sentido horario) más traslación
 * y estiramiento del cuerpo (squash & stretch) alrededor del suelo.
 *
 * Estados, con transición suave entre ellos:
 *   run   — carrera saltada; la fase la marca el scroll (o el tiempo, en la demo)
 *   idle  — flota, respira, se ríe a ratos
 *   wave  — saluda con la mano delantera mientras habla
 */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2, rad = Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  const rotAbout = (x, y, deg) => { const c = Math.cos(deg * rad), s = Math.sin(deg * rad); return [c, s, -s, c, x - c * x + s * y, y - s * x - c * y]; };

  // ---------- poses (cada una devuelve ángulos y cuerpo para un instante) ----------
  // u: 0 en el vuelo (piernas abiertas, como en el dibujo) → 1 al tocar el suelo (piernas juntas)
  function runPose(ph) {
    const s = Math.sin(ph * TAU), u = ease((1 + s) / 2);
    const lag = (k) => Math.sin((ph - k) * TAU);
    const land = Math.max(0, Math.sin((ph - 0.18) * TAU)) ** 3;      // pico de aplastamiento justo después de tocar
    return {
      legB1: -20 * u, legB2: 20 * u, legB3: 14 * lag(0.15),
      legF1: 18 * u, legF2: -12 * u, legF3: -12 * lag(0.15),
      armF1: 24 * u, armF2: 20 * lag(0.22),
      armB1: -22 * u, armB2: -18 * lag(0.22),
      torso: 5 * u, head: -6 * lag(0.3), root: -3 + 4 * u,
      ty: -46 * (1 - u) + 10 * land, sx: 1 + 0.06 * land - 0.02 * (1 - u), sy: 1 - 0.09 * land + 0.04 * (1 - u)
    };
  }
  function idlePose(t) {
    const b = Math.sin(t * TAU / 2.6), b2 = Math.sin(t * TAU / 2.6 - 0.9);
    const laugh = Math.max(0, Math.sin(t * TAU / 7)) ** 18;           // de vez en cuando, una risa
    const chuckle = laugh * Math.sin(t * TAU * 7);
    return {
      legB1: 3 * b2, legB2: 4 * b2, legB3: 5 * Math.sin(t * TAU / 2.6 - 1.6),
      legF1: -3 * b2, legF2: 3 * b2, legF3: -4 * Math.sin(t * TAU / 2.6 - 1.6),
      armF1: 4 * b2, armF2: 6 * Math.sin(t * TAU / 2.6 - 1.4), armB1: -4 * b2, armB2: -6 * Math.sin(t * TAU / 2.6 - 1.4),
      torso: 1.5 * b + 2 * chuckle, head: 2 * b2 - 5 * chuckle, root: 0,
      ty: -14 * (1 + b) / 2 - 6 * Math.abs(chuckle), sx: 1 - 0.012 * b, sy: 1 + 0.018 * b
    };
  }
  function wavePose(t) {
    const w = Math.sin(t * TAU * 1.9), b = Math.sin(t * TAU * 0.95);
    return {
      legB1: -6, legB2: 8, legB3: 6 * Math.sin(t * TAU * 0.95 - 1), legF1: 6, legF2: -4, legF3: -5 * Math.sin(t * TAU * 0.95 - 1),
      armF1: -18 + 6 * w, armF2: -10 + 30 * Math.sin(t * TAU * 1.9 - 0.6), armB1: -8, armB2: -6 * b,
      torso: -3 + 1.5 * b, head: -8 + 4 * Math.sin(t * TAU * 1.9 - 1.2), root: -2,
      ty: -10 - 8 * Math.abs(b), sx: 1 + 0.01 * b, sy: 1 - 0.015 * b
    };
  }
  const KEYS = ['root', 'torso', 'head', 'armB1', 'armB2', 'armF1', 'armF2', 'legB1', 'legB2', 'legB3', 'legF1', 'legF2', 'legF3', 'ty', 'sx', 'sy'];
  const REST = { sx: 1, sy: 1 };
  const mix = (a, b, k) => { const o = {}; KEYS.forEach((key) => { const x = a[key] ?? (key[0] === 's' ? 1 : 0), y = b[key] ?? (key[0] === 's' ? 1 : 0); o[key] = x + (y - x) * k; }); return o; };

  function Mascot(svg, rig) {
    const NS = 'http://www.w3.org/2000/svg';
    const path = svg.querySelector('.cp-ink') || svg.appendChild(document.createElementNS(NS, 'path'));
    path.setAttribute('class', 'cp-ink'); path.setAttribute('fill-rule', 'nonzero'); // nonzero: si el trazo se solapa al doblarse, no salen agujeros
    const B = rig.bones, P = rig.pts, Wt = rig.w, T = rig.t, n = P.length;
    const X = new Float32Array(n), Y = new Float32Array(n);
    const G = [660, 1180]; // apoyo del cuerpo para estirar y aplastar
    const M = new Array(B.length);

    function apply(q) {
      q = Object.assign({ ty: 0, sx: 1, sy: 1, root: 0 }, q);
      // matrices de mundo de cada hueso (los padres van antes en la lista)
      for (let i = 0; i < B.length; i++) {
        const b = B[i];
        if (b.p < 0) {
          let A = [1, 0, 0, 1, 0, q.ty];
          A = mul(A, [q.sx, 0, 0, q.sy, G[0] - q.sx * G[0], G[1] - q.sy * G[1]]);
          M[i] = mul(A, rotAbout(b.x, b.y, q.root));
        } else M[i] = mul(M[b.p], rotAbout(b.x, b.y, q[b.n] || 0));
      }
      for (let i = 0; i < n; i++) {
        const x = P[i][0], y = P[i][1], w = Wt[i]; let ax = 0, ay = 0;
        for (let k = 0; k < w.length; k++) { const m = M[w[k][0]], v = w[k][1]; ax += v * (m[0] * x + m[2] * y + m[4]); ay += v * (m[1] * x + m[3] * y + m[5]); }
        X[i] = ax; Y[i] = ay;
      }
      let d = '';
      const f = (i) => X[i].toFixed(1) + ' ' + Y[i].toFixed(1);
      for (let k = 0; k < T.length; k++) {
        const c = T[k];
        if (c[0] === 'Z') d += 'Z';
        else if (c[0] === 'C') d += 'C' + f(c[1]) + ' ' + f(c[1] + 1) + ' ' + f(c[1] + 2);
        else d += c[0] + f(c[1]);
      }
      path.setAttribute('d', d);
    }

    // controlador: mezcla entre estados y avance de la carrera
    const st = { state: 'idle', from: null, k: 1, phase: 0, t0: performance.now() / 1000 };
    function poseOf(state, t) { return state === 'run' ? runPose(st.phase) : state === 'wave' ? wavePose(t) : idlePose(t); }
    function render(now) {
      const t = now / 1000 - st.t0;
      let q = poseOf(st.state, t);
      if (st.from && st.k < 1) q = mix(poseOf(st.from, t), q, ease(st.k));
      apply(q);
    }
    function set(state) { if (state === st.state) return; st.from = st.state; st.state = state; st.k = 0; }
    let raf = 0, last = 0;
    function loop(now) {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (st.k < 1) st.k = Math.min(1, st.k + dt / 0.35);
      render(now);
      raf = requestAnimationFrame(loop);
    }
    return {
      apply, render, set,
      advance(d) { st.phase += d; }, // la carrera avanza con el scroll
      start() { if (!raf) raf = requestAnimationFrame(loop); },
      stop() { cancelAnimationFrame(raf); raf = 0; last = 0; },
      pose: { run: runPose, idle: idlePose, wave: wavePose, mix }
    };
  }
  root.GVEMascot = Mascot;
})(window);
