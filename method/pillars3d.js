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
  function mount(host, name) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "p3"); svg.setAttribute("viewBox", "-1.08 -1.08 2.16 2.16"); svg.setAttribute("aria-hidden", "true");
    host.appendChild(svg);
    var pool = [], scene = PIL[name](), shown = 1;
    var path = function (i) { var p = pool[i]; if (!p) { p = pool[i] = document.createElementNS(NS, "path"); svg.appendChild(p); } return p; };
    var proj = function (v, s) { var q = F / (F - v[2] * s); return [v[0] * s * q, -v[1] * s * q]; };
    var ring = function (pts, close) { var d = ""; for (var i = 0; i < pts.length; i++) d += (i ? "L" : "M") + pts[i][0].toFixed(4) + " " + pts[i][1].toFixed(4); return close ? d + "Z" : d; };
    function render(t, k) {
      var s = 0.001 + shown, items = [];
      scene(t, k || 0).forEach(function (o) {
        o.faces.forEach(function (f) {
          var n = ap(o.m, f.n), v0 = ap(o.m, f.rings[0][0]), p0 = [v0[0] + o.at[0], v0[1] + o.at[1], v0[2] + o.at[2]];
          // facing the eye? (eye at (0,0,F/s) in object space)
          if (-p0[0] * n[0] - p0[1] * n[1] + (F / s - p0[2]) * n[2] <= 0) return;
          var zsum = 0, cnt = 0, d = "";
          f.rings.forEach(function (r) {
            d += ring(r.map(function (p) { var v = ap(o.m, p); v = [v[0] + o.at[0], v[1] + o.at[1], v[2] + o.at[2]]; zsum += v[2]; cnt++; return proj(v, s); }), true);
          });
          var deco = (f.deco || []).map(function (q) {
            return { cls: q.cls, d: ring(q.pts.map(function (p) { var v = ap(o.m, [p[0], p[1], f.z + (f.z > 0 ? 0.002 : -0.002)]); return proj([v[0] + o.at[0], v[1] + o.at[1], v[2] + o.at[2]], s); }), q.closed) };
          });
          items.push({ z: zsum / cnt, d: d, cls: f.cls, deco: deco });
        });
      });
      items.sort(function (a, b) { return a.z - b.z; });
      var i = 0;
      items.forEach(function (it) {
        var p = path(i++); p.setAttribute("d", it.d); p.setAttribute("class", it.cls);
        it.deco.forEach(function (q) { var e = path(i++); e.setAttribute("d", q.d); e.setAttribute("class", q.cls); });
      });
      for (; i < pool.length; i++) pool[i].setAttribute("d", "");
    }
    render(0, 0);
    return { render: render, show: function (v) { shown = Math.max(0, Math.min(1, v)); } };
  }
  window.GVE_P3D = { mount: mount };
})();
