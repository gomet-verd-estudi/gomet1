/*
 * Gomet · Method — the four pillars in 3D.
 * Small solids in the same green line as the rest of the drawings: white faces, green edges, hidden faces
 * culled and the rest painted far to near. No library: a few matrices and an SVG path per face.
 *   typo     the A of the titles (Archivo 900, condensed), extruded and turning on itself
 *   grid     a page with its column grid and three modules standing on it
 *   color    a fan of swatches opening and closing
 *   imagery  a print with its picture, turning, with another print behind
 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  // the A of the titles, outline and counter, height 1, centred (from fonts/archivo-var.woff2 at wght 900, wdth 62)
  var A = [
    [[-0.3852, -0.5], [-0.186, 0.5], [0.186, 0.5], [0.3852, -0.5], [0.1047, -0.5], [0.0843, -0.3532], [-0.093, -0.3532], [-0.1119, -0.5]],
    [[-0.0625, -0.1323], [0.0552, -0.1323], [0.0247, 0.0916], [0.0029, 0.2776], [-0.0102, 0.2776], [-0.032, 0.0916]]
  ];

  /* ---------- a little 3D ---------- */
  var rx = function (a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  var ry = function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
  var rz = function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
  var mul = function (a, b) {
    var o = []; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return o;
  };
  var ap = function (m, p) { return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]]; };
  var area = function (r) { var a = 0; for (var i = 0; i < r.length; i++) { var p = r[i], q = r[(i + 1) % r.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  var orient = function (r, ccw) { return (area(r) > 0) === ccw ? r : r.slice().reverse(); };
  var rect = function (x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; };
  var circle = function (cx, cy, r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };

  // a prism: rings in the xy plane (the first is the outline, the rest are holes) between z = -d/2 and z = +d/2.
  // deco: shapes drawn on the front (and back) cap: { pts, closed, cls }
  function prism(rings, d, capCls, sideCls, deco, backCls, backDeco) {
    rings = rings.map(function (r, i) { return orient(r, i === 0); });
    var h = d / 2, faces = [];
    faces.push({ rings: rings.map(function (r) { return r.map(function (p) { return [p[0], p[1], h]; }); }), n: [0, 0, 1], cls: capCls, deco: deco, z: h });
    faces.push({ rings: rings.map(function (r) { return r.map(function (p) { return [p[0], p[1], -h]; }); }), n: [0, 0, -1], cls: backCls || capCls, deco: backDeco, z: -h });
    rings.forEach(function (r) {
      for (var i = 0; i < r.length; i++) {
        var a = r[i], b = r[(i + 1) % r.length], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        faces.push({ rings: [[[a[0], a[1], h], [b[0], b[1], h], [b[0], b[1], -h], [a[0], a[1], -h]]], n: [dy / l, -dx / l, 0], cls: sideCls });
      }
    });
    return faces;
  }

  /* ---------- the four pillars ---------- */
  var PIL = {
    typo: function () {
      var faces = prism(A.map(function (r) { return r.map(function (p) { return [p[0] * 1.55, p[1] * 1.55]; }); }), 0.36, "fw", "fw");
      return function (t, k) {
        return [{ faces: faces, m: mul(rx(0.2), ry(t * 0.9 + k)), at: [0, Math.sin(t * 1.3) * 0.03, 0] }];
      };
    },
    grid: function () {
      var W = 1.05, H = 1.4, c = 4, g = 0.05, m = 0.09, cw = (W - 2 * m - (c - 1) * g) / c, lines = [];
      for (var i = 0; i < c; i++) { var x0 = -W / 2 + m + i * (cw + g); lines.push({ pts: rect(x0, -H / 2 + m, x0 + cw, H / 2 - m), closed: true, cls: "ln" }); }
      for (var j = 1; j < 9; j++) { var y = -H / 2 + m + j * (H - 2 * m) / 9; lines.push({ pts: [[-W / 2 + m, y], [W / 2 - m, y]], closed: false, cls: "ln lt" }); }
      var page = prism([rect(-W / 2, -H / 2, W / 2, H / 2)], 0.035, "fw", "fw", lines, "fw");
      var col = function (i) { return -W / 2 + m + i * (cw + g); }, row = function (j) { return H / 2 - m - j * (H - 2 * m) / 9; };
      // three modules standing on the grid: they rise and settle in turn
      var mods = [[col(0), row(3), col(1) + cw, row(0)], [col(2), row(5), col(2) + cw, row(3)], [col(1), row(9), col(3) + cw, row(6)]];
      return function (t, k) {
        var M = mul(rx(-0.32), ry(Math.sin(t * 0.55 + k) * 0.85)), out = [{ faces: page, m: M, at: [0, 0, 0] }];
        mods.forEach(function (q, i) {
          var hgt = 0.02 + 0.13 * (0.5 + 0.5 * Math.sin(t * 1.4 - i * 1.3));
          var f = prism([rect(q[0], q[3], q[2], q[1])], hgt, i === 0 ? "fg" : "f2", "fw");
          out.push({ faces: f, m: M, at: ap(M, [0, 0, 0.0175 + hgt / 2]) });
        });
        return out;
      };
    },
    color: function () {
      var cls = ["fg", "f1", "f2", "f3", "fw"], cards = cls.map(function (c) {
        return prism([rect(-0.15, 0, 0.15, 1.3)], 0.018, c, "fw", [{ pts: rect(-0.12, 0.03, 0.12, 0.2), closed: true, cls: "fw" }, { pts: [[-0.09, 0.12], [0.06, 0.12]], closed: false, cls: "ln" }], c);
      });
      return function (t, k) {
        var G = mul(rx(-0.18), ry(Math.sin(t * 0.45 + k) * 0.7)), spread = 0.1 + 0.2 * (0.5 + 0.5 * Math.sin(t * 1.05));
        return cards.map(function (f, i) {
          var a = (i - 2) * spread;
          return { faces: f, m: mul(G, rz(-a)), at: ap(G, [0, -0.62, (i - 2) * 0.03]) };
        });
      };
    },
    imagery: function () {
      var W = 1.2, H = 0.92, m = 0.07, sun = circle(0.24, 0.12, 0.09, 18);
      var hills = [[-W / 2 + m, -0.14], [-0.3, 0.06], [-0.1, -0.08], [0.12, 0.12], [W / 2 - m, -0.1], [W / 2 - m, -H / 2 + m], [-W / 2 + m, -H / 2 + m]];
      var front = [{ pts: rect(-W / 2 + m, -H / 2 + m, W / 2 - m, H / 2 - m), closed: true, cls: "fw" }, { pts: hills, closed: true, cls: "f3" }, { pts: sun, closed: true, cls: "fg" }];
      var back = [{ pts: [[-W / 2 + m, 0.2], [0.2, 0.2]], closed: false, cls: "ln" }, { pts: [[-W / 2 + m, 0.08], [0.05, 0.08]], closed: false, cls: "ln" }];
      var print = prism([rect(-W / 2, -H / 2, W / 2, H / 2)], 0.03, "fw", "fw", front, "fw", back);
      var under = prism([rect(-W / 2, -H / 2, W / 2, H / 2)], 0.03, "fw", "fw", [{ pts: rect(-W / 2 + m, -H / 2 + m, W / 2 - m, H / 2 - m), closed: true, cls: "fw" }], "fw");
      return function (t, k) {
        var G = mul(rx(0.22), ry(Math.sin(t * 0.6 + k) * 0.85));
        return [{ faces: under, m: mul(G, rz(0.14)), at: ap(G, [0.1, 0.1, -0.12]) }, { faces: print, m: mul(G, rz(-0.05)), at: [0, Math.sin(t * 1.2) * 0.025, 0] }];
      };
    }
  };

  /* ---------- drawing ---------- */
  var F = 4.2; // the eye, on the z axis
  // the light comes from the upper left, in front: lit faces stay white paper, faces turned away take a pale green wash
  var LT = (function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })([-0.55, 0.62, 0.56]);
  var SHD = [0.55, -1, -0.45]; // where the light falls: the shadow is cast down, to the right and back, on a floor under the solid
  // the eye looks down on the solids a little, as on the building: the floor and the shadows open up
  var CAM = rx(0.36), cam = function (v) { return ap(CAM, v); };
  var WASH = [[255, 255, 255], [214, 234, 221]]; // white → the palest green of the palette
  var mix = function (k) { k = Math.max(0, Math.min(1, k)); return "rgb(" + WASH[0].map(function (c, i) { return Math.round(c + (WASH[1][i] - c) * k); }).join(",") + ")"; };
  function mount(host, name) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "p3"); svg.setAttribute("viewBox", "-1.08 -1.08 2.16 2.16"); svg.setAttribute("aria-hidden", "true");
    host.appendChild(svg);
    var shadow = document.createElementNS(NS, "path"); shadow.setAttribute("class", "sh"); svg.appendChild(shadow);
    var floor = document.createElementNS(NS, "path"); floor.setAttribute("class", "fl"); svg.appendChild(floor);
    var pool = [], scene = PIL[name](), shown = 1;
    var path = function (i) { var p = pool[i]; if (!p) { p = pool[i] = document.createElementNS(NS, "path"); svg.appendChild(p); } return p; };
    var proj = function (v, s) { var q = F / (F - v[2] * s); return [v[0] * s * q, -v[1] * s * q]; };
    var ring = function (pts, close) { var d = ""; for (var i = 0; i < pts.length; i++) d += (i ? "L" : "M") + pts[i][0].toFixed(4) + " " + pts[i][1].toFixed(4); return close ? d + "Z" : d; };
    function render(t, k) {
      var s = 0.001 + shown, items = [], hidden = [], world = [], low = 1e9;
      var objs = scene(t, k || 0);
      // every face in world space first: the floor sits just under the lowest point of the solid
      objs.forEach(function (o) {
        o.faces.forEach(function (f) {
          var rs = f.rings.map(function (r) { return r.map(function (p) { var v = ap(o.m, p); v = [v[0] + o.at[0], v[1] + o.at[1], v[2] + o.at[2]]; if (v[1] < low) low = v[1]; return v; }); });
          world.push({ o: o, f: f, rs: rs });
        });
      });
      var gy = low - 0.03, sh = "";
      world.forEach(function (w) {
        var o = w.o, f = w.f, nw = ap(o.m, f.n), n = cam(nw), p0 = cam(w.rs[0][0]);
        // the cast shadow: every face pressed onto the floor along the light (their union is the shadow)
        sh += ring(w.rs[0].map(function (v) { var tt = (gy - v[1]) / SHD[1]; return proj(cam([v[0] + SHD[0] * tt, gy, v[2] + SHD[2] * tt]), s); }), true);
        var facing = -p0[0] * n[0] - p0[1] * n[1] + (F / s - p0[2]) * n[2] > 0;
        var zsum = 0, cnt = 0, d = "";
        w.rs.forEach(function (r) { d += ring(r.map(function (v) { v = cam(v); zsum += v[2]; cnt++; return proj(v, s); }), true); });
        // faces turned away are not painted, but their edges are drawn dashed, as hidden lines on a technical drawing
        if (!facing) { hidden.push(d); return; }
        var deco = (f.deco || []).map(function (q) {
          return { cls: q.cls, d: ring(q.pts.map(function (p) { var v = ap(o.m, [p[0], p[1], f.z + (f.z > 0 ? 0.002 : -0.002)]); return proj(cam([v[0] + o.at[0], v[1] + o.at[1], v[2] + o.at[2]]), s); }), q.closed) };
        });
        var lit = n[0] * LT[0] + n[1] * LT[1] + n[2] * LT[2];
        items.push({ z: zsum / cnt, d: d, cls: f.cls, fill: f.cls === "fw" ? mix((0.5 - lit) * 1.25) : "", deco: deco });
      });
      shadow.setAttribute("d", sh);
      // the floor: a short ruled line under the solid, where its shadow lands
      var c0 = proj(cam([-0.72, gy, 0.08]), s), c1 = proj(cam([0.9, gy, 0.08]), s);
      floor.setAttribute("d", "M" + c0[0].toFixed(4) + " " + c0[1].toFixed(4) + "L" + c1[0].toFixed(4) + " " + c1[1].toFixed(4));
      items.sort(function (a, b) { return a.z - b.z; });
      var i = 0;
      items.forEach(function (it) {
        var p = path(i++); p.setAttribute("d", it.d); p.setAttribute("class", it.cls); p.style.fill = it.fill;
        it.deco.forEach(function (q) { var e = path(i++); e.setAttribute("d", q.d); e.setAttribute("class", q.cls); e.style.fill = ""; });
      });
      if (hidden.length) { var hp = path(i++); hp.setAttribute("d", hidden.join("")); hp.setAttribute("class", "hd"); hp.style.fill = ""; }
      for (; i < pool.length; i++) pool[i].setAttribute("d", "");
    }
    render(0, 0);
    return { render: render, show: function (v) { shown = Math.max(0, Math.min(1, v)); } };
  }
  window.GVE_P3D = { mount: mount };
})();
